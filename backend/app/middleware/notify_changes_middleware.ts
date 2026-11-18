import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { pushRefresh } from '#services/push'

export default class NotifyChangesMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    await next()
    if (request.method() !== 'GET' && response.getStatus() < 400) pushRefresh()
  }
}
