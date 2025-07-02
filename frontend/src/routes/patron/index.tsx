import ExcelPreview from '@/components/ExcelPreview'
import Sidebar from '@/components/ui/Sidebar'
import StudentDetails from '@/components/ui/StudentDetails'
import { getAllApplications, getRatedApplications, rateApplication } from '@/lib/api/patron'
import { VITE_PUBLIC_API } from '@/lib/constants'
import { authRedirect } from '@/lib/functions/guards/authRedirect.ts'
import { Application, FieldNames, PatronApplication, StudentListItem } from '@/lib/types/types'
import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar,
  Backdrop,
  Box,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'

export const Route = createFileRoute('/patron/')({
  beforeLoad: authRedirect,
  component: RouteComponent
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const [applications, setApplications] = useState<Application[]>([])
  const [ratedApplications, setRatedApplications] = useState<PatronApplication[]>([])

  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<keyof typeof FieldNames | null>(null)

  // --- Drawer state for mobile ---
  const [drawerOpen, setDrawerOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Invalidate cache on component mount to get fresh data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['rated-applications'] })
    queryClient.invalidateQueries({ queryKey: ['all-applications'] })
    queryClient.invalidateQueries({ queryKey: ['patron-ranking'] })
  }, [queryClient])

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
        queryClient.invalidateQueries({ queryKey: ['rated-applications'] })
        queryClient.invalidateQueries({ queryKey: ['patron-ranking'] })
      })
      .catch(console.error)
  }

  const selectedDocPath = useMemo(() => {
    if (!selectedDoc || !selectedApplication) return null
    const docKey = selectedDoc.replace(/([A-Z])/g, '_$1').toLowerCase() as keyof Application
    const path = selectedApplication[docKey]
    if (!path) return null
    return `${VITE_PUBLIC_API}/files/${path}`
  }, [selectedDoc, selectedApplication])

  function isExcelFile(path: string | null) {
    return path && (path.endsWith('.xlsx') || path.endsWith('.xls'))
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {isMobile && (
        <AppBar position="fixed" color="default" elevation={1}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Patron Panel
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      {/* Drawer for Sidebar on mobile */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            height: '100vh',
            overflow: 'auto'
          }
        }}
      >
        <Sidebar
          items={studentListItems}
          onSelected={(id) => {
            setSelectedApplicationId(id)
            setDrawerOpen(false)
          }}
          selectedId={selectedApplicationId}
        />
      </Drawer>
      {/* Backdrop for mobile drawer */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer - 1,
          display: { xs: 'block', md: 'none' }
        }}
        open={drawerOpen}
        onClick={() => setDrawerOpen(false)}
      />
      {/* Main layout */}
      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={0}
        sx={{
          minHeight: '100vh',
          pt: isMobile ? 7 : 0
        }}
      >
        {/* Sidebar for desktop */}
        {!isMobile && (
          <Box
            sx={{
              width: { md: '25%', lg: '20%' },
              display: { xs: 'none', md: 'block' }
            }}
          >
            <Sidebar
              items={studentListItems}
              onSelected={setSelectedApplicationId}
              selectedId={selectedApplicationId}
            />
          </Box>
        )}
        {/* Student details */}
        <Box
          sx={{
            width: isMobile ? '100%' : { md: '30%', lg: '25%' },
            background: '#e0e0e0',
            p: { xs: 1, md: 2 },
            height: isMobile ? '50vh' : '100vh',
            overflow: 'auto'
          }}
        >
          {selectedApplication ? (
            <StudentDetails
              application={selectedApplication}
              rating={selectedRating}
              onSelectedDoc={setSelectedDoc}
              onSave={handleSave}
            />
          ) : (
            <Box sx={{ color: 'text.primary', p: 2 }}>Not selected</Box>
          )}
        </Box>
        {/* Document preview */}
        <Box
          sx={{
            width: isMobile ? '100%' : { md: '45%', lg: '55%' },
            background: '#fff',
            p: { xs: 1, md: 2 },
            height: isMobile ? '50vh' : '100vh',
            overflow: 'auto'
          }}
        >
          {selectedDocPath ? (
            <>
              <Box
                className="preview-header"
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: 1,
                  borderColor: 'grey.300',
                  bgcolor: 'grey.100',
                  p: 2
                }}
              >
                <span style={{ fontWeight: 600 }}>{FieldNames[selectedDoc!]}</span>
                <IconButton
                  onClick={() => setSelectedDoc(null)}
                  color="error"
                  size="small"
                  sx={{ ml: 2 }}
                >
                  Close
                </IconButton>
              </Box>
              {isExcelFile(selectedDocPath) ? (
                <ExcelPreview fileUrl={selectedDocPath} />
              ) : (
                <iframe
                  src={selectedDocPath}
                  style={{
                    width: '100%',
                    height: isMobile ? 'calc(50vh - 80px)' : 'calc(100vh - 80px)',
                    border: 'none'
                  }}
                  title="Document Preview"
                />
              )}
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600
              }}
            >
              No documents selected.
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  )
}
