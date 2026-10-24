import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: facility, error: facilityError } = await supabase
      .from('tenants')
      .select('id, name, address, sport_template, status')
      .eq('id', id)
      .single()

    if (facilityError || !facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      )
    }

    const { data: courts } = await supabase
      .from('courts')
      .select('id, name, is_active, court_type')
      .eq('tenant_id', id)
      .eq('is_active', true)
      .order('sort_order')

    return NextResponse.json({
      facility,
      courts: courts || [],
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
