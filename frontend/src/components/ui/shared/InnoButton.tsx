import { Button } from '@mui/material'
import { styled } from '@mui/system'

const InnoButton = styled(Button)(() => ({
  backgroundColor: '#33ff33',
  color: 'black',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: '#33ff33',
    opacity: 0.8
  }
}))

export default InnoButton
