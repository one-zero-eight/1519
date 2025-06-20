'use client'
import React, { useMemo, useState } from 'react'
import CheckboxFilter from '@/components/ui/Checkbox-filter'
import DoneOutlineIcon from '@mui/icons-material/DoneOutline'
import ClearIcon from '@mui/icons-material/Clear'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import { Stack } from '@mui/material'
import { StudentListItem } from '@/types/types'

interface SidebarProps {
  items: StudentListItem[]
  onSelected: (applicationId: number | null) => void
  selectedId?: number | null
}

function Sidebar({ items, onSelected, selectedId }: SidebarProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  const handleFilterChange = (selected: string[]) => {
    setSelectedFilters(selected)
  }

  const filteredItems = useMemo(() => {
    if (selectedFilters.length === 0) return items

    return items.filter((item) => selectedFilters.includes(String(item.rate)))
  }, [items, selectedFilters])

  const handlePickStudent = (item: StudentListItem) => {
    onSelected(item.application_id)
  }

  return (
    <aside className="order-1 min-h-full min-w-80 bg-gray-700 p-4 text-white">
      <CheckboxFilter
        options={[
          { icon: <ClearIcon />, name: -1, color: '#c10007' },
          { icon: <QuestionMarkIcon />, name: 0, color: '#d08700' },
          { icon: <DoneOutlineIcon />, name: 1, color: '#5ea500' }
        ]}
        onChange={handleFilterChange}
      />
      <hr className="mt-4 font-bold text-white" />
      <h4 className="mb-1 mt-3 w-full text-start text-2xl font-normal">Student list</h4>
      <Stack
        className="mt-4"
        direction="column"
        spacing={2}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {filteredItems.map((item) => (
          <div
            key={item.application_id}
            className={`box-border flex w-full flex-row items-start rounded-xl border-2 bg-gray-600 py-2 ${item.application_id === selectedId ? `border-4` : ''} ${item.rate === 0 ? `border-[#d08700]` : item.rate === 1 ? `border-[#5ea500]` : item.rate === -1 ? `border-[#c10007]` : 'border-gray-500'}`}
            onClick={() => handlePickStudent(item)}
          >
            <span className="ml-8">{item.full_name}</span>
          </div>
        ))}
      </Stack>
    </aside>
  )
}

export default Sidebar
