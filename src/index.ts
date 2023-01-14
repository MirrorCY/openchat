import { Context, h, Logger, Schema } from 'koishi'
import { GetResponse, Moderation } from './types'

export const name = 'openchat'
export const usage = '需要注意的内容：</br>前缀由于误触发概率过高，现已去除；</br>本公共服务为随机分配的共享上下文，不适当言论将导致其他用户的消息被污染，请提醒群友理性提问；'+
'</br>触发词新增了 `ask`;</br>超时时间改为了 300 秒，应该可以解决一部分的网络异常报错；</br>只有最新版可以正常使用，及时更新'

const logger = new Logger(name)

export interface Config {
  watingMsg?: boolean
  limit?: number
}

export const Config: Schema<Config> = Schema.object({
  watingMsg: Schema.boolean().description('等待响应前是否提示。').default(false),
  limit: Schema.number().description('风险模型阈值（目前效果较为糟糕，可以当它不存在）。100 关闭、60 宽松、20 严格。')
    .default(60).max(100).min(0)
})

export function apply(ctx: Context, config: Config) {
  ctx.i18n.define('zh', require('./locales/zh'))

  const inputModeration = async (limit: number, input: string): Promise<string> => {
    const moderation: Moderation = (
      await ctx.http.post(
        `https://chat.elchapo.cn:65502/v2/text-moderation`, { prompt: input })
        .catch(err => logger.error(err))
    )
    if (!moderation) return 'pass'
    for (const [key, value] of Object.entries(moderation.category_scores)) {
      if (value > limit / 100) return key
    }
    return 'pass'
  }

  const getRes = async (input: string): Promise<string> => {
    let res: GetResponse = await ctx.http.axios('https://chat.elchapo.cn:65502/v2/chat', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'api': '422'
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
      const checkReslt: string = await inputModeration(config.limit, input)
      if (checkReslt === 'pass') {
        try {
          await session.send(
            h('quote', { id: session.messageId }) + await getRes(input)
          )
        }
        catch { return session.text('.network-error') }
      } else {
        return session.text('.prohibited', [session.text(`.${checkReslt}`)])
      }
    })
}
