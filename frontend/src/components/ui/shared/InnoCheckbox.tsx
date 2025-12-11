import { Checkbox } from '@mui/material'
import { styled } from '@mui/system'

const InnoCheckbox = styled(Checkbox)(() => ({
  color: '#33ff33',
  '&.Mui-checked': {
    color: '#33ff33'
  }
}))

export default InnoCheckbox
