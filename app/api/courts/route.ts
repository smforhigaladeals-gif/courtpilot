import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tenantId, courts } = body

    if (!tenantId || !courts || !Array.isArray(courts) || courts.length === 0) {
      return NextResponse.json(
        { error: 'tenantId and at least one court are required' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const rows = courts.map((name: string, index: number) => ({
      tenant_id: tenantId,
      name: name.trim() || `Court ${index + 1}`,
      is_active: true,
      sort_order: index,
    }))

    const { data, error } = await supabase
      .from('courts')
      .insert(rows)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, courts: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
