import { PatronApplication } from '@/types/types'

const apiServer = process.env.NEXT_PUBLIC_SERVER

export async function getApplications(): Promise<PatronApplication> {
  const res = await fetch(`${apiServer}/patron/applications/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (!res.ok) throw new Error('Create message: network response was not ok')
  return res.json()
}
