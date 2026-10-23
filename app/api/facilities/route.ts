import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

async function geocodeAddress(address: string) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}&limit=1`

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'CourtPilot/1.0 (court booking system)',
      },
    })

    const data = await res.json()

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      }
    }
  } catch (err) {
    console.error('Geocoding error:', err)
  }
  return null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, address, email, phone, sport } = body

    if (!name || !address || !phone) {
      return NextResponse.json(
        { error: 'Name, address and mobile number are required' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const coords = await geocodeAddress(address)

    const insertData: any = {
      name,
      slug,
      address,
      sport_template: sport || 'pickleball',
      status: 'trial',
      settings: {
        contact_phone: phone,
        contact_email: email || null,
      },
    }

    if (coords) {
      insertData.location = `POINT(${coords.lng} ${coords.lat})`
    }

    const { data, error } = await supabase
      .from('tenants')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      facility: data,
      id: data.id,
      hasLocation: !!coords,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
