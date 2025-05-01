'use client'
import { useState } from 'react'
import Sidebar from '@/components/ui/Sidebar'
import { Student } from '@/types/Student'
import StudentDetails from '@/components/ui/StudentDetails'

export default function Page() {
  const [students] = useState<Student[]>([
    {
      id: '1',
      name: 'Василиса Премудрая',
      status: 'V',
      details: {
        comment: '',
        documents: {
          motivationalLetter: true,
          recommendationLetter: false,
          transcript: true,
          almostAStudent: false
        }
      }
    }
  ])

  const [selected, setSelected] = useState<Student | null>(null)

  return (
    <main className="min-w-screen flex min-h-screen flex-row">
      <Sidebar students={students} onSelected={setSelected} selectedId={selected?.id} />

      <aside className="order-2 flex min-h-full min-w-80 flex-col self-stretch bg-gray-300 p-4 text-black">
        {selected ? (
          <StudentDetails
            student={selected}
            onSave={(updated) => {
              const updatedStudents = students.map((s) => (s.id === updated.id ? updated : s))
            }}
          />
        ) : (
          <div className="text-black">Not selected</div>
        )}
      </aside>
      <section className="order-3 min-h-full w-full self-stretch bg-white"></section>
    </main>
  )
}
