'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar/Sidebar'
import { Student } from '@/types/Student'
import StudentDetails from '@/components/StudentDetails/StudentDetails'

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
          almostAStudent: false,
        }
      }
    },
  ])

  const [selected, setSelected] = useState<Student | null>(null)

  return (
    <main className="flex flex-row min-w-screen min-h-screen">
      <Sidebar
        students={students}
        onSelected={setSelected}
        selectedId={selected?.id}
      />

      <aside className="self-stretch min-h-full min-w-80 bg-gray-300 p-4 order-2 flex flex-col text-black">
        {selected ? (
          <StudentDetails
            student={selected}
            onSave={updated => {
              const updatedStudents = students.map(s => s.id === updated.id ? updated : s)
            }}/>
        ) : (<div className="text-black">Not selected</div>)}
      </aside>
      <section className="order-3 bg-white w-full min-h-full self-stretch">

      </section>
    </main>
  )
}
