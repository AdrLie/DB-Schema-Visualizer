'use client';
import Link from 'next/link';
import { ArrowRight, Database, Code2, Users, Wand2, ArrowDownToLine, Zap, Globe, Shield, Check, ChevronRight, Sparkles } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';

export function LandingPage() {
  const scrollTo = useCallback((id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen font-sans overflow-x-hidden selection:bg-[#cfe1b9] selection:text-[#2a3d18]" style={{ backgroundColor: '#f8faf4', color: '#2a3d18' }}>

      {/* ── Ambient Orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="animate-orb-drift absolute top-[-15%] left-[-8%] w-[55vw] h-[55vw] rounded-full opacity-40" style={{ background: 'radial-gradient(circle at 40% 40%, #d8ebb0 0%, #b5c99a 30%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="animate-float-slow absolute bottom-[-20%] right-[-10%] w-[65vw] h-[65vw] rounded-full opacity-25" style={{ background: 'radial-gradient(circle at 60% 60%, #cfe1b9 0%, #a4b88a 40%, transparent 70%)', filter: 'blur(100px)', animationDelay: '-4s' }} />
        <div className="animate-float-reverse absolute top-[40%] left-[50%] w-[30vw] h-[30vw] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #e9f5db 0%, transparent 70%)', filter: 'blur(60px)', animationDelay: '-2s' }} />
      </div>

      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 lg:px-14 lg:py-5 border-b border-[#718355]/10 bg-white/60 backdrop-blur-xl">
        <div className="flex items-center justify-center w-32 h-8 relative">
          <img src="/logo.svg" alt="Schma Logo" className="absolute w-30 max-w-none pointer-events-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" onClick={scrollTo('features')} className="text-sm font-medium text-[#4a6030]/70 hover:text-[#2a3d18] transition-colors">Features</a>
          <a href="#how" onClick={scrollTo('how')} className="text-sm font-medium text-[#4a6030]/70 hover:text-[#2a3d18] transition-colors">How it works</a>
          <a href="#pricing" onClick={scrollTo('pricing')} className="text-sm font-medium text-[#4a6030]/70 hover:text-[#2a3d18] transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/studio" className="text-sm font-semibold text-[#4a6030] hidden md:block hover:text-[#2a3d18] transition-colors">Sign in</Link>
          <Link href="/studio" className="group flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-full shadow-lg shadow-[#718355]/30 hover:shadow-xl hover:shadow-[#718355]/45 hover:-translate-y-px transition-all" style={{ background: 'linear-gradient(135deg, #4a6030, #2a3d18)' }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start free</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </nav>

      <main className="relative z-10">

        {/* ── Hero ── */}
        <section className="pt-28 pb-16 px-6 lg:px-14 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16">

            {/* Live badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-10 border border-[#87986a]/30 bg-gradient-to-r from-[#f5faea] to-[#edf5dc]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#87986a] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#718355]" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#4a6030]">New — AI Schema Generator is live</span>
            </div>

            <h1 className="text-[clamp(2.8rem,8vw,6rem)] font-black tracking-tight leading-[1.0] max-w-5xl mb-8">
              <span className="text-gradient-green">Your database schema,</span>
              <br />
              <span className="text-gradient-green">designed beautifully.</span>
            </h1>

            <p className="text-lg lg:text-xl text-[#4a6030]/80 max-w-2xl mb-12 leading-relaxed font-medium">
              Stop wrestling with SQL DDL and whiteboard diagrams. Schma gives your team a real-time visual canvas to design, document, and deploy database schemas — powered by AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
              <Link href="/studio" className="group relative flex items-center justify-center gap-2.5 px-9 py-4 text-white text-base font-bold rounded-2xl overflow-hidden shadow-xl shadow-[#2a3d18]/25 hover:-translate-y-1 active:scale-95 transition-all" style={{ background: 'linear-gradient(135deg, #4a6030 0%, #2a3d18 100%)' }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, #718355 0%, #4a6030 100%)' }} />
                <Sparkles className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Start Building — It&apos;s Free</span>
              </Link>
              <a href="#how" onClick={scrollTo('how')} className="flex items-center gap-2 px-7 py-4 rounded-2xl border border-[#718355]/20 bg-white/80 text-[#2a3d18] text-base font-semibold hover:bg-white hover:border-[#718355]/40 hover:-translate-y-0.5 active:scale-95 transition-all shadow-sm">
                See how it works
                <ChevronRight className="w-4 h-4 opacity-60" />
              </a>
            </div>

            {/* Social proof numbers */}
            <div className="flex items-center gap-8 md:gap-14">
              {[['500+', 'Schemas designed'], ['12k+', 'Tables visualized'], ['99.9%', 'Uptime SLA']].map(([num, label]) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-black text-[#2a3d18]">{num}</div>
                  <div className="text-xs font-medium text-[#4a6030]/60 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3D Hero Visual ── */}
          <HeroCanvas />
        </section>

        {/* ── How it works ── */}
        <section id="how" className="py-28 px-6 lg:px-14 max-w-7xl mx-auto">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6 text-center text-gradient-green">From idea to production in minutes</h2>
          <p className="text-center text-[#4a6030]/70 mb-20 max-w-xl mx-auto text-lg">Three steps to a fully deployed, documented, and version-controlled database schema.</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: <Wand2 className="w-6 h-6" />, title: 'Describe or Import', desc: 'Type a prompt like "e-commerce app with users, orders, and payments" and our AI drafts the full schema. Or paste existing SQL to instantly visualize it.' },
              { step: '02', icon: <Globe className="w-6 h-6" />, title: 'Design on Canvas', desc: 'Drag tables, draw relationships, toggle cardinality (1:1, 1:N, N:M). The SQL editor syncs in real-time as you design.' },
              { step: '03', icon: <Zap className="w-6 h-6" />, title: 'Push to Production', desc: 'Connect to your Supabase, Neon, or AWS RDS database and push the migration SQL with one click. No CLI, no guessing.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="card-3d relative p-8 rounded-3xl border border-[#718355]/15 bg-white/70 backdrop-blur-sm shadow-xl shadow-[#718355]/8 noise-overlay">
                <div className="flex items-start gap-5">
                  <div className="text-6xl font-black text-[#718355]/8 leading-none select-none font-mono">{step}</div>
                  <div className="flex-1">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5 text-white shadow-lg shadow-[#718355]/30" style={{ background: 'linear-gradient(135deg, #87986a, #4a6030)' }}>{icon}</div>
                    <h3 className="text-xl font-bold mb-3">{title}</h3>
                    <p className="text-sm leading-relaxed text-[#4a6030]/70">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="py-28 px-6 lg:px-14 max-w-7xl mx-auto">
          <SectionLabel>Features</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6 text-center text-gradient-green">Built for teams who move fast</h2>
          <p className="text-center text-[#4a6030]/70 mb-20 max-w-xl mx-auto text-lg">Every feature was designed to cut the time between "we need a table for that" and shipping production code.</p>

          {/* Big feature cards */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <BigFeatureCard
              icon={<Wand2 className="w-8 h-8" />}
              badge="Powered by AI"
              title="Schema Generation in Seconds"
              desc="Describe your app in plain English. Our AI understands your domain and instantly generates normalized, production-grade SQL with proper foreign keys, indexes, and constraints — ready to push to your database."
              highlight
            />
            <BigFeatureCard
              icon={<ArrowDownToLine className="w-8 h-8" />}
              badge="Live DB Sync"
              title="Push to Database, Live"
              desc="Connect directly to Supabase, Neon, PlanetScale, or any Postgres instance. Preview migration diffs, then execute with a single click — no CLI, no config files, no surprises."
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Code2 className="w-5 h-5" />, title: 'ORM Code Export', desc: 'Generate Prisma schemas, TypeORM entities, or Drizzle definitions instantly. Paste into your project and start coding.' },
              { icon: <Users className="w-5 h-5" />, title: 'Team Collaboration', desc: 'Multiplayer editing with live presence. See your teammates\' cursors and changes as they happen, like Figma for databases.' },
              { icon: <Shield className="w-5 h-5" />, title: 'Version History', desc: 'Every schema change is tracked. Roll back to any previous version with one click — your "undo" button for production databases.' },
            ].map(({ icon, title, desc }) => (
              <SmallFeatureCard key={title} icon={icon} title={title} desc={desc} />
            ))}
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-28 px-6 lg:px-14 max-w-7xl mx-auto">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-5 text-center text-gradient-green">Pay for what you need</h2>
          <p className="text-center text-[#4a6030]/70 mb-20 max-w-xl mx-auto text-lg">Start with a forever-free plan. Upgrade only when you need superpowers.</p>

          <div className="grid md:grid-cols-3 gap-6 items-center max-w-5xl mx-auto">
            <PricingCard
              tier="Hobby"
              price="$0"
              period="forever free"
              desc="For solo devs, learners, and side projects."
              features={['1 Workspace', 'Up to 15 tables per schema', 'Export to PNG, SVG, PDF', 'PostgreSQL DDL Export', 'Community Support']}
              cta="Get started free"
            />
            <PricingCard
              tier="Pro"
              price="$9"
              period="per month"
              desc="For indie hackers and solo freelancers shipping real products."
              features={['Unlimited Workspaces & Tables', '100 AI Schema Generations/mo', 'Push to Cloud DBs (Supabase, Neon)', 'Prisma & TypeORM Export', 'Mock Data Seeder (Faker.js)', 'Priority Email Support']}
              cta="Start Pro trial"
              popular
            />
            <PricingCard
              tier="Team"
              price="$29"
              period="per month"
              desc="For startups and agencies with multiple engineers."
              features={['Everything in Pro', 'Multiplayer Real-time Editing', 'Role-based Access (View / Edit)', 'Full Version History & Rollback', 'GitHub PR Sync on Schema Change', 'Dedicated Slack Support']}
              cta="Contact sales"
            />
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="py-24 px-6 lg:px-14 max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-12 lg:p-20 text-center noise-overlay" style={{ background: 'linear-gradient(135deg, #1e2d10 0%, #2a3d18 50%, #4a6030 100%)' }}>
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 30% 50%, #87986a, transparent 60%), radial-gradient(ellipse at 70% 50%, #b5c99a, transparent 60%)' }} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 mb-8">
                <Sparkles className="w-3.5 h-3.5 text-[#cfe1b9]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#cfe1b9]">No credit card required</span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-tight">Start designing<br />your database today.</h2>
              <p className="text-lg text-white/70 mb-10 max-w-lg mx-auto">Join hundreds of developers who stopped arguing about schema design and started shipping.</p>
              <Link href="/studio" className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl text-[#1e2d10] text-base font-black hover:-translate-y-1 active:scale-95 transition-all shadow-2xl shadow-black/30" style={{ background: 'linear-gradient(135deg, #d8ebb0, #b5c99a)' }}>
                Open Studio — It&apos;s Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#718355]/15 bg-white/40 backdrop-blur-sm py-14 px-6 lg:px-14">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center justify-center w-32 h-8 relative">
            <img src="/logo.svg" alt="Schma Logo" className="absolute w-30 max-w-none pointer-events-none" style={{ top: '50%', left: '0', transform: 'translateY(-50%)' }} />
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-[#4a6030]/60">
            <a href="#features" onClick={scrollTo('features')} className="hover:text-[#2a3d18] transition-colors">Features</a>
            <a href="#pricing" onClick={scrollTo('pricing')} className="hover:text-[#2a3d18] transition-colors">Pricing</a>
            <a href="#" className="hover:text-[#2a3d18] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#2a3d18] transition-colors">Privacy</a>
          </div>
          <div className="text-sm text-[#4a6030]/50">© 2025 Schma. Built for developers.</div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-components ─── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center mb-5">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#718355]/25 bg-[#f5faea] text-xs font-bold uppercase tracking-widest text-[#4a6030]">
        <div className="w-1.5 h-1.5 rounded-full bg-[#87986a]" />
        {children}
      </div>
    </div>
  );
}

function HeroCanvas() {
  return (
    <div className="relative w-full max-w-5xl mx-auto" style={{ perspective: '1200px' }}>
      {/* Glow behind */}
      <div className="absolute inset-8 rounded-3xl blur-3xl opacity-40" style={{ background: 'linear-gradient(135deg, #b5c99a, #87986a, #4a6030)' }} />

      {/* Main canvas frame */}
      <div className="relative animate-float-slow rounded-3xl overflow-hidden border border-[#718355]/20 shadow-2xl shadow-[#2a3d18]/20" style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(245,250,234,0.95))', backdropFilter: 'blur(20px)' }}>

        {/* Fake toolbar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#718355]/10 bg-white/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/70" />
            <div className="w-3 h-3 rounded-full bg-amber-400/70" />
            <div className="w-3 h-3 rounded-full bg-green-400/70" />
          </div>
          <div className="h-5 w-36 rounded-full bg-[#718355]/10 ml-3" />
          <div className="ml-auto flex gap-2">
            <div className="h-6 w-16 rounded-full bg-[#718355]/10" />
            <div className="h-6 w-20 rounded-full bg-[#718355]/10" />
            <div className="h-6 w-24 rounded-full bg-gradient-to-r from-[#87986a]/40 to-[#4a6030]/40" />
          </div>
        </div>

        {/* Canvas body */}
        <div className="relative h-[360px] lg:h-[440px] overflow-hidden" style={{ background: 'radial-gradient(ellipse at 50% 50%, #f0f7e6 0%, #eef5e0 100%)' }}>
          {/* Dot grid */}
          <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="rgba(113,131,85,0.35)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          {/* Animated connecting lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path d="M 210 130 C 280 130, 280 220, 350 220" fill="none" stroke="#87986a" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" style={{ animation: 'draw-line 2s ease forwards' }} />
            <path d="M 210 130 C 280 130, 320 300, 420 320" fill="none" stroke="#87986a" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4" style={{ animation: 'draw-line 2.5s ease forwards' }} />
            <path d="M 490 230 C 560 230, 580 330, 650 330" fill="none" stroke="#87986a" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4" style={{ animation: 'draw-line 3s ease forwards' }} />
          </svg>

          {/* Floating Table Cards */}
          <MockTableCard title="users" cols={['id UUID PK', 'email VARCHAR', 'created_at TIMESTAMPTZ']} style={{ top: '8%', left: '3%', animationDelay: '0s' }} />
          <MockTableCard title="orders" cols={['id UUID PK', 'user_id UUID FK', 'total DECIMAL', 'status ENUM']} style={{ top: '28%', left: '28%', animationDelay: '-2s' }} />
          <MockTableCard title="products" cols={['id UUID PK', 'name VARCHAR', 'price DECIMAL']} style={{ top: '55%', left: '54%', animationDelay: '-4s' }} />

          {/* Label pills on connections */}
          <div className="absolute text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#718355]/20 bg-white/80" style={{ top: '32%', left: '22%', color: '#4a6030' }}>1 — N</div>
          <div className="absolute text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#718355]/20 bg-white/80" style={{ top: '62%', left: '46%', color: '#4a6030' }}>1 — N</div>
        </div>
      </div>
    </div>
  );
}

function MockTableCard({ title, cols, style }: { title: string; cols: string[]; style: React.CSSProperties & { animationDelay: string } }) {
  return (
    <div className="animate-float absolute rounded-xl border border-[#718355]/20 bg-white/90 shadow-lg shadow-[#718355]/10 backdrop-blur-sm overflow-hidden min-w-[170px]" style={{ ...style, animationDuration: '7s' }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#718355]/10 bg-[#f5faea]/80">
        <div className="w-2 h-2 rounded-full bg-[#718355] shadow-sm shadow-[#718355]/50" />
        <span className="text-[11px] font-bold text-[#1e2d10]">{title}</span>
      </div>
      <div className="px-3 py-1.5 space-y-1">
        {cols.map((col, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-[#718355]/40" />
            <span className="text-[10px] font-mono text-[#4a6030]/80">{col}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BigFeatureCard({ icon, badge, title, desc, highlight }: { icon: React.ReactNode; badge: string; title: string; desc: string; highlight?: boolean }) {
  return (
    <div className={`card-3d relative overflow-hidden rounded-3xl p-10 noise-overlay ${highlight ? 'text-white' : 'bg-white border border-[#718355]/15 shadow-xl shadow-[#718355]/8'}`}
      style={highlight ? { background: 'linear-gradient(135deg, #2a3d18 0%, #1e2d10 100%)' } : {}}>
      {highlight && <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 30% 20%, #87986a, transparent 60%)' }} />}
      <div className="relative z-10">
        <div className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6 ${highlight ? 'bg-white/15 text-[#d8ebb0]' : 'bg-[#f5faea] text-[#4a6030] border border-[#718355]/20'}`}>{badge}</div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${highlight ? 'bg-white/15' : 'bg-[#f5faea] border border-[#718355]/20'}`}
          style={{ color: highlight ? '#d8ebb0' : '#718355' }}>
          {icon}
        </div>
        <h3 className={`text-2xl font-black mb-4 ${highlight ? 'text-white' : ''}`}>{title}</h3>
        <p className={`text-sm leading-relaxed ${highlight ? 'text-white/70' : 'text-[#4a6030]/70'}`}>{desc}</p>
      </div>
    </div>
  );
}

function SmallFeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card-3d group p-7 rounded-3xl bg-white border border-[#718355]/12 shadow-lg shadow-[#718355]/6 noise-overlay">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5 text-[#718355] bg-[#f5faea] border border-[#718355]/15 group-hover:scale-110 group-hover:bg-[#87986a] group-hover:text-white group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-[#718355]/30 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-base font-bold mb-2.5">{title}</h3>
      <p className="text-sm leading-relaxed text-[#4a6030]/70">{desc}</p>
    </div>
  );
}

function PricingCard({ tier, price, period, desc, features, cta, popular }: {
  tier: string; price: string; period: string; desc: string; features: string[]; cta: string; popular?: boolean;
}) {
  return (
    <div className={`relative rounded-3xl overflow-hidden noise-overlay ${popular ? 'text-white md:scale-105 shadow-2xl shadow-[#2a3d18]/30 z-10' : 'bg-white border border-[#718355]/15 shadow-lg shadow-[#718355]/6 hover:-translate-y-1 transition-transform'}`}
      style={popular ? { background: 'linear-gradient(160deg, #2a3d18 0%, #1e2d10 100%)' } : {}}>
      {popular && (
        <>
          <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 50% 0%, #87986a, transparent 60%)' }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-b-2xl text-[#1e2d10] text-[10px] font-black uppercase tracking-widest shadow-lg" style={{ background: 'linear-gradient(135deg, #d8ebb0, #b5c99a)' }}>
            Most Popular
          </div>
        </>
      )}
      <div className="relative z-10 p-8 pt-10">
        <h3 className={`text-xl font-black mb-1 ${popular ? 'text-white' : ''}`}>{tier}</h3>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-5xl font-black">{price}</span>
          <span className={`text-sm ${popular ? 'text-white/50' : 'text-[#4a6030]/50'}`}> /{period}</span>
        </div>
        <p className={`text-sm mb-8 ${popular ? 'text-white/60' : 'text-[#4a6030]/60'}`}>{desc}</p>

        <Link href="/studio" className={`flex items-center justify-center w-full py-3.5 rounded-xl font-bold mb-8 transition-all active:scale-95 text-sm ${popular ? 'text-[#1e2d10] hover:brightness-110 shadow-lg' : 'bg-[#f5faea] text-[#2a3d18] hover:bg-[#e9f5db] border border-[#718355]/20'}`}
          style={popular ? { background: 'linear-gradient(135deg, #d8ebb0, #b5c99a)' } : {}}>
          {cta}
        </Link>

        <div className="space-y-3.5">
          {features.map((f) => (
            <div key={f} className="flex items-start gap-3 text-sm">
              <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${popular ? 'bg-[#718355]/40' : 'bg-[#718355]/15'}`}>
                <Check className={`w-2.5 h-2.5 ${popular ? 'text-[#d8ebb0]' : 'text-[#718355]'}`} />
              </div>
              <span className={popular ? 'text-white/85' : 'text-[#4a6030]/80'}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
