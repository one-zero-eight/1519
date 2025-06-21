'use client'
import { Checkbox } from '@mui/material'
import { styled } from '@mui/system'

const InnoCheckbox = styled(Checkbox)(({ theme }) => ({
  color: '#40BA21',
  '&.Mui-checked': {
    color: '#40BA21'
  }
}))

export default InnoCheckbox
