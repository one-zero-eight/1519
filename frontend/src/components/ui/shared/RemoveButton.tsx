import { Button } from '@mui/material'
import { styled } from '@mui/system'

const RemoveButton = styled(Button)(() => ({
    backgroundColor: '#e32929',
    color: 'white',
    '&:hover': {
        backgroundColor: '#e32929',
        opacity: 0.8
    }
}))

export default RemoveButton
