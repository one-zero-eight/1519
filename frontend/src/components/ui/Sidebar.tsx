'use client'
import React, { useState } from 'react'
import CheckboxFilter from '@/components/ui/Checkbox-filter'
import DoneOutlineIcon from '@mui/icons-material/DoneOutline'
import ClearIcon from '@mui/icons-material/Clear'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import { Stack } from '@mui/material'
import { Student } from '@/types/Student'

interface SidebarProps {
  students: Student[]
  onSelected: (student: Student | null) => void
  selectedId?: string
}

function Sidebar({ students, onSelected, selectedId }: SidebarProps) {
  const [selected, setSelected] = useState<string[]>([])

  const handleChange = (selected: string[]) => {
    setSelected(selected)
  }

  const filteredItems =
    selected.length > 0 ? students.filter((student) => selected.includes(student.status)) : students

  const handlePickStudent = (student: Student) => {
    onSelected(student.id === selectedId ? null : student)
  }

  return (
    <aside className="order-1 min-h-full min-w-80 bg-gray-700 p-4 text-white">
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
        {filteredItems.map((student) => (
          <div
            key={student.id}
            className={`box-border flex w-full flex-row items-start rounded-xl bg-gray-600 pb-2 pt-2 ${selectedId === student.id ? `border-2 border-amber-50` : ''} `}
            onClick={() => handlePickStudent(student)}
          >
            <span className="ml-8">{student.name}</span>
          </div>
        ))}
      </Stack>
    </aside>
  )
}

export default Sidebar
