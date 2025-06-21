import { ApplicationRankingStats } from '@/types/types'

const apiServer = process.env.NEXT_PUBLIC_SERVER

export async function getRanking(): Promise<ApplicationRankingStats> {
  const res = await fetch(`${apiServer}/admin/applications/ranking`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ошибка: ${res.status} ${text}`)
  }

  return res.json()
}

export async function exportApplications() {
  const res = await fetch(`${apiServer}/admin/applications/export`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ошибка: ${res.status} ${text}`)
  }

  return res.json()
}
