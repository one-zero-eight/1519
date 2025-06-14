'use client'
import { useState } from 'react'
import Sidebar from '@/components/ui/Sidebar'
import { FieldNames, PatronApplication } from '@/types/types'
import StudentDetails from '@/components/ui/StudentDetails'

export default function Page() {
  const [patrons, setPatrons] = useState<PatronApplication[]>([
    {
      patron_id: 1,
      application_id: 1,
      full_name: 'Василиса Премудрая',
      rate: 0,
      application_comment: '',
      docs: {
        cv_comments: '',
        cv_seen: true,

        motivational_letter_comments: '',
        motivational_letter_seen: true,

        recommendation_letter_comments: '',
        recommendation_letter_seen: true,

        transcript_comments: '',
        transcript_seen: true,

        almost_a_student_comments: '',
        almost_a_student_seen: true
      }
    },
    {
      patron_id: 2,
      application_id: 2,
      full_name: 'Иван Дурак',
      rate: 0,
      application_comment: '',
      docs: {
        cv_comments: '',
        // cv_seen: false,

        // motivational_letter_comments: '',
        // motivational_letter_seen: false,

        recommendation_letter_comments: '',
        // recommendation_letter_seen: false,

        transcript_comments: '',
        // transcript_seen: false,

        almost_a_student_comments: '',
        almost_a_student_seen: true
      }
    }
  ])

  const [selected, setSelected] = useState<PatronApplication | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<keyof typeof FieldNames | null>(null)

  const handleSave = (updated: PatronApplication) => {
    setSelected(updated)

    setPatrons((prevState) =>
      prevState.map((p) => (p.patron_id === updated.patron_id ? updated : p))
    )
  }

  return (
    <main className="min-w-screen flex min-h-screen flex-row">
      <Sidebar
        patrons={patrons}
        onSelected={setSelected}
        selectedId={String(selected?.patron_id)}
      />

      <aside className="order-2 flex min-h-full min-w-80 flex-col self-stretch bg-gray-300 p-4 text-black">
        {selected ? (
          <StudentDetails patron={selected} onSelectedDoc={setSelectedDoc} onSave={handleSave} />
        ) : (
          <div className="text-black">Not selected</div>
        )}
      </aside>
      <section className="order-3 min-h-full w-full self-stretch bg-white">
        {selectedDoc ? (
          <>
            <div className="preview-header flex flex-row items-center justify-between border-b bg-gray-100 p-4">
              <span className="font-semibold">{FieldNames[selectedDoc]}</span>
              <button
                className="rounded-3xl bg-[var(--red-choice)] p-4 font-medium text-white"
                onClick={() => setSelectedDoc(null)}
              >
                Close Preview
              </button>
            </div>
            <iframe
              src="/test.pdf" // Change to request to find real document
              style={{ width: '100%', height: '90%', border: 'none' }}
            />
          </>
        ) : (
          <div className="flex h-full w-auto items-center justify-center font-semibold">
            No documents selected.
          </div>
        )}
      </section>
    </main>
  )
}
