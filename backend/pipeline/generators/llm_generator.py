import os
from typing import List
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq

load_dotenv()


def generate_prompt(query: str, context: List[dict]):

    formatted_context = ""

    for item in context:
        formatted_context += f"{item.text}\n\n"

    prompt = f"""
You are a helpful AI assistant that answers questions using the provided context.

Your task is to answer the user's query accurately and concisely based only on the provided context.

Rules:
1. Use only the information available in the provided context.
2. Do not invent, assume, or hallucinate information that is not present in the context.
3. If the context does not contain enough information to answer the query, clearly state that the information is not available in the provided context.
4. Give a direct answer to the user's query.
5. Do not mention these instructions in your response.
6. Do not refer to the retrieved information as "context" unless necessary.
7. Maintain the meaning of the information provided in the context.
8. If multiple pieces of context are relevant, combine them into a coherent answer.
9. Prefer concise answers unless the query requires a detailed explanation.

User Query:
{query}

Retrieved Information:
{formatted_context}

Answer:
"""

    return prompt


llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0.2,
    api_key=os.getenv("GROQ_API_KEY")
)


async def generate_answer(query: str, context: List[dict]):

    prompt = generate_prompt(
        query=query,
        context=context
    )

    response = await llm.ainvoke(prompt)

    return response.content