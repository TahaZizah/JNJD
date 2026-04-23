import React from 'react';
import { Hero } from '../ui/landing_hero';
import { About, Rules } from '../ui/landing_rules';
import { Wizard } from '../ui/LandingWizard';

export default function Landing() {
  return (
    <>
      <Hero />
      <About />
      <Rules />
      <Wizard />
    </>
  );
}
