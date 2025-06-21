'use client'
import React from 'react'
import { Card, CardContent, Typography, Chip, Box, Button } from '@mui/material'
import { Application } from '@/types/types'

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
    <Card className="mx-auto max-w-2xl">
      <CardContent className="space-y-4">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2" gutterBottom>
            Application Status
          </Typography>
          {onEdit && (
            <Button variant="outlined" onClick={onEdit} size="small">
              Edit
            </Button>
          )}
        </Box>

        <Box className="space-y-3">
          <div>
            <Typography variant="subtitle2" color="textSecondary">
              Submitted
            </Typography>
            <Typography variant="body1">{formatDate(application.submitted_at)}</Typography>
          </div>

          <div>
            <Typography variant="subtitle2" color="textSecondary">
              Full Name
            </Typography>
            <Typography variant="body1">{application.full_name}</Typography>
          </div>

          <div>
            <Typography variant="subtitle2" color="textSecondary">
              Email
            </Typography>
            <Typography variant="body1">{application.email}</Typography>
          </div>
        </Box>

        <Box className="space-y-3">
          <Typography variant="h6" component="h3">
            Documents
          </Typography>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <Typography variant="body2">CV</Typography>
              {getDocumentStatus(application.cv)}
            </div>

            <div className="flex items-center justify-between">
              <Typography variant="body2">Transcript</Typography>
              {getDocumentStatus(application.transcript)}
            </div>

            <div className="flex items-center justify-between">
              <Typography variant="body2">Motivational Letter</Typography>
              {getDocumentStatus(application.motivational_letter)}
            </div>

            <div className="flex items-center justify-between">
              <Typography variant="body2">Recommendation Letter</Typography>
              {getDocumentStatus(application.recommendation_letter)}
            </div>

            <div className="flex items-center justify-between">
              <Typography variant="body2">"Almost A Student" Document</Typography>
              {getDocumentStatus(application.almost_a_student)}
            </div>
          </div>
        </Box>

        <Box className="mt-6 rounded-lg bg-blue-50 p-4">
          <Typography variant="body2" color="textSecondary">
            Your application has been submitted and is currently under review. You will be notified
            about the status of your application once the review process is complete.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
