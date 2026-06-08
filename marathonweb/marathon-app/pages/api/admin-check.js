import { requireSession } from '../../lib/auth'
import { getSupabaseAdmin } from '../../lib/supabase'

// Admin emails — set in env or hardcode your email here
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())

export default async function handler(req, res) {
  const session = await requireSession(req, res)
  if (!session) return

  const isAdmin = ADMIN_EMAILS.includes(session.user.email?.toLowerCase())
  return res.json({ isAdmin, email: session.user.email })
}
