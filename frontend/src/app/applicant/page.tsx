'use client'

import React, { useState, useEffect } from 'react'
import { Alert, CircularProgress } from '@mui/material'
import FN from 'public/assets/svg/1519.svg'
import Image from 'next/image'
import ApplicantForm from '@/components/ui/ApplicantForm'
import ApplicationStatus from '@/components/ui/ApplicationStatus'
import { getMyApplication } from '@/lib/api/applicant'
import { Application } from '@/types/types'

function Page() {
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkExistingApplication()
  }, [])

  const checkExistingApplication = async () => {
    try {
      const existingApp = await getMyApplication()
      setApplication(existingApp)
    } catch (err) {
      if (err instanceof Error && err.message === 'Application not found') {
        // No existing application, show form
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
  }

  if (loading) {
    return (
      <main className="min-w-screen mx-8 mt-8 flex min-h-screen flex-col items-center">
        <div className="mb-8 flex flex-row items-center gap-4">
          <Image src={FN} alt="108" className="w-20" draggable={false} />
          <h1 className="text-4xl font-semibold">Scholarship</h1>
        </div>
        <div className="flex items-center justify-center">
          <CircularProgress />
        </div>
      </main>
    )
  }

  return (
    <main className="min-w-screen mx-8 mt-8 flex min-h-screen flex-col items-center">
      <div className="mb-8 flex flex-row items-center gap-4">
        <Image src={FN} alt="108" className="w-20" draggable={false} />
        <h1 className="text-4xl font-semibold">Scholarship Application</h1>
      </div>

      {error && (
        <Alert severity="error" className="mb-6 max-w-2xl">
          {error}
        </Alert>
      )}

      {application ? (
        <ApplicationStatus application={application} />
      ) : (
        <div className="w-full max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-2xl font-semibold">Submit Your Application</h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Please fill out the form below to submit your scholarship application.
              <br />
              <strong>File requirements:</strong> CV, Motivational Letter, Recommendation Letter,
              and "Almost A Student" documents must be in PDF format. Transcript must be in Excel
              format (XLSX/XLS).
            </p>
          </div>
          <ApplicantForm onSuccess={handleApplicationSubmitted} />
        </div>
      )}
    </main>
  )
}

export default Page
