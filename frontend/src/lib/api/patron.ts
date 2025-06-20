import { Application, Docs, PatronApplication, PatronRating, PatronResponse } from '@/types/types'

const apiServer = process.env.NEXT_PUBLIC_SERVER

export async function getRatedApplications(): Promise<PatronRating[]> {
  const res = await fetch(`${apiServer}/patron/me/rated-applications/`, {
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
  const res = await fetch(`${apiServer}/patron/applications/`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json'
    },
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Get all applications: network response was not ok')
  return res.json()
}

export async function rateApplication(
  application_id: number,
  rate = 0,
  comment = '',
  docs: Docs
): Promise<PatronRating> {
  const params = new URLSearchParams()
  params.append('rate', rate.toString())
  params.append('comment', comment)
  const res = await fetch(
    `${apiServer}/patron/rate-application/${application_id}/?${params.toString()}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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
  const res = await fetch(`${apiServer}/patron/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ошибка: ${res.status} ${text}`)
  }
  return res.json()
}
