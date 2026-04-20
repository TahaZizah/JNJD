import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ShieldAlert, Cpu, Trophy, ChevronDown, Menu, X } from "lucide-react";
import RegistrationWizard from "../components/RegistrationWizard";

export default function RegistrationPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Note: Update this target date as needed
    const target = new Date("2026-05-16T09:00:00").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;
      if (distance < 0) { clearInterval(interval); return; }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden text-[#eeeae0]">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-12 bg-[#020611]/85 backdrop-blur-xl border-b border-[#c8a84b]/15">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img src="/assets/Logo BW 2.png" alt="JNJD" width={34} height={34} className="opacity-90 flex-shrink-0" />
          <div className="flex flex-col leading-none">
            <span className="font-outfit font-extrabold text-[#c8a84b] text-base tracking-tight leading-none">JNJD</span>
            <span className="text-[9px] font-semibold text-[#6284b3] tracking-wider uppercase leading-none mt-0.5 hidden xs:block">19th Edition</span>
          </div>
          <span className="w-px h-6 bg-[#1c4481] mx-1 hidden md:block" />
          <span className="text-[10px] font-semibold text-[#6284b3] tracking-widest hidden md:block">
            Journées Nationales des Jeunes Développeurs
          </span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden sm:flex items-center gap-6">
          <a href="/sponsoring" className="text-sm font-semibold text-[#6284b3] hover:text-[#c8a84b] transition-colors">Sponsoring</a>
          <button onClick={() => scrollToSection("rules")} className="text-sm font-semibold text-[#6284b3] hover:text-[#c8a84b] transition-colors">Rules</button>
          <button
            onClick={() => scrollToSection("register")}
            className="text-xs font-outfit font-bold uppercase tracking-wider px-4 py-2 border border-[#c8a84b] text-[#c8a84b] rounded hover:bg-[#c8a84b] hover:text-[#020611] transition-colors"
          >
            Register
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="sm:hidden w-10 h-10 flex items-center justify-center text-[#6284b3] hover:text-[#c8a84b] transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#020611]/97 backdrop-blur-xl border-b border-[#c8a84b]/15 px-6 py-6 flex flex-col gap-4 sm:hidden"
          >
            <a
              href="/sponsoring"
              className="text-base font-semibold text-[#6284b3] hover:text-[#c8a84b] transition-colors text-left py-2"
            >
              Sponsoring
            </a>
            <button
              onClick={() => scrollToSection("rules")}
              className="text-base font-semibold text-[#6284b3] hover:text-[#c8a84b] transition-colors text-left py-2"
            >
              Rules & Guidelines
            </button>
            <button
              onClick={() => scrollToSection("countdown")}
              className="text-base font-semibold text-[#6284b3] hover:text-[#c8a84b] transition-colors text-left py-2"
            >
              Countdown
            </button>
            <button
              onClick={() => scrollToSection("register")}
              className="btn-primary justify-center mt-2"
            >
              Register Your Team
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-5 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,rgba(200,168,75,0.08)_0%,transparent_60%)] -z-10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCI+CjxwYXRoIGQ9Ik00OCAwaC0xdjQ4aDFWMHptLTQ3IDBoLTF2NDhoMVYweiIgZmlsbD0icmdiYSgyMDAsIDE2OCwgNzUsIDAuMDMpIi8+CjxwYXRoIGQ9Ik0wIDQ4di0xaDQ4djFIMHptMC00N3YtMWg0OHYxSDB6IiBmaWxsPSJyZ2JhKDIwMCwgMTY4LCA3NSwgMC4wMykiLz4KPC9zdmc+')] [mask-image:radial-gradient(ellipse_90%_60%_at_50%_30%,black_0%,transparent_80%)] -z-20" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto w-full"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c8a84b]/25 bg-[#c8a84b]/5 text-xs font-bold text-[#c8a84b] uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c8a84b] animate-pulse" />
            Registrations Open
          </div>

          <h1 className="font-outfit text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-[0.9] mb-6">
            <span className="text-[#c8a84b] drop-shadow-[0_0_30px_rgba(200,168,75,0.3)]">JNJD</span><br />
            <span>19TH EDITION</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#6284b3] mb-4 max-w-2xl mx-auto leading-relaxed">
            Journées Nationales des Jeunes Développeurs<br />
            Institut National des Postes et Télécommunications
          </p>

          <p className="font-outfit text-[#c8a84b] font-semibold tracking-wide mb-10 sm:mb-12 opacity-90">
            May 16th, 2026 &bull; INPT, Rabat
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button onClick={() => scrollToSection("register")} className="btn-primary w-full sm:w-auto justify-center">
              Register Team <ChevronDown className="w-5 h-5 ml-1" />
            </button>
            <button onClick={() => scrollToSection("rules")} className="btn-outline w-full sm:w-auto justify-center">
              View Rules
            </button>
          </div>
        </motion.div>

        <motion.button
          onClick={() => scrollToSection("countdown")}
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-8 text-[#6284b3] hover:text-[#c8a84b] transition-colors flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </motion.button>
      </section>

      {/* ── COUNTDOWN ── */}
      <section id="countdown" className="border-y border-[#c8a84b]/15 bg-[#061224] py-14 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#6284b3] mb-8">Time until kickoff — May 16th, 2026</p>
          <div className="flex items-center justify-center gap-2 sm:gap-6 md:gap-12">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Mins", value: timeLeft.minutes },
              { label: "Secs", value: timeLeft.seconds },
            ].map((unit, i) => (
              <div key={unit.label} className="relative text-center w-16 sm:w-20 md:w-24">
                <span className="block font-outfit text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#c8a84b] leading-none mb-2 tabular-nums">
                  {unit.value.toString().padStart(2, "0")}
                </span>
                <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-[#6284b3] uppercase tracking-widest">{unit.label}</span>
                {i < 3 && (
                  <span className="absolute -right-2 sm:-right-4 md:-right-8 top-0 text-2xl sm:text-3xl md:text-4xl text-[#1c4481] font-outfit font-bold leading-tight">
                    :
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RULES ── */}
      <section id="rules" className="py-20 sm:py-24 px-5 max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-outfit text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Rules & <span className="text-[#c8a84b]">Guidelines</span>
          </h2>
          <p className="text-[#6284b3] max-w-2xl mx-auto text-sm sm:text-base">Please read carefully before registering your team.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10 sm:mb-12">
          {[
            { icon: <Users className="w-6 h-6" />, title: "3 Members Required", desc: "Exactly 3 members per team — no more, no less. Incomplete teams will not be accepted." },
            { icon: <Trophy className="w-6 h-6" />, title: "Official Teams", desc: "All 3 members must be from Moroccan schools. Only official teams are eligible for prizes." },
            { icon: <Cpu className="w-6 h-6" />, title: "Unofficial Teams", desc: "Have out-of-Morocco members or 3-time consecutive winners. Participate and have fun!" },
            { icon: <ShieldAlert className="w-6 h-6" />, title: "Qualification Phase", desc: "Registration is not a guarantee. A qualification round may occur based on volume." },
          ].map((rule, i) => (
            <motion.div
              key={rule.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-6 sm:p-8 rounded-xl hover:border-[#c8a84b]/40 hover:-translate-y-1 transition-all group"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-[#c8a84b]/10 border border-[#c8a84b]/20 flex items-center justify-center text-[#c8a84b] mb-5 group-hover:scale-110 transition-transform">
                {rule.icon}
              </div>
              <h3 className="font-outfit text-lg sm:text-xl font-bold mb-2 sm:mb-3">{rule.title}</h3>
              <p className="text-sm text-[#6284b3] leading-relaxed">{rule.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Fee Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 p-6 sm:p-8 rounded-xl border-l-4 border-l-[#c8a84b] border border-[#1c4481] bg-gradient-to-br from-[#c8a84b]/5 to-transparent"
        >
          <div className="flex-shrink-0 font-outfit text-4xl sm:text-5xl font-extrabold text-[#c8a84b] text-center sm:text-left">
            180 <span className="text-xl text-[#6284b3]">MAD</span>
          </div>
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-lg mb-1">Participation Fee Per Team</h4>
            <p className="text-sm text-[#6284b3]">
              Payment confirms participation. Instructions sent after registration.{" "}
              <a href="mailto:cit.inpt@gmail.com" className="text-[#c8a84b] hover:underline">cit.inpt@gmail.com</a>
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── REGISTRATION ── */}
      <section id="register" className="py-20 sm:py-24 px-5 bg-[#061224] border-t border-[#1c4481]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-outfit text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Register Your <span className="text-[#c8a84b]">Team</span>
            </h2>
            <p className="text-[#6284b3] text-sm sm:text-base">Secure your spot in the 19th edition of JNJD.</p>
          </div>
          <RegistrationWizard />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#1c4481] bg-[#020611] pt-10 pb-8 px-5">
        <div className="max-w-6xl mx-auto">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-[#08172d]">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/assets/Logo BW 2.png" alt="JNJD" width={32} height={32} className="opacity-80" />
              <div className="flex flex-col">
                <span className="font-outfit font-extrabold text-[#c8a84b] text-sm tracking-tight leading-none">JNJD 2026</span>
                <span className="text-[9px] text-[#6284b3] tracking-widest uppercase mt-0.5">19th Edition</span>
              </div>
            </div>

            {/* Nav links */}
            <div className="flex items-center gap-5 text-xs font-semibold text-[#6284b3]">
              <a href="/sponsoring" className="hover:text-[#c8a84b] transition-colors py-1">Sponsoring</a>
              <a href="#rules" className="hover:text-[#c8a84b] transition-colors py-1">Rules</a>
              <a href="#register" className="hover:text-[#c8a84b] transition-colors py-1">Register</a>
              <a href="mailto:cit.inpt@gmail.com" className="hover:text-[#c8a84b] transition-colors py-1">Contact</a>
            </div>

            {/* CIT Logo */}
            <img src="/assets/Cit-Hor.png" alt="Club Informatique & Télécom" width={110} height={36} className="opacity-75" />
          </div>

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6">
            <p className="text-[10px] text-[#183c74] text-center sm:text-left">
              © {new Date().getFullYear()} Club Informatique &amp; Télécom — INPT Rabat
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
