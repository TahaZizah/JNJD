// Minimal inline SVG icons — gold stroke, thin line, custom so they feel bespoke
const I = ({ d, size = 18, stroke = 'currentColor', fill = 'none', sw = 1.5, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d} /> : children}
  </svg>
);

const IconArrow    = (p) => <I {...p} d="M5 12h14M13 6l6 6-6 6" />;
const IconDownload = (p) => <I {...p} d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />;
const IconCheck    = (p) => <I {...p} d="M5 12l4 4 10-10" />;
const IconX        = (p) => <I {...p} d="M6 6l12 12M18 6L6 18" />;
const IconUser     = (p) => <I {...p} d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" />;
const IconUsers    = (p) => <I {...p} d="M9 12a4 4 0 100-8 4 4 0 000 8zM1 21a8 8 0 0116 0M17 12a4 4 0 000-8M23 21a8 8 0 00-6-7.7" />;
const IconFile     = (p) => <I {...p} d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6zM14 3v6h6" />;
const IconUpload   = (p) => <I {...p} d="M12 16V4m0 0L7 9m5-5l5 5M4 18v2a2 2 0 002 2h12a2 2 0 002-2v-2" />;
const IconCalendar = (p) => <I {...p} d="M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zM8 2v4M16 2v4" />;
const IconPin      = (p) => <I {...p} d="M12 22s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z M12 10a2 2 0 100 0" />;
const IconMail     = (p) => <I {...p} d="M3 6h18v12H3zM3 6l9 7 9-7" />;
const IconPhone    = (p) => <I {...p} d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.79a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.29-1.29a2 2 0 012.11-.45c.89.35 1.83.59 2.79.72A2 2 0 0122 16.92z" />;
const IconSpark    = (p) => <I {...p} d="M12 2v4M12 18v4M4 12H0M24 12h-4M6 6l-3-3M21 21l-3-3M6 18l-3 3M21 3l-3 3" />;
const IconCircuit  = (p) => <I {...p}><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><path d="M6 8v8M18 8v8M8 6h8M8 18h8"/></I>;
const IconShield   = (p) => <I {...p} d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />;
const IconBolt     = (p) => <I {...p} d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />;
const IconCode     = (p) => <I {...p} d="M16 18l6-6-6-6M8 6l-6 6 6 6" />;
const IconTarget   = (p) => <I {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></I>;
const IconMegaphone= (p) => <I {...p} d="M3 11v2a2 2 0 002 2h1l4 4V5L6 9H5a2 2 0 00-2 2zM14 7v10M18 4v16" />;
const IconHandshake= (p) => <I {...p} d="M12 12l3-3 3 3-3 3-3-3zM9 15l-3 3M18 12l3-3M3 12l3 3 3-3M15 9l3-3 3 3" />;
const IconBrief    = (p) => <I {...p} d="M3 8h18v12H3zM8 8V5a2 2 0 012-2h4a2 2 0 012 2v3" />;
const IconChevron  = (p) => <I {...p} d="M9 6l6 6-6 6" />;
const IconPlus     = (p) => <I {...p} d="M12 5v14M5 12h14" />;
const IconMinus    = (p) => <I {...p} d="M5 12h14" />;
const IconGlobe    = (p) => <I {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></I>;
const IconLayers   = (p) => <I {...p} d="M12 2l10 6-10 6L2 8l10-6zM2 14l10 6 10-6M2 18l10 6 10-6" />;
const IconCrown    = (p) => <I {...p} d="M3 18h18l-2-10-5 4-3-6-3 6-5-4-2 10z" />;

Object.assign(window, {
  IconArrow, IconDownload, IconCheck, IconX, IconUser, IconUsers, IconFile, IconUpload,
  IconCalendar, IconPin, IconMail, IconPhone, IconSpark, IconCircuit, IconShield, IconBolt,
  IconCode, IconTarget, IconMegaphone, IconHandshake, IconBrief, IconChevron, IconPlus,
  IconMinus, IconGlobe, IconLayers, IconCrown
});
