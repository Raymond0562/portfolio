/* ============================================================================
 * Raymond Yang — portfolio
 * React + Tailwind CSS + lucide-react. Edit PORTFOLIO_CONFIG / PROJECTS_DATA
 * below; nothing else needs to change to update content.
 *
 * SECURITY NOTES
 *  - No dangerouslySetInnerHTML, innerHTML, eval, or Function anywhere.
 *    All text goes through React's JSX escaping.
 *  - Every href passes through safeHref(): https: and mailto: only, plus
 *    same-page #anchors. javascript:, data:, http:, and anything unparsable
 *    are dropped and the element renders as plain text.
 *  - External links always get target="_blank" rel="noopener noreferrer".
 *  - Search / palette input is length-capped and stripped of control
 *    characters, and matched with String.includes (no user-built RegExp,
 *    so no ReDoS surface).
 *  - No style="" props and no inline event-handler attributes: dynamic
 *    styles are set through the CSSOM, so the app runs under
 *    `style-src 'self'` and `script-src 'self'`.
 *  - No secrets, tokens, or API calls. All content is the static object below.
 *
 * RECOMMENDED PRODUCTION HEADERS (also in vercel.json next to this file).
 * Assumes Tailwind is compiled at build time and fonts are self-hosted.
 *
 *   Content-Security-Policy:
 *     default-src 'self'; script-src 'self'; style-src 'self';
 *     img-src 'self' data:; font-src 'self'; connect-src 'self';
 *     object-src 'none'; base-uri 'self'; form-action 'none';
 *     frame-ancestors 'none'; upgrade-insecure-requests
 *   Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
 *   X-Content-Type-Options: nosniff
 *   X-Frame-Options: DENY
 *   Referrer-Policy: strict-origin-when-cross-origin
 *   Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(),
 *     usb=(), interest-cohort=()
 *   Cross-Origin-Opener-Policy: same-origin
 *
 * On Next.js (App Router) the framework injects inline bootstrap scripts, so
 * use a per-request nonce in middleware: script-src 'self' 'nonce-<value>'
 * 'strict-dynamic'. A static Vite build can use the policy above as written.
 * ========================================================================== */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowRight,
  ArrowUpRight,
  Blocks,
  BookOpen,
  Briefcase,
  Check,
  ChevronDown,
  Copy,
  Download,
  CornerDownLeft,
  FileText,
  Github,
  GraduationCap,
  Hash,
  Linkedin,
  List,
  Mail,
  MapPin,
  Mountain,
  Search,
  Swords,
} from "lucide-react";

/* ----------------------------------------------------------------------------
 * CONFIG — the only place content lives
 * -------------------------------------------------------------------------- */

/* The resume, transcribed from raymond_yang_resume.pdf. The Resume Sheet view
 * and the timeline both read from this, so edit it in one place.
 * (Phone number left out on purpose: this page is public.) */
export const RESUME = {
  location: "Austin, TX",
  education: {
    school: "Texas A&M University",
    date: "May 2028",
    degree: "Bachelor of Science in Computer Engineering",
    minors: "Minors: Mathematics, Cybersecurity",
    notes: ["Craig & Galen Brown Engineering Honors Program | GPA: 4.00 / 4.00."],
  },
  experience: [
    {
      id: "gcri",
      org: "Texas A&M Global Cyber Research Institute",
      place: "College Station, TX",
      role: "Undergraduate Team Lead",
      period: "Feb 2026 - Present",
      bullets: [
        "Leads hardware design and integration for a NASA USRC drone cybersecurity research project, managing embedded systems including Raspberry Pi, TPM, and GPS modules across ground-station and drone platforms.",
        "Designing a TPM-based remote attestation pipeline with nonce challenge/response and PCR-backed evidence verification, rejecting tampered or incomplete baseline claims before granting network trust.",
        "Building a dynamic VLAN segmentation and enforcement layer (hostapd/iptables/tc) with a 100-VLAN trusted pool, quarantining unattested devices and promoting verified drones into isolated trusted subnets.",
        "Leading red-team exercises across a 3-node lab network (ground station, drone, and attacker device), simulating MITM, ARP-spoofing, and Scapy-based packet-injection attacks against the attestation service and MAVLink control channel.",
        "Oversees procurement, assembly, and testing of drone subsystems to support simulated cyberattacks and defensive security validation.",
      ],
    },
    {
      id: "nitro",
      org: "Nitro Swimming",
      place: "Austin, TX",
      role: "Swim Instructor",
      period: "Feb 2024 - Aug 2025",
      bullets: [
        "Instructed classes of 2 to 5 youth swimmers in water safety and competitive swim strokes.",
        "Adapted training plans to individual skill levels, improving performance and confidence.",
      ],
    },
  ],
  projects: [
    {
      name: "World Cup Predictor",
      stack: "Python, Machine Learning",
      bullets: [
        "Built an end-to-end ML pipeline on 49,500+ international football matches, benchmarking Logistic Regression, Random Forest, XGBoost, and LightGBM with isotonic-calibrated probabilities and a leakage-free, chronological train/validation split.",
        "Engineered Elo, rolling-form, and momentum features and ran 10,000-iteration Monte Carlo simulations to forecast 2026 FIFA World Cup team odds at 60.8% test accuracy; deployed via Streamlit.",
      ],
    },
    {
      name: "Real-Time CAN-to-UART Telemetry Relay",
      stack: "Embedded C",
      bullets: [
        "Implemented an interrupt-driven CAN-to-UART relay using a 32-slot volatile circular buffer to safely hand frames from the receive ISR to the main loop, with endian-converted framing, overflow handling, and an RGB LED activity indicator.",
      ],
    },
    {
      name: "Crazy-8",
      stack: "C++",
      bullets: [
        "Developed a full game engine in C++ (Game/Player/Card classes) with file-based deck loading, rank/suit/format validation, and manual dynamic memory management.",
        "Implemented distinct AI and human player logic, including wild-card suit declaration, draw-pile/discard-pile reshuffling, and rule-driven move validation.",
      ],
    },
    {
      name: "Automated File Organizer",
      stack: "Python",
      bullets: [
        "Created a Python file organizer using watchdog to monitor Downloads in real time, sorting new files into 6 typed categories by extension and skipping files still mid-download via a size-stability check, with duplicate-name handling and one-command revert.",
      ],
    },
  ],
  leadership: [
    {
      id: "bjj",
      org: "Texas A&M Brazilian Jiu-Jitsu Club",
      place: "College Station, TX",
      role: "Finance Officer",
      period: "Jan 2025 - Present",
      bullets: [
        "Manage budgeting, dues tracking, and expense approvals; advise club leadership team on resource allocation for tournaments, seminars, and social events.",
      ],
    },
  ],
  additional: [
    { k: "Technical Skills", v: "Python, Java, C++, C, LaTeX, Linux/Unix, Verilog, Git, Bash, redteaming" },
    { k: "Honors", v: "Fall 2025/Spring 2026 Dean's Honor Roll, AP Scholar with Distinction; UIL 6A State Gold Medalist (2022, 2023)" },
    { k: "Language Fluency", v: "Mandarin (fluent), Spanish (proficient)" },
    { k: "Organizations", v: "Cybersecurity Club, Sophomores Advancing in Leadership, Fish Camp, BVMMA" },
  ],
};

const resumeJob = (id) => [...RESUME.experience, ...RESUME.leadership].find((job) => job.id === id);

