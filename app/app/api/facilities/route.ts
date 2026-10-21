import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, address, email, sport } = body

    if (!name || !address || !email) {
      return NextResponse.json(
        { error: 'Name, address and email are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create a simple slug from the facility name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const { data, error } = await supabase
      .from('tenants')
      .insert({
        name,
        slug,
        address,
        contact_email: email,
        primary_sport: sport || 'pickleball',
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, facility: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
