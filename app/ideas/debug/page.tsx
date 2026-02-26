import { supabase } from '@/lib/supabase'

export default async function DebugPage() {
  const { data, error } = await supabase
    .from('market_data')
    .select('slug, status, niche, city')
    .limit(20)

  return (
    <pre style={{ padding: 40, color: 'white', background: '#000', fontSize: 12 }}>
      {JSON.stringify({ data, error }, null, 2)}
    </pre>
  )
}