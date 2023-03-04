import { Context, h, Logger, Schema } from 'koishi'
import { GetResponse } from './types'

export const name = 'openchat2'

const logger = new Logger(name)

export const usage = "[自建后端转发服务](https://github.com/yi03/openchat/tree/openchat2)，目前尚未存在手把手教程，有基本的 python 使用经验一般可以较为轻松的搭建。"

export interface Config {
  botname: string
  endPoint: string
}

export const Config: Schema<Config> = Schema.object({
  botname: Schema.string().description('bot的名字'),
  endPoint: Schema.string().description('服务器地址').default('http://127.0.0.1:8006/chat')
})

function getReplyCondition(session, config) {
  if (session.subtype === 'group') { // 群聊
    if (session.parsed.appel)
      return 1; // @bot
    if (session.content.includes(config.botname))
      return 2; // 包含botname
    if (Math.random() < config.randomReplyFrequency)
      return 3; // 随机回复
    return 0; // 不回复
  }
  else {
    return 4; // 私聊
  }
}

export function apply(ctx: Context, config: Config) {
  ctx.i18n.define('zh', require('./locales/zh'))

  const getRes = async (uid: string, username: string, input: string, setting: boolean, reset: boolean): Promise<string> => {
    let res: GetResponse = await ctx.http.axios(config.endPoint, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 300000,
      data: {
        uid: uid,
        username: username,
        prompt: input,
        setting: setting,
        reset: reset
      }
    })
    if (res) return res.data['message']
    throw new Error()
  }
  const cmd = ctx.command(`设定 <设定bot的人格:text>`)
    .alias('set')
    .action(async ({ session }, input) => {
      if (!input?.trim()) return session.execute(`help ${name}`)
      try {
        await session.send(
          h('quote', { id: session.messageId }) + await getRes(session.uid, session.username, input, true, false)
        )
      }
      catch { return session.text('.network-error') }
    })
  const cmd2 = ctx.command(`重置`)
    .alias('reset')
    .action(async ({ session }, input) => {
      try {
        await session.send(
          h('quote', { id: session.messageId }) + await getRes(session.uid, session.username, input, false, true)
        )
      }
      catch { return session.text('.network-error') }
    })
  ctx.middleware(async (session, next) => {
    if (ctx.bots[session.uid])
      return; // ignore bots from self
    const condition = getReplyCondition(session, config);
    if (condition === 0)
      return next(); // 不回复
    const input = session.content.replace(/<[^>]*>/g, ''); // 去除XML元素
    if (input === '')
      return next(); // ignore empty message
    logger.info(`condition ${condition} met, replying`);
    // get info from session
    const uid = session.uid;
    const username = session.username;
    try {
      await session.send(
        h('quote', { id: session.messageId }) + await getRes(uid, username, input, false, false)
      )
    }
    catch { return session.text('.network-error') }
  })
}