export const PORTFOLIO_CONFIG = {
  name: "Raymond Yang",
  initials: "RY",
  // Headline after the name. `hi: true` segments render in the serif accent face.
  headline: [
    { text: "Computer Engineering student building " },
    { text: "secure systems", hi: true },
    { text: ", " },
    { text: "network infrastructure", hi: true },
    { text: ", and " },
    { text: "software", hi: true },
    { text: "." },
  ],
  subheadline:
    "Undergraduate at Texas A&M University focused on cybersecurity, network engineering, embedded systems, and applied software engineering.",

  status: {
    primary: "Incoming SWE Co-Op @ Collins Aerospace (Jan 2027)",
    secondary: "Open to Summer 2028 Roles",
  },

  contact: {
    email: "raymondyang490@gmail.com",
    github: "https://github.com/Raymond0562",
    linkedin: "https://www.linkedin.com/in/raymond-yang-tamu/",
    // One fixed PDF so the resume is identical on every device.
    // Regenerate with `npm run resume-pdf` after editing RESUME.
    resumePdf: "https://raymondyang.vercel.app/Raymond_Yang_Resume.pdf",
  },

  location: {
    city: "College Station, TX",
    coords: "30.6280° N, 96.3344° W",
    timeZone: "America/Chicago",
  },

  nav: [
    { id: "about", label: "About" },
    { id: "current", label: "Current" },
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "resume", label: "Resume" },
  ],

  // Read-only terminal in the hero. stack.json is generated from `stack`.
  terminal: [
    {
      id: "profile.sh",
      sep: ": ",
      lines: [
        { t: "cmd", v: "whoami" },
        { t: "out", v: "raymond.yang" },
        { t: "kv", k: "role", v: "Undergraduate Team Lead @ GCRI" },
        { t: "kv", k: "school", v: "Texas A&M · Computer Engineering '28" },
        { t: "kv", k: "minors", v: "Mathematics, Cybersecurity" },
        { t: "cmd", v: "status --now" },
        { t: "ok", v: "Incoming SWE Co-Op @ Collins Aerospace (Jan 2027)" },
        { t: "ok", v: "Open to Summer 2028 roles" },
        { t: "kv", k: "building", v: "EasyVote" },
      ],
    },
    { id: "stack.json", json: true },
  ],

  bio: [
    "I'm a Computer Engineering student at Texas A&M who likes working where software meets the network.",
    "At the Global Cyber Research Institute I lead the undergraduate team on a NASA USRC drone cybersecurity project. We build the defenses, including TPM-based remote attestation and dynamic VLAN segmentation, and then I run the red-team exercises that try to break them.",
    "In class I'm in the Engineering Honors program with minors in Mathematics and Cybersecurity, taking the honors sections of computer systems, computer architecture, circuit theory, and differential equations. In January 2027 I join Collins Aerospace as a software engineering co-op.",
  ],

  // From the unofficial transcript (13 Nov 2026).
  education: {
    degree: "B.S. Computer Engineering",
    school: "Texas A&M University",
    grad: "May 2028",
    gpa: "4.00",
    badges: ["Engineering Honors", "Minor: Mathematics", "Minor: Cybersecurity", "Dean's Honor Roll"],
    terms: [
      { t: "Fall 24", hours: 13, gpa: "4.00" },
      { t: "Spr 25", hours: 12, gpa: "4.00" },
      { t: "Fall 25", hours: 16, gpa: "4.00" },
      { t: "Spr 26", hours: 15, gpa: "4.00" },
      { t: "Fall 26", hours: 15, now: true },
    ],
  },
  // h = honors section, now = in progress this term.
  coursework: [
    {
      label: "Systems & architecture",
      items: [
        { c: "CSCE 313", n: "Computer Systems", h: true, now: true },
        { c: "ECEN 350", n: "Computer Architecture & Design", h: true, now: true },
        { c: "ECEN 248", n: "Digital System Design" },
      ],
    },
    {
      label: "Software & theory",
      items: [
        { c: "CSCE 221", n: "Data Structures & Algorithms" },
        { c: "CSCE 222", n: "Discrete Structures", h: true },
        { c: "CSCE 120", n: "Program Design & Concepts" },
      ],
    },
    {
      label: "Circuits & signals",
      items: [
        { c: "ECEN 214", n: "Electrical Circuit Theory", h: true },
        { c: "ECEN 314", n: "Signals & Systems", now: true },
      ],
    },
    {
      label: "Mathematics",
      items: [
        { c: "MATH 308", n: "Differential Equations", h: true },
        { c: "MATH 311", n: "Topics in Applied Mathematics" },
        { c: "MATH 251", n: "Engineering Mathematics III" },
        { c: "STAT 211", n: "Principles of Statistics" },
      ],
    },
  ],

  stack: [
    {
      id: "languages",
      label: "Languages",
      tone: "indigo",
      items: ["C/C++", "Python", "Rust", "Java", "Verilog", "ARMv8 Assembly", "SQL", "Bash"],
    },
    {
      id: "security",
      label: "Cybersecurity & Networking",
      tone: "cyan",
      items: [
        "VLANs",
        "Network Segmentation",
        "Red Teaming",
        "MITM Analysis",
        "TPM Attestation",
        "PKI/Cryptography",
        "Scapy",
        "iptables",
        "Linux",
      ],
    },
    {
      id: "systems",
      label: "Systems & Tools",
      tone: "zinc",
      items: ["Git", "Docker/WSL", "Embedded Systems", "Raspberry Pi", "MAVLink", "LaTeX"],
    },
  ],

  interests: [
    {
      icon: "bjj",
      label: "Brazilian Jiu-Jitsu",
      text: "I've been training for 2 years now. I started in the second semester of my freshman year at the TAMU BJJ Club and have kept coming back to the mats ever since.",
      meta: { k: "belt", v: "White belt" },
    },
    {
      icon: "lego",
      label: "Legos",
      text: "I've loved Legos ever since I was a kid. Snapping bricks together was the first time I got to make something of my own, and that feeling is what started my love for building things.",
      meta: { k: "favorite set", v: "Nintendo Entertainment System" },
    },
    {
      icon: "read",
      label: "Reading",
      text: "There is usually a novel on my desk next to the textbooks. Right now it's Marjan Kamali's story of a decades-long friendship in Tehran.",
      meta: { k: "reading right now", v: "The Lion Women of Tehran" },
    },
    {
      icon: "hike",
      label: "Hiking",
      text: "Getting away from the screen matters, and one of my favorite ways to do it is camping and hiking. One of my best memories is hiking up Emory Peak at 4 a.m. to reach the highest point in Big Bend by sunrise.",
      meta: { k: "favorite hike", v: "Emory Peak, Big Bend" },
    },
  ],

  current: {
    name: "EasyVote",
    tagline: "Local AI Nonpartisan Voting & Civic Assistant",
    status: "Active Development",
    overview:
      "An open-source, privacy-first local AI voting assistant designed to run on personal hardware using small language models (SLMs) via Ollama, RAG, and nonpartisan civic data APIs (Congress.gov, Open States, OpenFEC) to deliver unbiased candidate and ballot information with zero cloud dependency.",
    tags: ["Local SLMs", "RAG", "Python", "Civic Data APIs", "Privacy-First"],
    pipeline: ["Your question", "Retrieve evidence", "Local SLM", "Cited answer"],
    // What you're working on right now. Free-form; edit as the work moves.
    workLog: [
      "Tauri 2 desktop shell with a React + TypeScript interface",
      "Rust crates for retrieval, answer orchestration, and signed evidence-pack checks",
      "Python build tools for ingestion, pack building, and evaluation",
    ],
    facts: [
      { k: "license", v: "Apache-2.0" },
      { k: "pilot", v: "Windows 10/11 · one state" },
      { k: "cloud calls", v: "0" },
    ],
    repo: "", // private for now; add the https URL when it opens up
  },

  categories: [
    { id: "security", label: "Cybersecurity & Networking", tone: "cyan" },
    { id: "ml", label: "Machine Learning & Data", tone: "indigo" },
    { id: "systems", label: "Algorithms & Systems", tone: "zinc" },
    { id: "embedded", label: "Embedded & Hardware", tone: "emerald" },
  ],

  timeline: [
    {
      id: "collins",
      kind: "work",
      org: "Collins Aerospace",
      role: "Software Engineering Co-Op",
      period: "Starting Jan 2027",
      badge: "Incoming",
      summary: "Joining as a software engineering co-op in January 2027.",
      bullets: [],
    },
    {
      id: "gcri",
      kind: "work",
      org: "Texas A&M Global Cyber Research Institute (GCRI)",
      role: resumeJob("gcri").role,
      period: "Feb 2026 – Present",
      summary: "NASA USRC drone cybersecurity research: hardware, attestation, segmentation, and red teaming.",
      bullets: resumeJob("gcri").bullets,
    },
    {
      id: "tamu",
      kind: "edu",
      org: "Texas A&M University",
      role: "B.S. in Computer Engineering",
      period: "Expected May 2028",
      summary:
        "Minors in Mathematics and Cybersecurity. Craig & Galen Brown Engineering Honors Program, GPA 4.00 / 4.00, Dean's Honor Roll.",
      bullets: [],
    },
    {
      id: "bjj",
      kind: "lead",
      org: resumeJob("bjj").org,
      role: resumeJob("bjj").role,
      period: "Jan 2025 – Present",
      summary: "",
      bullets: resumeJob("bjj").bullets,
    },
    {
      id: "nitro",
      kind: "work",
      org: "Nitro Swimming · Austin, TX",
      role: resumeJob("nitro").role,
      period: "Feb 2024 – Aug 2025",
      summary: "",
      bullets: resumeJob("nitro").bullets,
    },
  ],
};

/* Central project list. `featured: true` shows in the main grid;
 * `featured: false` lands in the "More Projects / Archive" card.
 * Shape: { id, name, code?, org?, category, description, tags, repo?,
 *          visual?, featured }
 * `visual` picks the drawing at the top of the card (see PROJECT_VISUALS). */
