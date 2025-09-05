import { whoami } from '@/lib/api/patron.ts'
import { HttpError } from '@/lib/types/errors.ts'
import { redirect } from '@tanstack/react-router'

export async function authRedirect() {
  try {
    const user = await whoami()
    if (!user) {
      return redirect({
        to: '/auth'
      })
    }
    return null
  } catch (error) {
    if (error instanceof HttpError && (error.status == 401 || error.status == 403)) {
      throw redirect({
        to: '/auth'
      })
    }
    throw error
  }
}

export async function isAdminRedirect() {
  try {
    const user = await whoami()
    if (!user) {
      return redirect({
        to: '/auth'
      })
    } else {
      if (!user.is_admin) {
        return redirect({
          // TODO: урбать selectedApplicationId: undefined
          to: '/patron', search: { selectedApplicationId: undefined }
        })
      }
    }
    return null
  } catch (error) {}
}
