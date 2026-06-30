import Link from 'next/link'
import { UserIcon } from 'lucide-react'
import { getCurrentUser } from '@/lib/dal'
import Button from './ui/Button'
import SignOutButton from './SignOutButton'

export default async function MarketingHeaderAuth() {
  const user = await getCurrentUser()

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            Dashboard
          </Button>
        </Link>
        <div className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-dark-border-subtle px-3 py-1.5">
          <UserIcon size={18} className="text-gray-500 shrink-0" />
          <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300 max-w-[160px] truncate">
            {user.email}
          </span>
        </div>
        <SignOutButton compact />
      </div>
    )
  }

  return (
    <>
      <Link href="/signin">
        <Button variant="outline">Sign in</Button>
      </Link>
      <Link href="/signup">
        <Button>Sign up</Button>
      </Link>
    </>
  )
}
