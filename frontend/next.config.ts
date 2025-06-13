import type { NextConfig } from 'next'
import * as dotenv from 'dotenv'

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SERVER: process.env.NEXT_PUBLIC_SERVER,
    NEXT_PUBLIC_BOT: process.env.NEXT_PUBLIC_BOT
  }
}

export default nextConfig
