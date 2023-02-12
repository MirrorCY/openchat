import uvicorn
from fastapi import FastAPI,Body
from revChatGPT.V2 import Chatbot

port=8006
app = FastAPI()
chatbot = Chatbot(
    email="",
    password="",
    # paid=True,
    # proxy="http://127.0.0.1:7890",
)

'''
根据是否开通了 plus 版，选择 paid 参数，如果开通了，就填 True，否则就不填
根据是否使用代理，选择 proxy 参数，如果你在国内，建议使用代理，否则就不填
email 填写你的 openai 账号，是邮箱
password 填写你的 openai 密码

~~以上是内容 copilot 自动生成的~~

~~以下代码是 chatGPT 生成的~~
'''

async def get_text(prompt):
    text = ""
    async for response in chatbot.ask(prompt):
        text += response["choices"][0]["text"].replace("<|im_end|>", "")
    return text


@app.post("/chat")
async def chatGPT(body: dict = Body(...)):
    prompt = body["prompt"]
    answer = await get_text(prompt)
    print(prompt + "\n" + answer)
    return {"message": answer}


uvicorn.run(app, host="0.0.0.0", port=port)
