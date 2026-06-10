import { requireSession } from '../../../lib/auth'
import { getSupabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  const session = await requireSession(req, res)
  if (!session) return

  const supabase = getSupabaseAdmin()
  const { id }   = req.query

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('runners').select('*').eq('id', id).single()
    if (error) return res.status(404).json({ error: 'Not found' })
    return res.json(data)
  }

  if (req.method === 'PUT') {
    const { data, error } = await supabase
      .from('runners').update(req.body).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('runners').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ success: true })
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  res.status(405).end()
}
