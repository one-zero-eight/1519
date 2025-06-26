import InnoButton from '@/components/ui/shared/InnoButton'
import { exportApplications, getRanking } from '@/lib/api/admin'
import { ApplicationRankingStats } from '@/lib/types/types'
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel
} from '@mui/material'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React, { useEffect, useState } from 'react'

export const Route = createFileRoute('/patron/admin-ranking')({
  component: RouteComponent
})

type Order = 'asc' | 'desc'
type SortableKeys =
  | 'full_name'
  | 'rrf_score'
  | 'positive_votes'
  | 'negative_votes'
  | 'neutral_votes'
  | 'total_votes'

function RouteComponent() {
  const [ranking, setRanking] = useState<ApplicationRankingStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [order, setOrder] = useState<Order>('desc')
  const [orderBy, setOrderBy] = useState<SortableKeys>('rrf_score')

  useEffect(() => {
    getRanking()
      .then((data) => {
        setRanking(data)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to fetch ranking')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportApplications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  const handleRequestSort = (property: SortableKeys) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const navigate = useNavigate()

  const sortedRanking = React.useMemo(() => {
    const comparator = (a: ApplicationRankingStats, b: ApplicationRankingStats): number => {
      let valA: string | number
      let valB: string | number

      if (orderBy === 'full_name') {
        valA = a.application.full_name
        valB = b.application.full_name
      } else {
        valA = a[orderBy]
        valB = b[orderBy]
      }

      if (valB < valA) {
        return -1
      }
      if (valB > valA) {
        return 1
      }
      return 0
    }

    const stabilizedThis = ranking.map(
      (el, index) => [el, index] as [ApplicationRankingStats, number]
    )
    stabilizedThis.sort((a, b) => {
      const orderVal = comparator(a[0], b[0])
      if (orderVal !== 0) return orderVal
      return a[1] - b[1]
    })

    if (order === 'desc') {
      return stabilizedThis.map((el) => el[0])
    }
    return stabilizedThis.map((el) => el[0]).reverse()
  }, [order, orderBy, ranking])

  if (loading) {
    return (
      <main className="min-w-screen mx-8 mt-8 flex min-h-screen flex-col items-center">
        <CircularProgress />
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-w-screen mx-8 mt-8 flex min-h-screen flex-col items-center">
        <Alert severity="error">{error}</Alert>
      </main>
    )
  }

  return (
    <main className="min-w-screen mx-8 mt-8 flex min-h-screen flex-col items-center">
      <div className="w-full max-w-7xl">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <h1 className="text-4xl font-semibold">Students Ranking</h1>
          <div className="flex gap-3">
            <InnoButton onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <div className="flex items-center space-x-2">
                  <CircularProgress size={20} color="inherit" />
                  <span>Exporting...</span>
                </div>
              ) : (
                'Export to Excel'
              )}
            </InnoButton>
            <InnoButton onClick={() => navigate({ to: '/patron' })}>Back to main page</InnoButton>
          </div>
        </Box>

        <TableContainer component={Paper}>
          <Table stickyHeader aria-label="ranking table">
            <TableHead>
              <TableRow>
                <TableCell sortDirection={orderBy === 'full_name' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'full_name'}
                    direction={orderBy === 'full_name' ? order : 'asc'}
                    onClick={() => handleRequestSort('full_name')}
                  >
                    Full Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right" sortDirection={orderBy === 'rrf_score' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'rrf_score'}
                    direction={orderBy === 'rrf_score' ? order : 'asc'}
                    onClick={() => handleRequestSort('rrf_score')}
                  >
                    RRF Score
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="right"
                  sortDirection={orderBy === 'positive_votes' ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === 'positive_votes'}
                    direction={orderBy === 'positive_votes' ? order : 'asc'}
                    onClick={() => handleRequestSort('positive_votes')}
                  >
                    Positive
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="right"
                  sortDirection={orderBy === 'negative_votes' ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === 'negative_votes'}
                    direction={orderBy === 'negative_votes' ? order : 'asc'}
                    onClick={() => handleRequestSort('negative_votes')}
                  >
                    Negative
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="right"
                  sortDirection={orderBy === 'neutral_votes' ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === 'neutral_votes'}
                    direction={orderBy === 'neutral_votes' ? order : 'asc'}
                    onClick={() => handleRequestSort('neutral_votes')}
                  >
                    Neutral
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sortDirection={orderBy === 'total_votes' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'total_votes'}
                    direction={orderBy === 'total_votes' ? order : 'asc'}
                    onClick={() => handleRequestSort('total_votes')}
                  >
                    Total Votes
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRanking.map((row) => (
                <TableRow key={row.application.id} hover>
                  <TableCell component="th" scope="row">
                    {row.application.full_name}
                  </TableCell>
                  <TableCell>{row.application.email}</TableCell>
                  <TableCell align="right">{row.rrf_score.toFixed(4)}</TableCell>
                  <TableCell align="right" style={{ color: 'green' }}>
                    {row.positive_votes}
                  </TableCell>
                  <TableCell align="right" style={{ color: 'red' }}>
                    {row.negative_votes}
                  </TableCell>
                  <TableCell align="right" style={{ color: 'orange' }}>
                    {row.neutral_votes}
                  </TableCell>
                  <TableCell align="right">{row.total_votes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </main>
  )
}
