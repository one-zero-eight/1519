'use client'
import React, { useState } from 'react'
import { FormGroup, Checkbox, FormControlLabel, SvgIcon } from '@mui/material'

interface CheckboxFilterProps {
  options: { icon: React.ReactNode; name: string }[]
  onChange: (selected: string[]) => void
}

function CheckboxFilter({ options, onChange }: CheckboxFilterProps) {
  const [selected, setSelected] = useState<string[]>([])

  const handleChange = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter((s) => s !== option)
      : [...selected, option]

    setSelected(newSelected)
    onChange(newSelected)
  }

  return (
    <fieldset>
      <FormGroup
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '8px',
          width: '100%'
        }}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.name}
            control={
              <Checkbox
                checked={selected.includes(option.name)}
                onChange={() => handleChange(option.name)}
                name={option.name}
              />
            }
            label={<SvgIcon>{option.icon}</SvgIcon>}
          />
        ))}
      </FormGroup>
    </fieldset>
  )
}

export default CheckboxFilter
