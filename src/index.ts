import { Context, h, Logger, Schema } from 'koishi'
import { GetResponse } from './types'

export const name = 'openchat'

const logger = new Logger(name)

export const usage = "[自建后端转发服务](https://github.com/MirrorCY/openchat/blob/main/chat.py)，目前尚未存在手把手教程，有基本的 python 使用经验一般可以较为轻松的搭建。"

export interface Config {
  watingMsg?: boolean,
  endPoint: string
}

export const Config: Schema<Config> = Schema.object({
  watingMsg: Schema.boolean().description('等待响应前是否提示。').default(false),
  endPoint: Schema.string().description('服务器地址').default('http://127.0.0.1:8006/chat')
})

export function apply(ctx: Context, config: Config) {
  ctx.i18n.define('zh', require('./locales/zh'))

  const getRes = async (input: string): Promise<string> => {
    let res: GetResponse = await ctx.http.axios(config.endPoint, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 300000,
      data: {
        prompt: input
      }
    })
    if (res) return res.data['message']
    throw new Error()
  }

  const cmd = ctx.command(`${name} <提问内容:text>`)
    .alias('ask')
    .action(async ({ session }, input) => {
      if (!input?.trim()) return session.execute(`help ${name}`)
      if (config.watingMsg) session.send(session.text('.wating'))
      try {
        await session.send(
          h('quote', { id: session.messageId }) + await getRes(input)
        )
      }
      catch { return session.text('.network-error') }
    })
}
