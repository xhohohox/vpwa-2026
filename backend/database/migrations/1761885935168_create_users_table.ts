import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('first_name', 50).notNullable()
      table.string('last_name', 50).notNullable()
      // used in commands and mentions (/invite nick, @nick)
      table.string('nick_name', 30).notNullable().unique()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()

      // use case 9: DND pauses notifications, offline pauses messages
      table.enum('status', ['online', 'dnd', 'offline']).notNullable().defaultTo('online')
      // use case 8: notifications only for messages with my @nickname
      table.boolean('notify_mentions_only').notNullable().defaultTo(false)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}