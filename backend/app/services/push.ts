import socket from '@rlanz/socket/services/main'
import type User from '#models/user'


// channels, members or statuses changed, every client loads its lists again
export function pushRefresh() {
  socket.to('updates').emit('refresh', {})
}

// a new message for a member of its channel
export function pushMessage(user: User, message: unknown) {
  socket.to(`users/${user.id}`).emit('message', message)
}
