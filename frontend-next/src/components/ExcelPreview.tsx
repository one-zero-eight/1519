'use client'
import React, { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

interface ExcelPreviewProps {
  fileUrl: string
}

const ExcelPreview: React.FC<ExcelPreviewProps> = ({ fileUrl }) => {
  const [data, setData] = useState<any[][] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!fileUrl) return
    setData(null)
    setError(null)
    fetch(fileUrl, { credentials: 'include' })
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        setData(json as any[][])
      })
      .catch((e) => setError('Failed to load or parse Excel file'))
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
