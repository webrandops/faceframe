import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function POST(req) {
  try {
    const formData = await req.formData()
    const secret = formData.get('secret')

    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const image = formData.get('image')
    const title = formData.get('title')
    const category = formData.get('category')
    const prompt = formData.get('prompt')
    const tagsRaw = formData.get('tags')
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []

    const bytes = await image.arrayBuffer()
    const ext = image.name.split('.').pop()
    const fileName = `${category}-${Date.now()}.${ext}`

    const { error: storageErr } = await supabase.storage
      .from('posters')
      .upload(fileName, bytes, { contentType: image.type })

    if (storageErr) return NextResponse.json({ error: storageErr.message }, { status: 500 })

    const { data: pub } = supabase.storage
      .from('posters')
      .getPublicUrl(fileName)

    const { error: dbErr } = await supabase
      .from('posters')
      .insert({ title, category, prompt, tags, sample_image_url: pub.publicUrl })

    if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

    return NextResponse.json({ success: true })

  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
