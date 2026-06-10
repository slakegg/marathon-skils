import { requireSession } from '../../lib/auth'
import { getSupabaseAdmin } from '../../lib/supabase'

export default async function handler(req, res) {
  const session = await requireSession(req, res)
  if (!session) return

  const supabase = getSupabaseAdmin()
  const userId   = session.user.id

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('runners')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  if (req.method === 'POST') {
    const body = req.body
    const { data, error } = await supabase
      .from('runners')
      .insert([{ ...body, user_id: userId }])
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end()
}
