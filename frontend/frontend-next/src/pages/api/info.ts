import { NextApiRequest, NextApiResponse } from 'next'
import { dbUserList } from '@/utils/db'
import { ResInfo } from '@/utils/shared'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const db = await dbUserList()
  const resInfo: ResInfo = {}
  for (const [user_id, user] of db) {
    resInfo[user_id] = {
      ...user,
      name: `${user.firstName} ${user.lastName}`
    }
  }

  res.status(200).json(resInfo)
}
