from google import genai
import os
from dotenv import load_dotenv

load_dotenv(override=True)

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

models = client.models.list()

for m in models:
    print(m.name)

# from google import genai

# client = genai.Client(api_key="AIzaSyD2PzA0zneKGWVz8kZpROqGMZ6Ky2vYbko")

# response = client.models.generate_content(
#     model="gemini-3-flash-preview", contents="Explain how AI works in a few words"
# )
# print(response.text)