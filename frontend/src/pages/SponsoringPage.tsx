import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Building2, Users, Zap, Shield, BarChart3, Target, Mail, Phone, Download } from "lucide-react";

const ANIM = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-40px" as const },
};

const trans = (delay = 0) => ({
  duration: 0.7,
  ease: "easeOut" as const,
  delay,
});

const FADE_IN = { ...ANIM, transition: trans() };
const FADE_DELAY = (d: number) => ({ ...ANIM, transition: trans(d) });

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start: number | null = null;
        const duration = 1800;

        const step = (ts: number) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(ease * target) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

// Unified 18-row feature matrix
const ALL_FEATURES = [
  "Logo sur badge officiel des participants",
  "Logo sur la page de garde du problem set",
  "Post de remerciement dédié",
  "Diffusion d'une vidéo promotionnelle",
  "Discours de 5 min à l'ouverture",
  "Co-branding de l'événement",
  "Possibilité de proposer une problématique personnalisée",
  "L'honneur de remettre les prix aux gagnants",
  "Logo sur la plateforme d'inscription",
  "Accès anticipé à la CVthèque",
  "Mention du nom lors des conférences",
  "Accès CVthèque via Talent Scouting",
  "Médiatisation sur les réseaux du club",
  "Stand de recrutement ou commercialisation",
  "Accès zone VIP pour votre délégation",
  "Accompagnement par un membre dédié",
  "Logo sur les réseaux de l'événement",
  "Logo sur tous les imprimés (affiches, t-shirts…)",
];

const OFFICIEL_ACTIVE = [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true];
const PLATINUM_ACTIVE = [false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true];
const GOLD_ACTIVE =    [false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, true, true];
const SILVER_ACTIVE =  [false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true];

const makeFeatures = (activeArr: boolean[]) =>
  ALL_FEATURES.map((text, i) => ({ active: activeArr[i], text }));

const OFFICIEL_FEATURES = makeFeatures(OFFICIEL_ACTIVE);
const PLATINUM_FEATURES = makeFeatures(PLATINUM_ACTIVE);
const GOLD_FEATURES     = makeFeatures(GOLD_ACTIVE);
const SILVER_FEATURES   = makeFeatures(SILVER_ACTIVE);

