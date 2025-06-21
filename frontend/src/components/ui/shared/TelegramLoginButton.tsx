import React, { useEffect, useRef } from 'react'
import { TelegramUser } from '@/types/types'

interface TelegramLoginButtonProps {
  botName: string
  usePic?: boolean
  className?: string
  cornerRadius?: number
  requestAccess?: boolean
  onAuth: (user: TelegramUser) => void
  buttonSize?: 'large' | 'medium' | 'small'
}

declare global {
  interface Window {
    TelegramLoginWidget: {
      dataOnAuth: (user: TelegramUser) => void
    }
  }
}

export default function TelegramLoginButton({
  usePic = false,
  botName,
  className,
  buttonSize = 'large',
  onAuth,
  cornerRadius,
  requestAccess = true
}: TelegramLoginButtonProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    window.TelegramLoginWidget = {
      dataOnAuth: (user: TelegramUser) => onAuth(user)
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', botName)
    script.setAttribute('data-size', buttonSize)
    script.setAttribute('data-userpic', usePic.toString())
    script.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnAuth(user)')
    if (requestAccess) {
      script.setAttribute('data-request-access', 'write')
    }

    ref.current.appendChild(script)

    return () => {
      ref.current?.removeChild(script)
    }
  }, [botName, buttonSize, cornerRadius, onAuth, requestAccess, usePic])

  return <div ref={ref} className={className} />
}
