// Prototype only: without a backend nobody else is online, so this script
// pretends that other users type and send messages (use case 11).
// Later the backend will send the same data over WebSockets.
import { currentUser, messages, typing, nextMessageId } from '@/data/mock.js'

const script = [
  { channel: 'general', nickName: 'zigo', text: 'Kto ide zajtra na trening?' },
  {
    channel: 'general',
    nickName: 'demitra',
    text: '@bondra2002 ty urcite, nie?'
  },
  {
    channel: 'vpwa',
    nickName: 'demitra',
    text: 'Prototyp odovzdavame do nedele.'
  }
]

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// An offline user receives nothing until they go online again (use case 9)
async function waitUntilOnline() {
  while (currentUser.status === 'offline') await sleep(500)
}

let started = false

export async function startTypingSimulation() {
  if (started) return
  started = true

  for (const { channel, nickName, text } of script) {
    await sleep(4000)
    await waitUntilOnline()

    typing.push({ channel, nickName, draft: '' })
    const typist = typing.at(-1) // reactive version of the pushed object

    // One character at a time, so the preview changes on every keystroke
    for (const char of text) {
      typist.draft += char
      await sleep(150)
    }
    await sleep(1000)

    typing.splice(typing.indexOf(typist), 1)
    await waitUntilOnline()
    messages.push({
      id: nextMessageId(),
      channel,
      author: nickName,
      text,
      createdAt: new Date()
    })
  }
}