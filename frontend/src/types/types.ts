export interface PatronApplication {
  patron_id: number
  application_id: number
  rate: -1 | 0 | 1
  full_name: string
  comment?: string
  docs: Docs
}

export interface Application {
  id: number
  submitted_at: string
  session_id: string
  email: string
  full_name: string
  cv: string | null
  motivational_letter: string | null
  recommendation_letter: string | null
  transcript: string | null
  almost_a_student: string | null
}

export interface Docs {
  cv_comments?: string | ''
  cv_seen?: boolean | false

  motivational_letter_comments?: string | ''
  motivational_letter_seen?: boolean | false

  recommendation_letter_comments?: string | ''
  recommendation_letter_seen?: boolean | false

  transcript_comments?: string | ''
  transcript_seen?: boolean | false

  almost_a_student_comments?: string | ''
  almost_a_student_seen?: boolean | false
}

export interface PatronRating {
  patron_id: number
  application_id: number
  rate: -1 | 0 | 1
  comment?: string
  docs: Docs
}

export interface StudentListItem {
  application_id: number
  full_name: string
  rate: -1 | 0 | 1 | null // null if not rated
}

export enum FieldNames {
  motivationalLetter = 'Motivational Letter',
  recommendationLetter = 'Recommendation Letter',
  transcript = 'Transcript',
  almostAStudent = 'Almost A Student',
  cv = 'CV'
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url: string
  auth_date: number
  hash: string
}

export interface PatronResponse {
  telegram_id: string
  telegram_data: {}
  is_admin: boolean
}

export interface ApplicationRankingStats {
  application: Application
  rff_score: number
  positive_votes: number
  negative_votes: number
  neutral_votes: number
  total_votes: number
}
