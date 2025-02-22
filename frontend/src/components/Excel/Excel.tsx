import { useState, useEffect } from 'react'
import * as Xls from 'xlsx'

export default function Excel({ src }: { src: string }) {
  const [xls, setXls] = useState<string[] | null>(null)

  useEffect(() => {
    setXls(null)
    ;(async () => {
      const res = await fetch(src)
      const xls = Xls.read(await res.arrayBuffer())
      const tables = xls.SheetNames.map((x) => xls.Sheets[x])
        .map((sheet) => {
          const max: Xls.CellAddress = { r: -1, c: -1 }
          for (const k of Object.keys(sheet)) {
            if (k.startsWith('!')) continue
            const x = Xls.utils.decode_cell(k)
            max.r = Math.max(max.r, x.r)
            max.c = Math.max(max.c, x.c)
          }
          if (max.r === -1) return undefined
          sheet['!ref'] = Xls.utils.encode_range({ r: 0, c: 0 }, max)
          return Xls.utils.sheet_to_html(sheet, { header: '', footer: '' })
        })
        .filter((x): x is string => x !== undefined)
      setXls(tables)
    })()
  }, [src])

  if (!xls) return <div>loading...</div>

  return (
    <div className="excel">
      {xls.map((table, index) => (
        <div key={index} dangerouslySetInnerHTML={{ __html: table }}></div>
      ))}
    </div>
  )
}
