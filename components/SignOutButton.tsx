'use client'

import { LogOutIcon } from 'lucide-react'
import { useTransition } from 'react'
import { signOut } from '@/app/actions/auth'

interface SignOutButtonProps {
  compact?: boolean
}

export default function SignOutButton({ compact = false }: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut()
    })
  }

  if (compact) {
    return (
      <button
        onClick={handleSignOut}
        disabled={isPending}
        title="Sign out"
        aria-label="Sign out"
        className="flex items-center justify-center h-9 w-9 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        <LogOutIcon size={18} />
      </button>
    )
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="flex items-center w-full px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
    >
      <LogOutIcon size={20} className="mr-2" />
      <span>{isPending ? 'Signing out...' : 'Sign Out'}</span>
    </button>
  )
}
