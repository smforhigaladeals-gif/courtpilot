import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !['confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'status must be confirmed or cancelled' },
        { status: 400 }
      )
    }

    // Check the user is logged in
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 })
    }

    // Use service role to update
    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify this booking belongs to a facility the user owns
    const { data: booking } = await admin
      .from('bookings')
      .select('id, tenant_id')
      .eq('id', id)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const { data: link } = await admin
      .from('tenant_users')
      .select('id')
      .eq('tenant_id', booking.tenant_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!link) {
      return NextResponse.json(
        { error: 'You do not manage this facility' },
        { status: 403 }
      )
    }

    const { data, error } = await admin
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, booking: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
