import { getCurrentUser } from '@/lib/dal'
import IssueForm from '@/components/IssueForm'
import { redirect } from 'next/navigation'

const NewIssue = async () => {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/')
  }
  return <IssueForm userId={user.id}/>
}

export default NewIssue
