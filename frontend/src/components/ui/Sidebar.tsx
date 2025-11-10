import CheckboxFilter from '@/components/ui/Checkbox-filter'
import InnoButton from '@/components/ui/shared/InnoButton'
import { whoami } from '@/lib/api/patron.ts'
import { PatronResponse, StudentListItem } from '@/lib/types/types'
import ClearIcon from '@mui/icons-material/Clear'
import DoneOutlineIcon from '@mui/icons-material/DoneOutline'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { Box, Stack } from '@mui/material'
import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'

interface SidebarProps {
  items: StudentListItem[]
  onSelected: (applicationId: number | null) => void
  selectedId?: number | null
}

function Sidebar({ items, onSelected, selectedId }: SidebarProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [user, setUser] = useState<PatronResponse | null>(null)

  const handleFilterChange = (selected: string[]) => {
    setSelectedFilters(selected)
  }

  const filteredItems = useMemo(() => {
    if (selectedFilters.length === 0) return items

    return items.filter((item) => selectedFilters.includes(item.rate))
  }, [items, selectedFilters])

  const handlePickStudent = (item: StudentListItem) => {
    onSelected(item.application_id)
  }

  useEffect(() => {
    async function fetchUser() {
      setUser(await whoami())
    }

    fetchUser()
  }, [])

  return (
    <Box
      sx={{
        height: '100vh',
        bgcolor: '#374151',
        p: 2,
        color: 'white',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CheckboxFilter
        options={[
          { icon: <ClearIcon />, name: 'negative', color: '#c10007' },
          { icon: <QuestionMarkIcon />, name: 'neutral', color: '#d08700' },
          { icon: <DoneOutlineIcon />, name: 'positive', color: '#5ea500' },
          { icon: <RadioButtonUncheckedIcon />, name: 'unrated', color: '#9ca3af' }
        ]}
        onChange={handleFilterChange}
      />
      <hr style={{ marginTop: 16, marginBottom: 16, borderColor: 'white', fontWeight: 'bold' }} />
      <h4
        style={{
          marginBottom: 4,
          marginTop: 12,
          width: '100%',
          textAlign: 'center',
          fontSize: '1.875rem',
          fontWeight: 'normal'
        }}
      >
        Student list
      </h4>
      <Stack
        sx={{
          mt: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 2,
          flex: 1, // Take remaining space
          paddingTop: '1rem',
          paddingRight: '0.5rem',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.5)'
            }
          },
          // Firefox
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)'
        }}
      >
        {filteredItems.map((item) => (
          <Box
            key={item.application_id}
            sx={{
              boxSizing: 'border-box',
              display: 'flex',
              width: '100%',
              flexDirection: 'row',
              alignItems: 'flex-start',
              borderRadius: 2,
              border: item.application_id === selectedId ? 4 : 2,
              borderColor:
                item.rate === 'neutral'
                  ? '#d08700'
                  : item.rate === 'positive'
                    ? '#5ea500'
                    : item.rate === 'negative'
                      ? '#c10007'
                      : '#9ca3af',
              bgcolor: '#4b5563',
              py: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#5a6268'
              }
            }}
            onClick={() => handlePickStudent(item)}
          >
            <span style={{ marginLeft: 32 }}>{item.full_name}</span>
          </Box>
        ))}
      </Stack>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, flexShrink: 0 }}>
        <hr style={{ margin: '16px 0', borderColor: 'white', fontWeight: 'bold' }} />
        <Link to="/patron/ranking" style={{ textDecoration: 'none' }}>
          <InnoButton sx={{ width: '100%' }}>Rank students</InnoButton>
        </Link>
        {user?.is_admin && (
          <span>
            <Link to="/patron/admin-ranking" style={{ textDecoration: 'none' }}>
              <InnoButton sx={{ width: '100%' }}>See total ranking</InnoButton>
            </Link>
            <hr style={{ margin: '16px 0', borderColor: 'white', fontWeight: 'bold' }} />
            <Link to="/maecenas" style={{ textDecoration: 'none' }}>
              <InnoButton sx={{ width: '100%' }}>My patrons</InnoButton>
            </Link>
          </span>
        )}
      </Box>
    </Box>
  )
}

export default Sidebar
