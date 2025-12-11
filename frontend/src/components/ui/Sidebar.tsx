import CheckboxFilter from '@/components/ui/Checkbox-filter'
import InnoButton from '@/components/ui/shared/InnoButton'
import { whoami } from '@/lib/api/patron.ts'
import { Application, PatronResponse, StudentListItem } from '@/lib/types/types'
import ClearIcon from '@mui/icons-material/Clear'
import DoneOutlineIcon from '@mui/icons-material/DoneOutline'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import FilterListIcon from '@mui/icons-material/FilterList'
import { Box, Stack, FormControl, InputLabel, Select, MenuItem, Chip, SelectChangeEvent } from '@mui/material'
import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'

interface SidebarProps {
  items: StudentListItem[]
  applications: Application[]
  onSelected: (applicationId: number | null) => void
  selectedId?: number | null
}

function Sidebar({ items, applications, onSelected, selectedId }: SidebarProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [documentFilters, setDocumentFilters] = useState<string[]>([])
  const [user, setUser] = useState<PatronResponse | null>(null)

  const handleFilterChange = (selected: string[]) => {
    setSelectedFilters(selected)
  }

  const handleDocumentFilterChange = (event: SelectChangeEvent<typeof documentFilters>) => {
    const value = event.target.value
    setDocumentFilters(typeof value === 'string' ? value.split(',') : value)
  }

  const handleRemoveDocumentFilter = (filterToRemove: string) => {
    setDocumentFilters((prev) => prev.filter((filter) => filter !== filterToRemove))
  }

  const documentFilterOptions = [
    { value: 'transcript', label: 'Transcript' },
    { value: 'almost_a_student', label: 'Almost a student' },
    { value: 'recommendation_letter', label: 'Recommendation letter' }
  ]

  const filteredItems = useMemo(() => {
    let filtered = items

    // Фильтр по рейтингу
    if (selectedFilters.length > 0) {
      filtered = filtered.filter((item) => selectedFilters.includes(item.rate))
    }

    // Фильтр по документам
    if (documentFilters.length > 0) {
      filtered = filtered.filter((item) => {
        const application = applications.find((app) => app.id === item.application_id)
        if (!application) return false

        return documentFilters.every((filter) => {
          const docField = application[filter as keyof Application]
          return docField !== null && docField !== undefined && docField !== ''
        })
      })
    }

    return filtered
  }, [items, selectedFilters, documentFilters, applications])

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
        bgcolor: 'background.paper',
        p: 2,
        color: 'text.primary',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CheckboxFilter
        options={[
          { icon: <ClearIcon />, name: 'negative', color: '#ff3333' },
          { icon: <QuestionMarkIcon />, name: 'neutral', color: '#ffcc00' },
          { icon: <DoneOutlineIcon />, name: 'positive', color: '#33ff33' },
          { icon: <RadioButtonUncheckedIcon />, name: 'unrated', color: 'text.secondary' }
        ]}
        onChange={handleFilterChange}
      />
      
      {/* Document Filter Dropdown */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel 
          id="document-filter-label"
          sx={{ color: 'white', '&.Mui-focused': { color: 'white' } }}
        >
          Filter by documents
        </InputLabel>
        <Select
          labelId="document-filter-label"
          multiple
          value={documentFilters}
          onChange={handleDocumentFilterChange}
          label="Filter by documents"
          sx={{
            color: 'white',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
            '& .MuiSvgIcon-root': { color: 'white' }
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: '#4b5563',
                '& .MuiMenuItem-root': {
                  color: 'white',
                  '&:hover': { bgcolor: '#5a6268' },
                  '&.Mui-selected': { bgcolor: '#6b7280' }
                }
              }
            }
          }}
        >
          {documentFilterOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
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
      
      {/* Document Filter Chips */}
      {documentFilters.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {documentFilters.map((filter) => (
            <Chip
              key={filter}
              label={documentFilterOptions.find(opt => opt.value === filter)?.label || filter}
              onDelete={() => handleRemoveDocumentFilter(filter)}
              deleteIcon={<ClearIcon sx={{ color: 'white !important' }} />}
              sx={{
                bgcolor: '#6b7280',
                color: 'white',
                '& .MuiChip-deleteIcon': {
                  color: 'white',
                  '&:hover': {
                    color: '#ef4444'
                  }
                }
              }}
            />
          ))}
        </Box>
      )}
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
