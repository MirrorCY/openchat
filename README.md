# openchat2后端

只能调用openai官方的付费api。国内用户必须要配置代理翻墙才能用。

## 运行方法：

0. 在命令行里执行 `git clone -b openchat2 https://github.com/yi03/openchat`
1. 修改 `config.env` 文件，填入自己的 `API_KEY`
2. 在命令行里执行 `pip install -r requirements.txt`
3. 运行 `chat.py`

参考 https://forum.koishi.xyz/t/topic/59

## 用法

艾特bot 或 提到bot的名字 或 回复bot 后，bot会回复你

发送 `设定 <text>` 设定bot的人格，如 `设定 你是一只猫猫`，不设定人格的话会使用默认的人格。

发送 `重置` 或 `reset` 重置bot的记忆

每个账号的设定和记忆是独立的
