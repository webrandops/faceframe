'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const CATEGORIES = ['All','trending','fashion','rapper','sport','horror','love','closeup','ai_art','vintage']

export default function Home() {
  const [posters, setPosters] = useState([])
  const [activeTab, setActiveTab] = useState('All')
  const [selected, setSelected] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resultUrl, setResultUrl] = useState(null)
  const [status, setStatus] = useState('')

  useEffect(() => { fetchPosters() }, [activeTab])

  async function fetchPosters() {
    let query = supabase.from('posters').select('*').order('created_at', { ascending: false })
    if (activeTab !== 'All') query = query.eq('category', activeTab)
    const { data } = await query
    setPosters(data || [])
  }

  function openModal(poster) {
    setSelected(poster)
    setPhoto(null)
    setPhotoPreview(null)
    setResultUrl(null)
    setStatus('')
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function generate() {
    if (!photo) { setStatus('Pehle apni photo upload karo!'); return }
    setLoading(true)
    setStatus('Generating... 30-60 seconds lagenge...')
    setResultUrl(null)
    try {
      const form = new FormData()
      form.append('photo', photo)
      form.append('posterId', selected.id)
      const res = await fetch('/api/generate', { method: 'POST', body: form })
      const data = await res.json()
      if (data.imageUrl) {
        setResultUrl(data.imageUrl)
        setStatus('Taiyaar hai!')
      } else {
        setStatus('Error: ' + (data.error || 'Try again'))
      }
    } catch(e) {
      setStatus('Network error — try again')
    }
    setLoading(false)
  }

  const s = {
    nav: {display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 2rem',borderBottom:'1px solid #2a2a2a',background:'rgba(10,10,10,0.95)',position:'sticky',top:0,zIndex:100},
    logo: {fontSize:'1.6rem',fontWeight:'700',letterSpacing:'3px',color:'#e8c547'},
    tabs: {display:'flex',gap:'8px',padding:'1rem 2rem',overflowX:'auto',scrollbarWidth:'none'},
    tab: (a) => ({padding:'6px 16px',border:'1px solid',borderColor:a?'#e8c547':'#2a2a2a',background:a?'#e8c547':'transparent',color:a?'#000':'#888',cursor:'pointer',fontSize:'12px',letterSpacing:'1px',textTransform:'uppercase',borderRadius:'4px',whiteSpace:'nowrap'}),
    grid: {display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))',gap:'12px',padding:'1rem 2rem 3rem'},
    card: {position:'relative',cursor:'pointer',border:'1px solid #2a2a2a',borderRadius:'8px',overflow:'hidden',background:'#141414'},
    img: {width:'100%',aspectRatio:'3/4',objectFit:'cover',display:'block'},
    cardLabel: {position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,0.85))',padding:'1rem .75rem .75rem',fontSize:'13px',fontWeight:'500'},
    overlay: {position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'},
    modal: {background:'#141414',border:'1px solid #2a2a2a',borderRadius:'12px',width:'100%',maxWidth:'800px',display:'grid',gridTemplateColumns:'1fr 1fr',maxHeight:'90vh',overflowY:'auto'},
    modalLeft: {padding:'1.5rem',borderRight:'1px solid #2a2a2a'},
    modalRight: {padding:'1.5rem'},
    label: {fontSize:'11px',letterSpacing:'2px',textTransform:'uppercase',color:'#e8c547',display:'block',marginBottom:'6px'},
    uploadBox: {border:'2px dashed #2a2a2a',borderRadius:'8px',padding:'1.5rem',textAlign:'center',cursor:'pointer',position:'relative',marginTop:'8px'},
    btn: {width:'100%',padding:'12px',background:'#e8c547',color:'#000',border:'none',borderRadius:'6px',fontWeight:'700',fontSize:'14px',cursor:'pointer',marginTop:'12px'},
    btnSec: {width:'100%',padding:'10px',background:'transparent',color:'#f5f0e8',border:'1px solid #2a2a2a',borderRadius:'6px',fontSize:'13px',cursor:'pointer',marginTop:'8px'},
    status: {fontSize:'13px',color:'#888',textAlign:'center',marginTop:'8px',minHeight:'20px'},
    close: {position:'absolute',top:'1rem',right:'1rem',background:'none',border:'1px solid #2a2a2a',color:'#f5f0e8',width:'32px',height:'32px',borderRadius:'4px',cursor:'pointer',fontSize:'16px',zIndex:300},
  }

  return (
    <div>
      <nav style={s.nav}>
        <div style={s.logo}>FACE<span style={{color:'#f5f0e8'}}>FRAME</span></div>
        <span style={{fontSize:'12px',color:'#666'}}>AI Poster Studio</span>
      </nav>
      <div style={{textAlign:'center',padding:'2.5rem 1rem 1rem'}}>
        <h1 style={{fontSize:'clamp(2rem,6vw,4rem)',fontWeight:'700',margin:0,letterSpacing:'2px'}}>
          Your Face. <span style={{color:'#e8c547'}}>Any Poster.</span>
        </h1>
        <p style={{color:'#666',marginTop:'8px',fontSize:'15px'}}>Koi bhi poster chunlo — photo upload karo — AI se poster banao</p>
      </div>
      <div style={s.tabs}>
        {CATEGORIES.map(c => (
          <button key={c} style={s.tab(activeTab===c)} onClick={()=>setActiveTab(c)}>{c}</button>
        ))}
      </div>
      <div style={s.grid}>
        {posters.map(p => (
          <div key={p.id} style={s.card} onClick={()=>openModal(p)}>
            <img src={p.sample_image_url} alt={p.title} style={s.img}/>
            <div style={s.cardLabel}>{p.title}</div>
            <div style={{position:'absolute',top:'8px',right:'8px',background:'#e8c547',color:'#000',fontSize:'10px',padding:'3px 8px',borderRadius:'4px',fontWeight:'700'}}>TAP →</div>
          </div>
        ))}
        {posters.length===0 && (
          <div style={{gridColumn:'1/-1',textAlign:'center',padding:'4rem',color:'#444'}}>
            Admin panel se pehla poster add karo
          </div>
        )}
      </div>
      {selected && (
        <div style={s.overlay} onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div style={{position:'relative',width:'100%',maxWidth:'800px'}}>
            <button style={s.close} onClick={()=>setSelected(null)}>✕</button>
            <div style={s.modal}>
              <div style={s.modalLeft}>
                <span style={s.label}>{selected.category}</span>
                <h2 style={{margin:'0 0 .75rem',fontSize:'1.4rem'}}>{selected.title}</h2>
                <img src={selected.sample_image_url} style={{width:'100%',aspectRatio:'3/4',objectFit:'cover',borderRadius:'8px',display:'block'}}/>
                <div style={{marginTop:'8px',display:'flex',flexWrap:'wrap',gap:'4px'}}>
                  {(selected.tags||[]).map(t=>(
                    <span key={t} style={{fontSize:'10px',padding:'2px 8px',border:'1px solid #2a2a2a',borderRadius:'4px',color:'#666'}}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={s.modalRight}>
                <div style={{marginBottom:'1.2rem'}}>
                  <span style={s.label}>Step 1 — Style select ki ✓</span>
                  <p style={{color:'#555',fontSize:'13px',margin:'4px 0 0'}}>Is poster ka look tumhare face par apply hoga</p>
                </div>
                <div>
                  <span style={s.label}>Step 2 — Apni photo upload karo</span>
                  <div style={s.uploadBox}>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} style={{position:'absolute',inset:0,opacity:0,cursor:'pointer',width:'100%',height:'100%'}}/>
                    {photoPreview
                      ? <img src={photoPreview} style={{width:'100%',maxHeight:'180px',objectFit:'cover',borderRadius:'6px'}}/>
                      : <div>
                          <div style={{fontSize:'2rem',marginBottom:'8px'}}>↑</div>
                          <p style={{color:'#555',fontSize:'13px',margin:0}}>Photo click karo ya drag karo</p>
                          <p style={{color:'#333',fontSize:'11px',margin:'4px 0 0'}}>Clear face wali photo best rahegi</p>
                        </div>
                    }
                  </div>
                </div>
                <div style={{marginTop:'1.2rem'}}>
                  <span style={s.label}>Step 3 — Generate karo</span>
                  <button style={{...s.btn,opacity:loading?0.6:1}} onClick={generate} disabled={loading}>
                    {loading ? '⏳ Generating...' : '⚡ Generate Karo'}
                  </button>
                  <div style={s.status}>{status}</div>
                </div>
                {resultUrl && (
                  <div style={{marginTop:'1rem'}}>
                    <span style={s.label}>Tumhara Poster Taiyaar! 🎉</span>
                    <img src={resultUrl} style={{width:'100%',borderRadius:'8px',border:'1px solid #2a2a2a'}}/>
                    <a href={resultUrl} download style={{...s.btn,display:'block',textAlign:'center',marginTop:'8px',textDecoration:'none'}}>↓ Download Karo</a>
                    <button style={s.btnSec} onClick={generate}>↺ Phir Se Generate</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
