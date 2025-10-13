import {
  getAllApplications,
  getRanking,
  getRatedApplications,
  updateRanking
} from '@/lib/api/patron'
import type { Application, PatronRankingResponse } from '@/lib/types/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Query keys
export const patronQueryKeys = {
  ratedApplications: ['rated-applications'] as const,
  allApplications: ['all-applications'] as const,
  ranking: ['patron-ranking'] as const
}

// Hook for getting rated applications
export const useRatedApplications = () => {
  return useQuery({
    queryKey: patronQueryKeys.ratedApplications,
    queryFn: getRatedApplications,
    staleTime: 30 * 1000, // 30 seconds - shorter cache for ratings
    refetchOnWindowFocus: true // Refetch when window gains focus
  })
}

// Hook for getting all applications
export const useAllApplications = () => {
  return useQuery({
    queryKey: patronQueryKeys.allApplications,
    queryFn: getAllApplications,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

// Hook for getting current ranking
export const useRanking = () => {
  return useQuery({
    queryKey: patronQueryKeys.ranking,
    queryFn: getRanking,
    staleTime: 30 * 1000, // 30 seconds - shorter cache for ranking
    refetchOnWindowFocus: true // Refetch when window gains focus
  })
}

// Hook for updating ranking
export const useUpdateRanking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateRanking,
    onSuccess: (data: PatronRankingResponse) => {
      // Update the ranking query cache
      queryClient.setQueryData(patronQueryKeys.ranking, data)
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: patronQueryKeys.ranking })
    },
    onError: (error) => {
      console.error('Failed to update ranking:', error)
    }
  })
}

// Hook for getting positively rated applications
export const usePositivelyRatedApplications = () => {
  const { data: ratedApplications = [], isLoading: isLoadingRated } = useRatedApplications()
  const { data: allApplications = [], isLoading: isLoadingAll } = useAllApplications()

  // Create a map of application_id to full application data
  const applicationMap = new Map<number, Application>()
  allApplications.forEach((app) => applicationMap.set(app.id, app))

  // Filter applications that are rated positively (green or yellow, excluding red with rate -1)
  const positivelyRatedApplications = ratedApplications
    .filter((rating) => rating.rate !== 'negative') // Exclude red ratings (rate = -1)
    .map((rating) => applicationMap.get(rating.application_id))
    .filter((app): app is Application => app !== undefined)

  return {
    positivelyRatedApplications,
    isLoading: isLoadingRated || isLoadingAll
  }
}

// Hook for getting available applications (positively rated but not in current ranking)
export const useAvailableApplications = (rankedApplications: Application[]) => {
  const { positivelyRatedApplications, isLoading } = usePositivelyRatedApplications()
  const { data: ratedApplications = [] } = useRatedApplications()

  // Create a map of application IDs to their ratings
  const ratingMap = new Map(ratedApplications.map((rating) => [rating.application_id, rating.rate]))

  // Create a set of application IDs that have negative or unrated ratings
  const excludedRatingIds = new Set(
    ratedApplications
      .filter((rating) => rating.rate === 'negative' || rating.rate === 'unrated')
      .map((rating) => rating.application_id)
  )

  // Filter out applications that are negatively rated or unrated from both available and ranked
  const availableApplications = positivelyRatedApplications
    .filter(
      (app) =>
        !rankedApplications.some((ranked) => ranked.id === app.id) && !excludedRatingIds.has(app.id)
    )
    .sort((a, b) => {
      // Sort by rating: positive (green) first, then neutral (yellow)
      const ratingA = ratingMap.get(a.id)
      const ratingB = ratingMap.get(b.id)
      if (ratingA === 'positive' && ratingB !== 'positive') return -1
      if (ratingA !== 'positive' && ratingB === 'positive') return 1
      return 0
    })

  // Also filter out negatively rated and unrated applications from the ranked list
  const cleanedRankedApplications = rankedApplications.filter(
    (app) => !excludedRatingIds.has(app.id)
  )

  return {
    availableApplications,
    cleanedRankedApplications,
    isLoading,
    hasNegativeRatedInRanking: rankedApplications.some((app) => excludedRatingIds.has(app.id)),
    ratingMap
  }
}
