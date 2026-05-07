import { readSheet } from 'read-excel-file/browser'
import React, { useEffect, useState } from 'react'

interface ExcelPreviewProps {
  fileUrl: string
}

type ExcelCell = string | number | boolean | Date | null | undefined

const ExcelPreview: React.FC<ExcelPreviewProps> = ({ fileUrl }) => {
  const [data, setData] = useState<ExcelCell[][] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!fileUrl) return

    let isCancelled = false

    setData(null)
    setError(null)

    const loadExcel = async () => {
      try {
        const res = await fetch(fileUrl, { credentials: 'include' })
        if (!res.ok) {
          throw new Error('Failed to fetch Excel file')
        }

        const blob = await res.blob()
        const rows = await readSheet(blob)

        if (!isCancelled) {
          setData(rows)
        }
      } catch {
        if (!isCancelled) {
          setError('Failed to load or parse Excel file')
        }
      }
    }

    void loadExcel()

    return () => {
      isCancelled = true
    }
  }, [fileUrl])

  if (error) return <div className="text-red-600">{error}</div>
  if (!data) return <div>Loading Excel...</div>
  if (data.length === 0) return <div>No data in Excel file</div>

  return (
    <div className="max-h-screen max-w-full overflow-auto">
      <table className="min-w-max border border-gray-400">
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border border-gray-300 px-2 py-1">
                  {cell !== undefined && cell !== null ? String(cell) : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ExcelPreview
