import { type Application } from '@/lib/types/types'
import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material'

interface ApplicationStatusProps {
  application: Application
  onEdit?: () => void
}

export default function ApplicationStatus({ application, onEdit }: ApplicationStatusProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDocumentStatus = (path: string | null) => {
    if (path) {
      return <Chip label="Uploaded" color="success" size="small" />
    }
    return <Chip label="Not provided" color="default" size="small" />
  }

  return (
    <Card className="mx-auto w-full max-w-xs sm:max-w-2xl">
      <CardContent className="space-y-4 px-2 sm:px-6 py-4 sm:py-8">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          className="flex-col sm:flex-row gap-2 sm:gap-0 text-center sm:text-left"
        >
          <Typography variant="h5" component="h2" gutterBottom className="text-lg sm:text-2xl">
            Application Status
          </Typography>
          {onEdit && (
            <Button variant="outlined" onClick={onEdit} size="small" className="w-full sm:w-auto">
              Edit
            </Button>
          )}
        </Box>

        <Box className="space-y-3">
          <div>
            <Typography variant="subtitle2" color="textSecondary" className="text-xs sm:text-sm">
              Submitted
            </Typography>
            <Typography variant="body1" className="text-sm sm:text-base">
              {formatDate(application.submitted_at)}
            </Typography>
          </div>

          <div>
            <Typography variant="subtitle2" color="textSecondary" className="text-xs sm:text-sm">
              Full Name
            </Typography>
            <Typography variant="body1" className="text-sm sm:text-base">
              {application.full_name}
            </Typography>
          </div>

          <div>
            <Typography variant="subtitle2" color="textSecondary" className="text-xs sm:text-sm">
              Email
            </Typography>
            <Typography variant="body1" className="text-sm sm:text-base">
              {application.email}
            </Typography>
          </div>
        </Box>

        <Box className="space-y-3">
          <Typography variant="h6" component="h3" className="text-base sm:text-lg">
            Documents
          </Typography>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <Typography variant="body2">CV</Typography>
              {getDocumentStatus(application.cv)}
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <Typography variant="body2">Transcript</Typography>
              {getDocumentStatus(application.transcript)}
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <Typography variant="body2">Motivational Letter</Typography>
              {getDocumentStatus(application.motivational_letter)}
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <Typography variant="body2">Recommendation Letter</Typography>
              {getDocumentStatus(application.recommendation_letter)}
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <Typography variant="body2">"Almost A Student" Document</Typography>
              {getDocumentStatus(application.almost_a_student)}
            </div>
          </div>
        </Box>

        <Box className="mt-4 sm:mt-6 rounded-lg bg-blue-50 p-3 sm:p-4">
          <Typography variant="body2" color="textSecondary" className="text-xs sm:text-base">
            Your application has been submitted and is currently under review. You will be notified
            about the status of your application once the review process is complete.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
