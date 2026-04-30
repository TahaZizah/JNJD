import React from 'react';
import { Hero } from '../ui/landing_hero';
import { About, Rules } from '../ui/landing_rules';
import { Wizard } from '../ui/LandingWizard';

export default function Landing() {
  return (
    <>
      <Hero />
      
      {/* Official Sponsor */}
      <section className="relative border-b border-gold-500/15 py-16 sm:py-24 md:py-32 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold-500/[0.03] blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center" style={{ paddingLeft: 'var(--container-padding)', paddingRight: 'var(--container-padding)' }}>
          {/* Text */}
          <div className="lg:col-span-5 text-center lg:text-left">
            <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start">
              <span className="w-6 h-px bg-gold-500/70"></span>
              <span className="t-mono text-[10px] tracking-[0.35em] text-gold-500 uppercase">// Official Sponsor</span>
            </div>
            <h2 className="t-display text-3xl sm:text-5xl md:text-7xl lg:text-[80px] text-bone-100 mb-5 leading-[0.9]" style={{ textWrap: 'balance' }}>
              The official sponsor for the <span className="gold-text">20th</span> edition.
            </h2>
            <p className="text-base sm:text-lg text-bone-100/60 leading-relaxed max-w-lg mx-auto lg:mx-0" style={{ textWrap: 'pretty' }}>
              Proudly supported by Eurafric — driving innovation and empowering the next generation of developers across Morocco.
            </p>
          </div>

          {/* Logo */}
          <div className="lg:col-span-7 flex items-center justify-center lg:justify-end order-last">
            <div className="relative flex justify-center lg:justify-end w-full">
              <div className="absolute inset-0 scale-[2] rounded-full bg-gold-500/[0.05] blur-[100px] pointer-events-none" />
              <img
                src="/logos sponsors/Eurafric.png"
                alt="Eurafric - Official Sponsor"
                className="relative h-40 sm:h-56 md:h-64 lg:h-[500px] w-auto max-w-full opacity-85 hover:opacity-100 transition-opacity duration-500 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <About />
      <Rules />
      <Wizard />
    </>
  );
}
