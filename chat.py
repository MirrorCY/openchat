from revChatGPT.Official import Chatbot
from fastapi import FastAPI
import uvicorn
from pydantic import BaseModel

port = 8006
app = FastAPI()
chatbot = Chatbot(api_key="") 
# 只需填入你的 openai api_key 即可。一键直达 https://platform.openai.com/account/api-keys
# 不再需要 2captcha 密钥
# 按照 https://github.com/acheong08/ChatGPT 的说法是完全免费的，但未经证实

class ChatRequest(BaseModel):
    prompt: str

@app.post("/chat")
def chatGPT(request: ChatRequest):
    prompt = request.prompt
    print(prompt)
    if prompt == "__clear__":
        chatbot.reset()
        return {"message": "OK"}
    answer = chatbot.ask(prompt)["choices"][0]["text"]
    print(answer)
    return {"message": answer}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=port)
