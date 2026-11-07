import vine from '@vinejs/vine'

/**
 * /join channelName [private] (use case 4), the name is one word like in the command
 */
export const joinValidator = vine.create({
  name: vine.string().trim().maxLength(50).regex(/^\S+$/),
  private: vine.boolean().optional(),
})

/**
 * /invite, /revoke and /kick take a nickName
 */
export const nickNameValidator = vine.create({
  nickName: vine.string().trim(),
})

/**
 * A message from the command line (use case 3)
 */
export const messageValidator = vine.create({
  text: vine.string().trim().minLength(1).maxLength(2000),
})
