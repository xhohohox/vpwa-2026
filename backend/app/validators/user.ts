import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

/**
 * Validator to use when performing self-signup (use case 1).
 * The same rules as in the frontend (quasar/src/utils/validation.js),
 * the server must check them again because the client can be bypassed.
 */
export const signupValidator = vine.create({
  firstName: vine.string().trim().maxLength(50),
  lastName: vine.string().trim().maxLength(50),
  // used in commands and mentions (/invite nick, @nick), so one word only
  nickName: vine
    .string()
    .trim()
    .maxLength(30)
    .regex(/^\S+$/)
    .unique({ table: 'users', column: 'nick_name' }),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

export const settingsValidator = vine.create({
  status: vine.enum(['online', 'dnd', 'offline']).optional(),
  notifyMentionsOnly: vine.boolean().optional(),
})

/**
 * Validator to use before validating user credentials
 * during login
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})