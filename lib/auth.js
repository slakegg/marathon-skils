import { getServerSession } from 'next-auth/next'
import { authOptions } from './authOptions'

export async function requireSession(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
  return session
}
