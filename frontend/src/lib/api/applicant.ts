import { type Application } from '@/lib/types/types'

const apiServer = import.meta.env.VITE_PUBLIC_API

export interface SubmitFormData {
  email: string
  full_name: string
  cv_file?: File
  transcript_file?: File
  motivational_letter_file?: File
  recommendation_letter_file?: File
  almost_a_student_file?: File
}

export async function submitApplication(formData: SubmitFormData): Promise<Application> {
  const data = new FormData()

  data.append('email', formData.email)
  data.append('full_name', formData.full_name)

  if (formData.cv_file) {
    data.append('cv_file', formData.cv_file)
  }
  if (formData.transcript_file) {
    data.append('transcript_file', formData.transcript_file)
  }
  if (formData.motivational_letter_file) {
    data.append('motivational_letter_file', formData.motivational_letter_file)
  }
  if (formData.recommendation_letter_file) {
    data.append('recommendation_letter_file', formData.recommendation_letter_file)
  }
  if (formData.almost_a_student_file) {
    data.append('almost_a_student_file', formData.almost_a_student_file)
  }

  const res = await fetch(`${apiServer}/applicant/submit/`, {
    method: 'POST',
    body: data,
    credentials: 'include'
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ошибка: ${res.status} ${text}`)
  }

  return res.json()
}

export async function getMyApplication(): Promise<Application> {
  const res = await fetch(`${apiServer}/applicant/my-application/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Application not found')
    }
    const text = await res.text()
    throw new Error(`Ошибка: ${res.status} ${text}`)
  }

  return res.json()
}
