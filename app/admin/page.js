'use client'
import { useState } from 'react'

export default function AdminPage() {
  const [form, setForm] = useState({ title:'', category:'trending', prompt:'', tags:'' })
  const [image, setImage] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const categories = ['trending','fashion','rapper','sport','horror','love','closeup','ai_art','vintage','women','babies']

  async function upload() {
    if (!image || !form.title || !form.prompt) {
      setStatus('Sab fields bharo aur image select karo')
      return
    }
    setLoading(true)
    setStatus('Upload ho raha hai...')
    const fd = new FormData()
    fd.append('image', image)
    fd.append('title', form.title)
    fd.append('category', form.category)
    fd.append('prompt', form.prompt)
    fd.append('tags', form.tags)
    fd.append('secret', 'faceframe-admin-2024')

    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.success) {
      setStatus('✅ Poster upload ho gaya!')
      setForm({ title:'', category:'trending', prompt:'', tags:'' })
      setImage(null)
    } else {
      setStatus('❌ Error: ' + data.error)
    }
    setLoading(false)
  }

  const inp = {width:'100%',padding:'10px 12px',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'6px',color:'#f5f0e8',fontSize:'14px',marginTop:'6px',boxSizing:'border-box'}

  return (
    <div style={{maxWidth:'600px',margin:'2rem auto',padding:'0 1.5rem'}}>
      <h1 style={{color:'#e8c547',letterSpacing:'2px',fontSize:'1.8rem'}}>⚙ ADMIN PANEL</h1>
      <p style={{color:'#555',fontSize:'13px',marginTop:'4px'}}>Naya poster add karo website par</p>

      <div style={{display:'flex',flexDirection:'column',gap:'16px',marginTop:'2rem'}}>
        <div>
          <label style={{fontSize:'11px',color:'#666',letterSpacing:'1px',textTransform:'uppercase'}}>Poster Title</label>
          <input style={inp} placeholder="jaise: Cyberpunk Royalty" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
        </div>
        <div>
          <label style={{fontSize:'11px',color:'#666',letterSpacing:'1px',textTransform:'uppercase'}}>Category</label>
          <select style={inp} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
            {categories.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{fontSize:'11px',color:'#666',letterSpacing:'1px',textTransform:'uppercase'}}>AI Prompt</label>
          <textarea style={{...inp,height:'120px',resize:'vertical'}} placeholder="jaise: Cinematic portrait, neon city background, wearing futuristic jacket, dramatic lighting..." value={form.prompt} onChange={e=>setForm({...form,prompt:e.target.value})}/>
        </div>
        <div>
          <label style={{fontSize:'11px',color:'#666',letterSpacing:'1px',textTransform:'uppercase'}}>Tags (comma se alag karo)</label>
          <input style={inp} placeholder="neon, cyberpunk, futuristic" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})}/>
        </div>
        <div>
          <label style={{fontSize:'11px',color:'#666',letterSpacing:'1px',textTransform:'uppercase'}}>Sample Image Upload karo</label>
          <input type="file" accept="image/*" onChange={e=>setImage(e.target.files[0])} style={{...inp,padding:'8px'}}/>
          {image && <p style={{color:'#e8c547',fontSize:'12px',margin:'4px 0 0'}}>✓ {image.name}</p>}
        </div>
        <button onClick={upload} disabled={loading} style={{padding:'14px',background:'#e8c547',color:'#000',border:'none',borderRadius:'6px',fontWeight:'700',fontSize:'15px',cursor:'pointer',opacity:loading?0.6:1}}>
          {loading ? '⏳ Upload ho raha hai...' : '⬆ Poster Upload Karo'}
        </button>
        {status && <div style={{textAlign:'center',fontSize:'14px',color:status.includes('✅')?'#5adf7a':'#e05555',padding:'8px',background:'#1a1a1a',borderRadius:'6px'}}>{status}</div>}
      </div>
    </div>
  )
}