export const PROJECTS_DATA = [
  {
    id: "world-cup",
    name: "world_cup Predictor",
    code: true,
    category: "ml",
    visual: "odds",
    description:
      "End-to-end ML pipeline trained on 49,500+ international matches. It benchmarks Logistic Regression, Random Forest, XGBoost, and LightGBM with isotonic-calibrated probabilities and a leakage-free chronological split, then runs 10,000-iteration Monte Carlo simulations of the 2026 FIFA World Cup. 60.8% test accuracy, deployed with Streamlit.",
    tags: ["Python", "Data Modeling", "Simulation", "Sports Analytics", "XGBoost"],
    repo: "https://github.com/Raymond0562/World-Cup-Predictor",
    featured: true,
  },
  {
    id: "gcri-vlan",
    name: "VLAN Network Segmentation Architecture",
    org: "GCRI",
    category: "security",
    visual: "vlan",
    description:
      "Dynamic VLAN segmentation and enforcement layer built on hostapd, iptables, and tc. Unattested devices land in quarantine, and drones that pass attestation are promoted into isolated subnets drawn from a 100-VLAN trusted pool, which cuts off lateral movement.",
    tags: ["VLAN", "Network Segmentation", "Access Control", "Enterprise Networking", "GCRI"],
    repo: "",
    featured: true,
  },
  {
    id: "gcri-redteam",
    name: "MITM & Red-Teaming Operations",
    org: "GCRI",
    category: "security",
    visual: "mitm",
    description:
      "Red-team exercises across a 3-node lab network: ground station, drone, and attacker. Simulated MITM, ARP spoofing, and Scapy packet injection against the attestation service and the MAVLink control channel, and built a GUI that wraps the attack scripts with a live packet view.",
    tags: ["Red Teaming", "MITM", "Adversary Emulation", "Network Security", "Vulnerability Assessment"],
    repo: "",
    featured: true,
  },
  {
    id: "armv8-cpu",
    name: "64-bit ARMv8 Single-Cycle Processor",
    category: "embedded",
    visual: "datapath",
    description:
      "A 64-bit processor written in Verilog that runs a subset of the ARMv8 instruction set, one instruction per clock cycle. Fetch, decode, register read, ALU, data memory, and write-back all finish inside a single cycle across 11 instructions, verified in Icarus Verilog with self-checking testbenches.",
    tags: ["Verilog", "ARMv8", "Computer Architecture", "Digital Design", "Icarus Verilog"],
    repo: "",
    featured: true,
  },
  {
    id: "gcri-attestation",
    name: "TPM Remote Attestation for Drones",
    org: "GCRI",
    category: "security",
    visual: "attest",
    description:
      "TPM-based remote attestation pipeline on Raspberry Pi hardware. A nonce challenge/response with PCR-backed evidence proves a drone's software integrity to the ground station, and tampered or incomplete baseline claims are rejected before network trust is granted.",
    tags: ["TPM 2.0", "Remote Attestation", "Raspberry Pi", "Python", "MAVLink"],
    repo: "",
    featured: false,
  },
  {
    id: "can-uart",
    name: "Real-Time CAN-to-UART Telemetry Relay",
    category: "embedded",
    visual: "ring",
    description:
      "Interrupt-driven CAN-to-UART relay in embedded C. A 32-slot volatile circular buffer hands frames from the receive ISR to the main loop safely, with endian-converted framing, overflow handling, and an RGB LED activity indicator.",
    tags: ["Embedded C", "Interrupts", "CAN", "UART", "Circular Buffer"],
    repo: "https://github.com/Raymond0562/can-uart-telemetry-relay",
    featured: true,
  },
  {
    id: "homework3",
    name: "homework3 — Wikipedia Word Search",
    code: true,
    category: "systems",
    visual: "throughput",
    description:
      "High-performance multithreaded keyword search over Wikipedia dumps. A reader streams the file in 1 to 16 MB blocks to search threads, scanning an 8.6 GB dump at about 2,100 MB/s for one keyword and 700 MB/s for 151 keywords at once.",
    tags: ["C++", "Multithreading", "Search & Indexing", "Algorithms"],
    repo: "",
    featured: true,
  },
  {
    id: "crazy-8",
    name: "Crazy-8",
    category: "systems",
    visual: "cards",
    description:
      "Card game engine in C++ (Game/Player/Card classes) with file-based deck loading, input validation, manual dynamic memory management, and separate AI and human player logic.",
    tags: ["C++", "OOP", "Memory Management"],
    repo: "",
    featured: false,
  },
  {
    id: "file-organizer",
    name: "Automated File Organizer",
    category: "systems",
    visual: "sort",
    description:
      "Python tool that watches Downloads with watchdog and sorts new files into 6 typed categories, skipping files still mid-download, handling duplicate names, and reverting with one command.",
    tags: ["Python", "watchdog", "Automation"],
    repo: "https://github.com/Raymond0562/File_Organizer",
    featured: false,
  },
];

// Champion odds from results/simulation_results.csv (top six teams).
const WORLD_CUP_ODDS = [
  { team: "Argentina", p: 18.8 },
  { team: "Spain", p: 15.6 },
  { team: "France", p: 14.5 },
  { team: "England", p: 9.1 },
  { team: "Netherlands", p: 5.2 },
  { team: "Brazil", p: 5.1 },
];

// Search speed from CSCE313/HW3/experiments/RESULTS.md (cached, 1 MB blocks).
const SEARCH_THROUGHPUT = [
  { x: 1, mbps: 2122 },
  { x: 2, mbps: 2081 },
  { x: 4, mbps: 2094 },
  { x: 8, mbps: 2059 },
  { x: 16, mbps: 1992 },
  { x: 32, mbps: 1857 },
  { x: 64, mbps: 1508 },
  { x: 128, mbps: 814 },
  { x: 151, mbps: 700 },
];

/* ----------------------------------------------------------------------------
 * Security helpers
 * -------------------------------------------------------------------------- */

const ALLOWED_PROTOCOLS = ["https:", "mailto:"];
const MAX_URL_LENGTH = 2048;
const MAX_QUERY_LENGTH = 64;

/** Returns a normalised URL if it is https:, mailto:, or a same-page #anchor;
 *  otherwise null. Callers must not render an href when this returns null. */
export function safeHref(raw) {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || value.length > MAX_URL_LENGTH) return null;
  if (value[0] === "#") {
    const name = value.slice(1);
    if (!name || name.length > 64) return null;
    for (const ch of name) {
      const ok =
        (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || (ch >= "0" && ch <= "9") || ch === "-" || ch === "_";
      if (!ok) return null;
    }
    return value;
  }
  try {
    const url = new URL(value);
    return ALLOWED_PROTOCOLS.includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

/** "https://www.site.com/x/" -> "site.com/x". Empty string if the URL is not allowed. */
export function displayUrl(raw) {
  let value = safeHref(raw) ?? "";
  for (const prefix of ["https://", "mailto:", "www."]) {
    if (value.startsWith(prefix)) value = value.slice(prefix.length);
  }
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

/** Length-caps input and drops control characters. Never used to build a RegExp. */
export function sanitizeQuery(raw, max = MAX_QUERY_LENGTH) {
  const text = String(raw ?? "").slice(0, max);
  let out = "";
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code >= 32 && code !== 127) out += ch;
  }
  return out;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.className = "sr-only";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/* ----------------------------------------------------------------------------
 * Small building blocks
 * -------------------------------------------------------------------------- */

const C = PORTFOLIO_CONFIG;
const cx = (...parts) => parts.filter(Boolean).join(" ");

const TONE_TEXT = { cyan: "text-sky-400", indigo: "text-indigo-400", zinc: "text-zinc-300", emerald: "text-emerald-400" };
const TONE_DOT = { cyan: "bg-sky-400", indigo: "bg-indigo-500", zinc: "bg-zinc-400", emerald: "bg-emerald-500" };

/** External link. Renders plain text if the URL fails validation. */
function ExternalLink({ href, className, children, ...rest }) {
  const safe = safeHref(href);
  if (!safe) return <span className={className}>{children}</span>;
  return (
    <a href={safe} target="_blank" rel="noopener noreferrer" className={className} {...rest}>
      {children}
    </a>
  );
}

/** Fades content up when it scrolls into view. Stagger with `delay` (ms). */
function Reveal({ delay = 0, className, children }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    el.style.transitionDelay = `${delay}ms`;
    if (!("IntersectionObserver" in window)) {
      setShown(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={cx("reveal", shown && "is-in", className)}>
      {children}
    </div>
  );
}

/** Surface with a mouse-tracking spotlight on the fill and the border. */
function Card({ className, children }) {
  const ref = useRef(null);
  const onMove = useCallback((event) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }, []);
  return (
    <div ref={ref} onMouseMove={onMove} className={cx("card", className)}>
      {children}
    </div>
  );
}

function Pill({ children, tone }) {
  return <span className={cx("pill", tone && TONE_TEXT[tone])}>{children}</span>;
}

function SectionHead({ path, title, accent, blurb }) {
  return (
    <Reveal className="mb-8 flex flex-col gap-3">
      <p className="font-mono text-xs text-zinc-500">
        <span className="text-sky-400">~</span>/{path}
      </p>
      <h2 className="text-3xl font-semibold tracking-[-0.03em] text-zinc-50 sm:text-[2.6rem] sm:leading-[1.1]">
        {title}
        {accent ? <span className="accent"> {accent}</span> : null}
      </h2>
      {blurb ? <p className="max-w-2xl text-base leading-relaxed text-zinc-400">{blurb}</p> : null}
    </Reveal>
  );
}

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="live-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  );
}

/* ----------------------------------------------------------------------------
 * Header
 * -------------------------------------------------------------------------- */

function Header({ onNav, onOpenPalette, shortcut }) {
  return (
    <header className="site-header sticky z-40 flex justify-center print:hidden">
      <nav
        aria-label="Primary"
        className="flex max-w-full items-center gap-1 rounded-full border border-white/10 bg-zinc-900/70 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-md"
      >
        <a
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            onNav("top");
          }}
          className="ml-1 hidden h-7 w-7 items-center justify-center rounded-full bg-zinc-50 font-mono text-[11px] font-bold text-zinc-950 sm:flex"
          aria-label="Back to top"
        >
          {C.initials}
        </a>
        <ul className="no-scrollbar flex min-w-0 items-center overflow-x-auto">
          {C.nav.map((item) => (
            <li key={item.id}>
              <a
                href={safeHref(`#${item.id}`) ?? undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onNav(item.id);
                }}
                className="nav-link"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <button type="button" onClick={onOpenPalette} className="kbd-btn" aria-label="Open command palette">
          <Search size={13} aria-hidden="true" />
          <kbd className="hidden font-mono text-[11px] sm:inline">{shortcut}</kbd>
        </button>
      </nav>
    </header>
  );
}

/* ----------------------------------------------------------------------------
 * Hero + terminal
 * -------------------------------------------------------------------------- */

function TerminalLine({ line, sep }) {
  switch (line.t) {
    case "cmd":
      return (
        <div>
          <span className="text-emerald-500">$ </span>
          <span className="text-zinc-50">{line.v}</span>
        </div>
      );
    case "ok":
      return (
        <div className="text-zinc-300">
          <span className="text-emerald-500">● </span>
          {line.v}
        </div>
      );
    case "kv":
      return (
        <div>
          <span className="text-sky-400">{line.k}</span>
          <span className="text-zinc-600">{sep}</span>
          <span className="text-zinc-300">{line.v}</span>
        </div>
      );
    case "sec":
      return <div className="pt-1 text-indigo-400">{line.v}</div>;
    case "comment":
      return <div className="text-zinc-500">{line.v}</div>;
    default:
      return <div className="text-zinc-300">{line.v}</div>;
  }
}

function StackJson() {
  const last = C.stack.length - 1;
  return (
    <>
      <div className="text-zinc-500">{"{"}</div>
      {C.stack.map((group, gi) => (
        <div key={group.id} className="pl-4">
          <span className="text-sky-400">"{group.id}"</span>
          <span className="text-zinc-600">: [</span>
          {group.items.map((item, i) => (
            <span key={item}>
              <span className="text-emerald-400">"{item}"</span>
              {i < group.items.length - 1 ? <span className="text-zinc-600">, </span> : null}
            </span>
          ))}
          <span className="text-zinc-600">]{gi < last ? "," : ""}</span>
        </div>
      ))}
      <div className="text-zinc-500">{"}"}</div>
    </>
  );
}

function TerminalCard() {
  const [active, setActive] = useState(C.terminal[0].id);
  const tab = C.terminal.find((t) => t.id === active) ?? C.terminal[0];
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        </div>
        <div role="tablist" aria-label="Terminal files" className="no-scrollbar flex min-w-0 gap-1 overflow-x-auto">
          {C.terminal.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`term-tab-${t.id}`}
              aria-selected={t.id === active}
              aria-controls="term-panel"
              onClick={() => setActive(t.id)}
              className={cx("term-tab", t.id === active && "is-active")}
            >
              {t.id}
            </button>
          ))}
        </div>
        <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-widest text-zinc-600 sm:block">
          read-only
        </span>
      </div>
      <div
        id="term-panel"
        role="tabpanel"
        aria-labelledby={`term-tab-${tab.id}`}
        key={tab.id}
        className="term-body min-h-[17.5rem] overflow-x-auto px-5 py-4 font-mono text-[12.5px] leading-[1.75]"
      >
        {tab.json ? (
          <>
            <div>
              <span className="text-emerald-500">$ </span>
              <span className="text-zinc-50">cat stack.json</span>
            </div>
            <StackJson />
          </>
        ) : (
          tab.lines.map((line, i) => <TerminalLine key={`${tab.id}-${i}`} line={line} sep={tab.sep} />)
        )}
        <div>
          <span className="text-emerald-500">$ </span>
          <span className="term-cursor" aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}

