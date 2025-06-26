import { type ApplicationRankingStats } from '@/lib/types/types'

const apiServer = import.meta.env.VITE_PUBLIC_API

export async function getRanking(): Promise<ApplicationRankingStats[]> {
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

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url

  const contentDisposition = res.headers.get('content-disposition')
  let filename = 'ranking.xlsx'
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
    if (filenameMatch && filenameMatch.length > 1) {
      filename = filenameMatch[1]
    }
  }

  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
