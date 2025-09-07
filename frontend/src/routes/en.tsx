import { Page } from '@/components/landing/Page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/en')({
  component: () => <Page lang="en" />
})