function Hero({ onNav, onCopyEmail }) {
  return (
    <section id="top" className="grid items-center gap-10 pb-20 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:pt-20 print:hidden">
      <div className="flex min-w-0 flex-col items-start gap-6">
        <Reveal>
          <p className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] px-3.5 py-1.5 font-mono text-[11.5px] leading-relaxed text-emerald-300">
            <LiveDot />
            <span>{C.status.primary}</span>
            <span className="text-emerald-500/50" aria-hidden="true">
              ·
            </span>
            <span className="text-emerald-200/70">{C.status.secondary}</span>
          </p>
        </Reveal>

        <Reveal delay={70}>
          <h1 className="text-balance">
            <span className="block text-5xl font-semibold tracking-[-0.045em] text-zinc-50 sm:text-6xl xl:text-7xl">
              {C.name}
            </span>
            <span className="mt-4 block text-2xl font-medium leading-snug tracking-[-0.03em] text-zinc-400 sm:text-[1.75rem]">
              {C.headline.map((seg, i) => (
                <span key={i} className={seg.hi ? "accent text-zinc-50" : undefined}>
                  {seg.text}
                </span>
              ))}
            </span>
          </h1>
        </Reveal>

        <Reveal delay={140}>
          <p className="max-w-xl text-base leading-relaxed text-zinc-400">{C.subheadline}</p>
        </Reveal>

        <Reveal delay={210} className="flex flex-wrap items-center gap-3">
          <a
            href="#projects"
            onClick={(event) => {
              event.preventDefault();
              onNav("projects");
            }}
            className="btn btn-primary"
          >
            Explore Projects <ArrowRight size={15} aria-hidden="true" />
          </a>
          <a
            href="#resume"
            onClick={(event) => {
              event.preventDefault();
              onNav("resume");
            }}
            className="btn btn-glass"
          >
            <FileText size={15} aria-hidden="true" /> View Resume
          </a>
        </Reveal>

        <Reveal delay={280} className="w-full">
          <ul className="socials">
            {safeHref(C.contact.github) ? (
              <li>
                <ExternalLink href={C.contact.github} className="social" aria-label={`GitHub: ${displayUrl(C.contact.github)}`}>
                  <Github size={15} aria-hidden="true" />
                  <span className="social-value">{displayUrl(C.contact.github)}</span>
                  <ArrowUpRight size={13} className="social-go" aria-hidden="true" />
                </ExternalLink>
              </li>
            ) : null}
            {safeHref(C.contact.linkedin) ? (
              <li>
                <ExternalLink href={C.contact.linkedin} className="social" aria-label={`LinkedIn: ${displayUrl(C.contact.linkedin)}`}>
                  <Linkedin size={15} aria-hidden="true" />
                  <span className="social-value">{displayUrl(C.contact.linkedin)}</span>
                  <ArrowUpRight size={13} className="social-go" aria-hidden="true" />
                </ExternalLink>
              </li>
            ) : null}
            {C.contact.email ? (
              <li className="flex min-w-0 items-center gap-1">
                <ExternalLink href={`mailto:${C.contact.email}`} className="social" aria-label={`Email ${C.contact.email}`}>
                  <Mail size={15} aria-hidden="true" />
                  <span className="social-value select-all">{C.contact.email}</span>
                  <ArrowUpRight size={13} className="social-go" aria-hidden="true" />
                </ExternalLink>
                <button type="button" onClick={onCopyEmail} className="btn-quiet shrink-0" aria-label="Copy email address">
                  <Copy size={13} aria-hidden="true" /> Copy
                </button>
              </li>
            ) : null}
          </ul>
        </Reveal>
      </div>

      <Reveal delay={200} className="min-w-0">
        <TerminalCard />
      </Reveal>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * About — bento
 * -------------------------------------------------------------------------- */

function useClock(timeZone) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return useMemo(() => {
    const pick = (parts, type) => parts.find((p) => p.type === type)?.value ?? "";
    const t = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
      timeZoneName: "short",
    }).formatToParts(now);
    const date = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(now);
    return {
      hm: `${pick(t, "hour")}:${pick(t, "minute")}`,
      ss: pick(t, "second"),
      zone: pick(t, "timeZoneName"), // CST in winter, CDT in summer
      date,
    };
  }, [now, timeZone]);
}

/** A bar whose length is set through the CSSOM (no style attribute, CSP-safe). */
function Fill({ pct, axis = "width", className, title }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.style[axis] = `${Math.max(0, Math.min(100, pct))}%`;
  }, [pct, axis]);
  return <span ref={ref} className={className} title={title} />;
}

const INTEREST_ICONS = { bjj: Swords, lego: Blocks, read: BookOpen, hike: Mountain };

