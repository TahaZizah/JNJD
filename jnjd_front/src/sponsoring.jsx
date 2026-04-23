// Sponsoring pitch page

function SponsoringHero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-24 lg:pt-48 lg:pb-32">
      <AgenticField density={36} />
      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
        <Reveal>
          <div className="flex items-center gap-4 mb-10">
            <span className="t-mono text-[10px] tracking-[0.35em] text-gold-500 uppercase">// For Partners</span>
            <span className="hr-gold flex-1 max-w-[180px]"></span>
            <span className="t-mono text-[10px] tracking-[0.3em] text-bone-100/50 uppercase">Sponsorship Brief · 2026</span>
          </div>
        </Reveal>
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <Reveal delay={80}>
              <h1 className="t-display text-[64px] md:text-[110px] lg:text-[140px]">
                <span className="block text-bone-100">Meet the engineers</span>
                <span className="block">
                  <span className="gold-text">who will build</span>
                </span>
                <span className="block text-bone-100">your next decade.</span>
              </h1>
            </Reveal>
          </div>
          <div className="lg:col-span-4 lg:pb-6">
            <Reveal delay={200}>
              <p className="text-lg text-bone-100/75 leading-relaxed mb-6" style={{ textWrap: 'pretty' }}>
                JNJD is the national stage where Morocco's top engineering schools send their sharpest students.
                Sponsoring puts your brand, your recruiters and your technology directly in front of them.
              </p>
              <div className="flex flex-wrap gap-3">
                <Magnetic>
                  <a className="btn-primary" href="#tiers">
                    See the formulas <IconArrow size={14} />
                  </a>
                </Magnetic>
                <Magnetic>
                  <a className="btn-ghost" href="#contact">
                    <IconDownload size={14} /> Download the brochure
                  </a>
                </Magnetic>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Stats bar */}
        <Reveal delay={280}>
          <div className="mt-20 glass rounded-3xl p-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-mist-400/10 rounded-2xl overflow-hidden">
              {[
                { n: '20', l: 'Editions', s: 'Running since 2006' },
                { n: '500+', l: 'Students', s: 'Hand-picked finalists' },
                { n: '30+', l: 'Institutions', s: 'Engineering & sciences' },
                { n: '6 000+', l: 'Followers', s: 'Active tech community' },
              ].map((s, i) => (
                <div key={i} className="bg-ink-900/90 p-6 md:p-8">
                  <div className="t-display text-5xl md:text-6xl gold-text mb-2">{s.n}</div>
                  <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-1">{s.l}</div>
                  <div className="t-mono text-[11px] text-mist-400/70">{s.s}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Ecosystem() {
  return (
    <section className="relative py-28 md:py-36 border-t border-gold-500/10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <Reveal>
          <SectionHeader
            eyebrow="// The ecosystem"
            title={<>Where <span className="gold-text">INPT</span> meets <span className="gold-text">CIT</span>.</>}
            kicker="An elite engineering school and the student club that turned a hackathon into a national institution."
          />
        </Reveal>
        <div className="grid lg:grid-cols-2 gap-6 mt-14">
          <Reveal delay={80}>
            <div className="glass rounded-3xl p-8 md:p-10 lift h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500">The School</div>
                <IconLayers size={22} className="text-gold-400" />
              </div>
              <h3 className="t-display text-4xl text-bone-100 mb-4">INPT Rabat</h3>
              <p className="text-bone-100/70 leading-relaxed mb-6">
                Institut National des Postes et Télécommunications. A flagship grande école for ICT
                engineering in Morocco — alumni populate Orange, Maroc Telecom, Inwi, Société Générale,
                Safran, Capgemini, and most of Casablanca's software estate.
              </p>
              <div className="grid grid-cols-3 gap-px bg-mist-400/10 rounded-xl overflow-hidden">
                {[
                  { k: 'Since', v: '1961' },
                  { k: 'Students', v: '1 200' },
                  { k: 'Track', v: 'Ingénieur d\'État' },
                ].map((x, i) => (
                  <div key={i} className="bg-ink-900/90 p-4">
                    <div className="t-mono text-[10px] uppercase tracking-widest text-bone-100/50">{x.k}</div>
                    <div className="t-display text-xl text-bone-100 mt-1">{x.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="glass rounded-3xl p-8 md:p-10 lift h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500">The Club</div>
                <IconCircuit size={22} className="text-gold-400" />
              </div>
              <h3 className="t-display text-4xl text-bone-100 mb-4">CIT</h3>
              <div className="t-mono text-[11px] tracking-[0.2em] uppercase text-mist-400/70 mb-5">
                Club Informatique &amp; Télécom
              </div>
              <p className="text-bone-100/70 leading-relaxed mb-6">
                Student-run, faculty-endorsed. Thirty-five active members running workshops,
                mentorship, CTFs, and the largest programming contest in the country. JNJD is CIT's
                flagship — and their annual proof-of-work.
              </p>
              <div className="grid grid-cols-3 gap-px bg-mist-400/10 rounded-xl overflow-hidden">
                {[
                  { k: 'Founded', v: '2006' },
                  { k: 'Members', v: '35' },
                  { k: 'Events / yr', v: '24+' },
                ].map((x, i) => (
                  <div key={i} className="bg-ink-900/90 p-4">
                    <div className="t-mono text-[10px] uppercase tracking-widest text-bone-100/50">{x.k}</div>
                    <div className="t-display text-xl text-bone-100 mt-1">{x.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function WhySponsor() {
  const reasons = [
    { n: '01', t: 'Elite talent pool',      d: 'Five hundred hand-filtered finalists — the top 5% of Moroccan CS graduates in one room.', icon: IconUsers },
    { n: '02', t: 'Recruitment platform',   d: 'Dedicated booth, private interview slots, CV book of every participant weeks before the event.', icon: IconBrief },
    { n: '03', t: 'Audience interaction',   d: 'Workshops, tech talks and after-parties — you meet students as peers, not prospects.', icon: IconHandshake },
    { n: '04', t: 'Brand visibility',       d: '6,000+ followers, national press coverage, stage branding, and a year-long digital halo.', icon: IconMegaphone },
    { n: '05', t: 'High return on spend',   d: 'Average cost-per-qualified-intern under the industry average by a factor of four.', icon: IconTarget },
  ];
  return (
    <section className="relative py-28 md:py-36 border-t border-gold-500/10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <Reveal>
          <SectionHeader
            eyebrow="// Why sponsor"
            title={<>Five reasons the <span className="gold-text">ROI</span> is real.</>}
            kicker="We measure our sponsors' outcomes. These are the five that compound year over year."
          />
        </Reveal>

        <div className="mt-14 grid lg:grid-cols-6 gap-5">
          {reasons.map((r, i) => (
            <Reveal key={i} delay={i * 80} className={i === 0 ? 'lg:col-span-3' : i === 1 ? 'lg:col-span-3' : 'lg:col-span-2'}>
              <div className="glass rounded-2xl p-7 lift h-full relative overflow-hidden">
                <div className="absolute -right-4 -top-4 t-display text-[140px] text-gold-500/5 leading-none select-none">{r.n}</div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 grid place-items-center rounded-xl hair-b text-gold-400">
                      <r.icon size={18} />
                    </div>
                    <div className="t-mono text-[10px] uppercase tracking-widest text-gold-500">Reason {r.n}</div>
                  </div>
                  <div className="t-display text-2xl text-bone-100 mb-3">{r.t}</div>
                  <p className="text-sm text-bone-100/70 leading-relaxed">{r.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tiers() {
  const tiers = [
    {
      name: 'Silver',
      price: '10 000',
      tagline: 'Get on the board.',
      color: 'silver',
      feats: [
        'Logo on website & event banners',
        'Social media mention (pre & post)',
        '2 tickets to the closing ceremony',
        'Brochure inclusion',
      ],
    },
    {
      name: 'Gold',
      price: '20 000',
      tagline: 'Step into the spotlight.',
      color: 'gold',
      feats: [
        'Everything in Silver',
        'Branded workshop slot (45 min)',
        'Recruitment booth · shared area',
        'Access to participant CV book',
        '4 tickets to the full event',
      ],
    },
    {
      name: 'Platinum',
      price: '30 000',
      tagline: 'Co-brand the experience.',
      color: 'platinum',
      feats: [
        'Everything in Gold',
        'Keynote slot on main stage',
        'Private interview room, full day',
        'Logo on all participant kits',
        'Dedicated social media feature',
        '8 tickets · priority seating',
      ],
    },
    {
      name: 'Officiel',
      price: '40 000',
      tagline: 'Own the edition.',
      color: 'featured',
      feats: [
        'Everything in Platinum',
        'Title sponsor · "JNJD × YOU"',
        'Opening keynote + closing award',
        'Branded hackathon track',
        'First-pick interview slots',
        'Stage backdrop, badges, tote co-branding',
        'Year-round CIT partnership access',
      ],
    },
  ];

  return (
    <section id="tiers" className="relative py-28 md:py-36 border-t border-gold-500/10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <Reveal>
          <SectionHeader
            eyebrow="// Partnership formulas"
            title={<>Four ways to <span className="gold-text">stand with us</span>.</>}
            kicker="All figures in MAD. All tiers are negotiable — the numbers below are the published floor."
          />
        </Reveal>

        <div className="mt-16 grid lg:grid-cols-12 gap-5 items-stretch">
          {tiers.map((t, i) => {
            const featured = t.color === 'featured';
            return (
              <Reveal key={t.name} delay={i * 80} className={featured ? 'lg:col-span-6 lg:row-span-2' : 'lg:col-span-3'}>
                <div className={`${featured ? 'tier-featured' : 'glass lift'} rounded-3xl p-8 md:p-10 h-full flex flex-col relative overflow-hidden`}>
                  {featured && (
                    <>
                      <div className="absolute top-6 right-6 t-mono text-[10px] tracking-[0.3em] uppercase text-gold-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-400 dot-live"></span> Title sponsor
                      </div>
                      <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full opacity-40 pointer-events-none" style={{
                        background: 'radial-gradient(circle, rgba(201,168,76,0.35), transparent 65%)'
                      }} />
                    </>
                  )}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500">Formula {String(i+1).padStart(2,'0')}</div>
                      {featured && <IconCrown size={22} className="text-gold-300" />}
                    </div>
                    <div className={`t-display ${featured ? 'text-7xl' : 'text-5xl'} mb-2`}>
                      <span className={featured ? 'gold-text' : 'text-bone-100'}>{t.name}</span>
                    </div>
                    <p className="text-bone-100/70 mb-6">{t.tagline}</p>
                    <div className="flex items-baseline gap-2 mb-8">
                      <span className={`t-display ${featured ? 'text-6xl' : 'text-4xl'} ${featured ? 'gold-text' : 'text-bone-100'}`}>
                        {t.price}
                      </span>
                      <span className="t-mono text-[11px] text-bone-100/60 tracking-[0.2em] uppercase">MAD</span>
                    </div>
                    <ul className={`space-y-3 ${featured ? 'md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-3 md:space-y-0' : ''}`}>
                      {t.feats.map((f, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-bone-100/85">
                          <span className={`mt-0.5 ${featured ? 'text-gold-300' : 'text-gold-400'}`}>
                            <IconCheck size={14} />
                          </span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-8 pt-6 hair-bottom" style={{ borderBottom: 'none', borderTop: '1px solid rgba(201,168,76,0.15)' }}>
                    <button className={featured ? 'btn-primary w-full justify-center' : 'btn-ghost w-full justify-center'}>
                      Become {t.name} <IconArrow size={14} />
                    </button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LogoCloud() {
  const sponsors = ['Safran', 'Ericsson', 'Orange', 'Société Générale', 'Maroc Telecom', 'Inwi', 'Capgemini', 'Atos', 'Oracle', 'OCP'];
  const schools  = ['INPT', 'ENSIAS', 'EMI', 'INSEA', 'ENSA', 'FST', 'UM6P', 'ENSIMAG', 'UIR', 'Al Akhawayn'];
  return (
    <section className="relative py-24 md:py-28 border-t border-gold-500/10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <Reveal>
          <div className="grid md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-4">
              <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-3">// Past editions</div>
              <h3 className="t-display text-3xl md:text-4xl text-bone-100 mb-2">Trusted by the companies that matter.</h3>
              <p className="text-bone-100/60 text-sm mt-3">And the schools that send the talent.</p>
            </div>
            <div className="md:col-span-8 space-y-5">
              <LogoRow items={sponsors} accent />
              <LogoRow items={schools} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function LogoRow({ items, accent }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-mist-400/10 rounded-2xl overflow-hidden hair-b">
      {items.map((name, i) => (
        <div key={i} className="bg-ink-900/90 p-5 md:p-6 grid place-items-center group hover:bg-ink-800/90 transition min-h-[72px]">
          <span className={`t-display text-lg md:text-xl tracking-tight ${accent ? 'text-bone-100/80 group-hover:text-gold-300' : 'text-mist-400/70 group-hover:text-bone-100'} transition`}>
            {name}
          </span>
        </div>
      ))}
    </div>
  );
}

function ContactSection() {
  return (
    <section id="contact" className="relative py-28 md:py-36 border-t border-gold-500/10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionHeader
                eyebrow="// Start a conversation"
                title={<>Let's design your <span className="gold-text">JNJD 2026</span>.</>}
                kicker="We respond to every partnership email within one business day. Pick the channel that suits you."
              />
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-8 space-y-3">
                {[
                  { icon: IconMail,  k: 'sponsoring@jnjd.ma',      sub: 'Partnership & press' },
                  { icon: IconPhone, k: '+212 537 77 30 79',       sub: 'CIT office · Mon–Fri' },
                  { icon: IconPin,   k: 'INPT, Madinat Al Irfane, Rabat', sub: 'Bureau Club Informatique' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 hair-b rounded-xl bg-ink-900/30 hover:bg-ink-800/50 transition">
                    <div className="w-10 h-10 rounded-xl grid place-items-center hair-b text-gold-400">
                      <c.icon size={16} />
                    </div>
                    <div>
                      <div className="text-bone-100">{c.k}</div>
                      <div className="t-mono text-[10px] uppercase tracking-widest text-bone-100/50 mt-0.5">{c.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={80}>
              <div className="glass rounded-3xl p-8 md:p-10">
                <div className="t-mono text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-3">// Brief us</div>
                <h3 className="t-display text-3xl text-bone-100 mb-6">Tell us what you'd like to achieve.</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Your name" value="" onChange={() => {}} />
                  <Field label="Company" value="" onChange={() => {}} />
                  <Field label="Work email" value="" onChange={() => {}} />
                  <Select label="Tier of interest" value="" onChange={() => {}} options={['Silver', 'Gold', 'Platinum', 'Officiel', 'Custom']} />
                </div>
                <div className="mt-4">
                  <div className="field">
                    <textarea rows="5" placeholder=""></textarea>
                    <label>Goals & context</label>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
                  <div className="t-mono text-[10px] uppercase tracking-widest text-bone-100/50">
                    By submitting you accept our partnership NDA template.
                  </div>
                  <Magnetic>
                    <button className="btn-primary">Send brief <IconArrow size={14} /></button>
                  </Magnetic>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Sponsoring() {
  return (
    <main>
      <SponsoringHero />
      <Ecosystem />
      <WhySponsor />
      <Tiers />
      <LogoCloud />
      <ContactSection />
    </main>
  );
}

Object.assign(window, { Sponsoring });
