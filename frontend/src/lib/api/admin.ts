import { VITE_PUBLIC_API } from '@/lib/constants'
import { type ApplicationRankingStats } from '@/lib/types/types'

export async function getRanking(): Promise<ApplicationRankingStats[]> {
  const res = await fetch(`${VITE_PUBLIC_API}/admin/applications/ranking`, {
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
  const res = await fetch(`${VITE_PUBLIC_API}/admin/applications/export`, {
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

export async function getPatrons() {
  const res = await fetch(`${VITE_PUBLIC_API}/admin/patrons`, {
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

export async function addPatron(patronTgId: string) {
  const data = {
    telegram_id: patronTgId,
    telegram_data: {},
    is_admin: false
  }

  const res = await fetch(`${VITE_PUBLIC_API}/admin/add-patron`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ошибка: ${res.status} ${text}`)
  }

  return res.json()
}

export async function removePatron(patronTgId: string) {
  const res = await fetch(`${VITE_PUBLIC_API}/admin/delete-patron/${patronTgId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ошибка: ${res.status} ${text}`)
  }

  return res.json()
}

export async function promotePatron(patronTgId: string, isAdmin: boolean) {
  const params = new URLSearchParams({
    patron_telegram_id: patronTgId,
    is_admin: isAdmin.toString()
  })

  const res = await fetch(`${VITE_PUBLIC_API}/admin/promote?${params}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ошибка: ${res.status} ${text}`)
  }

  return res.json()
}