function About() {
  const clock = useClock(C.location.timeZone);
  const edu = C.education;
  const maxHours = Math.max(...edu.terms.map((term) => term.hours));
  return (
    <section id="about" className="section print:hidden">
      <SectionHead path="about" title="Defense, offense, and" accent="the hardware underneath" />
      <div className="grid gap-4 md:grid-cols-6">
        <Reveal className="md:col-span-4">
          <Card className="flex h-full flex-col gap-4 p-6 sm:p-8">
            <p className="label">Biography</p>
            <p className="font-serif text-[1.7rem] leading-[1.2] text-zinc-50 sm:text-[2.1rem]">{C.bio[0]}</p>
            {C.bio.slice(1).map((para) => (
              <p key={para} className="max-w-[65ch] leading-relaxed text-zinc-400">
                {para}
              </p>
            ))}
          </Card>
        </Reveal>

        <Reveal delay={80} className="md:col-span-2">
          <Card className="relative flex h-full flex-col justify-between gap-8 overflow-hidden p-6">
            <div className="radar" aria-hidden="true">
              <span />
              <span />
              <span />
              <i />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="label">Location</p>
              <span className="inline-flex items-center gap-2 font-mono text-[11px] text-emerald-400">
                <LiveDot /> live
              </span>
            </div>
            <div>
              <p className="font-mono text-5xl font-medium tracking-[-0.04em] text-zinc-50 tabular-nums">
                {clock.hm}
                <span className="text-2xl text-zinc-500">:{clock.ss}</span>
              </p>
              <p className="mt-2 font-mono text-xs text-zinc-500">
                {clock.date} · <span className="text-sky-400">{clock.zone}</span>
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="flex items-center gap-2 text-zinc-50">
                <MapPin size={15} className="text-zinc-500" aria-hidden="true" /> {C.location.city}
              </p>
              <p className="font-mono text-xs text-zinc-500">{C.location.coords}</p>
            </div>
          </Card>
        </Reveal>

        <Reveal className="md:col-span-3">
          <Card className="flex h-full flex-col gap-6 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label">Education</p>
                <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-zinc-50">{edu.degree}</p>
                <p className="text-sm text-zinc-400">
                  {edu.school} · {edu.grad}
                </p>
              </div>
              <p className="text-right">
                <span className="block font-serif text-6xl leading-none text-zinc-50">{edu.gpa}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">GPA / 4.00</span>
              </p>
            </div>

            <div>
              <p className="mb-3 font-mono text-[11px] text-zinc-500">credit hours by term, every graded term at 4.00</p>
              <ol className="grid grid-cols-5 gap-2">
                {edu.terms.map((term) => (
                  <li key={term.t} className="flex flex-col gap-1.5">
                    <span className="flex h-20 items-end">
                      <Fill
                        axis="height"
                        pct={(term.hours / maxHours) * 100}
                        title={`${term.t}: ${term.hours} credit hours${term.now ? ", in progress" : `, GPA ${term.gpa}`}`}
                        className={cx("term-bar", term.now && "is-now")}
                      />
                    </span>
                    <span className="font-mono text-[11px] text-zinc-200 tabular-nums">{term.hours} h</span>
                    <span className="font-mono text-[10px] text-zinc-500">{term.t}</span>
                    <span className={cx("font-mono text-[10px]", term.now ? "text-emerald-400" : "text-zinc-400")}>
                      {term.now ? "in progress" : term.gpa}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <ul className="mt-auto flex flex-wrap gap-2">
              {edu.badges.map((badge) => (
                <li key={badge}>
                  <Pill>{badge}</Pill>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>

        <Reveal delay={80} className="md:col-span-3">
          <Card className="flex h-full flex-col gap-5 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="label">Notable coursework</p>
              <p className="flex items-center gap-3 font-mono text-[10px] text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="course-h">H</span> honors
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> this term
                </span>
              </p>
            </div>
            {C.coursework.map((group) => (
              <div key={group.label} className="flex flex-col gap-1.5">
                <p className="text-sm text-zinc-300">{group.label}</p>
                <ul className="flex flex-col">
                  {group.items.map((course) => (
                    <li key={course.c} className="course-row">
                      <span className="w-[4.6rem] shrink-0 font-mono text-[11.5px] text-sky-400">{course.c}</span>
                      <span className="min-w-0 flex-1 text-[13.5px] text-zinc-400">{course.n}</span>
                      {course.h ? <span className="course-h">H</span> : null}
                      {course.now ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" /> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Card>
        </Reveal>

        <Reveal className="md:col-span-6">
          <Card className="flex h-full flex-col gap-6 p-6 sm:p-8">
            <p className="label">Technical stack</p>
            {C.stack.map((group) => (
              <div key={group.id} className="grid gap-2.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
                <p className="flex items-center gap-2 pt-1 text-sm text-zinc-300">
                  <span className={cx("h-1.5 w-1.5 rounded-full", TONE_DOT[group.tone])} aria-hidden="true" />
                  {group.label}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item}>
                      <Pill>{item}</Pill>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Card>
        </Reveal>

        <Reveal className="md:col-span-6">
          <Card className="flex h-full flex-col gap-6 p-6 sm:p-8">
            <div className="flex flex-col gap-2">
              <p className="label">Beyond the terminal</p>
              <p className="font-serif text-[1.7rem] leading-[1.15] text-zinc-50 sm:text-[2.1rem]">
                What I do when the laptop is <span className="italic">closed</span>
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {C.interests.map((item) => {
                const Icon = INTEREST_ICONS[item.icon] ?? Hash;
                return (
                  <li key={item.label} className="hobby">
                    <span className="hobby-icon">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <h3 className="text-lg font-semibold tracking-[-0.02em] text-zinc-50">{item.label}</h3>
                    <p className="text-[14px] leading-relaxed text-zinc-400">{item.text}</p>
                    <p className="mt-auto flex flex-col gap-1 border-t border-white/[0.08] pt-3">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{item.meta.k}</span>
                      <span className="font-serif text-xl italic leading-tight text-zinc-100">{item.meta.v}</span>
                    </p>
                  </li>
                );
              })}
            </ul>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Current build
 * -------------------------------------------------------------------------- */

function Current() {
  const cur = C.current;
  return (
    <section id="current" className="section print:hidden">
      <SectionHead path="now" title="What I'm building" accent="right now" />
      <Reveal>
        <Card className="current-card overflow-hidden">
          <div className="grid lg:grid-cols-[1.25fr_1fr]">
            <div className="flex min-w-0 flex-col gap-6 p-6 sm:p-9">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] text-emerald-300">
                  <LiveDot /> {cur.status}
                </span>
                <span className="font-mono text-[11px] text-zinc-500">primary project</span>
              </div>
              <div>
                <h3 className="font-serif text-6xl leading-none text-zinc-50 sm:text-7xl">{cur.name}</h3>
                <p className="mt-3 text-lg tracking-[-0.01em] text-zinc-300">{cur.tagline}</p>
              </div>
              <p className="max-w-[65ch] leading-relaxed text-zinc-400">{cur.overview}</p>
              <ul className="flex flex-wrap gap-2">
                {cur.tags.map((tag) => (
                  <li key={tag}>
                    <Pill tone="cyan">{tag}</Pill>
                  </li>
                ))}
              </ul>
              {safeHref(cur.repo) ? (
                <ExternalLink href={cur.repo} className="link-arrow">
                  View repository <ArrowUpRight size={14} aria-hidden="true" />
                </ExternalLink>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-col gap-7 border-t border-white/[0.08] bg-black/20 p-6 sm:p-9 lg:border-l lg:border-t-0">
              <div className="flex flex-col gap-3">
                <p className="label">How an answer is made</p>
                <ol className="pipeline flex flex-col gap-1.5 font-mono text-[12.5px]">
                  {cur.pipeline.map((step, i) => (
                    <li key={step} className="flex items-center gap-3">
                      <span className="w-4 text-right text-zinc-600 tabular-nums">{i + 1}</span>
                      <span
                        className={cx(
                          "flex-1 rounded-md border px-3 py-2",
                          i === cur.pipeline.length - 1
                            ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300"
                            : "border-white/[0.08] bg-white/[0.02] text-zinc-300"
                        )}
                      >
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="font-mono text-[11px] text-zinc-500">every step runs on the user's own machine</p>
              </div>

              <div className="flex flex-col gap-3">
                <p className="label">On the bench</p>
                <ul className="flex flex-col gap-2.5 text-sm leading-relaxed text-zinc-300">
                  {cur.workLog.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-sky-400" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-white/[0.08] pt-5">
                {cur.facts.map((fact) => (
                  <div key={fact.k} className="min-w-0">
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{fact.k}</dt>
                    <dd className="mt-1 font-mono text-[12.5px] text-zinc-50">{fact.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Card>
      </Reveal>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Project visuals — one small drawing per featured project
 * -------------------------------------------------------------------------- */

function VizCaption({ children }) {
  return <p className="font-mono text-[10.5px] text-zinc-500">{children}</p>;
}

function OddsVisual() {
  const max = 20;
  return (
    <div className="flex w-full flex-col gap-2.5">
      <VizCaption>simulated 2026 champion odds, top 6 teams</VizCaption>
      <ul className="flex flex-col gap-1.5">
        {WORLD_CUP_ODDS.map((row) => (
          <li key={row.team} className="grid grid-cols-[5.5rem_1fr_2.75rem] items-center gap-2 text-[11.5px]">
            <span className="truncate text-zinc-300">{row.team}</span>
            <span className="flex h-2 items-center">
              <Fill pct={(row.p / max) * 100} title={`${row.team}: ${row.p}% to win`} className="bar-h" />
            </span>
            <span className="text-right font-mono text-zinc-300 tabular-nums">{row.p}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ThroughputVisual() {
  const max = 2200;
  const last = SEARCH_THROUGHPUT.length - 1;
  return (
    <div className="flex w-full flex-col gap-2.5">
      <VizCaption>search speed (MB/s) as the keyword list grows</VizCaption>
      <ol className="grid grid-cols-9 gap-1.5">
        {SEARCH_THROUGHPUT.map((point, i) => (
          <li key={point.x} className="flex flex-col items-center gap-1">
            <span className="h-3.5 font-mono text-[10px] text-zinc-300 tabular-nums">
              {i === 0 || i === last ? point.mbps.toLocaleString("en-US") : ""}
            </span>
            <span className="flex h-16 w-full items-end justify-center">
              <Fill
                axis="height"
                pct={(point.mbps / max) * 100}
                title={`${point.x} keyword${point.x === 1 ? "" : "s"}: ${point.mbps.toLocaleString("en-US")} MB/s`}
                className="bar-v"
              />
            </span>
            <span className="font-mono text-[10px] text-zinc-500 tabular-nums">{point.x}</span>
          </li>
        ))}
      </ol>
      <p className="text-center font-mono text-[10px] text-zinc-600">keywords searched at once</p>
    </div>
  );
}

function VlanVisual() {
  const cells = Array.from({ length: 100 }, (_, i) => i);
  const lit = new Set([3, 17, 28, 41, 42, 66, 79, 93]);
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 font-mono text-[11px]">
        <span className="viz-chip text-zinc-400">new device</span>
        <ArrowRight size={12} className="text-zinc-600" aria-hidden="true" />
        <span className="viz-chip viz-chip-warn">quarantine</span>
        <ArrowRight size={12} className="text-zinc-600" aria-hidden="true" />
        <span className="viz-chip text-sky-300">attest</span>
        <ArrowRight size={12} className="text-zinc-600" aria-hidden="true" />
        <span className="viz-chip viz-chip-ok">trusted VLAN</span>
      </div>
      <div className="vlan-grid" aria-hidden="true">
        {cells.map((i) => (
          <span key={i} className={lit.has(i) ? "is-lit" : undefined} />
        ))}
      </div>
      <VizCaption>100-VLAN trusted pool, one isolated subnet per verified drone</VizCaption>
    </div>
  );
}

function MitmVisual() {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    setAnimate(!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  }, []);
  const path = "M52,34 L170,98 L288,34";
  return (
    <div className="flex w-full flex-col items-center gap-1">
      <svg viewBox="0 0 340 128" className="w-full max-w-[380px]" role="img" aria-label="Three-node lab: the attacker sits on the path between ground station and drone">
        <line x1="52" y1="34" x2="288" y2="34" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="4 5" />
        <path d={path} fill="none" stroke="#fb7185" strokeWidth="1.5" strokeOpacity="0.75" />
        {animate ? (
          <circle r="3.5" fill="#fb7185">
            <animateMotion dur="2.8s" repeatCount="indefinite" path={path} />
          </circle>
        ) : null}
        <g fontFamily="JetBrains Mono, monospace" fontSize="10" textAnchor="middle">
          <circle cx="52" cy="34" r="9" fill="#121215" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="52" y="60" fill="#d4d4d8">ground station</text>
          <circle cx="288" cy="34" r="9" fill="#121215" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="288" y="60" fill="#d4d4d8">drone</text>
          <circle cx="170" cy="98" r="9" fill="#121215" stroke="#fb7185" strokeWidth="1.5" />
          <text x="170" y="122" fill="#fda4af">attacker</text>
          <text x="170" y="24" fill="#71717a">MAVLink, intended path</text>
        </g>
      </svg>
    </div>
  );
}

function AttestVisual() {
  const steps = [
    { from: "drone", to: "verifier", msg: "request challenge" },
    { from: "verifier", to: "drone", msg: "nonce" },
    { from: "drone", to: "verifier", msg: "PCR-backed evidence" },
  ];
  return (
    <div className="flex w-full flex-col gap-1.5 font-mono text-[11.5px]">
      {steps.map((step) => (
        <p key={step.msg} className="flex flex-wrap items-center gap-x-2">
          <span className="w-[4.2rem] text-sky-400">{step.from}</span>
          <ArrowRight size={12} className="text-zinc-600" aria-hidden="true" />
          <span className="w-[4.2rem] text-sky-400">{step.to}</span>
          <span className="text-zinc-300">{step.msg}</span>
        </p>
      ))}
      <p className="mt-1.5 flex flex-wrap items-center gap-2 border-t border-white/[0.08] pt-2.5">
        <span className="text-zinc-500">verdict</span>
        <span className="viz-chip viz-chip-ok">ALLOW · join trusted VLAN</span>
        <span className="viz-chip viz-chip-warn">DENY · stay quarantined</span>
      </p>
    </div>
  );
}

function RingVisual() {
  const slots = Array.from({ length: 32 }, (_, i) => i);
  const read = 5;
  const write = 13;
  return (
    <div className="flex w-full items-center justify-center gap-4 font-mono text-[10.5px]">
      <p className="w-24 text-right leading-relaxed text-zinc-400">
        <span className="block text-zinc-200">CAN RX ISR</span>
        writes at head
      </p>
      <svg viewBox="0 0 120 120" className="h-[7.25rem] w-[7.25rem] shrink-0" role="img" aria-label="32-slot circular buffer with eight frames waiting between the read and write indexes">
        {slots.map((i) => {
          const angle = (i / 32) * Math.PI * 2 - Math.PI / 2;
          const pending = i >= read && i < write;
          return (
            <circle
              key={i}
              cx={(60 + Math.cos(angle) * 48).toFixed(2)}
              cy={(60 + Math.sin(angle) * 48).toFixed(2)}
              r={pending ? 4 : 3}
              fill={pending ? "#34d399" : "#121215"}
              stroke={pending ? "#34d399" : "rgba(255,255,255,0.28)"}
              strokeWidth="1"
            />
          );
        })}
        <text x="60" y="57" textAnchor="middle" fontFamily="Instrument Serif, serif" fontSize="26" fill="#fafafa">
          32
        </text>
        <text x="60" y="73" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="#8b8b94">
          slots
        </text>
      </svg>
      <p className="w-24 leading-relaxed text-zinc-400">
        <span className="block text-zinc-200">main loop</span>
        drains to UART
      </p>
    </div>
  );
}

function DatapathVisual() {
  const stages = ["PC", "Instr Mem", "Reg File", "ALU", "Data Mem"];
  const ops = ["ADD", "SUB", "AND", "ORR", "ADDI", "SUBI", "MOVZ", "LDUR", "STUR", "CBZ", "B"];
  return (
    <div className="flex w-full flex-col gap-3 font-mono text-[11px]">
      <p className="flex flex-wrap items-center gap-2">
        <span className="viz-chip viz-chip-ctl">Control Unit</span>
        <span className="text-zinc-500">decodes instr[31:21], drives every mux below</span>
      </p>
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5">
        {stages.map((stage) => (
          <React.Fragment key={stage}>
            <span className="viz-chip text-zinc-200">{stage}</span>
            <ArrowRight size={12} className="text-zinc-600" aria-hidden="true" />
          </React.Fragment>
        ))}
        <span className="viz-chip viz-chip-ok">write back</span>
      </div>
      <ul className="flex flex-wrap gap-1">
        {ops.map((op) => (
          <li key={op} className="op">
            {op}
          </li>
        ))}
      </ul>
      <VizCaption>11 instructions, 64-bit datapath, one clock cycle each</VizCaption>
    </div>
  );
}

function CardsVisual() {
  const hand = [
    { r: "3", s: "♥", red: true },
    { r: "J", s: "♣" },
    { r: "8", s: "♠", wild: true },
    { r: "K", s: "♦", red: true },
    { r: "5", s: "♠" },
  ];
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <ul className="flex items-end justify-center gap-2 pt-3">
        {hand.map((card) => (
          <li key={card.r + card.s} className={cx("pcard", card.red && "is-red", card.wild && "is-wild")}>
            <span>{card.r}</span>
            <span aria-hidden="true">{card.s}</span>
          </li>
        ))}
      </ul>
      <VizCaption>an 8 is wild: play it and declare the next suit</VizCaption>
    </div>
  );
}

function SortVisual() {
  const folders = ["images", "documents", "videos", "audio", "installers"];
  return (
    <div className="flex w-full flex-col gap-3 font-mono text-[11px]">
      <p className="flex flex-wrap items-center gap-2">
        <span className="viz-chip text-zinc-200">~/Downloads</span>
        <span className="text-zinc-500">watched in real time</span>
      </p>
      <p className="flex items-center gap-2 text-zinc-500">
        <ArrowRight size={12} className="rotate-90 text-zinc-600" aria-hidden="true" /> sorted by file extension
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {folders.map((folder) => (
          <li key={folder} className="viz-chip text-sky-300">
            {folder}/
          </li>
        ))}
      </ul>
      <VizCaption>files still downloading are skipped until their size stops changing</VizCaption>
    </div>
  );
}

const PROJECT_VISUALS = {
  datapath: DatapathVisual,
  cards: CardsVisual,
  sort: SortVisual,
  odds: OddsVisual,
  throughput: ThroughputVisual,
  vlan: VlanVisual,
  mitm: MitmVisual,
  attest: AttestVisual,
  ring: RingVisual,
};

/* ----------------------------------------------------------------------------
 * Projects
 * -------------------------------------------------------------------------- */

function ProjectCard({ project, wide = false }) {
  const category = C.categories.find((c) => c.id === project.category);
  const Visual = PROJECT_VISUALS[project.visual];
  return (
    <Card className={cx("flex h-full flex-col overflow-hidden", wide && "lg:flex-row-reverse")}>
      {Visual ? (
        <div className={cx("viz", wide && "viz-side")}>
          <Visual />
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <p className={cx("font-mono text-[11px] uppercase tracking-widest", TONE_TEXT[category?.tone ?? "zinc"])}>
            {category?.label ?? "Project"}
          </p>
          {project.org ? <span className="font-mono text-[11px] text-zinc-500">@ {project.org}</span> : null}
        </div>
        <h3
          className={cx(
            "text-xl font-semibold tracking-[-0.03em] text-zinc-50",
            project.code && "font-mono text-[1.1rem] tracking-[-0.02em]"
          )}
        >
          {project.name}
        </h3>
        <p className="leading-relaxed text-zinc-400">{project.description}</p>
        <ul className="mt-auto flex flex-wrap gap-2 pt-2">
          {project.tags.map((tag) => (
            <li key={tag}>
              <Pill>{tag}</Pill>
            </li>
          ))}
        </ul>
        {safeHref(project.repo) ? (
          <ExternalLink href={project.repo} className="link-arrow">
            Repository <ArrowUpRight size={14} aria-hidden="true" />
          </ExternalLink>
        ) : null}
      </div>
    </Card>
  );
}

function matchesProject(project, categoryId, tokens) {
  if (categoryId !== "all" && project.category !== categoryId) return false;
  if (tokens.length === 0) return true;
  const category = C.categories.find((c) => c.id === project.category);
  const haystack = [project.name, project.description, project.org ?? "", category?.label ?? "", ...project.tags]
    .join(" ")
    .toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

function Projects() {
  const [categoryId, setCategoryId] = useState("all");
  const [query, setQuery] = useState("");
  const [archiveOpen, setArchiveOpen] = useState(false);

  const tokens = useMemo(() => query.toLowerCase().split(" ").filter(Boolean).slice(0, 8), [query]);
  const featured = useMemo(
    () => PROJECTS_DATA.filter((p) => p.featured && matchesProject(p, categoryId, tokens)),
    [categoryId, tokens]
  );
  const archive = useMemo(() => PROJECTS_DATA.filter((p) => !p.featured), []);
  const filters = [{ id: "all", label: "All" }, ...C.categories];

  return (
    <section id="projects" className="section print:hidden">
      <SectionHead
        path="projects"
        title="Featured"
        accent="work"
        blurb="Drone security research from GCRI, alongside modeling, embedded, and systems projects. The drawings use numbers from the projects themselves."
      />

      <Reveal className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-1" role="group" aria-label="Filter by category">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              aria-pressed={categoryId === filter.id}
              onClick={() => setCategoryId(filter.id)}
              className={cx("filter-btn", categoryId === filter.id && "is-active")}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <label className="search-field" htmlFor="project-search">
          <Search size={14} aria-hidden="true" />
          <span className="sr-only">Search projects</span>
          <input
            id="project-search"
            type="search"
            value={query}
            maxLength={MAX_QUERY_LENGTH}
            onChange={(event) => setQuery(sanitizeQuery(event.target.value))}
            placeholder="Search projects, tags…"
            autoComplete="off"
            spellCheck="false"
          />
        </label>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2">
        {featured.map((project, i) => (
          <Reveal key={project.id} delay={(i % 2) * 80}>
            <ProjectCard project={project} />
          </Reveal>
        ))}

        {featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center md:col-span-2">
            <p className="text-zinc-300">No projects match that filter.</p>
            <button
              type="button"
              className="link-arrow mx-auto mt-3"
              onClick={() => {
                setCategoryId("all");
                setQuery("");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : null}

        <Reveal className="md:col-span-2">
          <Card className="p-0">
            <button
              type="button"
              className="flex w-full items-center gap-4 p-6 text-left"
              aria-expanded={archiveOpen}
              aria-controls="archive-panel"
              onClick={() => setArchiveOpen((open) => !open)}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-400">
                <Archive size={17} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold tracking-[-0.02em] text-zinc-50">More Projects / Archive</span>
                <span className="block font-mono text-xs text-zinc-500">
                  {archive.length === 0 ? "slots open" : `${archive.length} more`}
                </span>
              </span>
              <ChevronDown
                size={18}
                aria-hidden="true"
                className={cx("shrink-0 text-zinc-500 transition-transform duration-300", archiveOpen && "rotate-180")}
              />
            </button>
            <div id="archive-panel" hidden={!archiveOpen} className="border-t border-white/[0.08] p-6">
              {archive.length === 0 ? (
                <p className="max-w-[65ch] text-sm leading-relaxed text-zinc-400">
                  Nothing archived yet. Add an entry to{" "}
                  <code className="font-mono text-zinc-200">PROJECTS_DATA</code> with{" "}
                  <code className="font-mono text-zinc-200">featured: false</code> and it shows up here.
                </p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {archive.map((project) => (
                    <li key={project.id}>
                      <ProjectCard project={project} wide />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Experience + resume
 * -------------------------------------------------------------------------- */

function buildResumeText() {
  const R = RESUME;
  const out = [C.name.toUpperCase()];
  out.push([R.location, C.contact.email, C.contact.linkedin.replace("https://www.", "")].filter(Boolean).join(" | "), "");
  out.push("EDUCATION", `${R.education.school} (${R.education.date})`, `${R.education.degree}, ${R.education.minors}`);
  for (const note of R.education.notes) out.push(`- ${note}`);
  const jobs = (title, list) => {
    out.push("", title);
    for (const job of list) {
      out.push(`${job.org}, ${job.place} (${job.period})`, job.role);
      for (const bullet of job.bullets) out.push(`- ${bullet}`);
    }
  };
  jobs("WORK EXPERIENCE", R.experience);
  out.push("", "PROJECTS");
  for (const project of R.projects) {
    out.push(`${project.name} (${project.stack})`);
    for (const bullet of project.bullets) out.push(`- ${bullet}`);
  }
  jobs("LEADERSHIP / ACTIVITIES", R.leadership);
  out.push("", "ADDITIONAL");
  for (const row of R.additional) out.push(`${row.k}: ${row.v}`);
  return out.join("\n");
}

const TIMELINE_ICONS = { work: Briefcase, edu: GraduationCap, lead: Swords };

function Timeline() {
  return (
    <ol className="timeline flex flex-col gap-4">
      {C.timeline.map((item, i) => {
        const Icon = TIMELINE_ICONS[item.kind] ?? Briefcase;
        return (
          <li key={item.id} className="relative pl-12 sm:pl-14">
            <span
              className={cx(
                "absolute left-0 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border bg-[#09090b]",
                item.badge ? "border-emerald-500/40 text-emerald-400" : "border-white/10 text-zinc-400"
              )}
              aria-hidden="true"
            >
              <Icon size={15} />
            </span>
            <Reveal delay={Math.min(i, 3) * 70}>
              <Card className="flex flex-col gap-3 p-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-zinc-50">{item.role}</h3>
                  {item.badge ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] text-emerald-300">
                      <LiveDot /> {item.badge}
                    </span>
                  ) : null}
                  {item.period ? (
                    <span className="font-mono text-xs text-zinc-500 sm:ml-auto">{item.period}</span>
                  ) : null}
                </div>
                <p className="text-sm text-sky-400">{item.org}</p>
                {item.summary ? <p className="max-w-[65ch] leading-relaxed text-zinc-400">{item.summary}</p> : null}
                {item.bullets.length > 0 ? (
                  <ul className="flex max-w-[72ch] flex-col gap-2 text-sm leading-relaxed text-zinc-300">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2.5">
                        <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-zinc-500" aria-hidden="true" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Card>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}

function SheetSection({ title, children }) {
  return (
    <section className="flex flex-col gap-3">
      <h4 className="border-b border-zinc-800 pb-1 text-[12.5px] font-bold uppercase tracking-wide">{title}</h4>
      <div className="flex min-w-0 flex-col gap-3.5">{children}</div>
    </section>
  );
}

function SheetBullets({ items }) {
  return (
    <ul className="list-disc space-y-0.5 pl-5 text-[13px] leading-relaxed text-zinc-800">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function SheetJob({ job }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <p className="text-[13.5px] font-bold">
          {job.org}, <span className="font-normal">{job.place}</span>
        </p>
        <p className="text-[13px]">{job.period}</p>
      </div>
      <p className="text-[13px] italic">{job.role}</p>
      <SheetBullets items={job.bullets} />
    </div>
  );
}

function ResumeSheet({ onDownload, onCopy }) {
  const R = RESUME;
  const linkedin = safeHref(C.contact.linkedin);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        {safeHref(C.contact.resumePdf) ? (
          <button type="button" className="btn btn-primary" onClick={onDownload}>
            <Download size={15} aria-hidden="true" /> Download PDF
          </button>
        ) : null}
        <button type="button" className="btn btn-glass" onClick={onCopy}>
          <Copy size={15} aria-hidden="true" /> Copy as text
        </button>
      </div>

      <article className="sheet flex flex-col gap-5" aria-label="Resume">
        <header className="flex flex-col items-center gap-1.5 text-center">
          <h3 className="text-2xl font-bold uppercase tracking-wide">{C.name}</h3>
          <p className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 text-[13px] text-zinc-800">
            <span>{R.location}</span>
            <span aria-hidden="true">|</span>
            <span className="select-all">{C.contact.email}</span>
            {linkedin ? (
              <>
                <span aria-hidden="true">|</span>
                <ExternalLink href={linkedin} className="underline underline-offset-2">
                  {linkedin.replace("https://www.", "").replace(/\/$/, "")}
                </ExternalLink>
              </>
            ) : null}
          </p>
        </header>

        <SheetSection title="Education">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <p className="text-[13.5px] font-bold">{R.education.school}</p>
              <p className="text-[13px]">{R.education.date}</p>
            </div>
            <p className="text-[13px] italic">
              {R.education.degree}, {R.education.minors}
            </p>
            <SheetBullets items={R.education.notes} />
          </div>
        </SheetSection>

        <SheetSection title="Work Experience">
          {R.experience.map((job) => (
            <SheetJob key={job.id} job={job} />
          ))}
        </SheetSection>

        <SheetSection title="Projects">
          {R.projects.map((project) => (
            <div key={project.name} className="flex flex-col gap-1">
              <p className="text-[13.5px] font-bold">
                {project.name} ({project.stack})
              </p>
              <SheetBullets items={project.bullets} />
            </div>
          ))}
        </SheetSection>

        <SheetSection title="Leadership / Activities">
          {R.leadership.map((job) => (
            <SheetJob key={job.id} job={job} />
          ))}
        </SheetSection>

        <SheetSection title="Additional">
          <dl className="flex flex-col gap-1 text-[13px] leading-relaxed text-zinc-800">
            {R.additional.map((row) => (
              <div key={row.k}>
                <dt className="inline font-bold">{row.k}: </dt>
                <dd className="inline">{row.v}</dd>
              </div>
            ))}
          </dl>
        </SheetSection>
      </article>
    </div>
  );
}

function Experience({ view, setView, onDownload, onCopyResume }) {
  const views = [
    { id: "timeline", label: "Timeline", Icon: List },
    { id: "sheet", label: "Resume", Icon: FileText },
  ];
  return (
    <section id="experience" className="section">
      <div className="print:hidden">
        <SectionHead path="experience" title="Experience &" accent="education" />
      </div>
      <div id="resume" className="flex flex-col gap-6">
        <div className="segmented print:hidden" role="group" aria-label="Choose a view">
          {views.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={view === id}
              onClick={() => setView(id)}
              className={cx("segmented-btn", view === id && "is-active")}
            >
              <Icon size={14} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
        {view === "timeline" ? <Timeline /> : <ResumeSheet onDownload={onDownload} onCopy={onCopyResume} />}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Command palette
 * -------------------------------------------------------------------------- */

function CommandPalette({ open, onClose, items }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const restoreRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => `${item.label} ${item.hint ?? ""} ${item.group}`.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    if (!open) return undefined;
    restoreRef.current = document.activeElement;
    setQuery("");
    setActive(0);
    document.body.classList.add("is-locked");
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      document.body.classList.remove("is-locked");
      if (restoreRef.current instanceof HTMLElement) restoreRef.current.focus();
    };
  }, [open]);

  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [active, results]);

  if (!open) return null;

  const clamped = Math.min(active, Math.max(results.length - 1, 0));

  const run = (item) => {
    onClose();
    // Links are real anchors, so the browser handles navigation itself.
    if (!item.href) item.run?.();
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(results.length ? (clamped + 1) % results.length : 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(results.length ? (clamped - 1 + results.length) % results.length : 0);
    } else if (event.key === "Enter") {
      event.preventDefault();
      listRef.current?.querySelector('[data-active="true"]')?.click();
    } else if (event.key === "Tab") {
      event.preventDefault(); // keep focus inside the dialog
    }
  };

  let lastGroup = null;

  return (
    <div className="palette-overlay print:hidden" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="palette"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-4">
          <Search size={16} className="shrink-0 text-zinc-500" aria-hidden="true" />
          <input
            ref={inputRef}
            id="palette-input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[clamped] ? `cmd-${results[clamped].id}` : undefined}
            aria-label="Type a command or search"
            value={query}
            maxLength={MAX_QUERY_LENGTH}
            onChange={(event) => {
              setQuery(sanitizeQuery(event.target.value));
              setActive(0);
            }}
            placeholder="Type a command or search…"
            autoComplete="off"
            spellCheck="false"
            className="h-14 w-full min-w-0 bg-transparent text-[15px] text-zinc-50 outline-none placeholder:text-zinc-500"
          />
          <kbd className="kbd">esc</kbd>
        </div>

        <div ref={listRef} id="palette-list" role="listbox" aria-label="Commands" className="max-h-[min(22rem,55vh)] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-zinc-500">No commands match “{query}”.</p>
          ) : null}
          {results.map((item, i) => {
            const showGroup = item.group !== lastGroup;
            lastGroup = item.group;
            const isActive = i === clamped;
            const Icon = item.icon;
            const shared = {
              id: `cmd-${item.id}`,
              role: "option",
              "aria-selected": isActive,
              "data-active": isActive,
              tabIndex: -1,
              className: "palette-item",
              onMouseMove: () => setActive(i),
              onClick: () => run(item),
            };
            const body = (
              <>
                <Icon size={15} className="shrink-0 text-zinc-500" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.hint ? <span className="hidden font-mono text-[11px] text-zinc-500 sm:block">{item.hint}</span> : null}
                {item.href ? (
                  <ArrowUpRight size={14} className="shrink-0 text-zinc-600" aria-hidden="true" />
                ) : (
                  <CornerDownLeft size={13} className="palette-enter shrink-0 text-zinc-500" aria-hidden="true" />
                )}
              </>
            );
            return (
              <React.Fragment key={item.id}>
                {showGroup ? <p className="px-3 pb-1.5 pt-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600">{item.group}</p> : null}
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" {...shared}>
                    {body}
                  </a>
                ) : (
                  <button type="button" {...shared}>
                    {body}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex items-center gap-4 border-t border-white/[0.08] px-4 py-2.5 font-mono text-[11px] text-zinc-500">
          <span>
            <kbd className="kbd">↑</kbd> <kbd className="kbd">↓</kbd> move
          </span>
          <span>
            <kbd className="kbd">↵</kbd> run
          </span>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * App
 * -------------------------------------------------------------------------- */

/** Asks before downloading the resume PDF, and says exactly what the file is. */
function DownloadConfirm({ open, onClose, onConfirm }) {
  const confirmRef = useRef(null);
  const cancelRef = useRef(null);
  const restoreRef = useRef(null);
  const href = safeHref(C.contact.resumePdf);

  useEffect(() => {
    if (!open) return undefined;
    restoreRef.current = document.activeElement;
    document.body.classList.add("is-locked");
    const frame = requestAnimationFrame(() => confirmRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      document.body.classList.remove("is-locked");
      if (restoreRef.current instanceof HTMLElement) restoreRef.current.focus();
    };
  }, [open]);

  if (!open || !href) return null;

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "Tab") {
      // Two controls: keep focus cycling between them.
      event.preventDefault();
      const next = document.activeElement === confirmRef.current ? cancelRef.current : confirmRef.current;
      next?.focus();
    }
  };

  return (
    <div className="palette-overlay confirm-overlay print:hidden" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-title"
        aria-describedby="download-desc"
        className="palette confirm"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex flex-col gap-5 p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-sky-400">
              <FileText size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="download-title" className="text-xl font-semibold tracking-[-0.02em] text-zinc-50">
                Download <span className="accent">resume</span>?
              </h2>
              <p id="download-desc" className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                This saves a one-page PDF of {C.name}'s resume to your device.
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-3 rounded-xl border border-white/[0.08] bg-black/25 p-4">
            <div className="col-span-3 min-w-0">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">file</dt>
              <dd className="mt-1 break-all font-mono text-[12.5px] text-zinc-100">Raymond_Yang_Resume.pdf</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">type</dt>
              <dd className="mt-1 font-mono text-[12.5px] text-zinc-100">PDF</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">pages</dt>
              <dd className="mt-1 font-mono text-[12.5px] text-zinc-100">1</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">size</dt>
              <dd className="mt-1 font-mono text-[12.5px] text-zinc-100">44 KB</dd>
            </div>
          </dl>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button ref={cancelRef} type="button" className="btn btn-glass justify-center" onClick={onClose}>
              Cancel
            </button>
            <a
              ref={confirmRef}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              download="Raymond_Yang_Resume.pdf"
              className="btn btn-primary justify-center"
              onClick={onConfirm}
            >
              <Download size={15} aria-hidden="true" /> Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Fixed backdrop: drifting colour glows, a dot grid that lights up under the
 *  cursor, and a slow network of nodes and links drawn on a canvas. */
function Background() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    let frame = 0;
    let x = 0;
    let y = 0;
    const onMove = (event) => {
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        el.style.setProperty("--px", `${x}px`);
        el.style.setProperty("--py", `${y}px`);
        el.classList.add("has-pointer");
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const LINK = 150;
    let width = 0;
    let height = 0;
    let nodes = [];
    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const node of nodes) {
        if (!reduce) {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
        }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK) {
            ctx.strokeStyle = `rgba(129, 160, 255, ${((1 - dist / LINK) * 0.28).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      for (const node of nodes) {
        ctx.fillStyle = node.hot ? "rgba(52, 211, 153, 0.9)" : "rgba(226, 232, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.hot ? 2 : 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(72, Math.max(22, (width * height) / 24000)));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        hot: i % 9 === 0,
      }));
      draw();
    };

    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (!reduce && !document.hidden) raf = requestAnimationFrame(loop);
    };

    resize();
    start();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", start);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  return (
    <div ref={rootRef} className="bg print:hidden" aria-hidden="true">
      <div className="bg-aurora">
        <i />
        <i />
        <i />
      </div>
      <canvas ref={canvasRef} className="bg-net" />
      <div className="bg-dots" />
      <div className="bg-dots bg-dots-hot" />
      <div className="bg-fade" />
    </div>
  );
}

export default function Portfolio() {
  const [view, setView] = useState("timeline");

  // Opening the site at #resume shows the resume sheet straight away.
  useEffect(() => {
    if (window.location.hash === "#resume") setView("sheet");
  }, []);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [shortcut, setShortcut] = useState("Ctrl K");
  const toastTimer = useRef(null);

  const notify = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    const platform = navigator.userAgentData?.platform ?? navigator.platform ?? "";
    if (platform.toLowerCase().includes("mac")) setShortcut("⌘ K");
    return () => clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const scrollToId = useCallback((id) => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // Two frames: let a view switch render before measuring.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      })
    );
  }, []);

  const onNav = useCallback(
    (id) => {
      if (id === "resume") setView("sheet");
      scrollToId(id);
    },
    [scrollToId]
  );

  const onCopyEmail = useCallback(async () => {
    const email = C.contact.email;
    if (!email) {
      notify("No email set yet. Add one in PORTFOLIO_CONFIG.contact.email.");
      return;
    }
    const ok = await copyText(email);
    notify(ok ? `Copied ${email}` : `Copy was blocked. Email: ${email}`);
  }, [notify]);

  const onCopyResume = useCallback(async () => {
    const ok = await copyText(buildResumeText());
    notify(ok ? "Resume copied as plain text" : "Copy was blocked by the browser");
  }, [notify]);

  const openDownload = useCallback(() => setDownloadOpen(true), []);

  const paletteItems = useMemo(() => {
    const github = safeHref(C.contact.github);
    const linkedin = safeHref(C.contact.linkedin);
    const resumePdf = safeHref(C.contact.resumePdf);
    return [
      ...C.nav.map((item) => ({
        id: `nav-${item.id}`,
        group: "Go to",
        label: item.label,
        hint: `#${item.id}`,
        icon: Hash,
        run: () => onNav(item.id),
      })),
      { id: "copy-email", group: "Actions", label: "Copy email address", icon: Copy, run: onCopyEmail },
      { id: "copy-resume", group: "Actions", label: "Copy resume as text", icon: FileText, run: onCopyResume },
      github && { id: "github", group: "Links", label: "GitHub", hint: github.replace("https://", ""), icon: Github, href: github },
      resumePdf && { id: "resume-pdf", group: "Actions", label: "Download resume (PDF)", icon: Download, run: openDownload },
      linkedin && { id: "linkedin", group: "Links", label: "LinkedIn", hint: linkedin.replace("https://", ""), icon: Linkedin, href: linkedin },
    ].filter(Boolean);
  }, [onNav, onCopyEmail, onCopyResume, openDownload]);

  return (
    <div className="page">
      <Background />
      <div className="shell">
        <Header onNav={onNav} onOpenPalette={() => setPaletteOpen(true)} shortcut={shortcut} />
        <main>
          <Hero onNav={onNav} onCopyEmail={onCopyEmail} />
          <About />
          <Current />
          <Projects />
          <Experience view={view} setView={setView} onDownload={openDownload} onCopyResume={onCopyResume} />
        </main>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] py-8 font-mono text-xs text-zinc-500 print:hidden">
          <p>
            © {new Date().getFullYear()} {C.name}
          </p>
          <p>no trackers · no cookies · static by design</p>
        </footer>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={paletteItems} />
      <DownloadConfirm
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        onConfirm={() => {
          setDownloadOpen(false);
          notify("Download started: Raymond_Yang_Resume.pdf");
        }}
      />

      <div className="toast-region print:hidden" role="status" aria-live="polite">
        {toast ? (
          <div key={toast.id} className="toast">
            <Check size={14} className="shrink-0 text-emerald-400" aria-hidden="true" />
            <span>{toast.message}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
