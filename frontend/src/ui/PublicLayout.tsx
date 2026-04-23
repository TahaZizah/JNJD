import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Nav } from './nav';
import { Footer } from './footer';

export default function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top on route change, unless there's a hash
    if (!location.hash) {
      window.scrollTo(0, 0);
    } else {
      setTimeout(() => {
        const el = document.getElementById(location.hash.slice(1));
        if (el) {
          window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.pathname, location.hash]);

  const route = location.pathname === '/sponsoring' ? 'sponsoring' : 'home';

  const setRoute = (newRoute: string) => {
    if (newRoute === 'sponsoring') {
      navigate('/sponsoring');
    } else if (newRoute === 'home') {
      navigate('/');
    } else if (newRoute.includes('#')) {
      const [page, hash] = newRoute.split('#');
      if (page === 'home' && location.pathname !== '/') {
        navigate('/#' + hash);
      } else if (page === 'sponsoring' && location.pathname !== '/sponsoring') {
        navigate('/sponsoring#' + hash);
      } else {
        // Just scroll
        const el = document.getElementById(hash);
        if (el) {
          window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <div data-screen-label={route === 'home' ? '01 Landing' : '02 Sponsoring'} className="min-h-screen bg-ink-950 text-bone-100 font-sans antialiased">
      <Nav route={route} setRoute={setRoute} />
      <Outlet context={{ setRoute }} />
      <Footer setRoute={setRoute} />
    </div>
  );
}
