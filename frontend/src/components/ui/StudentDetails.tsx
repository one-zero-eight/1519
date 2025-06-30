import InnoButton from '@/components/ui/shared/InnoButton'
import InnoCheckbox from '@/components/ui/shared/InnoCheckbox'
import { Application, FieldNames, PatronApplication } from '@/lib/types/types'
import ClearIcon from '@mui/icons-material/Clear'
import DoneOutlineIcon from '@mui/icons-material/DoneOutline'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import { FormControlLabel, Link, Radio, RadioGroup, SvgIcon, TextField } from '@mui/material'
import { useEffect, useState } from 'react'

interface StudentDetailsProps {
  application: Application
  rating: PatronApplication | null
  onSelectedDoc: (field: keyof typeof FieldNames | null) => void
  onSave: (patron: PatronApplication) => void
}

export default function StudentDetails({
  application,
  rating,
  onSelectedDoc,
  onSave
}: StudentDetailsProps) {
  const [edit, setEdit] = useState<PatronApplication | null>(null)

  useEffect(() => {
    if (rating) {
      setEdit(rating)
    } else {
      setEdit({
        application_id: application.id,
        patron_id: -1, // This will be set on the backend, -1 is a placeholder
        full_name: application.full_name,
        rate: 0,
        comment: '',
        docs: {
          cv_comments: '',
          cv_seen: false,
          motivational_letter_comments: '',
          motivational_letter_seen: false,
          recommendation_letter_comments: '',
          recommendation_letter_seen: false,
          transcript_comments: '',
          transcript_seen: false,
          almost_a_student_comments: '',
          almost_a_student_seen: false
        }
      })
    }
  }, [application, rating])

  if (!edit) {
    return <div>Loading...</div>
  }

  const documentExists = (key: string) => {
    const docKey = key.replace(/([A-Z])/g, '_$1').toLowerCase() as keyof Application
    return application[docKey] != null
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-row items-center space-x-1">
        <RadioGroup
          aria-labelledby="student-status-radio-group"
          value={edit.rate}
          onChange={(e) => {
            const _ = { ...edit, rate: Number(e.target.value) as 1 | 0 | -1 }
            setEdit(_)
            onSave(_)
          }}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around'
          }}
        >
          <FormControlLabel
            value={1}
            control={<Radio sx={{ color: '#5ea500', '&.Mui-checked': { color: '#5ea500' } }} />}
            label={
              <SvgIcon>
                <DoneOutlineIcon sx={{ color: '#5ea500' }} />
              </SvgIcon>
            }
          />
          <FormControlLabel
            value={-1}
            control={<Radio sx={{ color: '#c10007', '&.Mui-checked': { color: '#c10007' } }} />}
            label={
              <SvgIcon>
                <ClearIcon sx={{ color: '#c10007' }} />
              </SvgIcon>
            }
          />
          <FormControlLabel
            value={0}
            control={<Radio sx={{ color: '#d08700', '&.Mui-checked': { color: '#d08700' } }} />}
            label={
              <SvgIcon>
                <QuestionMarkIcon sx={{ color: '#d08700' }} />
              </SvgIcon>
            }
          />
        </RadioGroup>
        <hr className="h-[10vh] border border-dashed border-gray-400" />
        <h4 className="text-center text-lg">{edit.full_name}</h4>
      </div>
      <TextField
        fullWidth
        label="User comment"
        variant="outlined"
        multiline
        value={edit.comment}
        onChange={(e) =>
          setEdit({
            ...edit,
            comment: e.target.value
          })
        }
        sx={{
          background: '#eeee'
        }}
      />

      <section className="space-y-2">
        {Object.entries(FieldNames).map(([key, label]) => {
          const baseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
          const seenKey = `${baseKey}_seen` as keyof typeof edit.docs
          const commentsKey = `${baseKey}_comments` as keyof typeof edit.docs

          if (!documentExists(key)) return null

          return (
            <div key={key} className="flex flex-col">
              <div className="flex flex-row items-center">
                <InnoCheckbox
                  checked={!!edit.docs[seenKey]}
                  onChange={(e, checked) => {
                    const _ = {
                      ...edit,
                      docs: {
                        ...edit.docs,
                        [seenKey]: checked
                      }
                    }
                    setEdit(_)
                    onSave(_)
                  }}
                />
                <Link
                  href="#"
                  underline="hover"
                  sx={{ minWidth: 180, fontWeight: 500 }}
                  onClick={(e) => {
                    e.preventDefault()
                    onSelectedDoc(key as keyof typeof FieldNames)
                    const _ = {
                      ...edit,
                      docs: {
                        ...edit.docs,
                        [seenKey]: true
                      }
                    }
                    setEdit(_)
                    onSave(_)
                  }}
                >
                  {label}
                </Link>
              </div>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                label="Document comment"
                value={edit.docs[commentsKey] || ''}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    docs: {
                      ...edit.docs,
                      [commentsKey]: e.target.value
                    }
                  })
                }
                sx={{
                  background: '#eeee'
                }}
              />
            </div>
          )
        })}
      </section>

      <div className="flex justify-center w-full mt-4">
        <InnoButton onClick={() => onSave(edit)} className="w-[95%]">
          Save
        </InnoButton>
      </div>

      <hr className="mt-2 border border-dashed border-gray-400" />

      <section className="flex flex-col space-y-4">
        <h4 className="mt-4 text-xl">Not provided docs:</h4>
        {Object.entries(FieldNames).map(([key, label]) => {
          if (documentExists(key)) return null

          return (
            <div key={key} className="space-н-2 flex flex-col">
              <p className="text-lg text-yellow-600">&bull; {label}</p>
            </div>
          )
        })}
      </section>
    </div>
  )
}
