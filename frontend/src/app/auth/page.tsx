'use client'
import React from 'react'
import TelegramLoginButton from '@/components/ui/shared/TelegramLoginButton'
import { TelegramUser } from '@/types/types'
import { objToString } from '@/lib/functions/to-string'
import { tgCallback } from '@/lib/api/telegram'
import Image from 'next/image'
import OZE from 'public/assets/svg/108.svg'
import FN from 'public/assets/svg/1519.svg'
import IU from 'public/assets/svg/innopolis-university.svg'
import { useRouter } from 'next/navigation'

function Page() {
  const router = useRouter()
  const onAuth = async (tgUser: TelegramUser) => {
    try {
      const param = new URLSearchParams(objToString(tgUser))
      await tgCallback(param)
      router.push('/')
    } catch (error) {
      console.error('Telegram auth failed:', error)
      // TODO: show an error message to the user
    }
  }
  return (
    <main className="min-w-screen background-radial flex min-h-screen items-center justify-center">
      <section className="flex flex-col items-center justify-between gap-12 rounded-2xl border-2 border-gray-500 bg-white/30 p-12 backdrop-blur-sm">
        <h1 className="text-5xl font-bold text-black">Sign in</h1>
        <TelegramLoginButton
          botName={`${process.env.NEXT_PUBLIC_BOT}`}
          onAuth={onAuth}
          className={'w-90 h-90'}
          usePic={true}
          buttonSize={'large'}
          requestAccess={true}
        />
        <div className="flex w-full flex-row items-center justify-center gap-10">
          <Image src={OZE} alt="108" className="w-16" draggable={false} />
          <Image src={IU} alt="108" className="w-10" draggable={false} />
          <Image src={FN} alt="108" className="w-16" draggable={false} />
        </div>
      </section>
    </main>
  )
}

export default Page
