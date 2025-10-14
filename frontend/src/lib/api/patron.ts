import { VITE_PUBLIC_API } from '@/lib/constants'
import { HttpError } from '@/lib/types/errors.ts'
import type {
  Application,
  Docs,
  PatronRankingResponse,
  PatronRating,
  PatronResponse
} from '@/lib/types/types'

export async function getRatedApplications(): Promise<PatronRating[]> {
  const res = await fetch(`${VITE_PUBLIC_API}/patron/me/rated-applications`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })
  if (!res.ok) throw new Error('Create message: network response was not ok')
  return res.json()
}

export async function getAllApplications(): Promise<Application[]> {
  const res = await fetch(`${VITE_PUBLIC_API}/patron/applications`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Get all applications: network response was not ok')
  return res.json()
}

export async function rateApplication(
  application_id: number,
  rate = 'unrated',
  comment = '',
  docs: Docs
): Promise<PatronRating> {
  const params = new URLSearchParams()
  params.append('comment', comment)
  params.append('rate', rate.toString())

  const res = await fetch(
    `${VITE_PUBLIC_API}/patron/rate-application/${application_id}?${params.toString()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docs),
      credentials: 'include'
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ошибка: ${res.status} ${text}`)
  }

  return res.json()
}

export async function whoami(): Promise<PatronResponse> {
  const res = await fetch(`${VITE_PUBLIC_API}/patron/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!res.ok) {
    throw new HttpError('Not authorized', res.status)
  }
  return res.json()
}

export async function getRanking(): Promise<PatronRankingResponse> {
  const res = await fetch(`${VITE_PUBLIC_API}/patron/ranking`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!res.ok) {
    throw new HttpError('Failed to get ranking', res.status)
  }

  return res.json()
}

export async function updateRanking(applicationIds: number[]): Promise<PatronRankingResponse> {
  const res = await fetch(`${VITE_PUBLIC_API}/patron/ranking`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ application_ids: applicationIds }),
    credentials: 'include'
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to update ranking: ${res.status} ${text}`)
  }

  return res.json()
}
