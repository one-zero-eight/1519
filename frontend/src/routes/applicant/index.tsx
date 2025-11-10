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
      <main className="min-w-screen flex min-h-screen flex-col items-center px-2">
        <div className="mb-8 flex lg:flex-row items-center gap-4 sm:gap-6 sm:mb-12 sm:mt-8 sm:flex-row flex-col text-center">
          <img src={FN} alt="1519" className="w-16 sm:w-20 mb-2 sm:mb-0" draggable={false} />
          <h1 className="text-2xl sm:text-4xl font-semibold">Scholarship</h1>
        </div>
        <div className="flex items-center justify-center">
          <CircularProgress />
        </div>
      </main>
    )
  }

  return (
    <main className="min-w-screen flex min-h-screen flex-col items-center px-2 py-4">
      <div className="my-6 sm:my-8 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center">
        <img src={FN} alt="1519" className="w-16 sm:w-20 mb-2 sm:mb-0" draggable={false} />
        <h1 className="text-2xl sm:text-4xl font-semibold">Scholarship Application</h1>
      </div>

      {error && (
        <Alert severity="error" className="mb-4 sm:mb-6 w-full max-w-md sm:max-w-2xl">
          {error}
        </Alert>
      )}

      {application && !editMode ? (
        <ApplicationStatus application={application} onEdit={() => setEditMode(true)} />
      ) : (
        <div className="w-full max-w-md sm:max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8 text-center">
            <h2 className="mb-2 sm:mb-4 text-xl sm:text-2xl font-semibold">
              {application ? 'Edit Your Application' : 'Submit Your Application'}
            </h2>
            <p className="mx-auto max-w-xs sm:max-w-2xl text-gray-600 text-sm sm:text-base">
              {application
                ? 'Edit your application'
                : 'Please fill out the form below to submit your scholarship application. Remember that\n' +
                  '              your application will be reviewed by real people who genuinely want to get to know\n' +
                  '              you. Think twice before submitting a fully AI-generated content.'}
            </p>
            {application === null && (
              <p className="mx-auto max-w-xs sm:max-w-2xl text-gray-600 text-sm sm:text-base">
                Only 1st-3rd year bachelor students of Innopolis University can apply
              </p>
            )}
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
