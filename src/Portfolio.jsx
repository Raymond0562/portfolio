/* ============================================================================
 * Raymond Yang — portfolio
 * React 18 + Tailwind CSS + lucide-react, built with Vite. One page, one file.
 *
 * HOW THIS FILE IS LAID OUT (top to bottom)
 *   1. Content      RESUME, PORTFOLIO_CONFIG, PROJECTS_DATA and the small data
 *                   tables the project drawings use. Plain objects, no logic.
 *   2. Security     safeHref / displayUrl / sanitizeQuery / copyText.
 *   3. Primitives   ExternalLink, Reveal, Card, Pill, SectionHead, LiveDot.
 *   4. Sections     Header, Hero (+ terminal), About (+ LiveClock), Current,
 *                   project drawings, Projects, Experience (timeline + resume
 *                   sheet), CommandPalette, DownloadConfirm.
 *   5. Backdrop     CONSTELLATIONS data, its projection, and Background.
 *   6. Portfolio    The root component. It owns the only shared state (which
 *                   experience view is showing, which dialog is open, the
 *                   toast) and hands stable callbacks down.
 *
 * HOW TO UPDATE CONTENT
 * Search for "[EDIT HERE]". Every anchor sits on the object to change:
 *   - Availability badge ........ PORTFOLIO_CONFIG.status (and the two matching
 *                                 lines in PORTFOLIO_CONFIG.terminal)
 *   - Current project ........... PORTFOLIO_CONFIG.current
 *   - Projects .................. PROJECTS_DATA (featured: true = listed first;
 *                                 the grid shows 6, the rest sit behind
 *                                 "More Projects / Archive")
 *   - Experience timeline ....... PORTFOLIO_CONFIG.timeline
 *   - Resume sheet .............. RESUME, then run `npm run resume-pdf` so the
 *                                 downloadable PDF matches
 * Nothing outside those objects needs to change to update what the page says.
 *
 * HOW THE PIECES CONNECT
 * Portfolio renders Background, Header, the five sections and a footer. The
 * sections read content straight from the module-level config, so they take
 * almost no props, and each is wrapped in memo(): opening the palette or
 * showing a toast re-renders Portfolio but none of the sections under it.
 * Anything that changes many times a second (the clock, card spotlights, the
 * constellation canvas, the packet animation) is kept out of React state and
 * written to the DOM directly. See LiveClock, Card and Background for why.
 * The two dialogs are only mounted while open.
 *
 * This file is also rendered once in Node as a build-time smoke test
 * (build.mjs), so nothing may touch `window` or `document` during render.
 * Browser-only reads go in effects or behind IN_BROWSER.
 *
 * SECURITY INVARIANTS (do not weaken; see section 2 for the details)
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

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowRight,
  ArrowUpDown,
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

/* [EDIT HERE] Resume content.
 * The resume, transcribed from raymond_yang_resume.pdf. The Resume Sheet view
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

/** Looks up a resume job by id so the timeline reuses its wording instead of
 *  keeping a second copy. Throws at load time if the id is misspelled, which
 *  is the point: a broken link between the two lists should not ship. */
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

  // [EDIT HERE] Work availability. Shown in the badge above the name. The
  // terminal below repeats both lines (the two `ok` rows); change them together.
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
  // [EDIT HERE] The two `ok` lines mirror `status` above.
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
    // c = course, n = title, cr = credit hours, h = honors section.
    terms: [
      {
        t: "Fall 24",
        full: "Fall 2024",
        hours: 13,
        gpa: "4.00",
        courses: [
          { c: "MATH 151", n: "Engineering Mathematics I", cr: 4 },
          { c: "CHEM 107", n: "General Chemistry for Engineers", cr: 3 },
          { c: "CHEM 117", n: "General Chemistry for Engineers Lab", cr: 1 },
          { c: "ENGR 102", n: "Engineering Lab I: Computation", cr: 2 },
          { c: "ANTH 205", n: "Peoples and Cultures of the World", cr: 3 },
          { c: "FYEX 101", n: "Hullabaloo U", cr: 0 },
        ],
      },
      {
        t: "Spr 25",
        full: "Spring 2025",
        hours: 12,
        gpa: "4.00",
        courses: [
          { c: "CSCE 120", n: "Program Design & Concepts", cr: 3 },
          { c: "MATH 152", n: "Engineering Mathematics II", cr: 4 },
          { c: "PHYS 206", n: "Newtonian Mechanics for Engineering & Science", cr: 3 },
          { c: "PHYS 216", n: "Experimental Physics & Engineering Lab II: Mechanics", cr: 2 },
        ],
      },
      {
        t: "Fall 25",
        full: "Fall 2025",
        hours: 16,
        gpa: "4.00",
        courses: [
          { c: "ECEN 248", n: "Introduction to Digital Systems Design", cr: 4 },
          { c: "CSCE 222", n: "Discrete Structures for Computing", cr: 3, h: true },
          { c: "MATH 251", n: "Engineering Mathematics III", cr: 3 },
          { c: "STAT 211", n: "Principles of Statistics I", cr: 3 },
          { c: "PHYS 217", n: "Experimental Physics & Engineering Lab III: E&M", cr: 2, h: true },
          { c: "ENGR 181", n: "Engineering Honors Seminar I", cr: 1, h: true },
        ],
      },
      {
        t: "Spr 26",
        full: "Spring 2026",
        hours: 15,
        gpa: "4.00",
        courses: [
          { c: "CSCE 221", n: "Data Structures & Algorithms", cr: 4 },
          { c: "ECEN 214", n: "Electrical Circuit Theory", cr: 4, h: true },
          { c: "MATH 308", n: "Differential Equations", cr: 3, h: true },
          { c: "MATH 311", n: "Topics in Applied Mathematics I", cr: 3 },
          { c: "CSCE 481", n: "Seminar", cr: 1 },
        ],
      },
      {
        t: "Fall 26",
        full: "Fall 2026",
        hours: 14,
        now: true,
        courses: [
          { c: "CSCE 313", n: "Introduction to Computer Systems", cr: 4, h: true },
          { c: "ECEN 350", n: "Computer Architecture & Design", cr: 4, h: true },
          { c: "ECEN 314", n: "Signals & Systems", cr: 3 },
          { c: "MUSC 327", n: "Popular Music in the African Diaspora", cr: 3 },
        ],
      },
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

  // [EDIT HERE] The "What I'm building right now" card. Replace the whole
  // object when the primary project changes; `repo` may stay "" while private.
  current: {
    name: "EasyVote",
    tagline: "Local AI Nonpartisan Voting & Civic Assistant",
    status: "Active Development",
    overview:
      "An open-source, privacy-first local AI voting assistant designed to run on personal hardware using small language models (SLMs) via Ollama, RAG, and nonpartisan civic data APIs (Congress.gov, Open States, OpenFEC) to deliver unbiased candidate and ballot information with zero cloud dependency.",
    tags: ["Rust", "RAG Retrieval", "SQLite FTS5", "Signed Evidence Packs", "Privacy-First"],
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

  // Project categories: the filter buttons and each card's coloured label.
  // A project's `category` must be one of these ids.
  categories: [
    { id: "security", label: "Cybersecurity & Networking", tone: "cyan" },
    { id: "ml", label: "Machine Learning & Data", tone: "indigo" },
    { id: "systems", label: "Algorithms & Systems", tone: "zinc" },
    { id: "embedded", label: "Embedded & Hardware", tone: "emerald" },
  ],

  // [EDIT HERE] Experience timeline. Add an entry anywhere in the list; it is
  // sorted by `start`. `kind` picks the icon (work | edu | lead) and `badge`
  // adds the green pill. Reuse resume wording with resumeJob(id) where it fits.
  // `start` (YYYY-MM) is only used to sort; `period` is what is shown.
  timeline: [
    {
      id: "collins",
      start: "2027-01",
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
      start: "2026-02",
      kind: "work",
      org: "Texas A&M Global Cyber Research Institute (GCRI)",
      role: resumeJob("gcri").role,
      period: "Feb 2026 – Present",
      summary: "NASA USRC drone cybersecurity research: hardware, attestation, segmentation, and red teaming.",
      bullets: resumeJob("gcri").bullets,
    },
    {
      id: "tamu",
      start: "2024-08",
      kind: "edu",
      org: "Texas A&M University",
      role: "B.S. in Computer Engineering",
      period: "Aug 2024 – Expected May 2028",
      summary:
        "Started attending in August 2024. Minors in Mathematics and Cybersecurity. Craig & Galen Brown Engineering Honors Program, GPA 4.00 / 4.00, Dean's Honor Roll.",
      bullets: [],
    },
    {
      id: "bjj",
      start: "2025-01",
      kind: "lead",
      org: resumeJob("bjj").org,
      role: resumeJob("bjj").role,
      period: "Jan 2025 – Present",
      summary: "",
      bullets: resumeJob("bjj").bullets,
    },
    {
      id: "nitro",
      start: "2024-02",
      kind: "work",
      org: "Nitro Swimming · Austin, TX",
      role: resumeJob("nitro").role,
      period: "Feb 2024 – Aug 2025",
      summary: "",
      bullets: resumeJob("nitro").bullets,
    },
  ],
};

/* [EDIT HERE] Add, remove or reorder projects.
 * Central project list. Each category tab shows every project in that
 * category. `featured: true` projects are listed first, so they fill the
 * first PROJECTS_INITIAL slots; the rest are revealed PROJECTS_STEP at a time
 * by the "More Projects / Archive" card.
 * Shape: { id, name, code?, org?, category, description, tags, repo?,
 *          visual?, featured }
 * `visual` picks the drawing at the top of the card (see PROJECT_VISUALS). */
export const PROJECTS_DATA = [
  {
    id: "world-cup",
    name: "World Cup Predictor",
    category: "ml",
    visual: "odds",
    description:
      "End-to-end ML pipeline trained on 49,500+ international matches. It benchmarks Logistic Regression, Random Forest, XGBoost, and LightGBM with isotonic-calibrated probabilities and a leakage-free chronological split, then runs 10,000-iteration Monte Carlo simulations of the 2026 FIFA World Cup. 60.8% test accuracy, deployed with Streamlit.",
    tags: ["Python", "scikit-learn", "Monte Carlo Simulation", "Streamlit", "Sports Analytics"],
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
    tags: ["VLAN", "Network Segmentation", "Network Access Control", "hostapd", "iptables"],
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
    tags: ["Red Teaming", "MITM", "ARP Spoofing", "Scapy", "MAVLink"],
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
    id: "wiki-search",
    name: "Wikipedia Word Search",
    category: "systems",
    visual: "throughput",
    description:
      "High-performance multithreaded keyword search over Wikipedia dumps. A reader streams the file in 1 to 16 MB blocks to search threads, scanning an 8.6 GB dump at about 2,100 MB/s for one keyword and 700 MB/s for 151 keywords at once.",
    tags: ["C++", "Multithreading", "Win32 API", "String Search"],
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

/* Everything a visitor can type, and every URL the page links to, goes
 * through one of the helpers below. They are deliberately allowlists: the
 * question each asks is "is this one of the few things we accept?", never
 * "does this look dangerous?", because blocklists are what get bypassed
 * (OWASP XSS Prevention and Unvalidated Redirects cheat sheets). The limits
 * are constants up here so they are allocated once and easy to audit. */
const ALLOWED_PROTOCOLS = ["https:", "mailto:"];
const MAX_URL_LENGTH = 2048;
const MAX_QUERY_LENGTH = 64;

/**
 * The single gate every link target passes through (OWASP: validate URLs
 * against an allowlist of schemes).
 *
 * Invariants:
 *  - Only `https:` and `mailto:` are accepted, decided by the URL parser's own
 *    `protocol` field. Checking the string prefix instead would let through
 *    spellings such as "JaVaScRiPt:" or "java\tscript:" that browsers still run.
 *  - Same-page anchors are accepted only as `#` plus letters, digits, `-` or
 *    `_`, checked one character at a time (no RegExp).
 *  - Relative URLs, `http:`, `javascript:`, `data:`, `blob:`, over-long input
 *    and non-strings all return null.
 *
 * @param {unknown} raw Candidate URL, usually from the config objects.
 * @returns {string|null} The normalised URL, or null. Callers must not render
 *   an href when this returns null (ExternalLink falls back to plain text).
 */
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

/**
 * Shortens a URL for display: "https://www.site.com/x/" -> "site.com/x".
 * It validates first, so text shown as a link can never differ from a target
 * that safeHref would refuse.
 * @param {unknown} raw
 * @returns {string} Display text, or "" if the URL is not allowed.
 */
export function displayUrl(raw) {
  let value = safeHref(raw) ?? "";
  for (const prefix of ["https://", "mailto:", "www."]) {
    if (value.startsWith(prefix)) value = value.slice(prefix.length);
  }
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

/**
 * Cleans text typed into the project search and the command palette (OWASP
 * input validation: bound the length, drop characters with no legitimate use).
 *
 * Invariants:
 *  - Output is at most `max` characters, so no later step can be made slow by
 *    a huge paste.
 *  - Control characters (below U+0020, and DEL) are removed.
 *  - The result is only ever used with String.includes and rendered through
 *    JSX. It is never turned into a RegExp, HTML, or a URL, so there is no
 *    injection or ReDoS path from it.
 *
 * @param {unknown} raw
 * @param {number} [max=MAX_QUERY_LENGTH]
 * @returns {string}
 */
export function sanitizeQuery(raw, max = MAX_QUERY_LENGTH) {
  const text = String(raw ?? "").slice(0, max);
  let out = "";
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code >= 32 && code !== 127) out += ch;
  }
  return out;
}

/**
 * Copies text to the clipboard. Tries the async Clipboard API first and falls
 * back to a hidden textarea + execCommand for browsers or contexts that block
 * it. The textarea is hidden with a class, not an inline style, to stay inside
 * the `style-src 'self'` policy.
 * @param {string} text
 * @returns {Promise<boolean>} Whether the copy succeeded. Never throws.
 */
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

/* Everything below this line is module-level on purpose. Config, lookup
 * tables and derived lists are built once when the file loads; a component
 * that built them in its body would allocate them again on every render and
 * hand children a "new" prop each time, defeating memo(). */
const C = PORTFOLIO_CONFIG;
/** Joins class names, skipping falsy ones: cx("a", open && "b"). */
const cx = (...parts) => parts.filter(Boolean).join(" ");

/** False during the Node smoke render in build.mjs, where window is missing. */
const IN_BROWSER = typeof window !== "undefined";
/** Category id -> category, so cards do not scan the list on every render. */
const CATEGORY_BY_ID = new Map(C.categories.map((category) => [category.id, category]));

const TONE_TEXT = { cyan: "text-sky-400", indigo: "text-indigo-400", zinc: "text-zinc-300", emerald: "text-emerald-400" };
const TONE_DOT = { cyan: "bg-sky-400", indigo: "bg-indigo-500", zinc: "bg-zinc-400", emerald: "bg-emerald-500" };

/**
 * A link that leaves the site.
 *
 * Always opens in a new tab with rel="noopener noreferrer", so the opened page
 * gets no `window.opener` handle back to this one (reverse tabnabbing) and no
 * referrer. If the href fails safeHref the children render as plain text, so
 * a bad URL in the config degrades to a label instead of a dangerous link.
 *
 * @param {{href: string, className?: string, children: React.ReactNode}} props
 *   Extra props are passed to the anchor.
 */
function ExternalLink({ href, className, children, ...rest }) {
  const safe = safeHref(href);
  if (!safe) return <span className={className}>{children}</span>;
  return (
    <a href={safe} target="_blank" rel="noopener noreferrer" className={className} {...rest}>
      {children}
    </a>
  );
}

/**
 * Fades its children up the first time they scroll into view.
 *
 * Uses one IntersectionObserver per instance and disconnects it after firing,
 * so nothing listens to scroll. The animation is a CSS transition on opacity
 * and transform only, which the compositor runs without layout. The stagger
 * delay is written through the CSSOM because inline style attributes are
 * blocked by the CSP.
 *
 * @param {{delay?: number, className?: string, children: React.ReactNode}} props
 *   `delay` is in milliseconds.
 */
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

/**
 * The standard surface, with a spotlight that follows the mouse across its
 * fill and border.
 *
 * Why no state: the pointer position changes on every mouse event. Holding it
 * in useState would re-render the card and everything inside it (a project
 * drawing, a whole section) up to 60 or more times a second. Instead the
 * handler writes two CSS custom properties, --mx and --my, straight onto the
 * element; the gradients in `.card::before` / `.card::after` read them. React
 * never hears about the move, so the render cost is zero.
 *
 * Why requestAnimationFrame: a mouse can report faster than the screen draws.
 * The handler only records the latest position; one callback per frame reads
 * the card's box and writes the properties, so there is at most one layout
 * read per frame however fast events arrive.
 *
 * @param {{className?: string, children: React.ReactNode}} props
 */
function Card({ className, children }) {
  const ref = useRef(null);
  const frame = useRef(0);
  const point = useRef({ x: 0, y: 0 });
  const onMove = useCallback((event) => {
    point.current.x = event.clientX;
    point.current.y = event.clientY;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${point.current.x - rect.left}px`);
      el.style.setProperty("--my", `${point.current.y - rect.top}px`);
    });
  }, []);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  return (
    <div ref={ref} onMouseMove={onMove} className={cx("card", className)}>
      {children}
    </div>
  );
}

/**
 * Small monospace tag.
 * @param {{children: React.ReactNode, tone?: "cyan"|"indigo"|"zinc"|"emerald"}} props
 */
function Pill({ children, tone }) {
  return <span className={cx("pill", tone && TONE_TEXT[tone])}>{children}</span>;
}

/**
 * Section heading: a "~/path" eyebrow, the title with an optional serif
 * accent, and an optional one-line blurb.
 * @param {{path: string, title: string, accent?: string, blurb?: string, className?: string}} props
 */
function SectionHead({ path, title, accent, blurb, className }) {
  return (
    <Reveal className={cx("mb-8 flex flex-col gap-3", className)}>
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

/** Pulsing green dot used on "live" badges. Pure CSS; the pulse animates transform and opacity only. */
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

/**
 * Floating pill navigation.
 *
 * Wrapped in memo with stable props, so it does not re-render when a dialog
 * opens or a toast shows.
 *
 * @param {{onNav: (id: string) => void, onOpenPalette: () => void, shortcut: string}} props
 *   `onNav` scrolls to a section id; `shortcut` is the key hint ("Ctrl K" or "⌘ K").
 */
const Header = memo(function Header({ onNav, onOpenPalette, shortcut }) {
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
          className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-50 font-mono text-[11px] font-bold text-zinc-950"
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
          {/* Inside the scrolling list, so on a narrow screen only the RY
              button stays pinned and everything else scrolls past it. */}
          <li className="ml-1 shrink-0">
            <button type="button" onClick={onOpenPalette} className="kbd-btn" aria-label="Open command palette">
              <Search size={13} aria-hidden="true" />
              <kbd className="hidden font-mono text-[11px] sm:inline">{shortcut}</kbd>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
});

/* ----------------------------------------------------------------------------
 * Hero + terminal
 * -------------------------------------------------------------------------- */

/**
 * One line of the hero terminal.
 * @param {{line: {t: string, v: string, k?: string}, sep?: string}} props
 *   `t` is the line type: cmd | ok | kv | sec | comment, anything else is plain output.
 */
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

/** Renders PORTFOLIO_CONFIG.stack as highlighted JSON, so the terminal's stack.json tab can never drift from the About section. */
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

/**
 * Read-only terminal with tabs. Its body has a minimum height so switching
 * tabs, or the first paint, cannot move the content below it (no layout shift).
 */
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

/**
 * Top of the page: availability badge, name and headline, the two calls to
 * action, contact links, and the terminal.
 * @param {{onNav: (id: string) => void, onCopyEmail: () => void}} props
 */
const Hero = memo(function Hero({ onNav, onCopyEmail }) {
  return (
    <section id="top" className="grid grid-cols-1 items-center gap-10 pb-20 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:pt-20 print:hidden">
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
});

/* ----------------------------------------------------------------------------
 * About — bento
 * -------------------------------------------------------------------------- */

/**
 * The current time in a given zone, re-evaluated once a second.
 *
 * The interval is stopped while the tab is hidden (Page Visibility API) and
 * the time is refreshed immediately on return, so a background tab does no
 * work and never shows a stale time. The two Intl formatters are created once
 * per time zone; constructing them is far more expensive than using them.
 *
 * @param {string} timeZone IANA zone, e.g. "America/Chicago".
 * @returns {{hm: string, ss: string, zone: string, date: string}}
 */
function useClock(timeZone) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let timer = 0;
    const tick = () => setNow(Date.now());
    const sync = () => {
      clearInterval(timer);
      if (document.hidden) return;
      tick(); // catch up straight away when the tab comes back
      timer = setInterval(tick, 1000);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  const formats = useMemo(
    () => ({
      time: new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
        timeZoneName: "short",
      }),
      date: new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", month: "short", day: "numeric" }),
    }),
    [timeZone]
  );
  return useMemo(() => {
    const parts = formats.time.formatToParts(now);
    const pick = (type) => parts.find((part) => part.type === type)?.value ?? "";
    return {
      hm: `${pick("hour")}:${pick("minute")}`,
      ss: pick("second"),
      zone: pick("timeZoneName"), // CST in winter, CDT in summer
      date: formats.date.format(now),
    };
  }, [now, formats]);
}

/**
 * The ticking clock in the Location card.
 *
 * It exists as its own leaf component for one reason: the once-a-second state
 * update lives here and nowhere else. When the clock was read inside About,
 * every tick re-rendered the whole About section (biography, education chart,
 * coursework, stack, hobbies). Now a tick re-renders two paragraphs.
 *
 * @param {{timeZone: string}} props
 */
const LiveClock = memo(function LiveClock({ timeZone }) {
  const clock = useClock(timeZone);
  return (
    <div>
      <p className="font-mono text-5xl font-medium tracking-[-0.04em] text-zinc-50 tabular-nums">
        {clock.hm}
        <span className="text-2xl text-zinc-500">:{clock.ss}</span>
      </p>
      <p className="mt-2 font-mono text-xs text-zinc-500">
        {clock.date} · <span className="text-sky-400">{clock.zone}</span>
      </p>
    </div>
  );
});

/**
 * An animated bar. Its length is written through the CSSOM (no style
 * attribute, so it is CSP-safe) and eased by a CSS transition.
 *
 * Vertical bars are laid out at full height inside a clipping track and slid
 * into view with a transform, which the compositor animates without layout.
 * Horizontal bars animate their width: the odds chart retargets them every
 * 450ms, and the width transition is what gives it its continuous glide.
 * There are only six of them and they pause off screen, so the layout cost
 * is small.
 *
 * @param {{pct: number, axis?: "width"|"height", className?: string, trackClassName?: string, title?: string}} props
 *   `pct` is 0-100 and is clamped. `className` styles the bar; `trackClassName`
 *   sizes the track of a vertical bar.
 */
function Fill({ pct, axis = "width", className, trackClassName, title }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const value = Math.max(0, Math.min(100, pct));
    if (axis === "height") ref.current.style.transform = `translateY(${100 - value}%)`;
    else ref.current.style.width = `${value}%`;
  }, [pct, axis]);
  const bar = <span ref={ref} className={className} title={title} />;
  return axis === "height" ? <span className={cx("fill-v", trackClassName)}>{bar}</span> : bar;
}

/** `icon` key on an interest -> its icon. */
const INTEREST_ICONS = { bjj: Swords, lego: Blocks, read: BookOpen, hike: Mountain };

/**
 * About section: biography, location and clock, education with the per-term
 * credit chart, coursework, technical stack and interests.
 *
 * The only state is which term's class list is open. The clock ticks inside
 * LiveClock, so this large tree renders only on that click.
 */
const About = memo(function About() {
  const edu = C.education;
  const [openTerm, setOpenTerm] = useState(null);
  const activeTerm = edu.terms.find((term) => term.t === openTerm) ?? null;
  const maxHours = Math.max(...edu.terms.map((term) => term.hours));
  return (
    <section id="about" className="section print:hidden">
      <SectionHead path="about" title="Defense, offense, and" accent="the hardware underneath" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
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
            <LiveClock timeZone={C.location.timeZone} />
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
                <span className="kv-key">GPA / 4.00</span>
              </p>
            </div>

            <div>
              <p className="mb-3 font-mono text-[11px] text-zinc-500">credit hours by term, every graded term at 4.00 · select a term to see its classes</p>
              <ol className="grid grid-cols-5 gap-1">
                {edu.terms.map((term) => {
                  const isOpen = term.t === openTerm;
                  return (
                    <li key={term.t}>
                      <button
                        type="button"
                        className={cx("term-btn", isOpen && "is-open")}
                        aria-expanded={isOpen}
                        aria-controls="term-classes"
                        aria-label={`${term.full}: ${term.hours} credit hours${term.now ? ", in progress" : `, GPA ${term.gpa}`}. Show classes.`}
                        onClick={() => setOpenTerm(isOpen ? null : term.t)}
                      >
                        <span className="flex h-20 items-end">
                          <Fill
                            axis="height"
                            pct={(term.hours / maxHours) * 100}
                            className={cx("term-bar", term.now && "is-now")}
                          />
                        </span>
                        <span className="font-mono text-[11px] text-zinc-200 tabular-nums">{term.hours} h</span>
                        <span className="font-mono text-[10px] text-zinc-500">{term.t}</span>
                        <span className={cx("font-mono text-[10px]", term.now ? "text-emerald-400" : "text-zinc-400")}>
                          {term.now ? "in progress" : term.gpa}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              <div id="term-classes" aria-live="polite">
                {activeTerm ? (
                  <div key={activeTerm.t} className="term-panel">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <p className="font-semibold tracking-[-0.01em] text-zinc-50">{activeTerm.full}</p>
                      <p className="font-mono text-[11px] text-zinc-500">
                        {activeTerm.hours} credit hours ·{" "}
                        <span className={activeTerm.now ? "text-emerald-400" : "text-zinc-300"}>
                          {activeTerm.now ? "in progress" : `GPA ${activeTerm.gpa}`}
                        </span>
                      </p>
                    </div>
                    <ul className="mt-2 flex flex-col">
                      {activeTerm.courses.map((course) => (
                        <li key={course.c} className="course-row">
                          <span className="w-[4.6rem] shrink-0 font-mono text-[11.5px] text-sky-400">{course.c}</span>
                          <span className="min-w-0 flex-1 text-[13.5px] text-zinc-300">{course.n}</span>
                          {course.h ? <span className="course-h">H</span> : null}
                          <span className="w-8 shrink-0 text-right font-mono text-[11px] text-zinc-500 tabular-nums">
                            {course.cr} h
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
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
              <div key={group.id} className="grid grid-cols-1 gap-2.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
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
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                      <span className="kv-key">{item.meta.k}</span>
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
});

/* ----------------------------------------------------------------------------
 * Current build
 * -------------------------------------------------------------------------- */

/** "What I'm building right now": the PORTFOLIO_CONFIG.current card. Static, so memo means it renders once. */
const Current = memo(function Current() {
  const cur = C.current;
  return (
    <section id="current" className="section print:hidden">
      <SectionHead path="now" title="What I'm building" accent="right now" />
      <Reveal>
        <Card className="current-card grid grid-cols-1 overflow-hidden lg:grid-cols-[1.25fr_1fr]">
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
              <ol className="flex flex-col gap-1.5 font-mono text-[12.5px]">
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
                  <dt className="kv-key">{fact.k}</dt>
                  <dd className="mt-1 font-mono text-[12.5px] text-zinc-50">{fact.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Card>
      </Reveal>
    </section>
  );
});

/* ----------------------------------------------------------------------------
 * Project visuals — one small drawing per featured project
 * -------------------------------------------------------------------------- */

/** Caption line under a project drawing. */
function VizCaption({ children }) {
  return <p className="font-mono text-[10.5px] text-zinc-500">{children}</p>;
}

/**
 * Reports whether an element is in the viewport.
 * Used to pause animations nobody can see.
 * @param {Element|null} el
 * @param {(onScreen: boolean) => void} onChange
 * @returns {() => void} Stops watching.
 */
function watchOnScreen(el, onChange) {
  if (!el || !("IntersectionObserver" in window)) return () => {};
  const io = new IntersectionObserver((entries) => onChange(entries[entries.length - 1].isIntersecting));
  io.observe(el);
  return () => io.disconnect();
}

/**
 * A counter that advances 0..count-1 on a timer and wraps; the clock behind
 * most project drawings.
 *
 * It does not advance while the drawing is off screen or the tab is hidden,
 * so the cards below the fold cost nothing until they are scrolled to.
 *
 * @param {number} count Number of steps in the loop.
 * @param {number} ms Milliseconds per step.
 * @param {React.RefObject<Element>} ref The drawing's root, watched for visibility.
 * @returns {number} The current step.
 */
function useStep(count, ms, ref) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    let visible = true;
    const unwatch = watchOnScreen(ref.current, (onScreen) => {
      visible = onScreen;
    });
    const timer = setInterval(() => {
      if (visible && !document.hidden) setStep((current) => (current + 1) % count);
    }, ms);
    return () => {
      clearInterval(timer);
      unwatch();
    };
  }, [count, ms, ref]);
  return step;
}

/** World Cup drawing: champion odds settling as the simulated run count grows. */
function OddsVisual() {
  const ref = useRef(null);
  const RAMP = 14;
  const step = useStep(RAMP + 9, 450, ref);
  const progress = Math.min(1, step / RAMP);
  const runs = Math.max(100, Math.round((10000 * progress * progress) / 100) * 100);
  const max = 22;
  return (
    <div ref={ref} className="flex w-full flex-col gap-2.5">
      <VizCaption>
        simulated 2026 champion odds · run{" "}
        <span className="text-zinc-200 tabular-nums">{runs.toLocaleString("en-US")}</span> / 10,000
      </VizCaption>
      <ul className="flex flex-col gap-1.5">
        {WORLD_CUP_ODDS.map((row, i) => {
          // Early runs are noisy; the estimate settles as the run count grows.
          const wobble = Math.sin((i + 1) * (step + 1) * 1.7) * 4.5 * (1 - progress);
          const p = Math.max(0.5, Math.min(max, row.p + wobble));
          return (
            <li key={row.team} className="grid grid-cols-[5.5rem_1fr_2.75rem] items-center gap-2 text-[11.5px]">
              <span className="truncate text-zinc-300">{row.team}</span>
              <span className="flex h-2 items-center">
                <Fill pct={(p / max) * 100} title={`${row.team}: ${row.p}% to win`} className="bar-h" />
              </span>
              <span className="text-right font-mono text-zinc-300 tabular-nums">{p.toFixed(1)}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Word-search drawing: search speed against the number of keywords searched at once. */
function ThroughputVisual() {
  const ref = useRef(null);
  const step = useStep(SEARCH_THROUGHPUT.length, 1100, ref);
  const max = 2200;
  return (
    <div ref={ref} className="flex w-full flex-col gap-2.5">
      <VizCaption>search speed (MB/s) as the keyword list grows</VizCaption>
      <ol className="grid grid-cols-9 gap-1.5">
        {SEARCH_THROUGHPUT.map((point, i) => (
          <li key={point.x} className="flex flex-col items-center gap-1">
            <span className="h-3.5 font-mono text-[10px] text-zinc-100 tabular-nums">
              {i === step ? point.mbps.toLocaleString("en-US") : ""}
            </span>
            <span className="flex h-16 w-full items-end justify-center">
              <Fill
                axis="height"
                pct={(point.mbps / max) * 100}
                title={`${point.x} keyword${point.x === 1 ? "" : "s"}: ${point.mbps.toLocaleString("en-US")} MB/s`}
                className={cx("bar-v", i !== step && "is-dim")}
                trackClassName="w-[70%] max-w-[22px]"
              />
            </span>
            <span className={cx("font-mono text-[10px] tabular-nums", i === step ? "text-zinc-100" : "text-zinc-500")}>
              {point.x}
            </span>
          </li>
        ))}
      </ol>
      <p className="text-center font-mono text-[10px] text-zinc-600">keywords searched at once</p>
    </div>
  );
}

const VLAN_DEVICES = [
  { name: "drone-07", ok: true, cell: 23, vlan: 124 },
  { name: "unknown-3f", ok: false },
  { name: "drone-12", ok: true, cell: 57, vlan: 158 },
  { name: "drone-03", ok: true, cell: 88, vlan: 189 },
];
const VLAN_BASE = [3, 17, 41, 66, 79];
// The 100 cells never change, so the list is built once, not per animation step.
const VLAN_CELLS = Array.from({ length: 100 }, (_, i) => i);

/** VLAN drawing: devices join, are quarantined, attest, and are promoted into the trusted pool or left out. */
function VlanVisual() {
  const ref = useRef(null);
  const PHASES = 4; // join, quarantine, attest, verdict
  const step = useStep(VLAN_DEVICES.length * PHASES, 1050, ref);
  const index = Math.floor(step / PHASES);
  const phase = step % PHASES;
  const device = VLAN_DEVICES[index];
  const lit = new Set(VLAN_BASE);
  VLAN_DEVICES.forEach((d, i) => {
    if (d.ok && (i < index || (i === index && phase === 3))) lit.add(d.cell);
  });
  const fresh = device.ok && phase === 3 ? device.cell : -1;
  const denied = phase === 3 && !device.ok;
  const status = [
    `${device.name} joins the network`,
    "held in the quarantine VLAN",
    "TPM attestation in progress…",
    device.ok ? `verified → trusted VLAN ${device.vlan}` : "attestation failed → stays quarantined",
  ][phase];
  return (
    <div ref={ref} className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 font-mono text-[11px]">
        <span className={cx("viz-chip text-zinc-400", phase === 0 && "is-active")}>new device</span>
        <ArrowRight size={12} className="text-zinc-600" aria-hidden="true" />
        <span className={cx("viz-chip viz-chip-warn", (phase === 1 || denied) && "is-active")}>quarantine</span>
        <ArrowRight size={12} className="text-zinc-600" aria-hidden="true" />
        <span className={cx("viz-chip text-sky-300", phase === 2 && "is-active")}>attest</span>
        <ArrowRight size={12} className="text-zinc-600" aria-hidden="true" />
        <span className={cx("viz-chip viz-chip-ok", phase === 3 && device.ok && "is-active")}>trusted VLAN</span>
      </div>
      <p className="viz-status">
        <span className={denied ? "text-rose-300" : phase === 3 ? "text-emerald-300" : "text-zinc-200"}>▸ {status}</span>
      </p>
      <div className="vlan-grid" aria-hidden="true">
        {VLAN_CELLS.map((i) => (
          <span key={i} className={cx(lit.has(i) && "is-lit", i === fresh && "is-fresh")} />
        ))}
      </div>
      <VizCaption>100-VLAN trusted pool, one isolated subnet per verified drone</VizCaption>
    </div>
  );
}

/**
 * Red-team drawing: a packet travelling ground station -> attacker -> drone.
 *
 * The dot moves every frame, so it is animated outside React: the loop sets
 * SVG attributes directly and React renders this component once. The loop is
 * parked while the drawing is off screen.
 */
function MitmVisual() {
  const rootRef = useRef(null);
  const dotRef = useRef(null);
  const attackerRef = useRef(null);
  const statusRef = useRef(null);
  // The packet travels ground station -> attacker -> drone on a loop. Most
  // loops the attacker only relays it; every third loop it rewrites the packet.
  useEffect(() => {
    const dot = dotRef.current;
    const attacker = attackerRef.current;
    const status = statusRef.current;
    if (!dot || !attacker || !status) return undefined;
    const points = [
      [52, 34],
      [170, 98],
      [288, 34],
    ];
    const first = Math.hypot(points[1][0] - points[0][0], points[1][1] - points[0][1]);
    const second = Math.hypot(points[2][0] - points[1][0], points[2][1] - points[1][1]);
    const total = first + second;
    const LOOP_MS = 3000;
    const started = performance.now();
    let raf = 0;
    let lastKey = "";
    let visible = true;
    const tick = (now) => {
      if (!visible) {
        raf = 0; // parked; watchOnScreen below restarts it
        return;
      }
      const elapsed = now - started;
      const tamper = Math.floor(elapsed / LOOP_MS) % 3 === 1;
      const travelled = ((elapsed % LOOP_MS) / LOOP_MS) * total;
      const onFirst = travelled <= first;
      const from = onFirst ? points[0] : points[1];
      const to = onFirst ? points[1] : points[2];
      const t = onFirst ? travelled / first : (travelled - first) / second;
      dot.setAttribute("cx", (from[0] + (to[0] - from[0]) * t).toFixed(1));
      dot.setAttribute("cy", (from[1] + (to[1] - from[1]) * t).toFixed(1));
      const key = `${tamper}-${onFirst}`;
      if (key !== lastKey) {
        lastKey = key;
        const rewritten = tamper && !onFirst;
        dot.setAttribute("fill", rewritten ? "#fb7185" : "#38bdf8");
        dot.setAttribute("r", rewritten ? "5" : "4");
        attacker.setAttribute("fill", rewritten ? "#fb7185" : "#121215");
        status.textContent = onFirst
          ? "ground station sends: ARM"
          : rewritten
            ? "attacker rewrites it in transit: DISARM"
            : "attacker reads it and relays it unchanged";
        status.className = rewritten ? "viz-status text-rose-300" : "viz-status text-zinc-300";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const unwatch = watchOnScreen(rootRef.current, (onScreen) => {
      visible = onScreen;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(raf);
      unwatch();
    };
  }, []);
  return (
    <div ref={rootRef} className="flex w-full flex-col items-center gap-1">
      <svg viewBox="0 0 340 128" className="w-full max-w-[380px]" role="img" aria-label="Three-node lab: the attacker sits on the path between ground station and drone and sometimes rewrites packets">
        <line x1="52" y1="34" x2="288" y2="34" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="4 5" />
        <path d="M52,34 L170,98 L288,34" fill="none" stroke="#fb7185" strokeWidth="1.5" strokeOpacity="0.6" />
        <g fontFamily="JetBrains Mono, monospace" fontSize="10" textAnchor="middle">
          <circle cx="52" cy="34" r="9" fill="#121215" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="52" y="60" fill="#d4d4d8">ground station</text>
          <circle cx="288" cy="34" r="9" fill="#121215" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="288" y="60" fill="#d4d4d8">drone</text>
          <circle ref={attackerRef} cx="170" cy="98" r="9" fill="#121215" stroke="#fb7185" strokeWidth="1.5" />
          <text x="170" y="122" fill="#fda4af">attacker</text>
          <text x="170" y="24" fill="#71717a">MAVLink, intended path</text>
        </g>
        <circle ref={dotRef} className="mitm-dot" cx="52" cy="34" r="4" fill="#38bdf8" />
      </svg>
      <p ref={statusRef} className="viz-status text-zinc-300">
        ground station sends: ARM
      </p>
    </div>
  );
}

/** Attestation drawing: the challenge / nonce / evidence exchange, then the verdict, alternating a clean and a tampered run. */
function AttestVisual() {
  const ref = useRef(null);
  const PHASES = 5; // three messages, verdict, hold
  const step = useStep(PHASES * 2, 1100, ref);
  const tampered = Math.floor(step / PHASES) === 1;
  const phase = step % PHASES;
  const steps = [
    { from: "drone", to: "verifier", msg: "request challenge" },
    { from: "verifier", to: "drone", msg: "fresh nonce" },
    { from: "drone", to: "verifier", msg: tampered ? "PCR evidence (PCRs changed)" : "PCR-backed evidence" },
  ];
  const decided = phase >= 3;
  return (
    <div ref={ref} className="flex w-full flex-col gap-1.5 font-mono text-[11.5px]">
      {steps.map((line, i) => (
        <p
          key={i}
          className={cx("flow-line flex flex-wrap items-center gap-x-2", phase === i && "is-active", phase < i && "is-pending")}
        >
          <span className="w-[4.2rem] text-sky-400">{line.from}</span>
          <ArrowRight size={12} className="flow-arrow text-zinc-600" aria-hidden="true" />
          <span className="w-[4.2rem] text-sky-400">{line.to}</span>
          <span className={tampered && i === 2 ? "text-rose-300" : "text-zinc-300"}>{line.msg}</span>
        </p>
      ))}
      <p className="mt-1.5 flex flex-wrap items-center gap-2 border-t border-white/[0.08] pt-2.5">
        <span className="text-zinc-500">verdict</span>
        <span className={cx("viz-chip viz-chip-ok", decided && !tampered ? "is-active" : "is-dim")}>
          ALLOW · join trusted VLAN
        </span>
        <span className={cx("viz-chip viz-chip-warn", decided && tampered ? "is-active" : "is-dim")}>
          DENY · stay quarantined
        </span>
      </p>
    </div>
  );
}

/* The ring buffer animation is fully scripted, so both its history and its
 * geometry are worked out once here instead of on each 200ms step.
 * RING_STATES[step] is where the write and read indexes are after `step`
 * ticks: frames arrive in bursts from the ISR, and the main loop drains them
 * to UART more slowly. RING_SLOTS holds each slot's position on the circle. */
const RING_STEPS = 192;
const RING_STATES = (() => {
  const states = [{ write: 0, read: 0 }];
  let write = 0;
  let read = 0;
  for (let t = 1; t < RING_STEPS; t += 1) {
    const burst = t % 24 < 15;
    if (burst && write - read < 31) write += 1;
    if (read < write && (!burst || t % 2 === 0)) read += 1;
    states.push({ write, read });
  }
  return states;
})();
const RING_SLOTS = Array.from({ length: 32 }, (_, i) => {
  const angle = (i / 32) * Math.PI * 2 - Math.PI / 2;
  return { cx: (60 + Math.cos(angle) * 48).toFixed(2), cy: (60 + Math.sin(angle) * 48).toFixed(2) };
});

/** CAN-to-UART drawing: a 32-slot ring buffer filling from the interrupt and draining to UART. */
function RingVisual() {
  const ref = useRef(null);
  const step = useStep(RING_STEPS, 200, ref);
  const { write, read } = RING_STATES[step];
  const pendingCount = write - read;
  const head = write % 32;
  const pending = new Set();
  for (let i = read; i < write; i += 1) pending.add(i % 32);
  const receiving = step % 24 < 15 && step > 0;
  return (
    <div ref={ref} className="flex w-full items-center justify-center gap-3 font-mono text-[10.5px]">
      <p className="min-w-0 flex-1 text-right leading-relaxed text-zinc-400">
        <span className={cx("block", receiving ? "text-sky-300" : "text-zinc-200")}>CAN RX ISR</span>
        writes at head
        <span className="mt-1 block text-zinc-500 tabular-nums">in {write}</span>
      </p>
      <svg viewBox="0 0 120 120" className="h-[6.75rem] w-[6.75rem] shrink-0" role="img" aria-label="32-slot circular buffer filling from the interrupt and draining to UART">
        {RING_SLOTS.map((slot, i) => {
          const isPending = pending.has(i);
          const isHead = i === head;
          return (
            <circle
              key={i}
              cx={slot.cx}
              cy={slot.cy}
              r={isPending ? 4 : 3}
              fill={isPending ? "#34d399" : "#121215"}
              stroke={isHead ? "#38bdf8" : isPending ? "#34d399" : "rgba(255,255,255,0.28)"}
              strokeWidth={isHead ? 2 : 1}
            />
          );
        })}
        <text x="60" y="57" textAnchor="middle" fontFamily="Instrument Serif, serif" fontSize="26" fill="#fafafa">
          {pendingCount}
        </text>
        <text x="60" y="73" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="#8b8b94">
          of 32 queued
        </text>
      </svg>
      <p className="min-w-0 flex-1 leading-relaxed text-zinc-400">
        <span className="flex items-center gap-1.5 text-zinc-200">
          <span className={cx("led", pendingCount > 0 ? "is-green" : "is-red")} aria-hidden="true" />
          main loop
        </span>
        drains to UART
        <span className="mt-1 block text-zinc-500 tabular-nums">out {read}</span>
      </p>
    </div>
  );
}

const DATAPATH_STAGES = ["PC", "Instr Mem", "Reg File", "ALU", "Data Mem", "Write back"];
const DATAPATH_PROGRAM = [
  { op: "ADD", text: "ADD X9, X10, X11", uses: [0, 1, 2, 3, 5] },
  { op: "LDUR", text: "LDUR X9, [X10, #8]", uses: [0, 1, 2, 3, 4, 5] },
  { op: "STUR", text: "STUR X9, [X10, #16]", uses: [0, 1, 2, 3, 4] },
  { op: "CBZ", text: "CBZ X9, loop", uses: [0, 1, 2, 3] },
];
const DATAPATH_FRAMES = DATAPATH_PROGRAM.flatMap((ins, index) => ins.uses.map((stage) => ({ index, stage })));
const DATAPATH_OPS = ["ADD", "SUB", "AND", "ORR", "ADDI", "SUBI", "MOVZ", "LDUR", "STUR", "CBZ", "B"];

/** ARMv8 drawing: which datapath stages each instruction uses within its single clock cycle. */
function DatapathVisual() {
  const ref = useRef(null);
  const step = useStep(DATAPATH_FRAMES.length, 650, ref);
  const frame = DATAPATH_FRAMES[step];
  const ins = DATAPATH_PROGRAM[frame.index];
  return (
    <div ref={ref} className="flex w-full flex-col gap-3 font-mono text-[11px]">
      <p className="flex flex-wrap items-center gap-2">
        <span className="viz-chip viz-chip-ctl">Control Unit</span>
        <span className="text-zinc-500">executing</span>
        <span className="text-zinc-100">{ins.text}</span>
      </p>
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5">
        {DATAPATH_STAGES.map((stage, i) => {
          const used = ins.uses.includes(i);
          const done = used && i < frame.stage;
          return (
            <React.Fragment key={stage}>
              {i > 0 ? <ArrowRight size={12} className="text-zinc-600" aria-hidden="true" /> : null}
              <span
                className={cx(
                  "viz-chip",
                  i === frame.stage ? "is-active text-zinc-50" : done ? "viz-chip-ok" : "text-zinc-300",
                  !used && "is-dim"
                )}
              >
                {stage}
              </span>
            </React.Fragment>
          );
        })}
      </div>
      <ul className="flex flex-wrap gap-1">
        {DATAPATH_OPS.map((op) => (
          <li key={op} className={cx("op", op === ins.op && "is-active")}>
            {op}
          </li>
        ))}
      </ul>
      <VizCaption>each instruction finishes in one clock cycle; greyed stages are skipped</VizCaption>
    </div>
  );
}

// A short scripted hand. `play` marks the card you are about to put down.
const CRAZY8_GAME = [
  { top: "7♥", hand: ["3♥", "J♣", "8♠", "K♦", "5♠"], ai: 4, play: "3♥", text: "Your turn: match ♥ or a 7" },
  { top: "3♥", hand: ["J♣", "8♠", "K♦", "5♠"], ai: 4, text: "You play 3♥. AI is thinking…" },
  { top: "3♣", hand: ["J♣", "8♠", "K♦", "5♠"], ai: 3, play: "J♣", text: "AI matches the rank with 3♣" },
  { top: "J♣", hand: ["8♠", "K♦", "5♠"], ai: 3, text: "You follow suit with J♣" },
  { top: "J♣", hand: ["8♠", "K♦", "5♠"], ai: 4, play: "8♠", text: "AI has no match and draws a card" },
  { top: "8♠", suit: "♦", hand: ["K♦", "5♠"], ai: 4, text: "You play a wild 8 and declare ♦" },
  { top: "9♦", hand: ["K♦", "5♠"], ai: 3, play: "K♦", text: "AI follows the declared suit with 9♦" },
  { top: "K♦", hand: ["5♠"], ai: 3, text: "You play K♦. One card left!" },
];

/**
 * One face-up card, e.g. "8♠". Hearts and diamonds render red.
 * @param {{card: string, className?: string}} props
 */
function PlayingCard({ card, className }) {
  const suit = card.slice(-1);
  const red = suit === "♥" || suit === "♦";
  return (
    <span className={cx("pcard", red && "is-red", className)}>
      <span>{card.slice(0, -1)}</span>
      <span aria-hidden="true">{suit}</span>
    </span>
  );
}

/** Crazy-8 drawing: a short scripted hand between the player and the AI. */
function CardsVisual() {
  const ref = useRef(null);
  const step = useStep(CRAZY8_GAME.length + 1, 1500, ref);
  const state = CRAZY8_GAME[Math.min(step, CRAZY8_GAME.length - 1)];
  return (
    <div ref={ref} className="flex w-full flex-col gap-2.5 font-mono text-[10.5px]">
      <div className="flex items-center gap-2">
        <span className="w-7 text-zinc-500">AI</span>
        <span className="flex gap-1">
          {Array.from({ length: state.ai }, (_, i) => (
            <span key={i} className="pcard pcard-sm pcard-back" />
          ))}
        </span>
        <span className="text-zinc-500 tabular-nums">{state.ai} cards</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-7 text-zinc-500">pile</span>
        <span className="pcard pcard-back" title="Draw pile" />
        <PlayingCard key={state.top + step} card={state.top} className="is-top" />
        <span className="min-w-0 flex-1 text-[11px] leading-snug text-zinc-200">
          {state.text}
          {state.suit ? <span className="mt-0.5 block text-emerald-300">suit is now {state.suit}</span> : null}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-7 text-zinc-500">you</span>
        <span className="flex gap-1.5">
          {state.hand.map((card) => (
            <PlayingCard key={card} card={card} className={cx("pcard-md", card === state.play && "is-wild")} />
          ))}
        </span>
      </div>
    </div>
  );
}

const SORT_FILES = [
  { name: "report.pdf", to: "documents" },
  { name: "photo.png", to: "images" },
  { name: "setup.exe", to: "installers" },
  { name: "clip.mp4", to: "videos", slow: true },
  { name: "song.mp3", to: "audio" },
];
const SORT_FOLDERS = ["images", "documents", "videos", "audio", "installers"];
const SORT_FRAMES = SORT_FILES.flatMap((file) => {
  const ext = file.name.slice(file.name.lastIndexOf("."));
  return [
    { file: file.name, text: "new file appears in Downloads" },
    ...(file.slow ? [{ file: file.name, waiting: true, text: "still downloading (size changing): skipped for now" }] : []),
    { file: file.name, target: file.to, text: `${ext} belongs in ${file.to}/` },
    { moved: file.to, text: `moved to ${file.to}/` },
  ];
});

/** File organizer drawing: files appear in Downloads and are moved into typed folders. */
function SortVisual() {
  const ref = useRef(null);
  const step = useStep(SORT_FRAMES.length, 1000, ref);
  const frame = SORT_FRAMES[step];
  const counts = {};
  SORT_FRAMES.slice(0, step + 1).forEach((f) => {
    if (f.moved) counts[f.moved] = (counts[f.moved] ?? 0) + 1;
  });
  return (
    <div ref={ref} className="flex w-full flex-col gap-2.5 font-mono text-[11px]">
      <p className="flex min-h-[1.7rem] flex-wrap items-center gap-2">
        <span className="viz-chip text-zinc-200">~/Downloads</span>
        {frame.file ? (
          <span key={frame.file} className={cx("viz-chip file-chip", frame.waiting ? "viz-chip-warn" : "is-active text-zinc-50")}>
            {frame.file}
          </span>
        ) : (
          <span className="text-zinc-600">watching…</span>
        )}
      </p>
      <p className="viz-status">
        <span className={frame.waiting ? "text-rose-300" : frame.moved ? "text-emerald-300" : "text-zinc-200"}>▸ {frame.text}</span>
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {SORT_FOLDERS.map((folder) => (
          <li
            key={folder}
            className={cx(
              "viz-chip text-sky-300",
              (frame.target === folder || frame.moved === folder) && "is-active",
              frame.moved === folder && "viz-chip-ok"
            )}
          >
            {folder}/ <span className="text-zinc-400 tabular-nums">{counts[folder] ?? 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** `visual` key on a project -> the drawing shown at the top of its card. */
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

/**
 * One project: drawing, category, name, description, tags and repository link.
 *
 * Memoised on the project object, which comes from the module-level
 * PROJECTS_DATA and so never changes identity. Typing in the search box
 * re-renders the grid, but each card that is still shown is skipped.
 *
 * @param {{project: object, wide?: boolean}} props
 *   `wide` puts the drawing beside the text on large screens.
 */
const ProjectCard = memo(function ProjectCard({ project, wide = false }) {
  const category = CATEGORY_BY_ID.get(project.category);
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
});

/* Static inputs to the project grid, built once. PROJECT_SEARCH_TEXT is each
 * project's searchable text, lower-cased ahead of time, so a keystroke costs
 * a few String.includes calls rather than rebuilding and lower-casing every
 * project's text. */
const PROJECT_FILTERS = [{ id: "all", label: "All" }, ...C.categories];
/* Featured projects first, otherwise in PROJECTS_DATA order, so they take the
 * first slots of whichever tab is open. */
const ORDERED_PROJECTS = [
  ...PROJECTS_DATA.filter((project) => project.featured),
  ...PROJECTS_DATA.filter((project) => !project.featured),
];
/* How many projects a tab shows up front, and how many more each press of
 * "More Projects / Archive" reveals. */
const PROJECTS_INITIAL = 6;
const PROJECTS_STEP = 4;
const PROJECT_SEARCH_TEXT = new Map(
  PROJECTS_DATA.map((project) => [
    project.id,
    [project.name, project.description, project.org ?? "", CATEGORY_BY_ID.get(project.category)?.label ?? "", ...project.tags]
      .join(" ")
      .toLowerCase(),
  ])
);

/**
 * Whether a project passes the category filter and contains every search token.
 * @param {object} project
 * @param {string} categoryId A category id, or "all".
 * @param {string[]} tokens Lower-cased search words; all must match.
 * @returns {boolean}
 */
function matchesProject(project, categoryId, tokens) {
  if (categoryId !== "all" && project.category !== categoryId) return false;
  const haystack = PROJECT_SEARCH_TEXT.get(project.id) ?? "";
  return tokens.every((token) => haystack.includes(token));
}

/**
 * Project grid with category filters, search, and the "More Projects /
 * Archive" card.
 *
 * A tab shows every project in its category: the first PROJECTS_INITIAL right
 * away, then PROJECTS_STEP more each time the archive card is pressed. Once
 * everything is shown the card collapses the list again. Changing the tab or
 * the search starts over.
 *
 * The filtered list is memoised on the category and the search tokens. Cards
 * beyond the visible count are not mounted, which keeps their drawings (and
 * their timers) out of the initial render.
 */
const Projects = memo(function Projects() {
  const [categoryId, setCategoryId] = useState("all");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PROJECTS_INITIAL);

  // Memoised so revealing more projects (unrelated state) does not re-filter,
  // and so `matching` keeps its identity when nothing relevant changed.
  const tokens = useMemo(() => query.toLowerCase().split(" ").filter(Boolean).slice(0, 8), [query]);
  const matching = useMemo(
    () => ORDERED_PROJECTS.filter((p) => matchesProject(p, categoryId, tokens)),
    [categoryId, tokens]
  );
  const visible = useMemo(() => matching.slice(0, visibleCount), [matching, visibleCount]);
  const remaining = matching.length - visible.length;
  const expanded = visibleCount > PROJECTS_INITIAL;

  // A new tab or search starts again from the first PROJECTS_INITIAL projects.
  const selectCategory = useCallback((id) => {
    setCategoryId(id);
    setVisibleCount(PROJECTS_INITIAL);
  }, []);
  const changeQuery = useCallback((value) => {
    setQuery(sanitizeQuery(value));
    setVisibleCount(PROJECTS_INITIAL);
  }, []);
  const clearFilters = useCallback(() => {
    setCategoryId("all");
    setQuery("");
    setVisibleCount(PROJECTS_INITIAL);
  }, []);
  // Reveals the next PROJECTS_STEP projects, or collapses once all are shown.
  const toggleMore = useCallback(() => {
    setVisibleCount((count) => (remaining > 0 ? count + PROJECTS_STEP : PROJECTS_INITIAL));
  }, [remaining]);

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
          {PROJECT_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              aria-pressed={categoryId === filter.id}
              onClick={() => selectCategory(filter.id)}
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
            onChange={(event) => changeQuery(event.target.value)}
            placeholder="Search projects, tags…"
            autoComplete="off"
            spellCheck="false"
          />
        </label>
      </Reveal>

      <div id="project-grid" className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visible.map((project, i) => (
          <Reveal key={project.id} delay={(i % 2) * 80}>
            <ProjectCard project={project} />
          </Reveal>
        ))}

        {matching.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center md:col-span-2">
            <p className="text-zinc-300">No projects match that filter.</p>
            <button
              type="button"
              className="link-arrow mx-auto mt-3"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </div>
        ) : null}

        {remaining > 0 || expanded ? (
          <Reveal className="md:col-span-2">
            <Card className="p-0">
              <button
                type="button"
                className="flex w-full items-center gap-4 p-6 text-left"
                aria-expanded={expanded}
                aria-controls="project-grid"
                onClick={toggleMore}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-400">
                  <Archive size={17} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold tracking-[-0.02em] text-zinc-50">
                    {remaining > 0 ? "More Projects / Archive" : "Show fewer projects"}
                  </span>
                  <span className="block font-mono text-xs text-zinc-500" aria-live="polite">
                    {remaining > 0
                      ? `${remaining} more · show ${Math.min(PROJECTS_STEP, remaining)}`
                      : `showing all ${matching.length}`}
                  </span>
                </span>
                <ChevronDown
                  size={18}
                  aria-hidden="true"
                  className={cx("shrink-0 text-zinc-500 transition-transform duration-300", remaining === 0 && "rotate-180")}
                />
              </button>
            </Card>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
});

/* ----------------------------------------------------------------------------
 * Experience + resume
 * -------------------------------------------------------------------------- */

/**
 * The resume as plain text, for "Copy as text". Built from RESUME on demand
 * rather than at load, since most visitors never ask for it.
 * @returns {string}
 */
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

/** `kind` on a timeline entry -> its icon. */
const TIMELINE_ICONS = { work: Briefcase, edu: GraduationCap, lead: Swords };

// Both orders are sorted once here; the toggle just picks one.
const TIMELINE_OLDEST_FIRST = [...C.timeline].sort((a, b) => a.start.localeCompare(b.start));
const TIMELINE_LATEST_FIRST = [...TIMELINE_OLDEST_FIRST].reverse();

/**
 * The experience timeline.
 * @param {{latestFirst: boolean}} props Which of the two pre-sorted orders to show.
 */
const Timeline = memo(function Timeline({ latestFirst }) {
  const items = latestFirst ? TIMELINE_LATEST_FIRST : TIMELINE_OLDEST_FIRST;
  return (
    <ol className={cx("timeline flex flex-col gap-4", !latestFirst && "is-oldest-first")}>
      {items.map((item, i) => {
        const Icon = TIMELINE_ICONS[item.kind] ?? Briefcase;
        return (
          <li key={item.id} className="group relative pl-12 sm:pl-14">
            <span
              className={cx(
                "absolute left-0 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border bg-[#09090b] transition duration-200",
                item.badge
                  ? "border-emerald-500/40 text-emerald-400 group-hover:border-emerald-400 group-hover:text-emerald-300 group-hover:shadow-[0_0_18px_rgba(16,185,129,0.45)]"
                  : "border-white/10 text-zinc-400 group-hover:border-sky-400/70 group-hover:text-sky-300 group-hover:shadow-[0_0_18px_rgba(56,189,248,0.4)]"
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
});

/**
 * A titled block of the resume sheet.
 * @param {{title: string, children: React.ReactNode}} props
 */
function SheetSection({ title, children }) {
  return (
    <section className="flex flex-col gap-3">
      <h4 className="border-b border-zinc-800 pb-1 text-[12.5px] font-bold uppercase tracking-wide">{title}</h4>
      <div className="flex min-w-0 flex-col gap-3.5">{children}</div>
    </section>
  );
}

/**
 * Bullet list in the resume sheet.
 * @param {{items: string[]}} props
 */
function SheetBullets({ items }) {
  return (
    <ul className="list-disc space-y-0.5 pl-5 text-[13px] leading-relaxed text-zinc-800">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/**
 * One job or leadership entry in the resume sheet.
 * @param {{job: {org: string, place: string, role: string, period: string, bullets: string[]}}} props
 */
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

/**
 * The resume laid out as a sheet of paper, with download and copy actions.
 * This is also what prints: the print stylesheet hides everything else.
 * Only mounted while the Resume view is selected.
 *
 * @param {{onDownload: () => void, onCopy: () => void}} props
 */
const ResumeSheet = memo(function ResumeSheet({ onDownload, onCopy }) {
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
});

/** The two views of the experience section. */
const EXPERIENCE_VIEWS = [
  { id: "timeline", label: "Timeline", Icon: List },
  { id: "sheet", label: "Resume", Icon: FileText },
];

/**
 * Experience section: a switch between the timeline and the resume sheet, plus
 * the timeline's order toggle.
 *
 * `view` lives in Portfolio because the header's Experience and Resume links
 * and the command palette set it too. Only the selected view is mounted.
 *
 * @param {{view: "timeline"|"sheet", setView: (view: string) => void, onDownload: () => void, onCopyResume: () => void}} props
 */
const Experience = memo(function Experience({ view, setView, onDownload, onCopyResume }) {
  const [latestFirst, setLatestFirst] = useState(true);
  return (
    <section id="experience" className="section">
      <SectionHead path="experience" title="Experience &" accent="education" className="print:hidden" />
      <div id="resume" className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="segmented" role="group" aria-label="Choose a view">
            {EXPERIENCE_VIEWS.map(({ id, label, Icon }) => (
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
          {view === "timeline" ? (
            <button
              type="button"
              onClick={() => setLatestFirst((value) => !value)}
              className="btn-quiet"
              aria-label={`Reverse timeline order. Currently ${latestFirst ? "latest" : "oldest"} first.`}
            >
              <ArrowUpDown size={13} aria-hidden="true" /> {latestFirst ? "Latest first" : "Oldest first"}
            </button>
          ) : null}
        </div>
        {view === "timeline" ? <Timeline latestFirst={latestFirst} /> : <ResumeSheet onDownload={onDownload} onCopy={onCopyResume} />}
      </div>
    </section>
  );
});

/* ----------------------------------------------------------------------------
 * Command palette
 * -------------------------------------------------------------------------- */

/**
 * The Ctrl/Cmd+K command palette: a filter box over a list of actions and links.
 *
 * Mounted only while open (Portfolio renders it conditionally), so it costs
 * nothing until used and starts with a clean query each time. On mount it
 * remembers the focused element, locks page scroll and focuses the input; on
 * unmount it undoes all three.
 *
 * @param {{onClose: () => void, items: Array<{id: string, group: string, label: string, hint?: string, icon: React.ComponentType, search: string, run?: () => void, href?: string}>}} props
 *   An item with `href` renders as a real link; one with `run` as a button.
 */
function CommandPalette({ onClose, items }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.search.includes(q));
  }, [items, query]);

  useEffect(() => {
    const restore = document.activeElement;
    document.body.classList.add("is-locked");
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      document.body.classList.remove("is-locked");
      if (restore instanceof HTMLElement) restore.focus();
    };
  }, []);

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [active, results]);

  // `active` can point past the end right after the list shrinks; clamp on
  // read rather than fixing it up in an effect, which would cost a second render.
  const clamped = Math.min(active, Math.max(results.length - 1, 0));

  const run = (item) => {
    onClose();
    // Links are real anchors, so the browser handles navigation itself.
    if (!item.href) item.run?.();
  };

  /* Keyboard state machine. The only state is `active`, the highlighted row.
   *   ArrowDown / ArrowUp   move the highlight one row and wrap at the ends
   *   Enter                 click the highlighted row, so mouse and keyboard
   *                         run exactly the same code (see `run`)
   *   Escape                close; the effect above gives focus back
   *   Tab                   swallowed, which keeps focus inside the dialog
   *   any other key         types into the input; onChange filters the list
   *                         and resets the highlight to the first row
   * Focus never leaves the input. The highlighted row is announced through
   * aria-activedescendant instead of by moving focus, which is the standard
   * combobox pattern and avoids a focus change per arrow press. */
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

/**
 * Asks before downloading the resume PDF and says exactly what the file is.
 * Mounted only while open. Focus is trapped between its two controls and
 * returned to the opener on close.
 *
 * @param {{onClose: () => void, onConfirm: () => void}} props
 */
function DownloadConfirm({ onClose, onConfirm }) {
  const confirmRef = useRef(null);
  const cancelRef = useRef(null);
  const href = safeHref(C.contact.resumePdf);

  useEffect(() => {
    if (!href) return undefined;
    const restore = document.activeElement;
    document.body.classList.add("is-locked");
    const frame = requestAnimationFrame(() => confirmRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      document.body.classList.remove("is-locked");
      if (restore instanceof HTMLElement) restore.focus();
    };
  }, [href]);

  if (!href) return null;

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
        className="palette confirm flex flex-col gap-5 p-6 sm:p-7"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
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
            <dt className="kv-key">file</dt>
            <dd className="mt-1 break-all font-mono text-[12.5px] text-zinc-100">Raymond_Yang_Resume.pdf</dd>
          </div>
          <div>
            <dt className="kv-key">type</dt>
            <dd className="mt-1 font-mono text-[12.5px] text-zinc-100">PDF</dd>
          </div>
          <div>
            <dt className="kv-key">pages</dt>
            <dd className="mt-1 font-mono text-[12.5px] text-zinc-100">1</dd>
          </div>
          <div>
            <dt className="kv-key">size</dt>
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
  );
}

/* Real constellations for the backdrop. Each star is
 * [right ascension (hours), declination (degrees), apparent magnitude], J2000
 * and rounded; `lines` joins star indexes with the usual stick figure.
 * `at` is where the figure sits on a wide screen and `narrowAt` on a phone
 * (fractions of the viewport); figures without `narrowAt` are left out there.
 * `tilt` (degrees) turns the figure, as the real ones turn through the night.
 * `scale` keeps the figures roughly in proportion to their size in the sky. */
const CONSTELLATIONS = [
  {
    id: "big-dipper",
    name: "Big Dipper · Ursa Major",
    at: [0.2, 0.13],
    tilt: -14,
    narrowAt: [0.22, 0.16],
    scale: 1.1,
    // Dubhe, Merak, Phecda, Megrez, Alioth, Mizar, Alkaid
    stars: [
      [11.062, 61.75, 1.8],
      [11.031, 56.38, 2.4],
      [11.897, 53.69, 2.4],
      [12.257, 57.03, 3.3],
      [12.9, 55.96, 1.8],
      [13.399, 54.93, 2.2],
      [13.792, 49.31, 1.9],
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]],
  },
  {
    id: "orion",
    name: "Orion",
    at: [0.06, 0.37],
    tilt: 9,
    narrowAt: [0.2, 0.82],
    scale: 1,
    // Betelgeuse, Rigel, Bellatrix, Saiph, Alnitak, Alnilam, Mintaka, Meissa
    stars: [
      [5.919, 7.41, 0.5],
      [5.242, -8.2, 0.1],
      [5.419, 6.35, 1.6],
      [5.796, -9.67, 2.1],
      [5.679, -1.94, 1.8],
      [5.604, -1.2, 1.7],
      [5.533, -0.3, 2.2],
      [5.585, 9.93, 3.4],
    ],
    lines: [[0, 2], [0, 4], [2, 6], [4, 5], [5, 6], [4, 3], [6, 1], [3, 1], [7, 0], [7, 2]],
  },
  {
    id: "lyra",
    name: "Lyra",
    at: [0.25, 0.6],
    tilt: -22,
    scale: 0.6,
    // Vega, Epsilon, Zeta, Delta, Sheliak, Sulafat
    stars: [
      [18.616, 38.78, 0.0],
      [18.739, 39.67, 4.6],
      [18.746, 37.6, 4.3],
      [18.908, 36.9, 4.3],
      [18.835, 33.36, 3.5],
      [18.982, 32.69, 3.2],
    ],
    lines: [[0, 1], [0, 2], [1, 2], [2, 3], [3, 5], [5, 4], [4, 2]],
  },
  {
    id: "scorpius",
    name: "Scorpius",
    at: [0.1, 0.84],
    tilt: 12,
    scale: 1.15,
    // Antares, Graffias, Dschubba, Pi, Sigma, Tau, Epsilon, Mu, Zeta, Eta,
    // Sargas, Iota, Kappa, Shaula
    stars: [
      [16.49, -26.43, 1.0],
      [16.091, -19.81, 2.6],
      [16.006, -22.62, 2.3],
      [15.981, -26.11, 2.9],
      [16.353, -25.59, 2.9],
      [16.598, -28.22, 2.8],
      [16.836, -34.29, 2.3],
      [16.864, -38.05, 3.0],
      [16.91, -42.36, 3.6],
      [17.203, -43.24, 3.3],
      [17.622, -43.0, 1.9],
      [17.793, -40.13, 3.0],
      [17.708, -39.03, 2.4],
      [17.56, -37.1, 1.6],
    ],
    lines: [[1, 2], [2, 3], [2, 4], [4, 0], [0, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13]],
  },
  {
    id: "cassiopeia",
    name: "Cassiopeia",
    at: [0.84, 0.1],
    tilt: 18,
    narrowAt: [0.8, 0.14],
    scale: 0.75,
    // Caph, Schedar, Gamma, Ruchbah, Segin
    stars: [
      [0.153, 59.15, 2.3],
      [0.675, 56.54, 2.2],
      [0.945, 60.72, 2.4],
      [1.43, 60.24, 2.7],
      [1.907, 63.67, 3.4],
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    id: "leo",
    name: "Leo",
    at: [0.93, 0.29],
    tilt: -10,
    scale: 1.05,
    // Regulus, Eta, Algieba, Adhafera, Rasalas, Epsilon, Denebola, Zosma, Chertan
    stars: [
      [10.14, 11.97, 1.4],
      [10.122, 16.76, 3.5],
      [10.333, 19.84, 2.0],
      [10.278, 23.42, 3.4],
      [9.879, 26.01, 3.9],
      [9.764, 23.77, 3.0],
      [11.818, 14.57, 2.1],
      [11.235, 20.52, 2.6],
      [11.237, 15.43, 3.3],
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 7], [7, 6], [6, 8], [8, 0], [7, 8]],
  },
  {
    id: "cygnus",
    name: "Cygnus",
    at: [0.79, 0.58],
    tilt: 24,
    narrowAt: [0.8, 0.84],
    scale: 0.95,
    // Deneb, Sadr, Albireo, Gienah, Delta, Eta
    stars: [
      [20.69, 45.28, 1.3],
      [20.37, 40.26, 2.2],
      [19.512, 27.96, 3.1],
      [20.77, 33.97, 2.5],
      [19.75, 45.13, 2.9],
      [19.938, 35.08, 3.9],
    ],
    lines: [[0, 1], [1, 5], [5, 2], [1, 3], [1, 4]],
  },
  {
    id: "little-dipper",
    name: "Little Dipper · Ursa Minor",
    at: [0.95, 0.8],
    tilt: -28,
    scale: 0.8,
    // Polaris, Yildun, Epsilon, Zeta, Kochab, Pherkad, Eta
    stars: [
      [2.53, 89.26, 2.0],
      [17.537, 86.59, 4.4],
      [16.766, 82.04, 4.2],
      [15.734, 77.79, 4.3],
      [14.845, 74.16, 2.1],
      [15.345, 71.83, 3.0],
      [16.292, 75.76, 5.0],
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]],
  },
];

/**
 * Flattens one constellation onto a plane (gnomonic projection about its own
 * centre) the way it looks from the ground: north up, east to the left.
 * @param {object} con An entry of CONSTELLATIONS.
 * @returns {object} The entry plus `points`: one {x, y, r, hot} per star, with
 *   coordinates centred on 0 and the longer side spanning 1, a radius from the
 *   star's magnitude, and `hot` marking the brightest star.
 */
function projectConstellation(con) {
  const rad = Math.PI / 180;
  const sph = con.stars.map(([ra, dec]) => ({ ra: ra * 15 * rad, dec: dec * rad }));
  let vx = 0;
  let vy = 0;
  let vz = 0;
  for (const s of sph) {
    vx += Math.cos(s.dec) * Math.cos(s.ra);
    vy += Math.cos(s.dec) * Math.sin(s.ra);
    vz += Math.sin(s.dec);
  }
  const ra0 = Math.atan2(vy, vx);
  const dec0 = Math.atan2(vz, Math.hypot(vx, vy));
  const flat = sph.map((s) => {
    const cosc = Math.sin(dec0) * Math.sin(s.dec) + Math.cos(dec0) * Math.cos(s.dec) * Math.cos(s.ra - ra0);
    return {
      x: -(Math.cos(s.dec) * Math.sin(s.ra - ra0)) / cosc,
      y: -(Math.cos(dec0) * Math.sin(s.dec) - Math.sin(dec0) * Math.cos(s.dec) * Math.cos(s.ra - ra0)) / cosc,
    };
  });
  const xs = flat.map((p) => p.x);
  const ys = flat.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const w = Math.max(...xs) - minX;
  const h = Math.max(...ys) - minY;
  const span = Math.max(w, h);
  const brightest = Math.min(...con.stars.map((star) => star[2]));
  return {
    ...con,
    halfW: w / span / 2,
    halfH: h / span / 2,
    points: flat.map((p, i) => {
      const mag = con.stars[i][2];
      return {
        x: (p.x - minX - w / 2) / span,
        y: (p.y - minY - h / 2) / span,
        r: Math.max(1.2, 2.9 - 0.42 * mag),
        hot: mag === brightest,
      };
    }),
  };
}

/** Every constellation projected once at load; Background only scales and places them. */
const SKY = CONSTELLATIONS.map(projectConstellation);

/**
 * Fixed backdrop: drifting colour glows, a dot grid that lights up under the
 * cursor, and real constellations drawn on a canvas.
 *
 * This is the busiest code on the page, so none of it goes through React. The
 * component renders once; a single effect then owns everything:
 *  - Pointer, scroll and resize handlers only record what happened. The work
 *    is done at most once per frame in requestAnimationFrame callbacks.
 *  - The canvas is repainted at full rate only while a constellation is moving
 *    or the cursor has moved; otherwise it drops to 20fps for the twinkle.
 *  - Layout is read only when something could have changed it (a resize, a
 *    pointer move, a scroll), never on idle frames.
 *  - The loop stops while the tab is hidden, and never starts if the visitor
 *    asked for reduced motion (the sky is then drawn once, still).
 */
const Background = memo(function Background() {
  const rootRef = useRef(null);
  const hotRef = useRef(null);
  const canvasRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const hot = hotRef.current;
    const canvas = canvasRef.current;
    const label = labelRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !hot || !label || !ctx) return undefined;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const REACH = 110; // how close the cursor gets before a star feels it
    const IDLE_FRAME_MS = 50; // repaint rate while the only motion is the twinkle (20fps)
    const HOT_HALF = 240; // half the side of the .bg-dots-hot patch
    const pointer = { x: 0, y: 0, active: false };
    let width = 0;
    let height = 0;
    let placed = [];
    let now = 0;
    let lastPaint = 0;
    let raf = 0;
    let spotRaf = 0;
    let resizeRaf = 0;
    // Set by pointer and scroll events, cleared once a frame has used it. It
    // gates every piece of work that only changes when the cursor or the page
    // under it has moved.
    let pointerDirty = false;
    let pointerOnContent = null; // null = not worked out since the last move
    let labelled = null;
    let labelW = 0;
    let labelH = 0;

    // True when page content (text, a card, a control) is drawn at this point.
    // The backdrop ignores pointer events, so it is never the element found.
    const hasContentAt = (x, y) => {
      const found = document.elementFromPoint(x, y);
      if (!found) return false;
      if (found.closest(".card, .sheet, .hobby, .palette, header, a, button, input, svg, img, canvas")) return true;
      for (const node of found.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) return true;
      }
      return false;
    };
    // Hit-testing forces the browser to have layout ready, so do it at most
    // once per pointer move and share the answer between push and label.
    const isPointerOnContent = () => {
      if (pointerOnContent === null) pointerOnContent = hasContentAt(pointer.x, pointer.y);
      return pointerOnContent;
    };

    // The cursor pushes on any star it comes near, and the push moves that
    // whole constellation, so the shape stays intact. A spring pulls each
    // figure back home once the cursor leaves. Only figures that sit wholly
    // in the side margins react (`free`): one that shares any width with the
    // content column stays put, so on a phone or a narrow window none move.
    // Returns true while anything is still moving.
    const step = () => {
      let moving = false;
      for (const sky of placed) {
        let fx = 0;
        let fy = 0;
        if (pointer.active && sky.free) {
          for (const star of sky.stars) {
            const dx = star.x + sky.ox - pointer.x;
            const dy = star.y + sky.oy - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < REACH && dist > 0.01) {
              const push = (1 - dist / REACH) * 0.15;
              fx += (dx / dist) * push;
              fy += (dy / dist) * push;
            }
          }
          // No push while the cursor is on page content.
          if ((fx !== 0 || fy !== 0) && isPointerOnContent()) {
            fx = 0;
            fy = 0;
          }
        }
        const pushed = fx !== 0 || fy !== 0;
        if (!pushed && sky.ox === 0 && sky.oy === 0 && sky.vx === 0 && sky.vy === 0) continue; // at rest
        sky.vx = (sky.vx + fx - sky.ox * 0.012) * 0.9;
        sky.vy = (sky.vy + fy - sky.oy * 0.012) * 0.9;
        sky.ox += sky.vx;
        sky.oy += sky.vy;
        // Close enough to home: snap, so the figure counts as at rest again.
        if (!pushed && Math.abs(sky.ox) < 0.05 && Math.abs(sky.oy) < 0.05 && Math.abs(sky.vx) < 0.01 && Math.abs(sky.vy) < 0.01) {
          sky.ox = 0;
          sky.oy = 0;
          sky.vx = 0;
          sky.vy = 0;
        }
        moving = true;
      }
      return moving;
    };

    // Names the constellation under the cursor. The label is a DOM node, not
    // canvas text, so the canvas's centre fade does not dim it.
    const updateLabel = () => {
      const PAD = 16;
      let hit = null;
      let best = Infinity;
      if (pointer.active) {
        for (const sky of placed) {
          if (!sky.free) continue;
          const left = sky.minX + sky.ox - PAD;
          const right = sky.maxX + sky.ox + PAD;
          const top = sky.minY + sky.oy - PAD;
          const bottom = sky.maxY + sky.oy + PAD;
          if (pointer.x < left || pointer.x > right || pointer.y < top || pointer.y > bottom) continue;
          const dist = Math.hypot(pointer.x - (left + right) / 2, pointer.y - (top + bottom) / 2);
          if (dist < best) {
            best = dist;
            hit = sky;
          }
        }
      }
      // Hovering content that happens to sit over a figure is not hovering the figure.
      if (hit && isPointerOnContent()) hit = null;
      if (!hit) {
        label.classList.remove("is-on");
        labelled = null;
        return;
      }
      if (hit !== labelled) {
        label.textContent = hit.name;
        // Measure once per name rather than every frame the label is shown.
        labelW = label.offsetWidth;
        labelH = label.offsetHeight;
        labelled = hit;
      }
      // Under the figure, or above it when there is no room below.
      const below = hit.maxY + hit.oy + 14;
      const y = below + 24 > height ? hit.minY + hit.oy - 34 : below;
      const x = Math.min(Math.max((hit.minX + hit.maxX) / 2 + hit.ox, 70), Math.max(70, width - 70));
      label.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translateX(-50%)`;
      // Stay hidden while any content overlaps where the label would be.
      const half = labelW / 2;
      const midY = y + labelH / 2;
      const covered = [x - half, x, x + half].some((px) => hasContentAt(px, midY));
      label.classList.toggle("is-on", !covered);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(129, 160, 255, 0.45)";
      for (const sky of placed) {
        const { ox, oy } = sky;
        ctx.beginPath();
        for (const [from, to] of sky.lines) {
          ctx.moveTo(sky.stars[from].x + ox, sky.stars[from].y + oy);
          ctx.lineTo(sky.stars[to].x + ox, sky.stars[to].y + oy);
        }
        ctx.stroke();
        for (const star of sky.stars) {
          const twinkle = reduce ? 1 : 0.78 + 0.22 * Math.sin(now / star.speed + star.phase);
          ctx.fillStyle = star.hot
            ? `rgba(52, 211, 153, ${twinkle.toFixed(3)})`
            : `rgba(226, 232, 255, ${(0.85 * twinkle).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(star.x + ox, star.y + oy, star.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    // Sizes the canvas and places every figure for the current window.
    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const narrow = width < 700;
      const base = narrow
        ? Math.min(width * 0.3, height * 0.2)
        : Math.max(90, Math.min(230, height * 0.2, width * 0.15));
      const clamp = (value, half, max) => Math.min(Math.max(value, half), Math.max(half, max - half));
      // The content column: the shell minus its side padding.
      const shell = document.querySelector(".shell");
      let contentLeft = 0;
      let contentRight = width;
      if (shell) {
        const rect = shell.getBoundingClientRect();
        const pad = getComputedStyle(shell);
        contentLeft = rect.left + (parseFloat(pad.paddingLeft) || 0);
        contentRight = rect.right - (parseFloat(pad.paddingRight) || 0);
      }
      placed = SKY.filter((sky) => !narrow || sky.narrowAt).map((sky, i) => {
        const [fx, fy] = narrow ? sky.narrowAt : sky.at;
        const size = base * sky.scale;
        const cx = clamp(fx * width, size * 0.35, width);
        const cy = clamp(fy * height, size * 0.35, height);
        const angle = ((sky.tilt ?? 0) * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const stars = sky.points.map((point, j) => ({
          x: cx + (point.x * cos - point.y * sin) * size,
          y: cy + (point.x * sin + point.y * cos) * size,
          r: point.r,
          hot: point.hot,
          speed: 900 + ((i * 7 + j * 13) % 9) * 160,
          phase: i * 2.3 + j * 1.1,
        }));
        const xs = stars.map((star) => star.x);
        const ys = stars.map((star) => star.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        return {
          name: sky.name,
          lines: sky.lines,
          stars,
          minX,
          maxX,
          minY: Math.min(...ys),
          maxY: Math.max(...ys),
          free: maxX < contentLeft - 12 || minX > contentRight + 12,
          ox: 0,
          oy: 0,
          vx: 0,
          vy: 0,
        };
      });
      pointerOnContent = null;
      updateLabel();
      draw();
    };

    // One frame. Physics runs every frame (it is a no-op at rest), but the
    // canvas is only repainted at full rate while something is moving or the
    // cursor has moved. When the twinkle is the only motion, 20fps is
    // indistinguishable and saves two thirds of the full-screen repaints.
    const frame = (time) => {
      raf = requestAnimationFrame(frame);
      if (pointerDirty) pointerOnContent = null;
      const moving = step();
      const busy = moving || pointerDirty;
      if (!busy && time - lastPaint < IDLE_FRAME_MS) return;
      if (busy) updateLabel();
      pointerDirty = false;
      now = time;
      lastPaint = time;
      draw();
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (!reduce && !document.hidden) raf = requestAnimationFrame(frame);
    };

    // Moves the bright-dot patch under the cursor. Only this 480px patch is
    // repainted; the grid keeps its place because the background is shifted
    // back by exactly the distance the patch moved.
    const moveSpot = () => {
      spotRaf = 0;
      const tx = Math.round(pointer.x - HOT_HALF);
      const ty = Math.round(pointer.y - HOT_HALF);
      hot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      hot.style.backgroundPosition = `${-tx}px ${-ty}px`;
      root.classList.add("has-pointer");
      // With reduced motion there is no frame loop, so the label is kept up
      // to date from here instead.
      if (reduce) {
        pointerOnContent = null;
        pointerDirty = false;
        updateLabel();
      }
    };
    const onPointerMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      pointerDirty = true;
      if (!spotRaf) spotRaf = requestAnimationFrame(moveSpot);
    };
    const onPointerGone = () => {
      pointer.active = false;
      pointerDirty = true;
      if (reduce) updateLabel();
    };
    // Scrolling changes what is under a cursor that has not moved.
    const onScroll = () => {
      pointerDirty = true;
      if (reduce && pointer.active && !spotRaf) spotRaf = requestAnimationFrame(moveSpot);
    };
    // A drag-resize fires many events per frame; lay out once per frame.
    const onResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        layout();
      });
    };

    layout();
    start();
    // `passive` promises the browser these never call preventDefault, so
    // scrolling and pointer input are never held up waiting on them.
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", onPointerGone);
    document.addEventListener("visibilitychange", start);
    document.documentElement.addEventListener("pointerleave", onPointerGone);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(spotRaf);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onPointerGone);
      document.removeEventListener("visibilitychange", start);
      document.documentElement.removeEventListener("pointerleave", onPointerGone);
    };
  }, []);

  return (
    <div ref={rootRef} className="bg print:hidden" aria-hidden="true">
      <div className="bg-aurora">
        <i />
        <i />
        <i />
      </div>
      <div className="bg-dots" />
      <div ref={hotRef} className="bg-dots-hot" />
      <div className="bg-fade" />
      {/* Drawn last so the bottom fade does not dim the constellations. */}
      <canvas ref={canvasRef} className="bg-net" />
      <div ref={labelRef} className="bg-sky-label" />
    </div>
  );
});

/**
 * Which experience view to start on. Opening the site at #resume shows the
 * resume sheet straight away. Read during the first render rather than in an
 * effect, which would paint the timeline first and then swap it (a visible
 * jump and a wasted render).
 * @returns {"timeline"|"sheet"}
 */
function initialView() {
  return IN_BROWSER && window.location.hash === "#resume" ? "sheet" : "timeline";
}

/**
 * The palette's key hint for this platform, worked out once.
 * @returns {string} "⌘ K" on macOS, otherwise "Ctrl K".
 */
function shortcutLabel() {
  if (!IN_BROWSER) return "Ctrl K";
  const platform = navigator.userAgentData?.platform ?? navigator.platform ?? "";
  return platform.toLowerCase().includes("mac") ? "⌘ K" : "Ctrl K";
}

/**
 * Root component.
 *
 * Owns the only state shared across sections: the experience view, which
 * dialog is open, and the toast. Everything it passes down is either that
 * state or a useCallback-stable function, so the memoised sections re-render
 * only when a prop they actually use changes.
 */
export default function Portfolio() {
  const [view, setView] = useState(initialView);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [shortcut] = useState(shortcutLabel);
  const toastTimer = useRef(null);

  /* Every handler below is wrapped in useCallback so its identity survives
   * re-renders. That is what lets the memo()-wrapped sections skip rendering
   * when only the toast or a dialog changes. */
  const notify = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // The one always-on key listener. It is a single comparison per keypress,
  // and it cannot be passive because it must preventDefault the browser's own
  // Ctrl/Cmd+K. The palette itself is not mounted until this opens it.
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
      if (id === "experience") setView("timeline");
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
  const closeDownload = useCallback(() => setDownloadOpen(false), []);
  const confirmDownload = useCallback(() => {
    setDownloadOpen(false);
    notify("Download started: Raymond_Yang_Resume.pdf");
  }, [notify]);
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  // Built once: every dependency is a stable callback. `search` is each
  // item's lower-cased text, precomputed so filtering does no string building.
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
      // Keep each group's items together: the palette prints a group heading
      // whenever the group changes from one row to the next.
      github && { id: "github", group: "Links", label: "GitHub", hint: github.replace("https://", ""), icon: Github, href: github },
      linkedin && { id: "linkedin", group: "Links", label: "LinkedIn", hint: linkedin.replace("https://", ""), icon: Linkedin, href: linkedin },
      { id: "copy-email", group: "Actions", label: "Copy email address", icon: Copy, run: onCopyEmail },
      { id: "copy-resume", group: "Actions", label: "Copy resume as text", icon: FileText, run: onCopyResume },
      resumePdf && { id: "resume-pdf", group: "Actions", label: "Download resume (PDF)", icon: Download, run: openDownload },
    ]
      .filter(Boolean)
      .map((item) => ({ ...item, search: `${item.label} ${item.hint ?? ""} ${item.group}`.toLowerCase() }));
  }, [onNav, onCopyEmail, onCopyResume, openDownload]);

  return (
    <div className="page">
      <Background />
      <div className="shell">
        <Header onNav={onNav} onOpenPalette={openPalette} shortcut={shortcut} />
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

      {paletteOpen ? <CommandPalette onClose={closePalette} items={paletteItems} /> : null}
      {downloadOpen ? <DownloadConfirm onClose={closeDownload} onConfirm={confirmDownload} /> : null}

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
