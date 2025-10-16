import InnoButton from '@/components/ui/shared/InnoButton'
import { submitApplication, type SubmitFormData } from '@/lib/api/applicant'
import { Alert, Checkbox, CircularProgress, FormControlLabel, TextField } from '@mui/material'
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

  const [isFirstYear, setIsFirstYear] = useState(false)
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

  const handleFirstYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setIsFirstYear(checked)

    // Если отмечен как первокурсник, удаляем файл транскрипта
    if (checked) {
      setFiles((prev) => ({
        ...prev,
        transcript_file: undefined
      }))

      // Очищаем input элемент
      const transcriptInput = document.querySelector(
        'input[accept=".xlsx,.xls"]'
      ) as HTMLInputElement
      if (transcriptInput) {
        transcriptInput.value = ''
      }
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

    // Транскрипт обязателен только если не первокурсник
    if (!isFirstYear && !files.transcript_file) {
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

      // Создаем FormData для отправки в формате, ожидаемом бэкендом
      const formDataToSend = new FormData()

      // Добавляем текстовые поля как form fields
      formDataToSend.append('email', formData.email)
      formDataToSend.append('full_name', formData.full_name)

      // Добавляем файлы с правильными именами полей
      if (files.cv_file) {
        formDataToSend.append('cv_file', files.cv_file)
      }
      if (files.motivational_letter_file) {
        formDataToSend.append('motivational_letter_file', files.motivational_letter_file)
      }

      // Добавляем транскрипт только если не первокурсник И файл есть
      if (!isFirstYear && files.transcript_file) {
        formDataToSend.append('transcript_file', files.transcript_file)
      }

      // Добавляем опциональные файлы
      if (files.recommendation_letter_file) {
        formDataToSend.append('recommendation_letter_file', files.recommendation_letter_file)
      }
      if (files.almost_a_student_file) {
        formDataToSend.append('almost_a_student_file', files.almost_a_student_file)
      }

      const result = await submitApplication(formDataToSend)
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
    const transcriptValid = isFirstYear || files.transcript_file
    const requiredFilesPresent = files.cv_file && transcriptValid && files.motivational_letter_file

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
        <Alert severity="error" className="mb-10 text-sm sm:text-base">
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

        <div className="space-y-4">
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
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              A résumé that may briefly include hackathons, academic achievements, work experience,
              and any other information about extracurricular activities.
            </p>
          </div>

          <div>
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <label className="text-xs sm:text-sm font-medium">
                  Transcript <b>(.xlsx)</b>
                  {!isFirstYear && <span className="text-red-500"> *</span>}
                </label>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isFirstYear}
                      onChange={handleFirstYearChange}
                      size="small"
                      sx={{
                        '& .MuiSvgIcon-root': { fontSize: 20 }
                      }}
                    />
                  }
                  label="I don't have grades now"
                  sx={{
                    margin: 0,
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.75rem',
                      '@media (min-width: 640px)': {
                        fontSize: '0.875rem'
                      }
                    }
                  }}
                />
              </div>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange('transcript_file')}
              disabled={isFirstYear}
              className={`block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-2 sm:file:px-4 file:py-2 file:text-xs sm:file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 ${
                isFirstYear ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              {isFirstYear
                ? "As a first year student, you don't need to upload a transcript."
                : "Here you should include all your grades with a separately calculated average score. You need to upload an Excel spreadsheet, and don't forget to specify the credits and the GPA weighted by them."}
            </p>
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
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Describe your background, achievements, and career goals, if any. Also, explain why
              this scholarship could be particularly beneficial for you.
            </p>
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
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Optional. From a professor or a supervisor from your workplace/internship.
            </p>
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
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Optional. We have often experienced situations where we were just a few points short
              of receiving the maximum scholarship from the university—for example, missing an A by
              a couple of points due to absences or not finishing a solution during midterms. If you
              have had a similar experience, please share it.
            </p>
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
