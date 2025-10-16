import { type Application } from '@/lib/types/types'

import { VITE_PUBLIC_API } from '@/lib/constants'

export interface SubmitFormData {
  email: string
  full_name: string
  cv_file?: File
  transcript_file?: File
  motivational_letter_file?: File
  recommendation_letter_file?: File
  almost_a_student_file?: File
}

export async function submitApplication(formData: FormData): Promise<Application> {
  const res = await fetch(`${VITE_PUBLIC_API}/applicant/submit`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
    // НЕ добавляем Content-Type заголовок - браузер автоматически установит multipart/form-data с boundary
  })

  if (!res.ok) {
    const errorDetail = await res.json()
    throw new Error(errorDetail.detail)
  }

  return res.json()
}

export async function getMyApplication(): Promise<Application> {
  const res = await fetch(`${VITE_PUBLIC_API}/applicant/my-application`, {
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
    const errorDetail = await res.json()
    throw new Error(errorDetail.detail)
  }

  return res.json()
}
