import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const date = searchParams.get('date') // YYYY-MM-DD

    if (!tenantId || !date) {
      return NextResponse.json(
        { error: 'tenantId and date are required' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get active courts for this facility
    const { data: courts, error: courtsError } = await supabase
      .from('courts')
      .select('id, name')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('sort_order')

    if (courtsError) {
      return NextResponse.json({ error: courtsError.message }, { status: 500 })
    }

    if (!courts || courts.length === 0) {
      return NextResponse.json({ slots: [] })
    }

    // Get existing bookings for that date
    const dayStart = `${date}T00:00:00.000Z`
    const dayEnd = `${date}T23:59:59.999Z`

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('court_id, start_time, end_time')
      .eq('tenant_id', tenantId)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', dayStart)
      .lte('start_time', dayEnd)

    if (bookingsError) {
      return NextResponse.json({ error: bookingsError.message }, { status: 500 })
    }

    // Simple time slots: every hour from 6:00 to 22:00
    const hours = []
    for (let h = 6; h <= 21; h++) {
      hours.push(h)
    }

    const slots: {
      courtId: string
      courtName: string
      startTime: string
      endTime: string
      label: string
    }[] = []

    for (const court of courts) {
      for (const hour of hours) {
        const start = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00`)
        const end = new Date(start.getTime() + 60 * 60 * 1000)

        // Check if this slot overlaps any existing booking for this court
        const isTaken = (bookings || []).some((b) => {
          if (b.court_id !== court.id) return false
          const bStart = new Date(b.start_time)
          const bEnd = new Date(b.end_time)
          return start < bEnd && end > bStart
        })

        if (!isTaken) {
          const label = `${start.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })} – ${end.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}`

          slots.push({
            courtId: court.id,
            courtName: court.name,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            label,
          })
        }
      }
    }

    return NextResponse.json({ slots })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
