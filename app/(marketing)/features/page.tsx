import Link from 'next/link'
import {
  LayoutDashboard,
  ListTodo,
  Shield,
  Zap,
  Tags,
  Users,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { getCurrentUser } from '@/lib/dal'

const features = [
  {
    icon: ListTodo,
    title: 'Issue tracking',
    description:
      'Create, edit, and organize issues with titles, descriptions, status, and priority — all in one place.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard overview',
    description:
      'See every issue at a glance. Sort by status, priority, and creation date from a clean dashboard.',
  },
  {
    icon: Tags,
    title: 'Status & priority',
    description:
      'Move issues through Backlog, Todo, In Progress, and Done. Set Low, Medium, or High priority.',
  },
  {
    icon: Shield,
    title: 'Secure authentication',
    description:
      'JWT-based sessions keep your account safe. Protected routes ensure only you access your data.',
  },
  {
    icon: Zap,
    title: 'Fast & modern stack',
    description:
      'Built with Next.js App Router, Drizzle ORM, and Neon PostgreSQL for speed and reliability.',
  },
  {
    icon: Users,
    title: 'Built for teams',
    description:
      'Start solo or grow your team. Mode scales from personal projects to collaborative workflows.',
  },
]

export default async function FeaturesPage() {
  const user = await getCurrentUser()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Everything you need to ship
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Mode gives you the tools to track work without the complexity.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-lg border border-gray-200 dark:border-dark-border-default bg-white dark:bg-dark-elevated p-6 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 mb-4">
              <feature.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {user ? 'Ready to dive in?' : 'Ready to get started?'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {user
            ? 'Your dashboard is ready — pick up where you left off.'
            : 'Create a free account and start tracking issues in minutes.'}
        </p>
        <Link href={user ? '/dashboard' : '/signup'}>
          <Button size="lg">{user ? 'Go to Dashboard' : 'Get Started'}</Button>
        </Link>
      </div>
    </div>
  )
}
