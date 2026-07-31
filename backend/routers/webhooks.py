from standardwebhooks.webhooks import WebhookVerificationError
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Request
import json
from config import settings
from svix.webhooks import Webhook, WebhookVerificationError
from fastapi import status,Response
from db.models import User
from sqlalchemy import select


CLERK_WEBHOOK_SECRET = settings.clerk_webhook_secret.get_secret_value()

async def handle_user_created(db: AsyncSession,clerk_id:str,email:str):
    try:
        print("entered handle user created")
        
        stmt = select(User).where(User.id == clerk_id)

        exec = await db.execute(stmt)
        user = exec.scalar_one_or_none()

        if user:
            return {"message: User already present"}
        

        new_user  = User(
            id = clerk_id,
            email = email,
        )

        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        print("db added")

        return {
                "status": "created",
                "message": "User created successfully",
                "user_id": new_user.id,
                
            }

    except Exception as e:
        await db.rollback()
        print(e)
        return {"message: Error during user creation in pg "}


async def handle_user_deleted(db: AsyncSession,clerk_id:str):
    try:
        stmt = select(User).where(User.id == clerk_id)
        exec = await db.execute(stmt)
        user = exec.scalar_one_or_none()

        print(user)

        if not user:
           return {"status": "error", "message": "Can't Remove - User dosnt exists"}

        await db.delete(user)
        await db.commit()
        

        return{
            "status": "deleted",
                "message": "User deleted successfully",
                
            }
    except Exception as e:
        await db.rollback()
        print(e)
        return {"message: Error during user deletetion in pg "}

        


async def clerk_webhook_call(request: Request, db: AsyncSession):
    try:
        body = await request.body()
        print(body)
        if not body:
            return {"status": "error", "message": "Empty request body"}
        
        if CLERK_WEBHOOK_SECRET:
            try:             
                
                wh = Webhook(CLERK_WEBHOOK_SECRET)
                payload = wh.verify(body, request.headers)
                
              
            except WebhookVerificationError as e:
                print(e)
                return
            except Exception as e:
                print(e)
                return
        else:
            try:
                
                payload = json.loads(body)
              
            except json.JSONDecodeError as e:
                return {"status": "error", "message": "Invalid JSON body"}

        event_type = payload.get("type")
        
        if event_type == "user.created":
            clerk_id = payload.get("data", {}).get("id")
            email_addresses = payload.get("data", {}).get("email_addresses", [])
            email = email_addresses[0].get("email_address") if email_addresses else None
            
            if not clerk_id:
                return {"status": "error", "message": "Missing clerk_id in payload"}

            
            return await handle_user_created(db, clerk_id, email) 

        if event_type == "user.deleted":
            clerk_id = payload.get("data", {}).get("id")

            if not clerk_id:
                return {"status": "error", "message": "Missing clerk_id in payload"}
            
            return await handle_user_deleted(db, clerk_id) 
        




    except Exception as e:
        print(e)
        return {"status": "error", "message": "Internal server error processing webhook"}
