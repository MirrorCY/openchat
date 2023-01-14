from revChatGPT.ChatGPT import Chatbot
from fastapi import FastAPI
import uvicorn
from pydantic import BaseModel

port = 8006

app = FastAPI()
chatbot = Chatbot(
    {
        "email": "邮箱",
        "password": "密码",
        "captcha": "2captcha 密钥",
    }
)



# 依赖这两个东西，参照 acheong08/ChatGPT 文档进行配置
# https://github.com/acheong08/ChatGPT
# https://2captcha.com/




class ChatRequest(BaseModel):
    prompt: str

@app.post("/chat")
def chatGPT(request: ChatRequest):
    prompt = request.prompt
    print(prompt)
    answer = chatbot.ask(prompt)
    print(answer)
    return answer

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=port)
