import CheckboxFilter from '@/components/ui/Checkbox-filter'
import InnoButton from '@/components/ui/shared/InnoButton'
import { whoami } from '@/lib/api/patron.ts'
import { PatronResponse, StudentListItem } from '@/lib/types/types'
import ClearIcon from '@mui/icons-material/Clear'
import DoneOutlineIcon from '@mui/icons-material/DoneOutline'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import { Stack } from '@mui/material'
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

    return items.filter((item) => selectedFilters.includes(String(item.rate)))
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
      <h4 className="mb-1 mt-3 w-full text-center text-3xl font-normal">Student list</h4>
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

      <section className="flex flex-col gap-4">
        <hr className="my-4 font-bold text-white" />
        <Link to="/patron/ranking">
          <InnoButton className="w-full">Rank students</InnoButton>
        </Link>
        {user?.is_admin && (
          <Link to="/patron/admin-ranking">
            <InnoButton className="w-full">See total ranking</InnoButton>
          </Link>
        )}
      </section>
    </aside>
  )
}

export default Sidebar
