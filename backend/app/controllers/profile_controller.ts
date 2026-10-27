import UserTransformer from '#transformers/user_transformer'
import { settingsValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async show({ auth, serialize }: HttpContext) {
    return serialize(UserTransformer.transform(auth.getUserOrFail()))
  }

  async update({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const settings = await request.validateUsing(settingsValidator)

    user.merge(settings)
    await user.save()

    return serialize(UserTransformer.transform(user))
  }
}
