import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async index({ auth, serialize }: HttpContext) {
    const me = auth.getUserOrFail()
    const users = await User.query().whereNot('id', me.id).orderBy('nick_name')

    return serialize(users.map((user) => ({ nickName: user.nickName, status: user.status })))
  }
}
