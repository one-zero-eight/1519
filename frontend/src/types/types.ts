export interface PatronApplication {
  patron_id: number
  application_id: number
  rate: -1 | 0 | 1
  full_name: string
  application_comment?: string
  docs: {
    cv_comments?: string
    cv_seen?: boolean | false

    motivational_letter_comments?: string
    motivational_letter_seen?: boolean | false

    recommendation_letter_comments?: string
    recommendation_letter_seen?: boolean | false

    transcript_comments?: string
    transcript_seen?: boolean | false

    almost_a_student_comments?: string
    almost_a_student_seen?: boolean | false
  }
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
