import os
import json
import uvicorn
from fastapi import FastAPI, Body
from mychatbot import MyChatbot
from dotenv import load_dotenv


load_dotenv(dotenv_path="config.env")

memory_dir = os.getenv("MEMORY_DIR")
port = int(os.getenv("PORT"))
chatbot = MyChatbot(
    api_key=os.getenv("API_KEY"),
    proxy=os.getenv("PROXY"),
)
app = FastAPI()


async def get_text(memory: list, prompt: str):
    memory.append({"role": "user", "content": prompt})
    return chatbot.ask(memory)


def load_memory(uid: str) -> list:
    """
    Load the conversation from a JSON file
    """
    filename = f"./memory/{uid}.json"
    if os.path.exists(filename):
        with open(filename, encoding="utf-8") as f:
            return json.load(f)
    else:
        return [{
                "role": "system",
                "content": chatbot.system_prompt,
                }]


def save_memory(uid: str, memory: list, message: dict):
    """
    Load the conversation from a JSON file
    """
    if not os.path.isdir(memory_dir):
        os.mkdir(memory_dir)
    filename = f"{memory_dir}/{uid}.json"
    if message:
        memory.append(message)
    with open(filename, mode="w", encoding="utf-8") as f:
        json.dump(memory, f, indent=2, ensure_ascii=False)


@app.post("/chat")
async def chatGPT(body: dict = Body(...)):
    uid = body["uid"].replace(":", "_")
    username = body["username"]
    if body["reset"]:
        if os.path.exists(f"{memory_dir}/{uid}.json"):
            os.remove(f"{memory_dir}/{uid}.json")
        return {"message": "重置成功"}
    prompt = body["prompt"]
    if body["setting"]:
        memory = load_memory(uid)
        memory[0]["content"] = prompt
        save_memory(uid, memory, {})
        return {"message": "设定成功"}
    memory = load_memory(uid)
    message = await get_text(memory, prompt)
    save_memory(uid, memory, message)
    print(uid + "\n" + prompt + "\n" + message["content"])
    return {"message": message["content"]}


uvicorn.run(app, host="0.0.0.0", port=port)
