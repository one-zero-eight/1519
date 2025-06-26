import { Checkbox, FormControlLabel, FormGroup, SvgIcon } from '@mui/material'
import React, { useState } from 'react'

interface CheckboxFilterProps {
  options: { icon: React.ReactNode; name: number; color: string }[]
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
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          ml: '1rem'
        }}
      >
        {options.map((option) => (
          <FormControlLabel
            className={`flex items-center justify-center rounded-xl pl-2 pr-2`}
            sx={{
              bgcolor: option.color
            }}
            key={option.name}
            control={
              <Checkbox
                checked={selected.includes(String(option.name))}
                onChange={() => handleChange(String(option.name))}
                name={String(option.name)}
                sx={{
                  '&.MuiSvgIcon-root': { fontSize: 28 },
                  '&.Mui-checked': {
                    color: 'white'
                  }
                }}
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
