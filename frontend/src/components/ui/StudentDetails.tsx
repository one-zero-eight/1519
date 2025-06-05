'use client'
import React, { useState } from 'react'
import { TextField, FormControlLabel, RadioGroup, Radio, SvgIcon, Link } from '@mui/material'
import { FieldNames, PatronApplication } from '@/types/types'
import DoneOutlineIcon from '@mui/icons-material/DoneOutline'
import ClearIcon from '@mui/icons-material/Clear'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import InnoCheckbox from '@/components/ui/shared/InnoCheckbox'
import InnoButton from '@/components/ui/shared/InnoButton'

interface StudentDetailsProps {
  patron: PatronApplication
  onSelectedDoc: (field: FieldNames | null) => void
  onSave: (patron: PatronApplication) => void
}

export default function StudentDetails({ patron, onSelectedDoc, onSave }: StudentDetailsProps) {
  const [edit, setEdit] = useState<PatronApplication>(patron);

    const handlePickDocument = (doc: FieldNames) => {
        onSelectedDoc(doc)
    }

  return (
    <div className="space-y-2">
      <div className="flex flex-row items-center space-x-1">
        <RadioGroup
          aria-labelledby="student-status-radio-group"
          value={edit.rate}
          onChange={(e) => setEdit({ ...edit, rate: Number(e.target.value) as 1 | 0 | -1 })}
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
        value={edit.application_comment}
        onChange={(e) =>
          setEdit({
            ...edit,
            application_comment: e.target.value
          })
        }
        sx={{
          background: '#eeee'
        }}
      />

      <section className="space-y-2">
        {Object.entries(FieldNames).map(([key, label]) => {
          const baseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase() // например, motivationalLetter -> motivational_letter
          const seenKey = `${baseKey}_seen` as keyof typeof edit.docs
          const commentsKey = `${baseKey}_comments` as keyof typeof edit.docs

          if (edit.docs[commentsKey] === undefined) return null

          return (
            <div key={key} className="space-y-w flex flex-col">
              <div className="flex flex-row items-center">
                <InnoCheckbox
                  checked={!!edit.docs[seenKey]}
                  onChange={(_, checked) =>
                    setEdit({
                      ...edit,
                      docs: {
                        ...edit.docs,
                        [seenKey]: checked
                      }
                    })
                  }
                />
                <Link
                    href="#"
                    underline="hover"
                    sx={{ minWidth: 180, fontWeight: 500 }}
                    onClick={e => {
                        e.preventDefault();
                        handlePickDocument(key as FieldNames)
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

      <InnoButton onClick={() => onSave(edit)}>Save</InnoButton>
    </div>
  )
}
