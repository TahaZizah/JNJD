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
