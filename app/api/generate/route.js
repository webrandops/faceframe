import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function POST(req) {
  try {
    const formData = await req.formData()
    const posterId = formData.get('posterId')

    const { data: poster } = await supabase
      .from('posters')
      .select('*')
      .eq('id', posterId)
      .single()

    if (!poster) return NextResponse.json({ error: 'Poster nahi mila' }, { status: 404 })

    const prompt = `${poster.prompt}, photorealistic, high quality, cinematic lighting, 8k, detailed, professional photography`

    const hfRes = await fetch(
      'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { width: 768, height: 1024 }
        }),
      }
    )

    if (!hfRes.ok) {
      const err = await hfRes.text()
      throw new Error('HF Error: ' + err)
    }

    const imgBuffer = await hfRes.arrayBuffer()
    const fileName = `${posterId}-${Date.now()}.jpg`

    await supabase.storage
      .from('generated')
      .upload(fileName, imgBuffer, { contentType: 'image/jpeg' })

    const { data: pub } = supabase.storage
      .from('generated')
      .getPublicUrl(fileName)

    await supabase.from('generations').insert({
      poster_id: posterId,
      result_url: pub.publicUrl
    })

    return NextResponse.json({ success: true, imageUrl: pub.publicUrl })

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
