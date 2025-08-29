import { createFileRoute } from '@tanstack/react-router'
import {authRedirect} from "@/lib/functions/guards/authRedirect.ts";
import InnoButton from "@/components/ui/shared/InnoButton.tsx";
import {TextField} from "@mui/material";
import React, {useEffect, useState} from "react";
import {addPatron, getPatrons, promotePatron, removePatron} from "@/lib/api/admin.ts";
import {PatronFullResponse } from "@/lib/types/types.ts";
import RemoveButton from "@/components/ui/shared/RemoveButton.tsx";

export const Route = createFileRoute('/maecenas/')({
  beforeLoad: authRedirect,
  component: RouteComponent,
})

function RouteComponent() {
  const [patrons, setPatrons] = useState<PatronFullResponse[] | null>(null);
  const [newPatron, setNewPatron] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const patronsList = patrons ? patrons.map((patron) => (
      <div key={patron.ranking.patron_id} className="flex justify-between bg-gray-50 rounded-xl p-5">
        <div className="text-xl">
            { `@${patron.patron.telegram_data.username}` }
        </div>
        <div className="flex gap-3">
            <InnoButton
                onClick={() => handlePromotePatron(patron.patron.telegram_id, patron.patron.is_admin)}
            >
                Promote
            </InnoButton>
            <RemoveButton
                onClick={() => handlePatronDelete(patron.patron.telegram_id)}
            >
                Remove
            </RemoveButton>
        </div>
      </div>
  )) : <div />;

    useEffect(() => {
        loadPatrons();
    }, []);

  async function loadPatrons() {
      try {
          const patronsFetched = await getPatrons();
          setPatrons(patronsFetched);
          setError(null);
      } catch (err) {
          setPatrons(null);
          setError(err instanceof Error ? err.message : 'Failed to fetch patrons')
      }
  }

  async function handlePatronAdd() {
      try {
          if (newPatron.length > 0) {
              const response = await addPatron(newPatron);
              setNewPatron('');
              await loadPatrons();
              setError(null);
          }
      } catch (err) {
          setNewPatron('');
          setError(err instanceof Error ? err.message : 'Failed to add patron')
      }
  }

  async function handlePatronDelete(patronTgId: string) {
      try {
          const response = await removePatron(patronTgId);
          await loadPatrons();
          setError(null);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to remove patron');
      }
  }

  async function handlePromotePatron(patronTgId: string, isAdmin: boolean) {
      try {
          const response = await promotePatron(patronTgId, isAdmin);
          await loadPatrons();
          setError(null);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to promote patron');
      }
  }

  return (
      <div className="flex min-h-screen flex-col items-center px-2">
        <h1 className="text-2xl sm:text-4xl font-semibold mb-8 flex lg:flex-row items-center gap-4 sm:gap-6 sm:mb-12 sm:mt-8 sm:flex-row flex-col text-center">
          Maecenas page
        </h1>
        <main>
            <div className="flex flex-col items-center gap-5">
                <TextField
                    fullWidth
                    label="Add new patron with Telegram ID"
                    value={newPatron}
                    onChange={(e) => setNewPatron(e.target.value)}
                    variant="outlined"
                    size="medium"
                    sx={{
                        width: "50%",
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
                <InnoButton onClick={handlePatronAdd}>Add patron</InnoButton>
                {error && (<div className="text-red-500 font-bold my-3">{error}</div>)}
            </div>
          <h2 className="text-xl font-semibold mb-5">
              Patrons list
          </h2>
            <div className="flex flex-col gap-2 w-[60vw]">
                {patronsList}
            </div>
        </main>
      </div>
  )
}
