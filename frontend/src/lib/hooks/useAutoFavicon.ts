import { useEffect } from 'react'

const setFavicon = () => {
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  const faviconPath = isDarkMode ? '/favicon-dark.ico' : '/favicon.ico'

  // Добавляем timestamp для обхода кэширования
  const timestamp = new Date().getTime()
  const faviconUrl = `${faviconPath}?v=${timestamp}`

  let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = faviconUrl
}

export const useAutoFavicon = () => {
  useEffect(() => {
    setFavicon()

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleThemeChange = () => {
      setFavicon()
    }

    mediaQuery.addEventListener('change', handleThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange)
    }
  }, [])
}
