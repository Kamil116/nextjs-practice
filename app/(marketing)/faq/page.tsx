import Link from 'next/link'
import Button from '@/components/ui/Button'

const faqs = [
  {
    question: 'What is Mode?',
    answer:
      'Mode is a minimal issue tracking tool inspired by Linear. It helps you create, organize, and manage project issues with a clean, modern interface.',
  },
  {
    question: 'Is Mode free to use?',
    answer:
      'Yes. The Free plan includes unlimited issues and basic tracking for individuals and small teams. See our Pricing page for Pro and Enterprise options.',
  },
  {
    question: 'How do I create an account?',
    answer:
      'Click Sign up on the homepage, enter your email and password, and you will be redirected to your dashboard. You can start creating issues right away.',
  },
  {
    question: 'How is my data secured?',
    answer:
      'Sessions are stored as HTTP-only JWT cookies. Protected routes and server actions verify your identity before any read or write operation on your issues.',
  },
  {
    question: 'Can I edit or delete issues?',
    answer:
      'Yes. Open any issue to view details, click Edit to update it, or use the Delete button. Only the issue owner can modify or remove their issues.',
  },
  {
    question: 'What tech stack does Mode use?',
    answer:
      'Mode is built with Next.js, TypeScript, Tailwind CSS, Drizzle ORM, and PostgreSQL (Neon). Authentication uses JWT via the jose library.',
  },
]

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Quick answers to common questions about Mode.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6 mb-16">
        {faqs.map((faq) => (
          <div
            key={faq.question}
            className="rounded-lg border border-gray-200 dark:border-dark-border-default bg-white dark:bg-dark-elevated p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              {faq.question}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Still have questions?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Create an account and explore Mode, or check our documentation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button>Sign up</Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline">View Pricing</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
