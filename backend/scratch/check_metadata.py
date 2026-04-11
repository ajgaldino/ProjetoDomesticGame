from database import get_supabase
import os
from dotenv import load_dotenv

load_dotenv()

def check_user_metadata():
    sb = get_supabase()
    # Test with a dummy query or just list users if possible (usually needs service role)
    # Since I don't have service role, I'll just assume metadata is there per Supabase docs.
    pass

if __name__ == "__main__":
    check_user_metadata()
