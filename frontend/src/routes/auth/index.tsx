import OZE from '@/assets/svg/108.svg'
import FN from '@/assets/svg/1519.svg'
import collab from '@/assets/svg/x.svg'
import TelegramLoginButton from '@/components/ui/shared/TelegramLoginButton'
import { whoami } from '@/lib/api/patron'
import { tgCallback } from '@/lib/api/telegram'
import { objToString } from '@/lib/functions/to-string'
import { TelegramUser } from '@/lib/types/types'
import { TextField } from '@mui/material'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/auth/')({
  component: RouteComponent
})
function RouteComponent() {
  const navigate = useNavigate()
  const [inviteKey, setInviteKey] = useState<string>('')
  const onAuth = async (tgUser: TelegramUser) => {
    try {
      const param = new URLSearchParams(objToString(tgUser))
      await tgCallback(param, inviteKey)
      const patron = await whoami()
      if (patron) {
        navigate({ to: '/patron' })
      } else {
        alert('You are not an admin')
      }
    } catch (error) {
      console.error('Telegram auth failed:', error)
      // TODO: show an error message to the user
    }
  }
  return (
    <main className="min-w-screen background-radial flex min-h-screen items-center justify-center">
      <section className="flex flex-col items-center justify-between gap-12 rounded-2xl border-2 border-gray-500 bg-white/30 p-12 backdrop-blur-sm">
        <h1 className="text-5xl font-bold text-black">Sign in</h1>
        <TextField
          fullWidth
          label="Invite key"
          value={inviteKey}
          onChange={(e: any) => setInviteKey(e.target.value)}
          variant="outlined"
        />
        <TelegramLoginButton
          botName={`${import.meta.env.VITE_PUBLIC_BOT}`}
          onAuth={onAuth}
          usePic={true}
          buttonSize={'large'}
          requestAccess={true}
        />
        <div className="flex w-full flex-row items-center justify-center gap-10">
          <img src={OZE} alt="108" className="w-16" draggable={false} />
          <img src={collab} alt="collab" className="w-4" draggable={false} />
          <img src={FN} alt="1519" className="w-20" draggable={false} />
        </div>
      </section>
    </main>
  )
}
