# Placeholder AI assistant integration
# - Use Rasa for local NLU (Amharic intents)
# - Fallback to OpenAI if no intent matched
import os
from typing import Dict
def handle_query(user_input: str) -> Dict:
    # Implement Rasa parsing here (or call cloud Rasa)
    # If no confident intent -> call OpenAI using openai package
    return {"reply": "ይህ የሞያ አማካሪ የሙከራ መልስ ነው"}
