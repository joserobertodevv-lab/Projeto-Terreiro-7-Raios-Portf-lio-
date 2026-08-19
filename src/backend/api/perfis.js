import { createClient } from '@supabase/supabase-js'

function getBearerToken(req) {
  const auth = req.headers.authorization || ''
  const match = auth.match(/^Bearer\s+(.+)$/i)
  return match ? match[1] : null
}

export default async function handler(req, res) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Variáveis de ambiente do Supabase não configuradas.' })
    }

    const token = getBearerToken(req)
    if (!token) return res.status(401).json({ error: 'Token ausente (Authorization: Bearer ...).' })

    // Service role: bypass RLS (somente no backend)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) return res.status(401).json({ error: 'Token inválido.' })

    const userId = userData.user.id
    const { data: perfil, error: perfilErr } = await supabase
      .from('perfis')
      .select('role')
      .eq('id', userId)
      .single()

    if (perfilErr || !perfil) return res.status(403).json({ error: 'Perfil não encontrado.' })

    // Apenas admin/admin_lojinha pode listar perfis
    if (!['admin', 'admin_lojinha'].includes(perfil.role)) {
      return res.status(403).json({ error: 'Sem permissão.' })
    }

    const role = typeof req.query.role === 'string' ? req.query.role : undefined

    let q = supabase.from('perfis').select('id, nome, email, role').order('nome', { ascending: true })
    if (role) q = q.eq('role', role)

    const { data, error } = await q
    if (error) throw error

    return res.status(200).json({ data: data || [] })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    return res.status(500).json({ error: e?.message || 'Erro inesperado.' })
  }
}

