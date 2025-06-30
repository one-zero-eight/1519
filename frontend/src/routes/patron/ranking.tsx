import RankingDragDrop from '@/components/ui/RankingDragDrop'
import InnoButton from '@/components/ui/shared/InnoButton'
import { authRedirect } from '@/lib/functions/guards/authRedirect.ts'
import {
  patronQueryKeys,
  useAvailableApplications,
  useRanking,
  useUpdateRanking
} from '@/lib/hooks/usePatronData'
import type { Application } from '@/lib/types/types'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export const Route = createFileRoute('/patron/ranking')({
  beforeLoad: authRedirect,
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [localRankedApplications, setLocalRankedApplications] = useState<Application[]>([])
  const [lastSavedRanking, setLastSavedRanking] = useState<Application[]>([])
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [showNegativeRemovedNotice, setShowNegativeRemovedNotice] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Invalidate cache on component mount to get fresh data
  useEffect(() => {
    // Invalidate all patron-related queries to get fresh data
    queryClient.invalidateQueries({ queryKey: patronQueryKeys.ratedApplications })
    queryClient.invalidateQueries({ queryKey: patronQueryKeys.ranking })
    queryClient.invalidateQueries({ queryKey: patronQueryKeys.allApplications })

    // Also refetch the data immediately
    queryClient.refetchQueries({ queryKey: patronQueryKeys.ratedApplications })
    queryClient.refetchQueries({ queryKey: patronQueryKeys.ranking })

    // Force refetch with fresh data
    setTimeout(() => {
      queryClient.refetchQueries({ queryKey: patronQueryKeys.ratedApplications, exact: true })
      queryClient.refetchQueries({ queryKey: patronQueryKeys.ranking, exact: true })
    }, 100)
  }, [queryClient])

  // Use custom hooks for data fetching
  const { data: currentRanking, isLoading: isLoadingRanking } = useRanking()
  const {
    availableApplications,
    cleanedRankedApplications,
    hasNegativeRatedInRanking,
    isLoading: isLoadingAvailable
  } = useAvailableApplications(localRankedApplications)
  const updateRankingMutation = useUpdateRanking()

  // Set local state when ranking data is loaded
  useEffect(() => {
    if (currentRanking) {
      setLocalRankedApplications(currentRanking.applications)
      setLastSavedRanking(currentRanking.applications)
    }
  }, [currentRanking])

  // Auto-clean ranking when there are negatively rated students in it
  useEffect(() => {
    if (
      hasNegativeRatedInRanking &&
      cleanedRankedApplications.length !== localRankedApplications.length
    ) {
      setLocalRankedApplications(cleanedRankedApplications)
      setShowNegativeRemovedNotice(true)
      // Hide notice after 5 seconds
      setTimeout(() => setShowNegativeRemovedNotice(false), 5000)
    }
  }, [hasNegativeRatedInRanking, cleanedRankedApplications, localRankedApplications])

  // Handle successful save
  useEffect(() => {
    if (updateRankingMutation.isSuccess && updateRankingMutation.data) {
      setLastSavedRanking(updateRankingMutation.data.applications)
      setIsAutoSaving(false)

      // Invalidate cache after successful save
      queryClient.invalidateQueries({ queryKey: patronQueryKeys.ranking })
      queryClient.invalidateQueries({ queryKey: patronQueryKeys.ratedApplications })
    }
  }, [updateRankingMutation.isSuccess, updateRankingMutation.data, queryClient])

  // Handle save error
  useEffect(() => {
    if (updateRankingMutation.isError) {
      setIsAutoSaving(false)
    }
  }, [updateRankingMutation.isError])

  // Debounced auto-save function
  const debouncedAutoSave = useCallback(
    debounce(async (applications: Application[]) => {
      if (applications.length === 0) return

      // Check if ranking has actually changed
      const hasChanged =
        JSON.stringify(applications.map((app) => app.id)) !==
        JSON.stringify(lastSavedRanking.map((app) => app.id))

      if (hasChanged) {
        setIsAutoSaving(true)
        try {
          const applicationIds = applications.map((app) => app.id)
          await updateRankingMutation.mutateAsync(applicationIds)
        } catch (error) {
          console.error('Auto-save failed:', error)
        }
      }
    }, 2000), // 2 sec delay
    [lastSavedRanking, updateRankingMutation]
  )

  // Auto-save when local ranking changes
  useEffect(() => {
    if (localRankedApplications.length > 0) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      // Set new timeout
      autoSaveTimeoutRef.current = setTimeout(() => {
        debouncedAutoSave(localRankedApplications)
      }, 1000)
    }
  }, [localRankedApplications, debouncedAutoSave])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  // Handle ranking changes
  const handleRankingChange = (newRanked: Application[]) => {
    setLocalRankedApplications(newRanked)
  }

  // Handle viewing application
  const handleViewApplication = (applicationId: number) => {
    // Invalidate cache before navigating
    queryClient.invalidateQueries({ queryKey: patronQueryKeys.ratedApplications })
    queryClient.invalidateQueries({ queryKey: patronQueryKeys.allApplications })

    // Navigate to patron main page and select the application
    navigate({
      to: '/patron',
      search: { selectedApplicationId: applicationId.toString() }
    })
  }

  // Handle back to patron page
  const handleBackToPatron = () => {
    // Invalidate cache before navigating back
    queryClient.invalidateQueries({ queryKey: patronQueryKeys.ratedApplications })
    queryClient.invalidateQueries({ queryKey: patronQueryKeys.allApplications })
    queryClient.invalidateQueries({ queryKey: patronQueryKeys.ranking })

    navigate({ to: '/patron' })
  }

  // Manual save function (for immediate save)
  const handleSaveRanking = async () => {
    try {
      const applicationIds = localRankedApplications.map((app) => app.id)
      await updateRankingMutation.mutateAsync(applicationIds)
    } catch (error) {
      console.error('Failed to save ranking:', error)
    }
  }

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return (
      JSON.stringify(localRankedApplications.map((app) => app.id)) !==
      JSON.stringify(lastSavedRanking.map((app) => app.id))
    )
  }, [localRankedApplications, lastSavedRanking])

  if (isLoadingRanking || isLoadingAvailable) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Student Ranking</h1>
        <p className="text-gray-600 mb-6">
          Drag students from the right column to the left to create a ranking. The first two places
          will receive scholarships. Changes are saved automatically. Students rated with a cross
          (❌) are automatically excluded from ranking and will be removed if already ranked.
        </p>

        <div className="flex gap-4 mb-6 items-center">
          <InnoButton
            onClick={handleSaveRanking}
            disabled={updateRankingMutation.isPending || !hasUnsavedChanges}
            sx={{ padding: '8px 24px' }}
          >
            {updateRankingMutation.isPending ? 'Saving...' : 'Save Now'}
          </InnoButton>

          {/* Auto-save status */}
          {isAutoSaving && (
            <span className="text-blue-600 text-sm flex items-center">🔄 Auto-saving...</span>
          )}

          {updateRankingMutation.isSuccess && !isAutoSaving && (
            <span className="text-green-600 text-sm flex items-center">✓ Ranking saved</span>
          )}

          {updateRankingMutation.isError && (
            <span className="text-red-600 text-sm flex items-center">✗ Save error</span>
          )}

          {hasUnsavedChanges && !isAutoSaving && !updateRankingMutation.isPending && (
            <span className="text-orange-600 text-sm flex items-center">
              ⏳ Waiting for auto-save...
            </span>
          )}

          {showNegativeRemovedNotice && (
            <span className="text-red-600 text-sm flex items-center">
              ⚠️ Students with negative ratings have been automatically removed from ranking
            </span>
          )}
        </div>
      </div>

      <RankingDragDrop
        availableApplications={availableApplications}
        rankedApplications={localRankedApplications}
        onRankingChange={handleRankingChange}
        onViewApplication={handleViewApplication}
        onBackToPatron={handleBackToPatron}
      />

      {availableApplications.length === 0 && localRankedApplications.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            You don't have any positively rated students yet
          </div>
        </div>
      )}
    </div>
  )
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}
