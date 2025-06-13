export async function tgCallback(param: URLSearchParams) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER}/telegram-callback/?${param.toString()}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )

  if (!res.ok) throw new Error('Create message: network response was not ok')

  return res.json()
}
