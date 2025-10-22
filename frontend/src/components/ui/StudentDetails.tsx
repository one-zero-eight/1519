import InnoButton from '@/components/ui/shared/InnoButton'
import InnoCheckbox from '@/components/ui/shared/InnoCheckbox'
import { Application, FieldNames, PatronApplication } from '@/lib/types/types'
import ClearIcon from '@mui/icons-material/Clear'
import DoneOutlineIcon from '@mui/icons-material/DoneOutline'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import {
  FormControlLabel,
  Link,
  Radio,
  RadioGroup,
  SvgIcon,
  TextField,
  Tooltip,
  useMediaQuery
} from '@mui/material'
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

  // определяем мобильное устройство
  const isMobile = useMediaQuery('(max-width:600px)')

  useEffect(() => {
    if (rating) {
      setEdit(rating)
    } else {
      setEdit({
        application_id: application.id,
        patron_id: -1, // This will be set on the backend, -1 is a placeholder
        full_name: application.full_name,
        rate: 'unrated',
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

  useEffect(() => {
    if (edit) {
      const timeout = setTimeout(() => {
        onSave(edit)
      }, 2000)

      return () => clearTimeout(timeout)
    }
  }, [JSON.stringify(edit?.docs), edit?.comment]);

  if (!edit) {
    return <div>Loading...</div>
  }

  const documentExists = (key: string) => {
    const docKey = key.replace(/([A-Z])/g, '_$1').toLowerCase() as keyof Application
    return application[docKey] != null
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col items-center gap-2 p-1">
        <RadioGroup
          aria-labelledby="student-status-radio-group"
          value={edit.rate}
          onChange={(e) => {
            const newValue = e.target.value as 'positive' | 'negative' | 'neutral' | 'unrated'
            // Allow unchecking by clicking the same option again
            const _ = { ...edit, rate: edit.rate === newValue ? 'unrated' : newValue }
            setEdit(_)
            onSave(_)
          }}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            gap: 2,
            mb: 1
          }}
        >
          <FormControlLabel
            value={'positive'}
            control={<Radio sx={{ color: '#5ea500', '&.Mui-checked': { color: '#5ea500' } }} />}
            label={
              <SvgIcon>
                <DoneOutlineIcon sx={{ color: '#5ea500', width: '12rem' }} />
              </SvgIcon>
            }
            sx={{ mx: 1 }}
          />
          <FormControlLabel
            value={'negative'}
            control={<Radio sx={{ color: '#c10007', '&.Mui-checked': { color: '#c10007' } }} />}
            label={
              <SvgIcon>
                <ClearIcon sx={{ color: '#c10007' }} />
              </SvgIcon>
            }
            sx={{ mx: 1 }}
          />
          <FormControlLabel
            value={'neutral'}
            control={<Radio sx={{ color: '#d08700', '&.Mui-checked': { color: '#d08700' } }} />}
            label={
              <SvgIcon>
                <QuestionMarkIcon sx={{ color: '#d08700' }} />
              </SvgIcon>
            }
            sx={{ mx: 1 }}
          />
          <FormControlLabel
            value={'unrated'}
            control={<Radio sx={{ color: '#9ca3af', '&.Mui-checked': { color: '#9ca3af' } }} />}
            label={
              <SvgIcon>
                <RadioButtonUncheckedIcon sx={{ color: '#9ca3af' }} />
              </SvgIcon>
            }
            sx={{ mx: 1 }}
          />
        </RadioGroup>
        <div className="flex flex-col gap-1 items-center">
          <h4 className="text-center text-lg">{edit.full_name}</h4>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              flexDirection: 'column'
            }}
          >
            <span style={{ fontSize: 15, color: '#555', fontWeight: 500 }}>
              {application.email}
              {!isMobile && (
                <Tooltip
                  title={`Дата отправки: ${application.submitted_at ? new Date(application.submitted_at).toLocaleString() : 'неизвестно'}`}
                  placement="right"
                  arrow
                >
                  <span style={{ cursor: 'pointer', color: '#888', fontSize: 18, marginLeft: 4 }}>
                    🛈
                  </span>
                </Tooltip>
              )}
            </span>
            {isMobile && (
              <span style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
                Дата отправки:{' '}
                {application.submitted_at
                  ? new Date(application.submitted_at).toLocaleString()
                  : 'неизвестно'}
              </span>
            )}
          </div>
        </div>
        <hr className="w-full border border-dashed border-gray-400" />
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

      <hr className="mt-4 border border-dashed border-gray-400" />

      <section className="flex flex-col space-y-4 lg:items-start items-center">
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
