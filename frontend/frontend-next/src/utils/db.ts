import { DbUserName, DbUserDoc } from './shared'
import { join } from 'path'
import { promises as fs } from 'fs'

const dbPath = join(process.cwd(), 'db.json')

async function readDb() {
  const data = await fs.readFile(dbPath, 'utf-8')
  return JSON.parse(data)
}

async function writeDb(data: any) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2))
}

export async function dbUserList() {
  const db = await readDb()
  return new Map(Object.entries(db))
}

export async function dbUserUpdate(user_id: string, f: (x: DbUserName) => void) {
  const db = await readDb()
  const user = db[user_id] || { rate: 0, comment: '', docs: {} }
  f(user)
  db[user_id] = user
  await writeDb(db)
}
