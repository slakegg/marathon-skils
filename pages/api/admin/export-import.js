// pages/api/admin/export-import.js
import { requireSession } from '../../../lib/auth'
import { getSupabaseAdmin } from '../../../lib/supabase'
 
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
 
export default async function handler(req, res) {
  const session = await requireSession(req, res)
  if (!session) return
 
  const isAdmin = ADMIN_EMAILS.includes(session.user.email?.toLowerCase())
  if (!isAdmin) return res.status(403).json({ error: 'Forbidden' })
 
  const supabase = getSupabaseAdmin()
 
  // GET — экспорт всех участников в JSON
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('runners')
      .select('first_name, last_name, email, country, gender, birth_date, role, bmi')
      .order('last_name', { ascending: true })
 
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }
 
  // POST — импорт участников из массива
  if (req.method === 'POST') {
    const { runners } = req.body
    if (!Array.isArray(runners) || runners.length === 0) {
      return res.status(400).json({ error: 'Нет данных для импорта' })
    }
 
    // Валидация и очистка
    const cleaned = runners.map(r => ({
      first_name: String(r.first_name || '').trim().slice(0, 50),
      last_name:  String(r.last_name  || '').trim().slice(0, 50),
      email:      String(r.email      || '').trim().toLowerCase().slice(0, 100),
      country:    String(r.country    || 'Kazakhstan').trim(),
      gender:     ['Мужской', 'Женский'].includes(r.gender) ? r.gender : 'Мужской',
      birth_date: r.birth_date || '1990-01-01',
      role:       ['Бегун', 'Координатор'].includes(r.role) ? r.role : 'Бегун',
      bmi:        parseFloat(r.bmi) || 0,
    })).filter(r => r.first_name && r.email)
 
    if (cleaned.length === 0) {
      return res.status(400).json({ error: 'Нет валидных строк (нужны first_name и email)' })
    }
 
    const { data, error } = await supabase
      .from('runners')
      .insert(cleaned)
      .select()
 
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ inserted: data.length })
  }
 
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end()
}
