import React from 'react'
import ShortenForm from '../ui/ShortenForm'

export default function Home(){
  return (
    <div>
      <section className="hero">
        <div className="hero-left">
          <h1>Build stronger digital connections</h1>
          <p className="small">Shorten links, manage aliases, view analytics and generate QR codes — now in a clean, professional UI.</p>
          <div style={{marginTop:20}}><a className="btn" href="#create">Get started</a></div>
        </div>
        <div style={{flex:1}}>
          <div className="app-panel" id="create">
            <ShortenForm />
          </div>
        </div>
      </section>

      <section className="card-grid">
        <div className="app-panel"><h3 className="panel-title">Fast redirects</h3><p className="small">Server-side redirects for reliable analytics and SEO-friendly behaviour.</p></div>
        <div className="app-panel"><h3 className="panel-title">QR codes</h3><p className="small">Instant QR generation for any short link.</p></div>
        <div className="app-panel"><h3 className="panel-title">Analytics</h3><p className="small">Charts and breakdowns for referrers, devices and timestamps.</p></div>
      </section>
    </div>
  )
}
