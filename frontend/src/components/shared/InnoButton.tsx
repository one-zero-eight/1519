'use client'
import { Button } from '@mui/material'
import { styled } from '@mui/system'

const InnoButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#40BA21',
  color: 'white',
  '&:hover': {
    backgroundColor: '#40BA21',
    opacity: 0.8,
  },
}))

export default InnoButton