export interface Student {
  id: string
  name: string
  status: 'V' | 'X' | '?'
  details: {
    comment: string
    documents: {
      motivationalLetter: boolean
      recommendationLetter: boolean
      transcript: boolean
      almostAStudent: boolean
    }
  }
}