function FormulaCard({
  badge,
  badgeColor,
  price,
  priceColor,
  features,
  ctaText,
  ctaClass,
  featured = false,
  delay = 0,
}: {
  badge: string;
  badgeColor: string;
  price: string;
  priceColor: string;
  features: { active: boolean; text: string }[];
  ctaText: string;
  ctaClass: string;
  featured?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      {...FADE_DELAY(delay)}
      className={`relative flex flex-col p-8 rounded-2xl border overflow-hidden transition-transform duration-300 hover:-translate-y-2 ${
        featured
          ? "border-[#c9a84c] bg-gradient-to-br from-[#c9a84c]/6 to-[#112b55]"
          : "border-[rgba(201,168,76,0.18)] bg-[#112b55]"
      }`}
    >
      {featured && (
        <div className="absolute top-5 right-5 bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] text-[#030816] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded shadow-lg flex items-center gap-1">
          <span className="text-[12px] leading-none mb-[1px]">★</span> Recommandé
        </div>
      )}
      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3 ${badgeColor}`}>
        <span className="w-2 h-2 rounded-full bg-current shadow-[0_0_8px_currentColor]"></span>
        {badge}
      </div>
      <div className={`font-outfit text-4xl font-extrabold leading-none mb-1 ${priceColor}`}>
        {price}
        <span className="text-base font-semibold text-[#8caede] ml-1">DH</span>
      </div>
      <div className="w-full h-px bg-[rgba(201,168,76,0.18)] my-5"></div>
      <ul className="space-y-2 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-snug">
            <span className={`mt-0.5 text-xs flex-shrink-0 ${f.active ? "text-[#c9a84c]" : "text-[#1e2d44]"}`}>
              {f.active ? "✦" : "—"}
            </span>
            <span className={f.active ? "text-[#f4f0e8]" : "text-[#1e2d44]"}>{f.text}</span>
          </li>
        ))}
      </ul>
      <a
        href="#contact"
        className={`mt-6 block w-full text-center text-xs font-outfit font-bold uppercase tracking-widest py-3 rounded-lg transition-all ${ctaClass}`}
      >
        {ctaText} →
      </a>
    </motion.div>
  );
}

export default function SponsoringPage() {
  const schools: { name: string; logo: string }[] = [
    { name: "INPT",       logo: "/logos ecoles/inpt.PNG" },
    { name: "EMI",        logo: "/logos ecoles/emi.png" },
    { name: "ENSIAS",     logo: "/logos ecoles/ensias.jpg" },
    { name: "INSEA",      logo: "/logos ecoles/insea.png" },
    { name: "ENSEM",      logo: "/logos ecoles/ensem.png" },
    { name: "EHTP",       logo: "/logos ecoles/ehtp.png" },
    { name: "ENIM",       logo: "/logos ecoles/enim.png" },
    { name: "ENSAM",      logo: "/logos ecoles/ensamr.png" },
    { name: "ENSA",       logo: "/logos ecoles/ensa.svg" },
    { name: "Al Akhawayn",logo: "/logos ecoles/alakhawayn.png" },
    { name: "FST",        logo: "/logos ecoles/fst.png" },
    { name: "EMSI",       logo: "/logos ecoles/emsi.jpg" },
    { name: "1337",       logo: "/logos ecoles/1337.png" },
    { name: "ESITH",      logo: "/logos ecoles/esith.jpg" },
  ];
  const pastSponsors: { name: string; logo: string }[] = [
    { name: "SAFRAN",           logo: "/logos sponsors/safran.png" },
    { name: "DXC · CDG",        logo: "/logos sponsors/dxc cdg.png" },
    { name: "ERICSSON",         logo: "/logos sponsors/ericsson.png" },
    { name: "La Marocaine Vie", logo: "/logos sponsors/la marocaine vie.png" },
    { name: "HP",               logo: "/logos sponsors/hp.png" },
    { name: "INWI",             logo: "/logos sponsors/inwi.png" },
    { name: "ANRT",             logo: "/logos sponsors/anrt.png" },
    { name: "Orange",           logo: "/logos sponsors/orange.png" },
    { name: "MCHAIN",          logo: "/logos sponsors/mchain.webp" },
    { name: "SNRT",             logo: "/logos sponsors/snrt.png" },
    { name: "IT Road Group",    logo: "/logos sponsors/it road.png" },
    { name: "Société Générale", logo: "/logos sponsors/sg.png" },
    { name: "UBISOFT",          logo: "/logos sponsors/ubisoft.svg" },
    { name: "MACS",             logo: "/logos sponsors/macs.jpg" },
    { name: "Sekera",           logo: "/logos sponsors/sekera.png" },
    { name: "Nucleon",          logo: "/logos sponsors/nucleon.png" },
  ];

  return (
    <main className="min-h-screen text-[#f4f0e8] bg-[#030816] overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-center sm:justify-between h-16 px-6 lg:px-12 bg-[#030816]/85 backdrop-blur-xl border-b border-[rgba(201,168,76,0.18)]">
        <a href="/" className="flex items-center gap-3 no-underline">
          <img src="/assets/Logo BW 2.png" alt="JNJD" width={32} height={32} className="opacity-90" />
          <span className="w-px h-6 bg-[rgba(201,168,76,0.18)] hidden sm:block"></span>
          <span className="text-xs font-semibold text-[#8caede] tracking-widest hidden sm:block">Dossier Sponsoring · 19ème Édition</span>
        </a>
        <div className="hidden sm:flex items-center gap-6">
          <a href="#formulas" className="hidden md:block text-sm font-semibold text-[#8caede] hover:text-[#c9a84c] transition-colors">Formules</a>
          <a href="#contact" className="hidden md:block text-sm font-semibold text-[#8caede] hover:text-[#c9a84c] transition-colors">Contact</a>
          <a
            href="/DS-JNJD.pdf"
            download
            className="hidden sm:flex text-xs font-outfit font-bold uppercase tracking-widest px-5 py-2 border border-[#c9a84c] text-[#c9a84c] rounded hover:bg-[#c9a84c] hover:text-[#030816] transition-all items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(201,168,76,0.07)_0%,transparent_65%)]" />
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(201,168,76,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(201,168,76,0.04)_1px,transparent_1px)] [background-size:60px_60px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,black_20%,transparent_70%)]" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div {...FADE_IN} className="flex items-center justify-center gap-4 mb-8">
            <span className="w-10 h-px bg-[#c9a84c]"></span>
            <span className="text-xs font-bold tracking-[0.22em] uppercase text-[#c9a84c]">Club Informatique & Télécom · INPT</span>
            <span className="w-10 h-px bg-[#c9a84c]"></span>
          </motion.div>

          <motion.p {...FADE_DELAY(0.05)} className="text-xs font-outfit font-semibold tracking-[0.4em] uppercase text-[#f5e4a8] mb-4">
            19ème Édition · 2026
          </motion.p>

          <motion.h1 {...FADE_DELAY(0.1)} className="font-outfit text-7xl md:text-9xl font-extrabold tracking-tighter leading-[0.9] text-[#f4f0e8] mb-4">
            <span className="text-[#c9a84c] drop-shadow-[0_0_30px_rgba(201,168,76,0.3)]">JNJD</span>
          </motion.h1>

          <motion.p {...FADE_DELAY(0.15)} className="font-outfit text-base font-semibold tracking-[0.18em] uppercase text-[#8caede] mb-2">
            Journées Nationales des Jeunes Développeurs
          </motion.p>

          <motion.p {...FADE_DELAY(0.2)} className="italic text-[#f5e4a8]/80 text-lg mb-12">
            &quot;The Agentic Shift: Building Systems That Think, Act, and Adapt&quot;
          </motion.p>

          <motion.div {...FADE_DELAY(0.25)} className="flex items-center justify-center gap-4 flex-wrap">
            <a href="#formulas" className="btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', textDecoration: 'none' }}>Voir les formules</a>
            <a href="/DS-JNJD.pdf" download className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', textDecoration: 'none' }}>
              <Download className="w-4 h-4" /> Dossier PDF
            </a>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 flex flex-col items-center gap-2 text-[#8caede]"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Découvrir</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
        </motion.div>
      </section>

      {/* STATS BAR */}
      <div className="bg-[#07172e] border-y border-[rgba(201,168,76,0.18)] py-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center divide-x divide-[rgba(201,168,76,0.18)]">
          {[
            { target: 19, suffix: "ème", label: "Éditions" },
            { target: 500, suffix: "+", label: "Étudiants ingénieurs" },
            { target: 30, suffix: "+", label: "Institutions académiques" },
            { target: 6000, suffix: "+", label: "Abonnés réseaux sociaux" },
          ].map((s) => (
            <div key={s.label} className="flex-1 min-w-[140px] text-center px-6 py-3">
              <span className="block font-outfit text-4xl md:text-5xl font-extrabold text-[#c9a84c] leading-none mb-1">
                <AnimatedCounter target={s.target} suffix={s.suffix} />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8caede]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.p {...FADE_IN} className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a84c] mb-4 flex items-center gap-3">
            <span className="w-7 h-px bg-[#c9a84c]"></span> L&apos;écosystème
          </motion.p>
          <motion.h2 {...FADE_DELAY(0.05)} className="font-outfit text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
            Deux piliers.<br /><span className="text-[#c9a84c]">Une vision.</span>
          </motion.h2>
          <div className="w-14 h-0.5 bg-gradient-to-r from-[#c9a84c] to-transparent mt-5 mb-12"></div>

          <div className="grid md:grid-cols-2 gap-0.5">
            {[
              {
                icon: <Building2 className="w-4 h-4" />,
                label: "INPT",
                title: "Institut National des Postes et Télécommunications",
                desc: "Rattaché à l'ANRT, l'INPT est une référence parmi les établissements d'enseignement supérieur et de recherche depuis 1961. Adhérent à la Conférence des Grandes Écoles d'Ingénieurs Françaises depuis 2008.",
                pillars: ["Formation des leaders du numérique de demain", "Soutien au développement de l'écosystème numérique", "Transformation pérenne de l'enseignement supérieur"],
              },
              {
                icon: <Zap className="w-4 h-4" />,
                label: "CIT",
                title: "Club Informatique & Télécom",
                desc: "Pilier du parascolaire de l'INPT depuis 1996, le CIT forme ses membres sur 6 domaines — Sécurité, Data, Web, Algorithmique, Design et DevOps — et organise des événements de portée nationale.",
                pillars: ["Cellule Technique — ressources & infrastructure", "Cellule Prospection — relations avec l'industrie", "Cellule Médiatisation — identité visuelle & réseaux"],
              },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                {...FADE_DELAY(i * 0.1)}
                className="relative bg-[#112b55] border border-[rgba(201,168,76,0.18)] p-10 hover:border-[rgba(201,168,76,0.45)] transition-colors group overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#c9a84c] to-transparent"></div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#c9a84c] mb-5">
                  {card.icon} {card.label}
                </div>
                <h3 className="font-outfit text-2xl font-bold mb-4 leading-tight">{card.title}</h3>
                <p className="text-[#8caede] text-sm leading-relaxed mb-6">{card.desc}</p>
                <ul className="space-y-2.5">
                  {card.pillars.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm text-white">
                      <span className="text-[#c9a84c] text-[7px] mt-1.5 flex-shrink-0">◆</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIVITIES */}
      <section id="activities" className="py-24 px-6 bg-[#030816]">
        <div className="max-w-6xl mx-auto">
          <motion.p {...FADE_IN} className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a84c] mb-4 flex items-center gap-3">
            <span className="w-7 h-px bg-[#c9a84c]"></span> Programme
          </motion.p>
          <motion.h2 {...FADE_DELAY(0.05)} className="font-outfit text-4xl md:text-5xl font-extrabold tracking-tight mb-12">
            Activités <span className="text-[#c9a84c]">de la journée</span>
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { num: "01", title: "Conférences & Experts", desc: "Interventions d'ingénieurs et experts d'entreprises reconnues. Une occasion de partager votre vision et d'interagir avec les futurs ingénieurs." },
              { num: "02", title: "Ateliers Techniques", desc: "Sessions interactives permettant aux participants de renforcer leurs compétences autour d'outils et méthodologies de l'industrie." },
              { num: "03", title: "Compétition de Programmation", desc: "Point central de la JNJD : les étudiants les plus talentueux s'affrontent sur des défis algorithmiques exigeants rigueur et maîtrise." },
              { num: "04", title: "Cérémonie de Clôture", desc: "Reconnaissance de l'excellence, valorisation des talents et célébration de la contribution des partenaires." },
            ].map((a, i) => (
              <motion.div
                key={a.num}
                {...FADE_DELAY(i * 0.08)}
                className="relative border border-[rgba(201,168,76,0.18)] p-8 bg-gradient-to-br from-[#112b55] to-[#07172e] rounded-xl hover:-translate-y-1.5 transition-all duration-300 hover:border-[rgba(201,168,76,0.45)] hover:shadow-2xl overflow-hidden"
              >
                <span className="absolute top-4 right-4 font-outfit text-5xl font-extrabold text-[rgba(201,168,76,0.07)] leading-none">{a.num}</span>
                <p className="text-xs font-bold uppercase tracking-widest text-[#c9a84c] mb-3">{a.title}</p>
                <p className="text-sm text-[#8caede] leading-relaxed">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* THEME */}
      <section id="theme" className="py-24 px-6 bg-gradient-to-br from-[#07172e] to-[#030816] border-y border-[rgba(201,168,76,0.18)]">
        <div className="max-w-6xl mx-auto">
          <motion.p {...FADE_IN} className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a84c] mb-4 flex items-center gap-3">
            <span className="w-7 h-px bg-[#c9a84c]"></span> Thème 2026
          </motion.p>
          <motion.blockquote {...FADE_DELAY(0.05)} className="font-outfit text-2xl md:text-3xl font-bold leading-snug border-l-4 border-[#c9a84c] pl-7 mb-12 tracking-tight">
            &quot;The Agentic Shift:<br /><span className="text-[#c9a84c]">Building Systems That Think, Act, and Adapt&quot;</span>
          </motion.blockquote>
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div {...FADE_DELAY(0.1)} className="space-y-4 text-[#8caede] text-base leading-relaxed">
              <p>Nous sommes à l'aube d'une transformation fondamentale du logiciel. La frontière du développement est désormais définie par les systèmes agentiques — des programmes qui perçoivent, raisonnent, planifient et exécutent, autonomement, en boucles, à grande échelle.</p>
              <p>Des frameworks comme LangGraph, AutoGen et CrewAI sont devenus mainstream. OpenAI, Anthropic, Google et Meta ont tous placé l'agentivité au cœur de leurs plateformes.</p>
              <p>La JNJD 2026 confronte les participants à sa réalité technique : comment concevoir des systèmes qui prennent des décisions ? Comment intégrer confiance, observabilité et contrôle dans quelque chose qui agit seul ?</p>
            </motion.div>
            <motion.div {...FADE_DELAY(0.15)} className="space-y-2.5">
              {["Intégration LLM", "Orchestration Multi-Agents", "Architectures Tool-Calling", "Gestion de Mémoire", "Sécurité IA", "Edge & Cloud Computing", "Systèmes Distribués"].map((tag) => (
                <div key={tag} className="flex items-center gap-3.5 px-4 py-3 border border-[rgba(201,168,76,0.18)] bg-[rgba(201,168,76,0.04)] rounded text-xs font-bold uppercase tracking-widest text-[#c9a84c] hover:border-[#c9a84c]/40 hover:bg-[rgba(201,168,76,0.08)] transition-all cursor-default">
                  <span className="text-[#7a6228] font-mono text-[10px]">//</span> {tag}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHY SPONSOR */}
      <section id="why" className="py-24 px-6 bg-[#030816]">
        <div className="max-w-6xl mx-auto">
          <motion.p {...FADE_IN} className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a84c] mb-4 flex items-center gap-3">
            <span className="w-7 h-px bg-[#c9a84c]"></span> Pourquoi nous rejoindre
          </motion.p>
          <motion.h2 {...FADE_DELAY(0.05)} className="font-outfit text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
            5 raisons de <span className="text-[#c9a84c]">nous sponsoriser</span>
          </motion.h2>
          <div className="w-14 h-0.5 bg-gradient-to-r from-[#c9a84c] to-transparent mt-5 mb-12"></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0.5">
            {[
              { num: "01", icon: <Users className="w-5 h-5" />, title: "Accès Direct à un Vivier d'Élite", points: ["+6000 abonnés sur nos réseaux sociaux", "Profils spécialisés : AI, Cloud, Telecom, Cyber", "Accès prioritaire via le Talent Scouting System"] },
              { num: "02", icon: <Target className="w-5 h-5" />, title: "Plateforme de Recrutement Stratégique", points: ["Évaluation en environnement technique réel", "Identification des profils à fort potentiel", "Opportunités : stages, emplois, collaborations"] },
              { num: "03", icon: <BarChart3 className="w-5 h-5" />, title: "Interaction avec une Audience Qualifiée", points: ["Engagement direct avec futurs ingénieurs", "Présentation de vos technologies", "Relations durables avec les talents de demain"] },
              { num: "04", icon: <Shield className="w-5 h-5" />, title: "Visibilité & Impact Durable", points: ["Présence au cœur de l'écosystème tech", "Exposition auprès d'une audience ciblée", "Contribution au développement des talents"] },
              { num: "05", icon: <Zap className="w-5 h-5" />, title: "Investissement à Forte Valeur", points: ["Accès exclusif aux talents tech émergents", "Positionnement au cœur de l'innovation", "Collaboration avec les ingénieurs de demain"] },
            ].map((w, i) => (
              <motion.div
                key={w.num}
                {...FADE_DELAY(i * 0.07)}
                className="p-8 bg-[#07172e] border border-[rgba(201,168,76,0.18)] hover:bg-[#112b55] hover:border-[rgba(201,168,76,0.4)] transition-all group"
              >
                <div className="text-[10px] font-extrabold tracking-[0.2em] text-[#c9a84c] mb-4">{w.num}</div>
                <div className="flex items-center gap-2 text-[#c9a84c] mb-3">{w.icon}</div>
                <h3 className="font-outfit text-sm font-bold uppercase tracking-wide mb-4 leading-snug">{w.title}</h3>
                <ul className="space-y-2">
                  {w.points.map((p) => (
                    <li key={p} className="text-sm text-[#8caede] flex gap-2.5">
                      <span className="text-[#c9a84c] text-xs mt-0.5 flex-shrink-0">→</span> {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULAS */}
      <section id="formulas" className="py-24 px-6 bg-gradient-to-b from-[#07172e] to-[#030816]">
        <div className="max-w-6xl mx-auto">
          <motion.p {...FADE_IN} className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a84c] mb-4 flex items-center gap-3">
            <span className="w-7 h-px bg-[#c9a84c]"></span> Partenariat
          </motion.p>
          <motion.h2 {...FADE_DELAY(0.05)} className="font-outfit text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Formules de <span className="text-[#c9a84c]">Sponsoring</span>
          </motion.h2>
          <motion.p {...FADE_DELAY(0.1)} className="text-[#8caede] mb-12 max-w-xl">Choisissez le niveau d&apos;engagement qui correspond à votre ambition.</motion.p>

          {/* Officiel Banner */}
          <motion.div
            {...FADE_DELAY(0)}
            className="relative flex flex-col border-2 border-[#c9a84c] bg-gradient-to-br from-[#1a1505] via-[#17213a] to-[#07172e] rounded-2xl overflow-hidden hover:shadow-[0_0_50px_rgba(201,168,76,0.2)] transition-all mb-6"
          >
            {/* Top shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#e8c96a] to-transparent pointer-events-none" />
            {/* Corner glow */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-[radial-gradient(ellipse_at_top_left,rgba(201,168,76,0.08)_0%,transparent_65%)] pointer-events-none" />

            {/* ★ SPONSOR OFFICIEL ★ — full-width header strip */}
            <div className="flex items-center justify-center gap-3 py-3 border-b border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.04)]">
              <span className="text-[#c9a84c] text-[9px] leading-none">★</span>
              <span className="text-[10px] font-bold tracking-[0.35em] uppercase text-[#c9a84c]">Sponsor Officiel</span>
              <span className="text-[#c9a84c] text-[9px] leading-none">★</span>
            </div>

            {/* Body: price left | divider | features right */}
            <div className="flex flex-col md:flex-row gap-0">
              {/* Price column */}
              <div className="flex flex-col items-center justify-center px-10 py-8 flex-shrink-0 min-w-[200px]">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a84c] mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] shadow-[0_0_6px_#c9a84c]" />Officiel
                </div>
                <div className="font-outfit text-6xl font-extrabold text-[#c9a84c] leading-none drop-shadow-[0_0_24px_rgba(201,168,76,0.4)]">40 000</div>
                <div className="text-sm font-semibold uppercase tracking-widest text-[#8caede] mt-2">DH</div>
              </div>

              {/* Divider */}
              <div className="w-px bg-[rgba(201,168,76,0.18)] self-stretch hidden md:block" />
              <div className="h-px bg-[rgba(201,168,76,0.18)] md:hidden" />

              {/* Features + CTA */}
              <div className="flex-1 px-8 py-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5">
                  {OFFICIEL_FEATURES.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-[#f4f0e8]">
                      <span className="text-[#c9a84c] text-[10px] mt-1 flex-shrink-0">✦</span>
                      <span className="leading-snug">{f.text}</span>
                    </div>
                  ))}
                </div>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] text-[#030816] text-xs font-outfit font-bold uppercase tracking-widest px-6 py-3 rounded-lg hover:from-[#e8c96a] hover:to-[#c9a84c] transition-all shadow-[0_0_20px_rgba(201,168,76,0.2)]"
                  style={{ textDecoration: 'none' }}
                >
                  Devenir Sponsor Officiel →
                </a>
              </div>
            </div>
          </motion.div>

          {/* Platinum / Gold / Silver */}
          <div className="grid lg:grid-cols-3 gap-5">
            <FormulaCard badge="Platinum" badgeColor="text-[#e8e8f0]" price="30 000" priceColor="text-[#c9a84c]" features={PLATINUM_FEATURES} ctaText="Devenir Platinum" ctaClass="bg-[rgba(201,168,76,0.12)] border border-[#c9a84c] text-[#c9a84c] hover:bg-[rgba(201,168,76,0.22)]" delay={0.05} />
            <FormulaCard badge="Gold" badgeColor="text-[#c9a84c]" price="20 000" priceColor="text-[#f5e4a8]" features={GOLD_FEATURES} ctaText="Devenir Gold" ctaClass="border border-[#c9a84c] text-[#c9a84c] hover:bg-[rgba(201,168,76,0.1)]" delay={0.12} />
            <FormulaCard badge="Silver" badgeColor="text-[#aab0be]" price="10 000" priceColor="text-[#aab0be]" features={SILVER_FEATURES} ctaText="Devenir Silver" ctaClass="border border-[#aab0be] text-[#aab0be] hover:bg-[rgba(170,176,190,0.08)]" delay={0.19} />
          </div>
        </div>
      </section>

      {/* SCHOOLS */}
      <section id="schools" className="py-24 px-6 bg-[#07172e] border-y border-[rgba(201,168,76,0.18)]">
        <div className="max-w-6xl mx-auto">
          <motion.p {...FADE_IN} className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a84c] mb-4 flex items-center gap-3">
            <span className="w-7 h-px bg-[#c9a84c]"></span> Écoles participantes
          </motion.p>
          <motion.h2 {...FADE_DELAY(0.05)} className="font-outfit text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
            30+ institutions.<br /><span className="text-[#c9a84c]">500+ ingénieurs.</span>
          </motion.h2>
          <div className="w-14 h-0.5 bg-gradient-to-r from-[#c9a84c] to-transparent mt-5 mb-12"></div>
          {/* White pill container */}
          <motion.div
            {...FADE_DELAY(0.1)}
            className="bg-white rounded-[2rem] px-10 py-8 shadow-[0_0_60px_rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.15)]"
          >
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {schools.map((s) => (
                <div key={s.name} title={s.name} className="flex items-center justify-center h-16">
                  <img
                    src={s.logo}
                    alt={s.name}
                    width={140}
                    height={64}
                    className="object-contain max-h-16 w-auto"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* PAST SPONSORS */}
      <section id="trust" className="py-24 px-6 bg-[#030816]">
        <div className="max-w-6xl mx-auto">
          <motion.p {...FADE_IN} className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a84c] mb-4 flex items-center gap-3">
            <span className="w-7 h-px bg-[#c9a84c]"></span> Confiance établie
          </motion.p>
          <motion.h2 {...FADE_DELAY(0.05)} className="font-outfit text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Ils nous ont <span className="text-[#c9a84c]">fait confiance</span>
          </motion.h2>
          <motion.p {...FADE_DELAY(0.1)} className="text-[#8caede] mb-12">Des entreprises qui ont choisi la JNJD pour rencontrer les talents technologiques du Maroc.</motion.p>
          <motion.div
            {...FADE_DELAY(0.1)}
            className="bg-white rounded-[2rem] px-10 py-8 shadow-[0_0_60px_rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.15)]"
          >
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {pastSponsors.map((s) => (
                <div key={s.name} title={s.name} className="flex items-center justify-center h-16">
                  <img
                    src={s.logo}
                    alt={s.name}
                    width={140}
                    height={64}
                    className="object-contain max-h-16 w-auto"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 px-6 bg-gradient-to-b from-[#030816] to-[#01040b] border-t border-[rgba(201,168,76,0.18)]">
        <div className="max-w-6xl mx-auto">
          <motion.p {...FADE_IN} className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a84c] mb-4 flex items-center gap-3">
            <span className="w-7 h-px bg-[#c9a84c]"></span> Rejoignez-nous
          </motion.p>
          <motion.h2 {...FADE_DELAY(0.05)} className="font-outfit text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Prenons <span className="text-[#c9a84c]">contact</span>
          </motion.h2>
          <motion.p {...FADE_DELAY(0.1)} className="text-[#8caede] max-w-xl mb-12">
            Rejoignez la 19ème édition de la JNJD et positionnez votre organisation au cœur de l&apos;innovation technologique marocaine.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {[
              { role: "Président du Club",      name: "Anas Chakrone",    email: "chakrone.anas@gmail.com",    phone: "+212 616-730025" },
              { role: "Responsable Sponsoring", name: "Nizar Benselloum", email: "benselloum.nizar@gmail.com", phone: "+212 642-457729" },
              { role: "Responsable Sponsoring", name: "Douae Ghayati",    email: "douaeghayati3@gmail.com",    phone: "+212 678-981694" },
            ].map((c, i) => (
              <motion.div
                key={c.name}
                {...FADE_DELAY(i * 0.1)}
                className="relative border border-[rgba(201,168,76,0.18)] p-10 bg-[#07172e] rounded-xl hover:border-[rgba(201,168,76,0.45)] transition-colors overflow-hidden"
              >
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#c9a84c] to-transparent"></div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a84c] mb-2">{c.role}</p>
                <p className="font-outfit text-2xl font-bold mb-6">{c.name}</p>
                <div className="space-y-3">
                  <a href={`mailto:${c.email}`} className="flex items-center gap-3 text-[#8caede] hover:text-[#c9a84c] transition-colors text-sm">
                    <Mail className="w-4 h-4 stroke-[#c9a84c] flex-shrink-0" /> {c.email}
                  </a>
                  <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-[#8caede] hover:text-[#c9a84c] transition-colors text-sm">
                    <Phone className="w-4 h-4 stroke-[#c9a84c] flex-shrink-0" /> {c.phone}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...FADE_DELAY(0.2)} className="text-center">
            <p className="text-[#8caede] text-sm mb-2">Ou écrivez-nous à <a href="mailto:cit.inpt@gmail.com" className="text-[#c9a84c] hover:underline">cit.inpt@gmail.com</a></p>
            <p className="text-[#8caede] italic text-sm mb-6">Partagez le dossier de sponsoring avec votre équipe</p>
            <a href="/DS-JNJD.pdf" download className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', textDecoration: 'none' }}>
              <Download className="w-4 h-4" /> Télécharger le Dossier PDF
            </a>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[rgba(201,168,76,0.18)] bg-[#030816] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <img src="/assets/Logo BW 2.png" alt="JNJD" width={26} height={26} className="opacity-70" />
              <div className="font-outfit text-sm font-extrabold tracking-wider text-[#c9a84c]">· 19ÈME ÉDITION · 2026</div>
            </div>
            <div className="flex gap-6 text-xs font-semibold uppercase tracking-widest text-[#8caede]">
              <a href="#formulas" className="hover:text-[#c9a84c] transition-colors">Formules</a>
              <a href="#contact" className="hover:text-[#c9a84c] transition-colors">Contact</a>
              <a href="/" className="hover:text-[#c9a84c] transition-colors">Inscription</a>
            </div>
            <img src="/assets/Cit-Hor.png" alt="Club Informatique & Télécom" width={110} height={36} className="opacity-75" />
          </div>
          <p className="text-[10px] text-[#183c74]">© 2026 Club Informatique &amp; Télécom — INPT</p>
        </div>
      </footer>
    </main>
  );
}
