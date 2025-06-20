'use client'

import React from 'react'
import FN from 'public/assets/svg/1519.svg'
import Image from 'next/image'

function Page() {
  return (
    <main className="min-w-screen flex min-h-screen flex-col mt-8 mx-8 items-center">
      <div className="flex flex-row gap-4 items-center">
        <Image src={FN} alt="108" className="w-20" draggable={false} />
        <h1 className="font-semibold text-4xl">Scholarship</h1>
      </div>
    </main>
  )
}

export default Page