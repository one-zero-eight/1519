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
          justifyContent: 'space-around',
          width: '100%',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        {options.map((option) => (
          <FormControlLabel
            sx={{
              bgcolor: option.color,
              borderRadius: 2,
              px: 1,
              py: 0.5,
              m: 0,
              minWidth: 'auto'
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
                  },
                  p: 0.5
                }}
              />
            }
            label={<SvgIcon sx={{ fontSize: 20 }}>{option.icon}</SvgIcon>}
          />
        ))}
      </FormGroup>
    </fieldset>
  )
}

export default CheckboxFilter
