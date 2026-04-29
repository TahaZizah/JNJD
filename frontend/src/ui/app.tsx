// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import * as Icons from './icons';
import { cn } from './utils';

function App() {
  const [route, setRoute] = React.useState('home');

  // Intercept hash-based jumps (home#rules etc.)
  React.useEffect(() => {
    if (route.includes('#')) {
      const [page, hash] = route.split('#');
      setRoute(page);
      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
          }
        }, 80);
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [route]);

  return (
    <div data-screen-label={route === 'home' ? '01 Landing' : '02 Sponsoring'}>
      <Nav route={route} setRoute={setRoute} />
      {route === 'home' ? (
        <main>
          <Hero />

          {/* Official Sponsor */}
          <section className="relative border-b border-gold-500/15 py-20 md:py-28">
            <div className="mx-auto max-w-[1400px] flex flex-col items-center justify-center gap-8" style={{ paddingLeft: 'var(--container-padding)', paddingRight: 'var(--container-padding)' }}>
              <div className="flex items-center gap-3">
                <span className="w-6 h-px bg-gold-500/70"></span>
                <span className="t-mono text-[10px] tracking-[0.35em] text-gold-500 uppercase">// Official Sponsor</span>
              </div>
              <h2 className="t-display text-2xl md:text-4xl text-bone-100 text-center" style={{ textWrap: 'balance' }}>
                The official sponsor for the <span className="gold-text">20th</span> edition
              </h2>
              <span className="w-12 h-px bg-gold-500/30"></span>
              <img
                src="/logos sponsors/Eurafric.png"
                alt="Eurafric - Official Sponsor"
                className="h-20 md:h-28 lg:h-32 opacity-80 hover:opacity-100 transition-opacity duration-500 object-contain"
              />
            </div>
          </section>

          <About />
          <Rules />
          <Wizard />
        </main>
      ) : (
        <Sponsoring />
      )}
      <Footer setRoute={setRoute} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

export { App };
