import { NextApiRequest, NextApiResponse } from 'next'
import { dbUserUpdate } from '@/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const [user_id, { rate, comment }] = req.body
  await dbUserUpdate(user_id, (user) => Object.assign(user, { rate, comment }))

  res.status(200).json({ message: 'User updated successfully' })
}
