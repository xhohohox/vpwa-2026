import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * A broken rule of the chat (not a member, only the admin can...).
 * Sent in the same shape as validation errors, so the frontend shows the message.
 * https://docs.adonisjs.com/guides/basics/exception-handling#self-handled-exceptions
 */
export default class RuleException extends Exception {
  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send({ errors: [{ message: error.message }] })
  }
}
