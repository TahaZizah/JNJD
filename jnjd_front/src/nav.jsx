// Top navigation — glassmorphic, gold accents

function Nav({ route, setRoute }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const on = () => setScrolled(window.scrollY > 16);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const link = (id, label) => (
    <button
      onClick={() => setRoute(id)}
      className={`relative t-mono text-[11px] tracking-[0.2em] uppercase px-3 py-2 transition ${route === id ? 'text-gold-300' : 'text-bone-100/70 hover:text-bone-100'}`}
    >
      {label}
      {route === id && (
        <span className="absolute left-3 right-3 -bottom-0.5 h-px bg-gold-500/80" />
      )}
    </button>
  );

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-6'}`}>
      <div className={`mx-auto max-w-[1400px] px-6 lg:px-10 ${scrolled ? 'opacity-100' : 'opacity-100'}`}>
        <div className={`flex items-center justify-between rounded-full px-4 lg:px-6 py-3 transition-all ${scrolled ? 'glass' : ''}`}>
          {/* Wordmark */}
          <button onClick={() => setRoute('home')} className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-full grid place-items-center" style={{ background: 'radial-gradient(circle, #112b55 0%, #030816 70%)', border: '1px solid rgba(201,168,76,0.35)' }}>
              <div className="absolute inset-1 rounded-full" style={{ border: '1px dashed rgba(201,168,76,0.35)' }}></div>
              <span className="relative t-mono text-[10px] text-gold-300 font-semibold">J</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="t-mono text-[11px] tracking-[0.25em] text-bone-100/80">JNJD</span>
              <span className="t-mono text-[9px] tracking-[0.3em] text-gold-500/80 mt-0.5">20<sup>TH</sup> · 2026</span>
            </div>
          </button>

          {/* Center links */}
          <nav className="hidden md:flex items-center gap-1">
            {link('home', 'Home')}
            {link('home#rules', 'Rules')}
            {link('home#register', 'Register')}
            {link('sponsoring', 'Sponsoring')}
          </nav>

          {/* Right CTA */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 pr-2 border-r border-mist-400/15">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 dot-live"></span>
              <span className="t-mono text-[10px] tracking-[0.25em] text-bone-100/60 uppercase">May 16 · INPT Rabat</span>
            </div>
            <Magnetic>
              <button onClick={() => setRoute('home#register')} className="btn-primary text-sm py-3 px-5">
                Register <IconArrow size={14} />
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { Nav });
