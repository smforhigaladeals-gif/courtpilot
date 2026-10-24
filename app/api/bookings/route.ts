import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      tenantId,
      courtId,
      startTime,
      endTime,
      guestName,
      guestPhone,
    } = body

    if (!tenantId || !courtId || !startTime || !endTime || !guestName || !guestPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        tenant_id: tenantId,
        court_id: courtId,
        start_time: startTime,
        end_time: endTime,
        guest_name: guestName,
        guest_phone: guestPhone,
        status: 'confirmed',
        payment_status: 'unpaid',
        amount_cents: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Booking error:', error)
      // Friendly message for double-booking
      if (error.message?.includes('no_overlapping_bookings') || error.code === '23P01') {
        return NextResponse.json(
          { error: 'This court is already booked for that time. Please choose another slot.' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, booking: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
