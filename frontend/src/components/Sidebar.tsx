'use client'
import React, { useState } from 'react'
import CheckboxFilter from '@/components/Checkbox-filter'
import DoneOutlineIcon from '@mui/icons-material/DoneOutline'
import ClearIcon from '@mui/icons-material/Clear'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'

function Sidebar() {
  const [selected, setSelected] = useState<string[]>([])

  const handleChange = (selected: string[]) => {
    setSelected(selected)
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
          { icon: <ClearIcon />, name: 'X' },
          { icon: <QuestionMarkIcon />, name: '?' },
          { icon: <DoneOutlineIcon />, name: 'V' }
        ]}
        onChange={handleChange}
      />
      <hr className="mt-4 font-bold text-white" />
      <ul className="mt-4 flex flex-col gap-2">
        {filteredItems.map((item) => (
          <li className="rounded-3xl bg-green-600 p-2 text-center" key={item.name}>
            {item.name}
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default Sidebar
