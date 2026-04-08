import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or url == "YOUR_SUPABASE_URL_HERE":
    # Let's handle the case where the URL is not set yet gracefully
    supabase: Client = None
else:
    supabase: Client = create_client(url, key)

def get_supabase():
    if not supabase:
        raise Exception("SUPABASE_URL não configurada no arquivo .env")
    return supabase
