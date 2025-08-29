import InnoButton from '@/components/ui/shared/InnoButton.tsx'
import RemoveButton from '@/components/ui/shared/RemoveButton.tsx'
import { addPatron, getPatrons, promotePatron, removePatron } from '@/lib/api/admin.ts'
import { authRedirect } from '@/lib/functions/guards/authRedirect.ts'
import { PatronFullResponse } from '@/lib/types/types.ts'
import { TextField } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/maecenas/')({
  beforeLoad: authRedirect,
  component: RouteComponent
})

function RouteComponent() {
  const [patrons, setPatrons] = useState<PatronFullResponse[] | null>(null)
  const [newPatron, setNewPatron] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const patronsList = patrons ? (
    patrons.map((patron) => (
      <div
        key={patron.ranking.patron_id}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 rounded-xl p-4 sm:p-5 gap-3 sm:gap-0"
      >
        <div className="text-lg sm:text-xl font-medium break-all">
          {`@${patron.patron.telegram_data.username}`}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <InnoButton
            className="w-full sm:w-auto text-sm sm:text-base"
            onClick={() => handlePromotePatron(patron.patron.telegram_id, patron.patron.is_admin)}
          >
            {patron.patron.is_admin ? 'Demote' : 'Promote'}
          </InnoButton>
          <RemoveButton
            className="w-full sm:w-auto text-sm sm:text-base"
            onClick={() => handlePatronDelete(patron.patron.telegram_id)}
          >
            Remove
          </RemoveButton>
        </div>
      </div>
    ))
  ) : (
    <div className="text-center py-8">Loading patrons...</div>
  )

  useEffect(() => {
    loadPatrons()
  }, [])

  async function loadPatrons() {
    try {
      const patronsFetched = await getPatrons()
      setPatrons(patronsFetched)
      setError(null)
    } catch (err) {
      setPatrons(null)
      setError(err instanceof Error ? err.message : 'Failed to fetch patrons')
    }
  }

  async function handlePatronAdd() {
    try {
      if (newPatron.length > 0 && !Number.isNaN(Number.parseInt(newPatron))) {
        await addPatron(newPatron)
        setNewPatron('')
        await loadPatrons()
        setError(null)
      } else {
        setError('Invalid Telegram ID')
      }
    } catch (err) {
      setNewPatron('')
      setError(err instanceof Error ? err.message : 'Failed to add patron')
    }
  }

  async function handlePatronDelete(patronTgId: string) {
    try {
      await removePatron(patronTgId)
      await loadPatrons()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove patron')
    }
  }

  async function handlePromotePatron(patronTgId: string, isAdmin: boolean) {
    try {
      await promotePatron(patronTgId, isAdmin)
      await loadPatrons()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote patron')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6 sm:mb-8 text-center">
        Maecenas page
      </h1>

      <main className="w-full max-w-4xl">
        <div className="flex flex-col items-center gap-4 sm:gap-5 mb-8 sm:mb-10">
          <TextField
            fullWidth
            label="Add new patron with Telegram ID"
            value={newPatron}
            onChange={(e) => setNewPatron(e.target.value)}
            variant="outlined"
            size="medium"
            sx={{
              fontSize: 16,
              '& .MuiInputBase-root': {
                borderRadius: '1rem',
                fontSize: 16,
                minHeight: 56,
                paddingLeft: 2,
                paddingRight: 2
              },
              '& .MuiInputLabel-root': {
                fontSize: 14,
                top: '-2px'
              },
              '& .MuiOutlinedInput-input': {
                padding: '16.5px 14px'
              }
            }}
            className="w-full sm:w-3/4 lg:w-1/2"
          />
          <InnoButton onClick={handlePatronAdd} className="w-full sm:w-auto px-8">
            Add patron
          </InnoButton>
          {error && (
            <div className="text-red-500 font-bold text-sm sm:text-base text-center my-2 sm:my-3">
              {error}
            </div>
          )}
        </div>

        {/* Patrons List Section */}
        <div className="w-full">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center sm:text-left">
            Patrons list
          </h2>

          <div className="flex flex-col gap-3 sm:gap-4 w-full">
            {patrons && patrons.length > 0 ? (
              patronsList
            ) : (
              <div className="text-center py-8 text-gray-500">No patrons found</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
