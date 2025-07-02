export async function tgCallback(param: URLSearchParams, inviteSecret: string) {
  const res = await fetch(
    `${import.meta.env.VITE_PUBLIC_API}/auth/telegram-callback?${param.toString()}&invite_secret=${inviteSecret}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'applicant/json'
      },
      credentials: 'include'
    }
  )

  if (!res.ok) throw new Error('Create message: network response was not ok')

  return res.json()
}
