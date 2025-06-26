import InnoButton from '@/components/ui/shared/InnoButton'
import { submitApplication, type SubmitFormData } from '@/lib/api/applicant'
import { Alert, CircularProgress, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'

interface ApplicantFormProps {
  onSuccess?: (application: any) => void
  initialValues?: Partial<SubmitFormData>
}

export default function ApplicantForm({ onSuccess, initialValues }: ApplicantFormProps) {
  const [formData, setFormData] = useState<SubmitFormData>({
    email: initialValues?.email || '',
    full_name: initialValues?.full_name || ''
  })

  const [files, setFiles] = useState<{
    cv_file?: File
    transcript_file?: File
    motivational_letter_file?: File
    recommendation_letter_file?: File
    almost_a_student_file?: File
  }>({})

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (initialValues) {
      setFormData((prev) => ({
        ...prev,
        ...initialValues
      }))
    }
  }, [initialValues])

  const handleInputChange =
    (field: keyof Pick<SubmitFormData, 'email' | 'full_name'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value
      }))
    }

  const handleFileChange =
    (field: keyof typeof files) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        setFiles((prev) => ({
          ...prev,
          [field]: file
        }))
      }
    }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9_.+-]+@(innopolis\.(university|ru))$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate email
      if (!validateEmail(formData.email)) {
        throw new Error(
          'Email must be a valid Innopolis email address (@innopolis.university or @innopolis.ru)'
        )
      }

      // Validate required fields
      if (!formData.full_name.trim()) {
        throw new Error('Full name is required')
      }

      const submitData: SubmitFormData = {
        ...formData,
        ...files
      }

      const result = await submitApplication(submitData)
      setSuccess(true)
      onSuccess?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Alert severity="success" className="mb-4">
        Application submitted successfully! You will be notified about the status of your
        application.
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="space-y-4">
        <TextField
          fullWidth
          label="Full Name"
          value={formData.full_name}
          onChange={handleInputChange('full_name')}
          required
          variant="outlined"
        />

        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          required
          variant="outlined"
          helperText="Must be an Innopolis email address (@innopolis.university or @innopolis.ru)"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Required Documents</h3>

        <div className="space-y-3">
          <div>
            <label className="mb-2 block text-sm font-medium">CV</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange('cv_file')}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Transcript</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange('transcript_file')}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Motivational Letter</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange('motivational_letter_file')}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Recommendation Letter</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange('recommendation_letter_file')}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">"Almost A Student" Document</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange('almost_a_student_file')}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <InnoButton type="submit" disabled={loading} className="px-8 py-3">
          {loading ? (
            <div className="flex items-center space-x-2">
              <CircularProgress size={20} color="inherit" />
              <span>Submitting...</span>
            </div>
          ) : (
            'Submit Application'
          )}
        </InnoButton>
      </div>
    </form>
  )
}
