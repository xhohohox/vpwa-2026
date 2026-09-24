import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'vpwa',
  password: process.env.PGPASSWORD || 'vpwa',
  database: process.env.PGDATABASE || 'vpwa'
})

await pool.query(`
  CREATE TABLE IF NOT EXISTS greetings (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL UNIQUE
  )
`)

await pool.query(`
  INSERT INTO greetings (message)
  SELECT 'Hello World'
  WHERE NOT EXISTS (SELECT 1 FROM greetings WHERE message = 'Hello World')
`)

const { rows } = await pool.query('SELECT * FROM greetings')
console.table(rows)

await pool.end()