import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─── tiny feature card ───────────────────────────────────────── */
const FeatureCard = ({ icon, title, desc, accent }) => (
  <div
    style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 20,
      padding: '28px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      transition: 'all 0.25s',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = accent + '55';
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = `0 12px 40px ${accent}18`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    {/* glow */}
    <div style={{
      position: 'absolute', top: -30, right: -30,
      width: 100, height: 100, borderRadius: '50%',
      background: accent + '18', pointerEvents: 'none',
    }} />
    <div style={{
      width: 48, height: 48, borderRadius: 14,
      background: accent + '18',
      border: `1px solid ${accent}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22,
    }}>
      {icon}
    </div>
    <div>
      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>{desc}</p>
    </div>
  </div>
);

/* ─── stat pill ────────────────────────────────────────────────── */
const Stat = ({ value, label }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, color: 'var(--accent)' }}>{value}</div>
    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
  </div>
);

/* ─── main component ───────────────────────────────────────────── */
const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If already logged in → go straight to dashboard
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'DM Mono, monospace' }}>

      {/* ══════════ NAVBAR ══════════ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,11,13,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 5vw',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 18, color: '#000',
            boxShadow: '0 0 16px rgba(0,208,132,0.4)',
          }}>H</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
            HireTrack
          </span>
        </div>
        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            to="/login"
            state={{ tab: 'login' }}
            style={{
              padding: '8px 20px', borderRadius: 10, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-secondary)',
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13,
              textDecoration: 'none', transition: 'all 0.2s',
              display: 'inline-flex', alignItems: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; }}
          >
            Sign In
          </Link>
          <Link
            to="/login"
            state={{ tab: 'register' }}
            style={{
              padding: '8px 20px', borderRadius: 10, border: 'none',
              background: 'var(--accent)', color: '#000',
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13,
              textDecoration: 'none', transition: 'all 0.2s',
              display: 'inline-flex', alignItems: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='#00f099'; e.currentTarget.style.boxShadow='0 0 20px rgba(0,208,132,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='var(--accent)'; e.currentTarget.style.boxShadow='none'; }}
          >
            Get Started →
          </Link>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section style={{
        minHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '80px 5vw 60px',
        backgroundImage: `
          radial-gradient(ellipse 70% 55% at 50% 0%, rgba(0,208,132,0.1) 0%, transparent 70%),
          radial-gradient(ellipse 50% 40% at 80% 80%, rgba(167,139,250,0.07) 0%, transparent 70%)
        `,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* floating orbs */}
        <div style={{ position:'absolute', top:80, left:'10%', width:300, height:300, borderRadius:'50%', background:'rgba(0,208,132,0.04)', filter:'blur(60px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:80, right:'10%', width:250, height:250, borderRadius:'50%', background:'rgba(167,139,250,0.05)', filter:'blur(60px)', pointerEvents:'none' }} />

        {/* badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(0,208,132,0.1)', border: '1px solid rgba(0,208,132,0.3)',
          borderRadius: 99, padding: '6px 16px',
          fontSize: 12, color: 'var(--accent)', fontWeight: 600,
          marginBottom: 32, letterSpacing: '0.04em',
        }}>
          <span style={{ width:7,height:7,borderRadius:'50%',background:'var(--accent)',display:'inline-block',boxShadow:'0 0 8px var(--accent)' }} />
          AI-POWERED · GEMINI + JSEARCH API
        </div>

        {/* headline */}
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 'clamp(38px, 6vw, 76px)',
          lineHeight: 1.1, letterSpacing: '-2px',
          color: 'var(--text-primary)',
          maxWidth: 820, margin: '0 auto 24px',
        }}>
          Track Every Job.<br />
          <span style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, #00f099 50%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Land Your Dream Role.
          </span>
        </h1>

        {/* subheadline */}
        <p style={{
          fontSize: 'clamp(15px, 2vw, 19px)',
          color: 'var(--text-secondary)',
          maxWidth: 580, margin: '0 auto 48px',
          lineHeight: 1.8,
        }}>
          HireTrack uses AI to parse your resume, match you to real jobs,
          track your pipeline, and surface the skill gaps standing between
          you and your next offer.
        </p>

        {/* CTA buttons */}
        <div style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center', marginBottom: 64 }}>
          <Link
            to="/login"
            state={{ tab: 'register' }}
            style={{
              padding: '15px 36px', borderRadius: 14, border: 'none',
              background: 'var(--accent)', color: '#000',
              fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15,
              textDecoration: 'none', transition: 'all 0.2s',
              boxShadow: '0 4px 24px rgba(0,208,132,0.35)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,208,132,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 24px rgba(0,208,132,0.35)'; }}
          >
            ⚡ Start for Free
          </Link>
          <Link
            to="/login"
            state={{ tab: 'login' }}
            style={{
              padding: '15px 36px', borderRadius: 14,
              border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-primary)',
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15,
              textDecoration: 'none', transition: 'all 0.2s',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-primary)'; }}
          >
            → Sign In
          </Link>
        </div>

        {/* mock screenshot / UI preview */}
        <div style={{
          width: '100%', maxWidth: 860,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '20px 24px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
          position: 'relative',
        }}>
          {/* fake browser chrome */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, paddingBottom:16, borderBottom:'1px solid var(--border)' }}>
            {['#ff4d6d','#fbbf24','#00d084'].map(c=>(
              <div key={c} style={{width:11,height:11,borderRadius:'50%',background:c,opacity:0.7}} />
            ))}
            <div style={{ flex:1, height:28, background:'var(--surface-2)', borderRadius:8, display:'flex',alignItems:'center',paddingLeft:12, fontSize:11, color:'var(--text-muted)' }}>
              🔒 app.hiretrack.dev/dashboard
            </div>
          </div>
          {/* fake dashboard grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:14 }}>
            {[
              {label:'Applied',val:24,color:'#38bdf8'},
              {label:'Interviews',val:8,color:'#a78bfa'},
              {label:'Offers',val:3,color:'#00d084'},
              {label:'Rejected',val:5,color:'#ff4d6d'},
            ].map(s=>(
              <div key={s.label} style={{background:'var(--surface-2)',borderRadius:12,padding:'14px 16px',borderTop:`3px solid ${s.color}`}}>
                <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:24,color:s.color}}>{s.val}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{background:'var(--surface-2)',borderRadius:12,padding:16,height:90,display:'flex',flexDirection:'column',gap:8}}>
              <div style={{fontSize:11,color:'var(--text-muted)',fontWeight:700,letterSpacing:'0.06em'}}>PIPELINE</div>
              {['Applied → Interview','Interview → Offer','Offer → Accepted'].map(t=>(
                <div key={t} style={{fontSize:11,color:'var(--text-secondary)',display:'flex',alignItems:'center',gap:6}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'var(--accent)',display:'inline-block'}} />{t}
                </div>
              ))}
            </div>
            <div style={{background:'var(--surface-2)',borderRadius:12,padding:16,height:90}}>
              <div style={{fontSize:11,color:'var(--text-muted)',fontWeight:700,letterSpacing:'0.06em',marginBottom:8}}>TOP MATCH</div>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:13,color:'var(--text-primary)'}}>Senior React Developer</div>
              <div style={{fontSize:11,color:'var(--text-muted)'}}>Stripe · Remote</div>
              <div style={{marginTop:6,display:'inline-block',background:'rgba(0,208,132,0.15)',color:'var(--accent)',borderRadius:99,padding:'2px 10px',fontSize:11,fontWeight:700}}>🔥 92% Match</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <section style={{
        padding: '60px 5vw',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'center', gap: 'clamp(40px,8vw,100px)',
        flexWrap: 'wrap',
        background: 'var(--surface)',
      }}>
        <Stat value="10K+" label="Jobs Fetched Daily" />
        <Stat value="94%" label="AI Parse Accuracy" />
        <Stat value="6" label="Pipeline Stages" />
        <Stat value="∞" label="Free Forever" />
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section style={{ padding: '100px 5vw', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>
            WHAT WE OFFER
          </div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(26px,4vw,42px)', letterSpacing: '-1px', marginBottom: 16 }}>
            Everything you need to get hired faster
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 520, margin: '0 auto' }}>
            One dashboard. Every tool. Powered by Gemini AI and real job data.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          <FeatureCard
            icon="🤖"
            accent="#00d084"
            title="AI Resume Parser"
            desc="Upload your PDF and Gemini AI extracts skills, experience, and education — instantly. No manual entry."
          />
          <FeatureCard
            icon="🔍"
            accent="#38bdf8"
            title="Personalized Job Feed"
            desc="Real jobs from 10+ sources, ranked by how well they match your actual skills. See your match score on every card."
          />
          <FeatureCard
            icon="⬢"
            accent="#a78bfa"
            title="Drag-and-Drop Pipeline"
            desc="6-stage Kanban board (Applied → Accepted/Rejected). Drag cards to update status. See your full journey at a glance."
          />
          <FeatureCard
            icon="⚖️"
            accent="#fbbf24"
            title="Offer Comparison"
            desc="Received multiple offers? Compare CTC, base salary, location, work mode, and deadlines side-by-side."
          />
          <FeatureCard
            icon="◎"
            accent="#ff4d6d"
            title="Skill Gap Analysis"
            desc="See exactly which skills are missing from your resume compared to real job requirements — with AI-powered learning recommendations."
          />
          <FeatureCard
            icon="◷"
            accent="#34d399"
            title="Activity Timeline"
            desc="Every action logged automatically — applications, interviews, stage changes, and offer updates all in one filterable history."
          />
        </div>
      </section>

      {/* ══════════ WHY US ══════════ */}
      <section style={{
        padding: '80px 5vw',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          {/* left text */}
          <div>
            <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>
              WHY HIRETRACK
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(24px,3.5vw,38px)', letterSpacing: '-0.5px', marginBottom: 24, lineHeight: 1.2 }}>
              Stop losing track of where you applied
            </h2>
            {[
              ['🚀', 'No spreadsheets', 'Everything is tracked automatically the moment you apply.'],
              ['🎯', 'See your real match score', 'Not just keyword stuffing — actual fuzzy skill matching per job.'],
              ['📄', 'AI does the heavy lifting', 'Upload your resume once. Gemini AI does the parsing, matching, and insights.'],
              ['🔒', 'Your data stays yours', 'No selling, no sharing. JWT + HTTP-only cookies for security.'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{icon}</div>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          {/* right visual */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { stage: 'Applied', company: 'Google · L4 SWE', match: 88, color: '#38bdf8' },
              { stage: 'Interview', company: 'Stripe · Frontend Eng', match: 94, color: '#a78bfa' },
              { stage: 'Offer', company: 'Vercel · React Dev', match: 97, color: '#00d084' },
            ].map((row) => (
              <div key={row.company} style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderLeft: `4px solid ${row.color}`,
                borderRadius: 14, padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>{row.company}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                    <span style={{ color: row.color, fontWeight: 700 }}>{row.stage}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: row.color }}>{row.match}%</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>match</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section style={{
        padding: '100px 5vw',
        textAlign: 'center',
        backgroundImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,208,132,0.08) 0%, transparent 70%)',
      }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(28px,5vw,52px)', letterSpacing: '-1px', marginBottom: 20 }}>
          Ready to track smarter?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 40, maxWidth: 440, margin: '0 auto 40px' }}>
          Join HireTrack for free. No credit card. No limits. Just results.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/login"
            state={{ tab: 'register' }}
            style={{
              padding: '16px 40px', borderRadius: 14, border: 'none',
              background: 'var(--accent)', color: '#000',
              fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16,
              textDecoration: 'none', transition: 'all 0.2s',
              boxShadow: '0 4px 30px rgba(0,208,132,0.4)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 40px rgba(0,208,132,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 30px rgba(0,208,132,0.4)'; }}
          >
            ⚡ Create Free Account
          </Link>
          <Link
            to="/login"
            state={{ tab: 'login' }}
            style={{
              padding: '16px 40px', borderRadius: 14,
              border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-secondary)',
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16,
              textDecoration: 'none', transition: 'all 0.2s',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; }}
          >
            → I Already Have an Account
          </Link>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{
        padding: '28px 5vw',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 13, color: '#000' }}>H</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 13 }}>HireTrack</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          © 2026 HireTrack · Built by Soumya Shri & Shruti Sinha · AI-Powered Career Intelligence
        </p>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/login" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color='var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
          >Sign In</Link>
          <Link to="/login" state={{ tab: 'register' }} style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color='var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
          >Register</Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
