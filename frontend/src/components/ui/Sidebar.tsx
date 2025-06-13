'use client'
import React, { useMemo, useState } from 'react'
import CheckboxFilter from '@/components/ui/Checkbox-filter'
import DoneOutlineIcon from '@mui/icons-material/DoneOutline'
import ClearIcon from '@mui/icons-material/Clear'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import { Stack } from '@mui/material'
import { PatronApplication } from '@/types/types'

interface SidebarProps {
  patrons: PatronApplication[]
  onSelected: (patron: PatronApplication | null) => void
  selectedId?: string
}

function Sidebar({ patrons, onSelected, selectedId }: SidebarProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  const handleFilterChange = (selected: string[]) => {
    setSelectedFilters(selected)
  }

  const filteredItems = useMemo(() => {
    if (selectedFilters.length === 0) return patrons

    return patrons.filter((patron) => selectedFilters.includes(String(patron.rate)))
  }, [patrons, selectedFilters])

  const handlePickStudent = (patron: PatronApplication) => {
    onSelected(patron)
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
        {filteredItems.map((patron) => (
          <div
            key={patron.patron_id}
            className={`box-border flex w-full flex-row items-start rounded-xl border-2 bg-gray-600 py-2 ${String(patron.patron_id) === selectedId ? `border-4` : ''} ${patron.rate === 0 ? `border-[#d08700]` : patron.rate === 1 ? `border-[#5ea500]` : `border-[#c10007]`}`}
            onClick={() => handlePickStudent(patron)}
          >
            <span className="ml-8">{patron.full_name}</span>
          </div>
        ))}
      </Stack>
    </aside>
  )
}

export default Sidebar
