// Rules for QInput internal validation
// https://quasar.dev/vue-components/input#internal-validation
// Each rule returns true when the value is valid, otherwise an error message.

export const required = val => !!val || 'This field is required'

export const isEmail = val =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Enter a valid email'

export const minLength = min => val =>
  val.length >= min || `Must be at least ${min} characters`

// nickName is used in commands and mentions (/invite nick, @nick),
// so it must be a single word
export const noSpaces = val => !/\s/.test(val) || 'Must not contain spaces'