'use client'
import { useState, useEffect, useMemo } from 'react'
import Sidebar from '@/components/ui/Sidebar'
import { Application, FieldNames, PatronApplication, StudentListItem } from '@/types/types'
import StudentDetails from '@/components/ui/StudentDetails'
import { getAllApplications, getRatedApplications, rateApplication } from '@/lib/api/patron'
import ExcelPreview from '@/components/ExcelPreview'

const apiServer = process.env.NEXT_PUBLIC_SERVER

export default function Page() {
  const [applications, setApplications] = useState<Application[]>([])
  const [ratedApplications, setRatedApplications] = useState<PatronApplication[]>([])

  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<keyof typeof FieldNames | null>(null)

  useEffect(() => {
    Promise.all([getAllApplications(), getRatedApplications()])
      .then(([allApps, ratedApps]) => {
        setApplications(allApps)
        const ratedWithData = ratedApps.map((rated) => {
          const app = allApps.find((a) => a.id === rated.application_id)
          return { ...rated, full_name: app?.full_name || 'Unknown' }
        })
        setRatedApplications(ratedWithData)
      })
      .catch(console.error)
  }, [])

  const studentListItems = useMemo((): StudentListItem[] => {
    return applications.map((app) => {
      const rated = ratedApplications.find((r) => r.application_id === app.id)
      return {
        application_id: app.id,
        full_name: app.full_name,
        rate: rated ? rated.rate : null
      }
    })
  }, [applications, ratedApplications])

  const selectedApplication = useMemo((): Application | null => {
    if (!selectedApplicationId) return null
    return applications.find((app) => app.id === selectedApplicationId) || null
  }, [applications, selectedApplicationId])

  const selectedRating = useMemo((): PatronApplication | null => {
    if (!selectedApplicationId) return null
    return ratedApplications.find((r) => r.application_id === selectedApplicationId) || null
  }, [ratedApplications, selectedApplicationId])

  const handleSave = (updated: PatronApplication) => {
    rateApplication(updated.application_id, updated.rate, updated.comment, updated.docs)
      .then((newRating) => {
        const newRatingWithFullName = {
          ...newRating,
          full_name: selectedApplication?.full_name || 'Unknown'
        }
        setRatedApplications((prev) => {
          const index = prev.findIndex((r) => r.application_id === updated.application_id)
          if (index !== -1) {
            const newRated = [...prev]
            newRated[index] = newRatingWithFullName
            return newRated
          } else {
            return [...prev, newRatingWithFullName]
          }
        })
        setSelectedApplicationId(updated.application_id)
      })
      .catch(console.error)
  }

  const selectedDocPath = useMemo(() => {
    if (!selectedDoc || !selectedApplication) return null
    const docKey = selectedDoc.replace(/([A-Z])/g, '_$1').toLowerCase() as keyof Application
    const path = selectedApplication[docKey]
    if (!path) return null
    return `${apiServer}/files/${path}`
  }, [selectedDoc, selectedApplication])

  function isExcelFile(path: string | null) {
    return path && (path.endsWith('.xlsx') || path.endsWith('.xls'))
  }

  return (
    <main className="min-w-screen flex min-h-screen flex-row">
      <Sidebar
        items={studentListItems}
        onSelected={setSelectedApplicationId}
        selectedId={selectedApplicationId}
      />

      <aside className="order-2 flex min-h-full min-w-80 flex-col self-stretch bg-gray-300 p-4 text-black">
        {selectedApplication ? (
          <StudentDetails
            application={selectedApplication}
            rating={selectedRating}
            onSelectedDoc={setSelectedDoc}
            onSave={handleSave}
          />
        ) : (
          <div className="text-black">Not selected</div>
        )}
      </aside>
      <section className="order-3 w-full self-stretch overflow-auto bg-white">
        {selectedDocPath ? (
          <>
            <div className="preview-header flex flex-row items-center justify-between border-b bg-gray-100 p-4">
              <span className="font-semibold">{FieldNames[selectedDoc!]}</span>
              <button
                className="rounded-3xl bg-[var(--red-choice)] p-4 font-medium text-white"
                onClick={() => setSelectedDoc(null)}
              >
                Close Preview
              </button>
            </div>
            {isExcelFile(selectedDocPath) ? (
              <ExcelPreview fileUrl={selectedDocPath} />
            ) : (
              <iframe
                src={selectedDocPath}
                style={{ width: '100%', height: '90%', border: 'none' }}
              />
            )}
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
