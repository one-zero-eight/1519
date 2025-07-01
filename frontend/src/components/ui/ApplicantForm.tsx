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

  const validateRequiredFiles = (): string[] => {
    const errors: string[] = []

    if (!files.cv_file) {
      errors.push('CV file is required')
    }

    if (!files.transcript_file) {
      errors.push('Transcript file is required')
    }

    if (!files.motivational_letter_file) {
      errors.push('Motivational letter file is required')
    }

    return errors
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

      // Validate required files
      const fileErrors = validateRequiredFiles()
      if (fileErrors.length > 0) {
        throw new Error(`Required files missing: ${fileErrors.join(', ')}`)
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

  // Check if form is valid for enabling/disabling submit button
  const isFormValid = () => {
    const emailValid = validateEmail(formData.email)
    const nameValid = formData.full_name.trim().length > 0
    const requiredFilesPresent =
      files.cv_file && files.transcript_file && files.motivational_letter_file

    return emailValid && nameValid && requiredFilesPresent
  }

  if (success) {
    return (
      <Alert severity="success" className="mb-4 text-sm sm:text-base">
        Application submitted successfully! You will be notified about the status of your
        application.
      </Alert>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-xs sm:max-w-2xl space-y-6 px-2 sm:px-0"
    >
      {error && (
        <Alert severity="error" className="mb-4 text-sm sm:text-base">
          {error}
        </Alert>
      )}

      <div className="flex flex-col gap-4">
        <TextField
          fullWidth
          label="Full Name"
          value={formData.full_name}
          onChange={handleInputChange('full_name')}
          required
          variant="outlined"
          size="medium"
          sx={{
            fontSize: 18,
            '& .MuiInputBase-root': {
              borderRadius: '1rem',
              fontSize: 18,
              minHeight: 56,
              paddingLeft: 1,
              paddingRight: 1
            },
            '& .MuiInputLabel-root': {
              fontSize: 16,
              top: '-4px'
            },
            '& .MuiOutlinedInput-input': {
              padding: '18.5px 14px'
            }
          }}
        />

        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          required
          variant="outlined"
          size="medium"
          helperText="Must be an Innopolis email address (@innopolis.university or @innopolis.ru)"
          sx={{
            fontSize: 18,
            '& .MuiInputBase-root': {
              borderRadius: '1rem',
              fontSize: 18,
              minHeight: 56,
              paddingLeft: 1,
              paddingRight: 1
            },
            '& .MuiInputLabel-root': {
              fontSize: 16,
              top: '-4px'
            },
            '& .MuiOutlinedInput-input': {
              padding: '18.5px 14px'
            }
          }}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold">Required Documents</h3>

        <div className="space-y-3">
          <div>
            <label className="mb-2 block text-xs sm:text-sm font-medium">
              CV <b>(.pdf)</b>
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange('cv_file')}
              className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-2 sm:file:px-4 file:py-2 file:text-xs sm:file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs sm:text-sm font-medium">
              Transcript <b>(.xlsx)</b>
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange('transcript_file')}
              className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-2 sm:file:px-4 file:py-2 file:text-xs sm:file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs sm:text-sm font-medium">
              Motivational Letter <b>(.pdf)</b>
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange('motivational_letter_file')}
              className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-2 sm:file:px-4 file:py-2 file:text-xs sm:file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs sm:text-sm font-medium">
              Recommendation Letter <b>(.pdf)</b>
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange('recommendation_letter_file')}
              className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-2 sm:file:px-4 file:py-2 file:text-xs sm:file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs sm:text-sm font-medium">
              "Almost A Student" Document <b>(.pdf)</b>
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange('almost_a_student_file')}
              className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-2 sm:file:px-4 file:py-2 file:text-xs sm:file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <InnoButton
          type="submit"
          disabled={loading || !isFormValid()}
          className="px-4 py-2 sm:px-8 sm:py-3 w-full sm:w-auto text-xs sm:text-base"
        >
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
