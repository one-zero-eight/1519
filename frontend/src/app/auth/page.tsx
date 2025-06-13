'use client'
import React from 'react'
import TelegramLoginButton from '@/components/ui/shared/TelegramLoginButton'
import { TelegramUser } from '@/types/types'
import { objToString } from '@/lib/functions/to-string'
import { tgCallback } from '@/lib/api/telegram'

function Page() {
  const onAuth = async (tgUser: TelegramUser) => {
    const param = new URLSearchParams(objToString(tgUser))
    await tgCallback(param)
  }
  return (
    <main>
      <TelegramLoginButton
        botName={`${process.env.NEXT_PUBLIC_BOT}`}
        onAuth={onAuth}
        className={'w-90 h-90'}
        usePic={true}
        buttonSize={'large'}
        requestAccess={true}
      />
    </main>
  )
}

export default Page
