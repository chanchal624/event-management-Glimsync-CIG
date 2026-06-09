import Link from "next/link";

export default function Home() {
  return (
    <div className="animate-fade-in" style={{ padding: '2rem 4rem', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '6rem' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '80vh', gap: '4rem' }}>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div className="hero-tagline" style={{ display: 'inline-block' }}>Where every moments find its place!</div>
          <h1 className="hero-title" style={{ fontSize: '4.5rem', marginTop: '1.5rem' }}>
            Sync Moments, <br />
            <span className="hero-title-highlight">Live Forever.</span>
          </h1>
          <p className="hero-subtitle" style={{ textAlign: 'left', maxWidth: '100%' }}>
            GlimSync is the premiere hub for photographers and organizers. Leverage cutting-edge AI to auto-tag photos, let guests find themselves instantly with facial recognition, and scale effortlessly on the cloud.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/register" style={{ textDecoration: "none" }}>
              <button className="btn-primary hover-scale" style={{ cursor: 'pointer' }}>Start Creating Free</button>
            </Link>
            <a href="#features" style={{ textDecoration: "none" }}>
              <button className="btn-primary hover-scale" style={{ background: 'var(--glass-bg)', color: '#0f172a', border: '1px solid var(--glass-border)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                See How It Works
              </button>
            </a>
          </div>
        </div>

        <div className="perspective-container" style={{ flex: 1 }}>
          <div className="photo-stack">

            <div className="photo-stack-img" style={{ overflow: 'hidden', padding: 0 }}>
              <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, zIndex: 0 }} alt="Concert" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)', zIndex: 1 }}></div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', zIndex: 2, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ color: 'white', fontWeight: '800', fontSize: '0.95rem', margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>Summer Fest 2025</h3>
                  <span style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontSize: '0.55rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Public</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>Jun 12 - Jun 14, 2025 • 420 Photos</p>
              </div>
            </div>

            <div className="photo-stack-img" style={{ overflow: 'hidden', padding: 0 }}>
              <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, zIndex: 0 }} alt="Photographer" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)', zIndex: 1 }}></div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', zIndex: 2, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ color: 'white', fontWeight: '800', fontSize: '0.95rem', margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>Mountain Adventure 2K24</h3>
                  <span style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontSize: '0.55rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Public</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>May 12 - May 15, 2024 • 256 Photos</p>
              </div>
            </div>

            <div className="photo-stack-img" style={{ overflow: 'hidden', padding: 0 }}>
              <img src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, zIndex: 0 }} alt="Concert" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)', zIndex: 1 }}></div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', zIndex: 2, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ color: 'white', fontWeight: '800', fontSize: '0.95rem', margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>Live Concert</h3>
                  <span style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontSize: '0.55rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Public</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>Aug 22, 2025 • 45 Photos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="features" className="glass-panel" style={{ width: '100%', textAlign: 'center', marginBottom: '0', padding: '4rem 2rem 4rem 2rem', position: 'relative', overflow: 'visible', background: '#ffffff', border: 'none', boxShadow: 'none' }}>

        <div style={{ marginBottom: '4rem' }}>
          <span style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(99,102,241,0.1)', color: '#6366f1', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1rem', border: '1px solid rgba(99,102,241,0.2)' }}>
            Capture. Connect. Celebrate.
          </span>
          <h2 style={{ fontSize: '3rem', fontWeight: '900', color: '#0f172a', lineHeight: '1.2' }}>
            Powerful <span style={{ color: '#6366f1' }}>Features</span> <br /> Built for Every Moment
          </h2>
        </div>

        <div className="mindmap-container">

          <div style={{ position: 'absolute', top: '46%', left: '50%', transform: 'translate(-50%, -50%)', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(216, 180, 254, 0.4) 0%, transparent 70%)', zIndex: 0, borderRadius: '50%' }}></div>

          <svg className="mindmap-lines" viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, opacity: 1 }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
              </marker>
            </defs>

            <path d="M 500 300 Q 350 150 220 130" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,5" fill="none" markerEnd="url(#arrowhead)" />
            <path d="M 500 300 Q 650 150 780 130" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,5" fill="none" markerEnd="url(#arrowhead)" />
            <path d="M 500 300 Q 300 250 160 300" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,5" fill="none" markerEnd="url(#arrowhead)" />
            <path d="M 500 300 Q 700 250 840 300" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,5" fill="none" markerEnd="url(#arrowhead)" />
            <path d="M 500 300 Q 350 450 220 480" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,5" fill="none" markerEnd="url(#arrowhead)" />
            <path d="M 500 300 Q 650 450 780 480" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,5" fill="none" markerEnd="url(#arrowhead)" />
            <path d="M 500 300 Q 400 450 500 560" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,5" fill="none" markerEnd="url(#arrowhead)" />
          </svg>

          <div className="mindmap-center hover-lift" style={{ position: 'absolute', top: '46%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 3, background: 'white', padding: '1.5rem', borderRadius: '50%', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))', display: 'inline-block' }}>📷</span>
          </div>

          <div className="mindmap-card hover-lift" style={{ top: '5%', left: '6%' }}>
            <div className="mindmap-icon" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#6366f1' }}>📅</div>
            <div style={{ textAlign: 'left', zIndex: 2 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1e293b' }}>Event Management</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4', marginTop: '0.2rem' }}>Create, organize and manage events with ease.</p>
            </div>
          </div>

          <div className="mindmap-card hover-lift" style={{ top: '5%', right: '6%' }}>
            <div className="mindmap-icon" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#6366f1' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                <path d="M12 12v9"></path>
                <path d="m16 16-4-4-4 4"></path>
              </svg>
            </div>
            <div style={{ textAlign: 'left', zIndex: 2 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1e293b' }}>Media Upload</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4', marginTop: '0.2rem' }}>Upload photos and videos in bulk effortlessly.</p>
            </div>
          </div>

          <div className="mindmap-card hover-lift" style={{ top: '35%', left: '0%' }}>
            <div className="mindmap-icon" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#6366f1' }}>👥</div>
            <div style={{ textAlign: 'left', zIndex: 2 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1e293b' }}>Access Control</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4', marginTop: '0.2rem' }}>Manage roles and control who views media.</p>
            </div>
          </div>

          <div className="mindmap-card hover-lift" style={{ top: '35%', right: '0%' }}>
            <div className="mindmap-icon" style={{ background: 'rgba(254, 226, 226, 0.5)', border: '1px solid #fecaca', color: '#ef4444' }}>❤️</div>
            <div style={{ textAlign: 'left', zIndex: 2 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1e293b' }}>Social Interaction</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4', marginTop: '0.2rem' }}>Like, comment, and share your favorite moments.</p>
            </div>
          </div>

          <div className="mindmap-card hover-lift" style={{ top: '65%', left: '8%' }}>
            <div className="mindmap-icon" style={{ background: 'rgba(219, 234, 254, 0.5)', border: '1px solid #bfdbfe', color: '#3b82f6' }}>🔍</div>
            <div style={{ textAlign: 'left', zIndex: 2 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1e293b' }}>AI Search & Tagging</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4', marginTop: '0.2rem' }}>Search by faces, tags, or names instantly.</p>
            </div>
          </div>

          <div className="mindmap-card hover-lift" style={{ top: '65%', right: '8%' }}>
            <div className="mindmap-icon" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#6366f1' }}>☁️</div>
            <div style={{ textAlign: 'left', zIndex: 2 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1e293b' }}>Cloud Storage</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4', marginTop: '0.2rem' }}>Secure cloud storage. Your memories are safe.</p>
            </div>
          </div>

          <div className="mindmap-card hover-lift" style={{ top: '82%', left: '50%', transform: 'translateX(-50%)' }}>
            <div className="mindmap-icon" style={{ background: 'rgba(243, 232, 255, 0.5)', border: '1px solid #e9d5ff', color: '#a855f7' }}>🤖</div>
            <div style={{ textAlign: 'left', zIndex: 2 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1e293b' }}>Face Recognition</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4', marginTop: '0.2rem' }}>Upload a selfie and find your photos instantly.</p>
            </div>
          </div>
        </div>

        <div className="mobile-features-stack">
          {[
            { icon: '📅', title: 'Event Management', desc: 'Create, organize and manage events with ease.', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
            {
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                <path d="M12 12v9"></path>
                <path d="m16 16-4-4-4 4"></path>
              </svg>,
              title: 'Media Upload',
              desc: 'Upload photos and videos in bulk effortlessly.',
              color: '#6366f1',
              bg: 'rgba(16, 185, 129, 0.1)'
            },
            { icon: '🛡️', title: 'Access Control', desc: 'Manage roles and control who views media.', color: '#6366f1', bg: 'rgba(245, 158, 11, 0.1)' },
            { icon: '💖', title: 'Social Interaction', desc: 'Like, comment, and share your favorite moments.', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
            { icon: '🔍', title: 'AI Search & Tagging', desc: 'Search by faces, tags, or names instantly.', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
            { icon: '🔒', title: 'Cloud Storage', desc: 'Secure cloud storage. Your memories are safe.', color: '#6366f1', bg: 'rgba(249, 115, 22, 0.1)' },
            { icon: '🤖', title: 'Face Recognition', desc: 'Upload a selfie and find your photos instantly.', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
          ].map((feat, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: feat.bg, color: feat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                {feat.icon}
              </div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b' }}>{feat.title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4', marginTop: '0.2rem' }}>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '4rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#6366f1', fontSize: '1.2rem' }}>⚡</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b' }}>Lightning Fast</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Blazing fast performance</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#3b82f6', fontSize: '1.2rem' }}>🛡️</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b' }}>Secure & Reliable</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Your data is always protected</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#6366f1', fontSize: '1.2rem' }}>✨</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b' }}>Smart & AI-Powered</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Advanced AI for better memories</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#a855f7', fontSize: '1.2rem' }}>👥</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b' }}>Made for Everyone</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Clubs, photographers, and everyone</div>
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          .mindmap-container {
            position: relative;
            width: 100%;
            max-width: 1000px;
            height: 650px;
            margin: 0 auto;
            display: none;
          }
          .mobile-features-stack {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            max-width: 500px;
            margin: 0 auto;
          }
          .mindmap-card {
            position: absolute;
            width: 280px;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            padding: 1rem;
            display: flex;
            gap: 1rem;
            align-items: center;
            z-index: 2;
            border: 1px solid rgba(0,0,0,0.03);
          }
          .mindmap-icon {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            flex-shrink: 0;
          }
          @media (min-width: 1024px) {
            .mindmap-container {
              display: block;
            }
            .mobile-features-stack {
              display: none;
            }
          }
        `}} />
      </div>

      <div style={{ padding: '3rem 2rem 6rem 2rem', background: 'linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.03) 100%)', borderRadius: '32px', marginTop: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '1.5rem' }}>
          More Than Just A Gallery
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '800px', margin: '0 auto 4rem auto', lineHeight: '1.8' }}>
          GlimSync bridges the gap between event organizers, photographers, and attendees. We take the hassle out of finding your favorite memories by blending powerful cloud storage with state-of-the-art AI.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'left' }}>

          <div className="hover-lift" style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.5rem' }}>📸</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>1. Capture & Upload</h3>
            <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '0.95rem' }}>Photographers capture the magic and upload entire albums in one click. Our reliable cloud infrastructure securely stores high-resolution media so nothing is ever lost.</p>
          </div>

          <div className="hover-lift" style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(168,85,247,0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.5rem' }}>🧠</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>2. AI Processing</h3>
            <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '0.95rem' }}>Our advanced AI gets to work immediately. It analyzes every photo, automatically detects faces, and seamlessly tags registered attendees in the background.</p>
          </div>

          <div className="hover-lift" style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(236,72,153,0.1)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.5rem' }}>✨</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>3. Relive & Share</h3>
            <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '0.95rem' }}>Guests can instantly find every photo they're in. Connect with others, like, comment, and download your favorite memories in full quality.</p>
          </div>

        </div>

        <div style={{ marginTop: '6rem', padding: '0 2rem' }}>
          <div style={{ fontSize: '4rem', color: '#cbd5e1', lineHeight: '1', fontFamily: 'serif', opacity: '0.5' }}>"</div>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', fontStyle: 'italic', maxWidth: '800px', margin: '-2rem auto 1rem auto', lineHeight: '1.4' }}>
            Every smile, every crowd, every light—<br/>
            <span style={{ color: '#6366f1', fontSize: '1.75rem', fontWeight: '800', fontStyle: 'normal' }}>perfectly synced into memories for life.</span>
          </h2>
        </div>
      </div>
    </div>
  );
}
