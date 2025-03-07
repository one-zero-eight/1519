'use client'
import React, { useState } from 'react'
import CheckboxFilter from '@/components/Checkbox-filter'
import DoneOutlineIcon from '@mui/icons-material/DoneOutline'
import ClearIcon from '@mui/icons-material/Clear'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import { Stack } from '@mui/material'

interface SidebarProps {
  onItemClick: (name: string) => void
}

function Sidebar({ onItemClick }: SidebarProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [picked, setPicked] = useState<string | null>(null)

  const handleChange = (selected: string[]) => {
    setSelected(selected)
  }

  const handlePick = (name: string) => {
    setPicked(name === picked ? null : name)
  }

  const items = [
    { name: 'Item 1', status: 'V' },
    { name: 'Item 2', status: 'X' },
    { name: 'Item 3', status: '?' },
    { name: 'Item 4', status: 'V' }
  ]

  const filteredItems =
    selected.length > 0 ? items.filter((item) => selected.includes(item.status)) : items

  return (
    <aside className="fixed h-full bg-gray-700 p-4 text-white">
      <CheckboxFilter
        options={[
          { icon: <ClearIcon />, name: 'X', color: '#c10007' },
          { icon: <QuestionMarkIcon />, name: '?', color: '#d08700' },
          { icon: <DoneOutlineIcon />, name: 'V', color: '#5ea500' }
        ]}
        onChange={handleChange}
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
          <a
            key={item.name}
            className={`box-border flex w-full flex-row items-start rounded-xl bg-gray-600 pb-2 pt-2 ${picked === item.name ? `border-2 border-amber-50` : ''} `}
            href="#"
            onClick={() => handlePick(item.name)}
          >
            <span className="ml-8">{item.name}</span>
          </a>
        ))}
      </Stack>
    </aside>
  )
}

export default Sidebar
