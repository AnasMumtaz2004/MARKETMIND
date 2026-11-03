import os
from typing import Any
from dotenv import load_dotenv

load_dotenv()

def get_llm() -> Any:
    """
    Centralized LLM Factory returning configured LangChain chat model.
    Supports 'gemini' and 'groq' via environment variables.
    Throws descriptive errors if provider or keys are missing or invalid.
    """
    provider = os.getenv("LLM_PROVIDER", "gemini").strip().lower()

    if provider == "groq":
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key or api_key in ("your_groq_api_key", ""):
            raise ValueError("Groq provider selected, but GROQ_API_KEY is not set in environment.")
        
        model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        try:
            from langchain_groq import ChatGroq
            return ChatGroq(
                api_key=api_key,
                model_name=model_name,
                temperature=0.2,
            )
        except ImportError:
            raise ImportError("langchain-groq package not installed. Run 'pip install langchain-groq'.")

    elif provider == "gemini":
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key in ("your_gemini_api_key", "MY_GEMINI_API_KEY", ""):
            raise ValueError("Gemini provider selected, but GEMINI_API_KEY is not set in environment.")

        model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            return ChatGoogleGenerativeAI(
                google_api_key=api_key,
                model=model_name,
                temperature=0.2,
            )
        except ImportError:
            # Also support standard ChatGoogleGenerativeAI or google-genai
            raise ImportError("langchain-google-genai package not installed. Run 'pip install langchain-google-genai'.")

    else:
        raise ValueError(
            f"Unsupported LLM_PROVIDER '{provider}'. Allowed options are 'gemini' or 'groq'."
        )
