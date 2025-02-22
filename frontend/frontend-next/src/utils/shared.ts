export interface DbUserDoc {
  seen: boolean
  comment: string
  paths: string[]
}

export interface DbUserName {
  name: string
  rate: number
  comment: string
  docs: {
    cv: DbUserDoc
    motivationalLetter: DbUserDoc
    recommendationLetter: DbUserDoc
    transcript: DbUserDoc
    almostAStudent: DbUserDoc
  }
}

export interface ResInfo {
  [key: string]: DbUserName
}
