import FN from '@/assets/svg/1519.svg'
import ApplicantForm from '@/components/ui/ApplicantForm'
import ApplicationStatus from '@/components/ui/ApplicationStatus'
import { getMyApplication } from '@/lib/api/applicant'
import { type Application } from '@/lib/types/types'
import { Alert, CircularProgress } from '@mui/material'
import { useEffect, useState } from 'react'

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/applicant/')({
  component: RouteComponent
})

function RouteComponent() {
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    checkExistingApplication()
  }, [])

  const checkExistingApplication = async () => {
    try {
      const existingApp = await getMyApplication()
      setApplication(existingApp)
    } catch (err) {
      if (err instanceof Error && err.message === 'Application not found') {
        setApplication(null)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to check application status')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationSubmitted = (newApplication: Application) => {
    setApplication(newApplication)
    setEditMode(false)
  }

  if (loading) {
    return (
      <main className="min-w-screen flex min-h-screen flex-col items-center">
        <div className="mb-8 flex flex-row items-center gap-4">
          <img src={FN} alt="1519" className="w-20" draggable={false} />
          <h1 className="text-4xl font-semibold">Scholarship</h1>
        </div>
        <div className="flex items-center justify-center">
          <CircularProgress />
        </div>
      </main>
    )
  }

  return (
    <main className="min-w-screen flex min-h-screen flex-col items-center">
      <div className="my-8 flex flex-row items-center gap-4">
        <img src={FN} alt="1519" className="w-20" draggable={false} />
        <h1 className="text-4xl font-semibold">Scholarship Application</h1>
      </div>

      {error && (
        <Alert severity="error" className="mb-6 max-w-2xl">
          {error}
        </Alert>
      )}

      {application && !editMode ? (
        <ApplicationStatus application={application} onEdit={() => setEditMode(true)} />
      ) : (
        <div className="w-full max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-2xl font-semibold">
              {application ? 'Edit Your Application' : 'Submit Your Application'}
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Please fill out the form below to {application ? 'edit' : 'submit'} your scholarship
              application.
              <br />
              <strong>File requirements:</strong>{' '}
              <u>
                CV, Motivational Letter, Recommendation Letter, and "Almost A Student" documents
                must be in PDF format. Transcript must be in Excel format (XLSX/XLS).
              </u>
            </p>
          </div>
          <ApplicantForm
            onSuccess={handleApplicationSubmitted}
            initialValues={
              application
                ? {
                    email: application.email,
                    full_name: application.full_name
                  }
                : undefined
            }
          />
          {application && (
            <div className="mt-4 flex justify-center">
              <button className="text-blue-600 underline" onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
