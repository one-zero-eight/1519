'use client'
import React, { useState } from 'react'
import {
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  SvgIcon
} from '@mui/material'
import { Student } from '@/types/Student'
import DoneOutlineIcon from '@mui/icons-material/DoneOutline'
import ClearIcon from '@mui/icons-material/Clear'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import InnoCheckbox from '@/components/shared/InnoCheckbox'
import InnoButton from '@/components/shared/InnoButton'

interface StudentDetailsProps {
  student: Student
  onSave: (student: Student) => void
}

export default function StudentDetails({ student, onSave }: StudentDetailsProps) {
  const [edit, setEdit] = useState(student)

  const handleStatus = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEdit({
      ...edit,
      status: e.target.value as 'V' | 'X' | '?'
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center space-x-2">
        <RadioGroup
          aria-labelledby="student-status-radio-group"
          value={edit.status}
          onChange={handleStatus}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around'
          }}
        >
          <FormControlLabel
            value="V"
            control={<Radio sx={{ color: '#5ea500', '&.Mui-checked': { color: '#5ea500' } }} />}
            label={
              <SvgIcon>
                <DoneOutlineIcon sx={{ color: '#5ea500' }} />
              </SvgIcon>
            }
          />
          <FormControlLabel
            value="X"
            control={<Radio sx={{ color: '#c10007', '&.Mui-checked': { color: '#c10007' } }} />}
            label={
              <SvgIcon>
                <ClearIcon sx={{ color: '#c10007' }} />
              </SvgIcon>
            }
          />
          <FormControlLabel
            value="?"
            control={<Radio sx={{ color: '#d08700', '&.Mui-checked': { color: '#d08700' } }} />}
            label={
              <SvgIcon>
                <QuestionMarkIcon sx={{ color: '#d08700' }} />
              </SvgIcon>
            }
          />
        </RadioGroup>
        <h4 className="text-lg">{student.name}</h4>
      </div>
      <TextField
        fullWidth
        label="User comment"
        variant="outlined"
        multiline
        value={edit.details.comment}
        onChange={(e) =>
          setEdit({ ...edit, details: { ...edit.details, comment: e.target.value } })
        }
      />

      <div className="space-y-2">
        <FormControlLabel
          control={
            <div className="flex flex-col space-y-2">
              <InnoCheckbox
                checked={edit.details.documents.motivationalLetter}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    details: {
                      ...edit.details,
                      documents: {
                        ...edit.details.documents,
                        motivationalLetter: e.target.checked
                      }
                    }
                  })
                }
              />
            </div>
          }
          label="Мотивационное письмо"
        />

        <FormControlLabel
          control={
            <div className="flex flex-col space-y-2">
              <InnoCheckbox
                checked={edit.details.documents.recommendationLetter}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    details: {
                      ...edit.details,
                      documents: {
                        ...edit.details.documents,
                        recommendationLetter: e.target.checked
                      }
                    }
                  })
                }
              />
            </div>
          }
          label="Рекомендательное письмо"
        />

        <FormControlLabel
          control={
            <div className="flex flex-col space-y-2">
              <InnoCheckbox
                checked={edit.details.documents.almostAStudent}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    details: {
                      ...edit.details,
                      documents: {
                        ...edit.details.documents,
                        almostAStudent: e.target.checked
                      }
                    }
                  })
                }
              />
            </div>
          }
          label="Транскрипт"
        />
      </div>

      <FormControlLabel
        control={
          <div className="flex flex-col space-y-2">
            <InnoCheckbox
              checked={edit.details.documents.transcript}
              onChange={(e) =>
                setEdit({
                  ...edit,
                  details: {
                    ...edit.details,
                    documents: {
                      ...edit.details.documents,
                      transcript: e.target.checked
                    }
                  }
                })
              }
            />
          </div>
        }
        label="Almost A Student"
      />

      <InnoButton
        variant="contained"
        color="primary"
        onClick={() => {
          onSave(edit)
        }}
      >
        SAVE
      </InnoButton>
    </div>
  )
}
