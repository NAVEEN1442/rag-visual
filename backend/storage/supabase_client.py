from supabase import create_client, Client
from config import settings

_supabase_client: Client | None = None
//connect to the supabase client
def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is None:
        try:
            _supabase_client = create_client(
                settings.supabase_url.get_secret_value(),
                settings.supabase_service_role_key.get_secret_value(),
            )
        except Exception as e:
            raise RuntimeError(f"Supabase client init failed: {e}") from e
    return _supabase_client
