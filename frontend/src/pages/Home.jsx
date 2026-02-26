/**
 * SwapNexus — Home Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Light / Dark mode: full CSS-variable system, no hardcoded colours
 * API-ready: all data is in one MOCK block (swap with real axios calls later)
 * Responsive: mobile-first, 3 breakpoints
 * Animations: Framer Motion + CSS keyframes
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────────
   MOCK DATA  ← swap each section with real axios calls later
   ───────────────────────────────────────────────────────────────────────────── */
const MOCK = {
  hero: {
    badge: "Public Beta · 42 k+ Swappers Live",
    words: ["Exchange Skills.", "Ship Together.", "Grow Faster.", "Build Anything."],
    sub:   "Trade the skills you have for the skills you need — no money required. Find your match in minutes.",
  },
  stats: [
    { value: 42000,  suffix: "+", label: "Active Members",    api: "/api/stats/members"   },
    { value: 128000, suffix: "+", label: "Skills Exchanged",  api: "/api/stats/exchanges" },
    { value: 97,     suffix: "%", label: "Satisfaction Rate", api: "/api/stats/sat"       },
    { value: 90,     suffix: "+", label: "Countries",         api: "/api/stats/countries" },
  ],
  features: [
    { icon: "⚡", title: "AI-Powered Matching",     desc: "40+ signals — skills, timezone, work style, project scope. Ideal collaborator in seconds.",   tag: "Powered by ML"    },
    { icon: "🔄", title: "Fair Exchange Protocol",   desc: "Time-banking ensures every swap is equitable. 1 hr of your skill = 1 hr of theirs.",           tag: "Blockchain Logged" },
    { icon: "🛡️", title: "Peer Skill Verification",  desc: "Submit a real project sample for community review. Earn a verified badge partners trust.",      tag: "Peer Reviewed"    },
    { icon: "📦", title: "Built-in Workspace",       desc: "Kanban, file sharing, milestone tracking, encrypted chat — zero context switching.",             tag: "All-in-One"       },
    { icon: "📝", title: "Smart Contracts",           desc: "Define deliverables, deadlines, revision rounds upfront. Automatic protection for both sides.", tag: "Zero Legal Fees"  },
    { icon: "📈", title: "SwapScore™ Analytics",     desc: "Track reputation, swap history, skill demand. Know when to level up your rate.",                tag: "Real-time Data"   },
  ],
  steps: [
    { num: "01", title: "Create Your Profile",  desc: "List skills you offer and skills you want. Add portfolio samples that showcase your best work." },
    { num: "02", title: "Get Matched",           desc: "AI surfaces the most compatible partners based on skills, availability, and ratings."           },
    { num: "03", title: "Agree on Scope",        desc: "Define deliverables, hours, and timeline in our lightweight agreement builder. Both sign."      },
    { num: "04", title: "Collaborate & Close",   desc: "Work in the built-in workspace, hit milestones, collect your swap, leave a verified review."   },
  ],
  plans: [
    {
      name: "Starter", price: "0",  period: "/mo", featured: false,
      desc: "Everything you need to start swapping and build your reputation.",
      cta: "Get Started Free",
      perks: [
        { text: "5 active swap proposals",   yes: true  },
        { text: "Basic AI matching",          yes: true  },
        { text: "Community workspace",        yes: true  },
        { text: "SwapScore™ profile",         yes: true  },
        { text: "Smart contracts",            yes: false },
        { text: "Priority matching",          yes: false },
      ],
    },
    {
      name: "Pro",     price: "19", period: "/mo", featured: true,
      desc: "For serious builders who swap skills multiple times a month.",
      cta: "Start Free Trial",
      perks: [
        { text: "Unlimited swap proposals",   yes: true },
        { text: "Advanced AI matching",       yes: true },
        { text: "Private workspace rooms",    yes: true },
        { text: "Smart contracts & escrow",   yes: true },
        { text: "Priority matching queue",    yes: true },
        { text: "Analytics dashboard",        yes: true },
      ],
    },
    {
      name: "Team",    price: "49", period: "/mo", featured: false,
      desc: "Built for agencies and collectives sharing a skill pool.",
      cta: "Talk to Sales",
      perks: [
        { text: "Everything in Pro",              yes: true },
        { text: "Up to 10 team members",          yes: true },
        { text: "Shared skill inventory",         yes: true },
        { text: "Team analytics & reporting",     yes: true },
        { text: "Dedicated success manager",      yes: true },
        { text: "SLA & uptime guarantee",         yes: true },
      ],
    },
  ],
  testimonials: [
    { name: "Arjun Mehta",  role: "Full-Stack Dev · Mumbai",   av: "AM", color: "#0ea5e9", text: "I traded 6 hr of Next.js consulting for brand identity worth ₹40 k. SwapNexus made it feel like the most natural transaction ever." },
    { name: "Sofia Reyes",  role: "UX Designer · Barcelona",   av: "SR", color: "#8b5cf6", text: "Found a backend engineer through AI matching — within 48 hr we had scope, a workspace, and were shipping code together. Magical." },
    { name: "David Chen",   role: "Growth Marketer · Toronto", av: "DC", color: "#10b981", text: "Swapped SEO sessions for mobile dev. Smart contract meant zero awkward scope chats. My newsletter grew 3× in 60 days." },
  ],
  dashboard: {
    activeSwaps: 7,
    swapScore: 847,
    reviews: 48,
    chartData: [12, 19, 8, 24, 31, 28, 35, 22, 40, 38, 45, 52, 48, 60],
    matches: [
      { name: "Neha Sharma", role: "UI Designer",    av: "NS", color: "#8b5cf6", score: "98%" },
      { name: "Rohan Das",   role: "Go Engineer",    av: "RD", color: "#10b981", score: "94%" },
      { name: "Emma Liu",    role: "Data Scientist", av: "EL", color: "#f59e0b", score: "91%" },
    ],
  },
  skillTags: [
    { label: "React / Next.js", color: "#0ea5e9" },
    { label: "UI / UX Design",  color: "#8b5cf6" },
    { label: "Python / ML",     color: "#10b981" },
    { label: "DevOps",          color: "#f59e0b" },
    { label: "Copywriting",     color: "#f43f5e" },
    { label: "Mobile Dev",      color: "#06b6d4" },
  ],
  companies: [
    {
      name: "GitHub",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`,
    },
    {
      name: "Vercel",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 22.525H0L12 1.475z"/></svg>`,
    },
    {
      name: "Stripe",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg>`,
    },
    {
      name: "Linear",
      svg: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M1.22541 61.5228c-.2225-.9485.90748-1.5459 1.59638-.857L38.3342 96.1782c.6889.6889.0915 1.8189-.857 1.5964C20.0515 94.1512 5.84882 79.9485 1.22541 61.5228zM.00189135 46.8891c-.01764375.2833.08887215.5599.28957165.7606L52.3503 99.7085c.2007.2007.4773.3072.7606.2896 2.3692-.1476 4.6938-.46 6.9624-.9259.7645-.157 1.0301-1.0963.4782-1.6481L2.57595 39.4485c-.55186-.5519-1.49117-.2863-1.648174.4782-.465915 2.2686-.77958 4.5932-.92688 6.9624zM4.21093 29.7054c-.16649.3738-.08169.8106.21109 1.1034L69.1911 95.7789c.2928.2928.7296.3776 1.1034.2111 1.9868-.8853 3.9176-1.9065 5.7798-3.0557.5762-.3529.6355-1.1619.1304-1.6670L7.28223 23.9252c-.50512-.5051-1.31416-.4458-1.66699.1304-1.14926 1.8622-2.17043 3.7930-3.05531 5.7798zM13.0235 18.2073c-.4288-.4288-.4038-1.1275.0589-1.5248 8.69835-7.2035 19.9861-11.54 32.3111-11.54 27.6 0 50 22.4 50 50 0 12.325-4.3365 23.6127-11.54 32.3111-.3973.4627-1.0960.4877-1.5248.0589z"/></svg>`,
    },
    {
      name: "Figma",
      svg: `<svg viewBox="0 0 38 57" fill="currentColor"><path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" opacity=".9"/><path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z" opacity=".6"/><path d="M19 0v19h9.5a9.5 9.5 0 0 0 0-19H19z" opacity=".7"/><path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" opacity=".5"/><path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" opacity=".7"/></svg>`,
    },
    {
      name: "Notion",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/></svg>`,
    },
    {
      name: "Railway",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M.958 11.849c.168 2.2.874 4.322 2.019 6.175L8.503 8.61 5.557 1.28A12.068 12.068 0 0 0 .958 11.849zM12.22.012c-.764.002-1.516.08-2.252.23L14.54 11.98.935 12.14c.028.668.122 1.328.28 1.97L6.47 24h.01c.63.132 1.283.2 1.946.202l4.94-8.558-.003-.005 5.13 8.867a11.952 11.952 0 0 0 5.23-5.81l-5.58-9.665.059-.033 5.14 3.7c-.15-1.45-.573-2.86-1.245-4.148L17.84.824A12.04 12.04 0 0 0 12.22.012zm5.52 1.506 2.217 3.838a12.08 12.08 0 0 0-2.218-3.838z"/></svg>`,
    },
    {
      name: "Supabase",
      svg: `<svg viewBox="0 0 109 113" fill="currentColor"><path d="M63.708 110.284c-2.86 3.601-8.658 1.628-8.727-2.97l-1.007-67.251h45.22c8.19 0 12.758 9.46 7.665 15.874z" opacity=".8"/><path d="M63.708 110.284c-2.86 3.601-8.658 1.628-8.727-2.97l-1.007-67.251h45.22c8.19 0 12.758 9.46 7.665 15.874z"/><path d="M45.317 2.071C48.177-1.53 53.975.443 54.044 5.041l.796 67.251H9.83c-8.19 0-12.759-9.46-7.665-15.875z" opacity=".5"/></svg>`,
    },
  ],
  navLinks: ["Explore", "Marketplace", "Community", "Docs", "Pricing"],
};

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES — all colours via CSS variables, zero hardcoded rgba
   ───────────────────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

/* ── Dark (default) ── */
:root {
  --bg0:#09090b; --bg1:#0f0f12; --bg2:#141418; --bg3:#1c1c22; --bg4:#27272d;
  --bdr:#27272a; --bdrH:#3f3f46;
  --tx0:#fafafa; --tx1:#d4d4d8; --tx2:#a1a1aa; --tx3:#71717a; --tx4:#52525b;
  --acc:#22d3ee; --accD:rgba(34,211,238,0.10); --accB:rgba(34,211,238,0.22); --accG:rgba(34,211,238,0.35);
  --grn:#4ade80; --grnD:rgba(74,222,128,0.13);
  --amb:#fbbf24;
  --nav:rgba(9,9,11,0.84);
  --sdw:0 24px 60px rgba(0,0,0,0.55); --sdwS:0 4px 18px rgba(0,0,0,0.35);
  --font:'Plus Jakarta Sans',system-ui,sans-serif;
  --mono:'JetBrains Mono','Fira Code',monospace;
  --r:10px; --rL:16px; --rXL:24px;
  --ease:cubic-bezier(0.4,0,0.2,1); --t:0.2s var(--ease);
}

/* ── Light ── */
[data-theme="light"] {
  --bg0:#f8fafc; --bg1:#ffffff; --bg2:#f1f5f9; --bg3:#e2e8f0; --bg4:#cbd5e1;
  --bdr:#e2e8f0; --bdrH:#94a3b8;
  --tx0:#0f172a; --tx1:#1e293b; --tx2:#334155; --tx3:#64748b; --tx4:#94a3b8;
  --acc:#0284c7; --accD:rgba(2,132,199,0.08); --accB:rgba(2,132,199,0.20); --accG:rgba(2,132,199,0.30);
  --grn:#059669; --grnD:rgba(5,150,105,0.10);
  --amb:#d97706;
  --nav:rgba(248,250,252,0.90);
  --sdw:0 16px 40px rgba(15,23,42,0.10); --sdwS:0 4px 12px rgba(15,23,42,0.07);
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{
  font-family:var(--font);
  background:var(--bg0);
  color:var(--tx0);
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
  transition:background 0.28s var(--ease),color 0.18s var(--ease);
}
a{text-decoration:none;color:inherit;}
button{font-family:var(--font);cursor:pointer;}

::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:var(--bg0);}
::-webkit-scrollbar-thumb{background:var(--bdr);border-radius:3px;}
::-webkit-scrollbar-thumb:hover{background:var(--bdrH);}

/* Keyframes */
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes ping{75%,100%{transform:scale(2.2);opacity:0}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* NAV */
.nav{
  position:fixed;top:0;left:0;right:0;z-index:200;
  height:60px;display:flex;align-items:center;justify-content:space-between;
  padding:0 40px;
  background:var(--nav);
  backdrop-filter:blur(24px) saturate(200%);
  -webkit-backdrop-filter:blur(24px) saturate(200%);
  border-bottom:1px solid var(--bdr);
  transition:background 0.28s var(--ease),border-color 0.28s var(--ease);
}
.nav-logo{display:flex;align-items:center;gap:10px;}
.nav-mark{
  width:32px;height:32px;border-radius:9px;
  background:linear-gradient(135deg,var(--acc) 0%,#818cf8 100%);
  display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;
}
.nav-wordmark{font-size:17px;font-weight:800;color:var(--tx0);letter-spacing:-0.5px;}
.nav-links{display:flex;gap:2px;}
.nav-link{color:var(--tx2);font-size:14px;font-weight:500;padding:6px 13px;border-radius:7px;transition:color var(--t),background var(--t);}
.nav-link:hover{color:var(--tx0);background:var(--bg3);}
.nav-right{display:flex;align-items:center;gap:10px;}
.nav-signin{color:var(--tx2);font-size:14px;font-weight:500;padding:6px 12px;border-radius:7px;transition:color var(--t);}
.nav-signin:hover{color:var(--tx0);}

/* Toggle */
.toggle{
  width:36px;height:36px;border-radius:9px;
  background:var(--bg2);border:1px solid var(--bdr);
  display:flex;align-items:center;justify-content:center;
  font-size:15px;transition:all var(--t);
}
.toggle:hover{background:var(--bg3);border-color:var(--bdrH);}

/* Buttons */
.btn-primary{
  display:inline-flex;align-items:center;gap:7px;
  background:var(--acc);color:#fff;border:none;
  font-size:14px;font-weight:700;padding:8px 18px;border-radius:var(--r);
  transition:all var(--t);
}
.btn-primary:hover{filter:brightness(1.12);box-shadow:0 0 22px var(--accG);transform:translateY(-1px);}
.btn-primary-lg{
  display:inline-flex;align-items:center;gap:8px;
  background:var(--acc);color:#fff;border:none;
  font-size:15px;font-weight:700;padding:13px 28px;border-radius:var(--r);
  transition:all var(--t);
}
.btn-primary-lg:hover{filter:brightness(1.1);box-shadow:0 8px 28px var(--accG);transform:translateY(-2px);}
.btn-ghost-lg{
  display:inline-flex;align-items:center;gap:8px;
  background:transparent;color:var(--tx1);
  font-size:15px;font-weight:500;padding:13px 24px;border-radius:var(--r);
  border:1px solid var(--bdr);transition:all var(--t);
}
.btn-ghost-lg:hover{background:var(--bg2);border-color:var(--bdrH);}

/* Hamburger */
.hamburger{
  display:none;background:transparent;border:1px solid var(--bdr);
  border-radius:8px;padding:7px 11px;color:var(--tx2);font-size:18px;transition:all var(--t);
}
.hamburger:hover{border-color:var(--bdrH);color:var(--tx0);}

/* Mobile menu */
.mob-menu{
  position:fixed;top:60px;left:0;right:0;z-index:190;
  background:var(--bg1);border-bottom:1px solid var(--bdr);
  padding:16px 24px 24px;box-shadow:var(--sdw);
  transition:background 0.28s var(--ease);
}
.mob-link{display:block;padding:13px 0;color:var(--tx1);font-size:15px;font-weight:500;border-bottom:1px solid var(--bdr);}

/* HERO */
.hero{
  min-height:100vh;position:relative;overflow:hidden;
  display:grid;grid-template-columns:1fr 1fr;
  align-items:center;padding:110px 64px 64px;gap:64px;
}
.hero-grid{
  position:absolute;inset:0;pointer-events:none;
  background-image:
    linear-gradient(var(--bdr) 1px,transparent 1px),
    linear-gradient(90deg,var(--bdr) 1px,transparent 1px);
  background-size:60px 60px;opacity:0.4;
  mask-image:radial-gradient(ellipse 70% 70% at 50% 40%,black 0%,transparent 100%);
}
.hero-glow{
  position:absolute;top:-180px;left:50%;transform:translateX(-50%);
  width:900px;height:700px;
  background:radial-gradient(ellipse,var(--accD) 0%,transparent 68%);
  pointer-events:none;
}
.hero-badge{
  display:inline-flex;align-items:center;gap:8px;
  background:var(--accD);border:1px solid var(--accB);
  color:var(--acc);padding:5px 14px 5px 10px;border-radius:100px;
  font-size:12px;font-weight:600;letter-spacing:0.3px;margin-bottom:22px;
}
.badge-dot{width:7px;height:7px;border-radius:50%;background:var(--acc);position:relative;flex-shrink:0;}
.badge-dot::after{content:'';position:absolute;inset:-3px;border-radius:50%;background:var(--acc);animation:ping 1.8s ease-out infinite;}
.hero-h1{font-size:clamp(38px,4.8vw,68px);font-weight:800;line-height:1.08;letter-spacing:-2.5px;color:var(--tx0);margin-bottom:20px;}
.hero-em{color:var(--acc);}
.hero-cursor{display:inline-block;width:3px;height:0.9em;background:var(--acc);border-radius:2px;vertical-align:text-bottom;animation:blink 1s step-end infinite;margin-left:3px;}
.hero-sub{font-size:17px;color:var(--tx2);line-height:1.75;max-width:480px;margin-bottom:36px;font-weight:400;}
.hero-ctas{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:32px;}
.hero-trust{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:28px;}
.trust-item{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--tx3);}
.trust-check{color:var(--grn);font-size:12px;}
.trust-div{width:1px;height:13px;background:var(--bdr);flex-shrink:0;}
.hero-tags{display:flex;flex-wrap:wrap;gap:7px;}
.skill-tag{
  display:flex;align-items:center;gap:7px;
  background:var(--bg1);border:1px solid var(--bdr);
  border-radius:8px;padding:7px 13px;
  font-size:13px;font-weight:500;color:var(--tx2);
  transition:all var(--t);
}
.skill-tag:hover{border-color:var(--acc);color:var(--tx0);background:var(--accD);}
.skill-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}

/* TERMINAL */
.terminal{
  background:var(--bg1);border:1px solid var(--bdr);
  border-radius:var(--rL);overflow:hidden;
  box-shadow:var(--sdw);
  animation:float 7s ease-in-out infinite;
  transition:background 0.28s var(--ease),border-color 0.28s var(--ease);
}
.term-bar{
  display:flex;align-items:center;gap:7px;
  padding:12px 16px;background:var(--bg2);
  border-bottom:1px solid var(--bdr);
  transition:background 0.28s var(--ease),border-color 0.28s var(--ease);
}
.term-dot{width:12px;height:12px;border-radius:50%;}
.term-title{margin:0 auto;font-family:var(--mono);font-size:12px;color:var(--tx3);}
.term-body{padding:20px 22px;font-family:var(--mono);font-size:13px;line-height:2.1;min-height:200px;}
.t-prompt{color:var(--tx3);}
.t-cmd   {color:var(--tx0);}
.t-ok    {color:var(--grn);}
.t-acc   {color:var(--acc);}
.t-warn  {color:var(--amb);}
.t-cursor{display:inline-block;width:8px;height:15px;background:var(--acc);border-radius:1px;vertical-align:middle;animation:blink 1s step-end infinite;margin-left:2px;}

/* LOGOS STRIP */
.logos-strip{
  border-top:1px solid var(--bdr);border-bottom:1px solid var(--bdr);
  padding:32px 0;overflow:hidden;
  background:var(--bg1);
  transition:background 0.28s var(--ease),border-color 0.28s var(--ease);
  position:relative;
}
.logos-fade-l,.logos-fade-r{
  position:absolute;top:0;bottom:0;width:160px;z-index:2;pointer-events:none;
  transition:background 0.28s var(--ease);
}
.logos-fade-l{left:0;background:linear-gradient(90deg,var(--bg1) 20%,transparent 100%);}
.logos-fade-r{right:0;background:linear-gradient(-90deg,var(--bg1) 20%,transparent 100%);}
.logos-label{text-align:center;font-size:11px;color:var(--tx4);letter-spacing:2.5px;text-transform:uppercase;margin-bottom:20px;font-weight:600;}
.logos-track{display:flex;align-items:center;gap:0;width:max-content;animation:marquee 32s linear infinite;}
.logos-track:hover{animation-play-state:paused;}
.logo-chip{
  display:inline-flex;align-items:center;gap:9px;
  padding:10px 28px;
  color:var(--tx3);
  transition:color 0.2s var(--ease);
  white-space:nowrap;
  cursor:default;
}
.logo-chip:hover{color:var(--tx1);}
.logo-chip svg{width:18px;height:18px;flex-shrink:0;}
.logo-chip-name{font-size:14px;font-weight:700;letter-spacing:-0.3px;}
.logos-divider{width:1px;height:20px;background:var(--bdr);flex-shrink:0;}

/* STATS */
.stats-band{
  background:var(--bg1);border-bottom:1px solid var(--bdr);padding:56px 64px;
  transition:background 0.28s var(--ease),border-color 0.28s var(--ease);
}
.stats-grid{display:grid;grid-template-columns:1fr 1px 1fr 1px 1fr 1px 1fr;gap:0;max-width:860px;margin:0 auto;align-items:center;}
.stat-item{text-align:center;padding:8px 20px;}
.stat-num{font-size:46px;font-weight:800;color:var(--tx0);letter-spacing:-2.5px;line-height:1;}
.stat-suf{color:var(--acc);}
.stat-label{font-size:13px;color:var(--tx3);font-weight:500;margin-top:6px;}
.stat-divider{width:1px;height:48px;background:var(--bdr);}

/* SECTION */
.section{padding:96px 64px;}
.inner{max-width:1120px;margin:0 auto;}
.section-alt{
  background:var(--bg1);border-top:1px solid var(--bdr);border-bottom:1px solid var(--bdr);
  transition:background 0.28s var(--ease),border-color 0.28s var(--ease);
}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;color:var(--acc);letter-spacing:2.5px;text-transform:uppercase;margin-bottom:14px;}
.eyebrow::before{content:'';width:18px;height:1.5px;background:var(--acc);flex-shrink:0;}
.sh2{font-size:clamp(26px,3vw,46px);font-weight:800;letter-spacing:-1.5px;color:var(--tx0);line-height:1.12;margin-bottom:16px;}
.sh2-acc{color:var(--acc);}
.s-sub{font-size:16px;color:var(--tx2);line-height:1.75;max-width:520px;margin-bottom:56px;}

/* FEATURES */
.feats-grid{display:grid;grid-template-columns:repeat(3,1fr);background:var(--bdr);gap:1px;border:1px solid var(--bdr);border-radius:var(--rL);overflow:hidden;}
.feat{
  padding:32px 28px;position:relative;overflow:hidden;
  background:var(--bg0);
  transition:background var(--t);
}
[data-theme="light"] .feat{background:var(--bg1);}
.feat::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--accD) 0%,transparent 55%);opacity:0;transition:opacity var(--t);}
.feat:hover{background:var(--bg1);}
[data-theme="light"] .feat:hover{background:var(--bg2);}
.feat:hover::before{opacity:1;}
.feat-icon{width:42px;height:42px;border-radius:10px;background:var(--bg2);border:1px solid var(--bdr);display:flex;align-items:center;justify-content:center;font-size:19px;margin-bottom:18px;position:relative;z-index:1;transition:all var(--t);}
.feat:hover .feat-icon{background:var(--accD);border-color:var(--accB);}
.feat-title{font-size:15px;font-weight:700;color:var(--tx0);margin-bottom:9px;position:relative;z-index:1;}
.feat-desc{font-size:13px;color:var(--tx3);line-height:1.72;position:relative;z-index:1;}
.feat-tag{display:inline-block;margin-top:16px;font-size:11px;font-weight:700;color:var(--acc);letter-spacing:0.8px;text-transform:uppercase;position:relative;z-index:1;}

/* BENTO */
.bento{display:grid;grid-template-columns:repeat(12,1fr);grid-auto-rows:140px;gap:10px;}
.bento-card{
  background:var(--bg0);border:1px solid var(--bdr);border-radius:var(--rL);
  padding:20px;overflow:hidden;
  transition:border-color var(--t),box-shadow var(--t),background 0.28s var(--ease);
}
[data-theme="light"] .bento-card{background:var(--bg2);}
.bento-card:hover{border-color:var(--bdrH);box-shadow:var(--sdwS);}
.bento-label{font-size:11px;font-weight:700;color:var(--tx3);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;}
.bento-val{font-size:36px;font-weight:800;color:var(--tx0);letter-spacing:-1.5px;line-height:1;}
.bento-sub{font-size:12px;color:var(--tx3);margin-top:5px;}
.bento-up{font-size:12px;color:var(--grn);font-weight:600;margin-top:4px;}
.bento-score{color:var(--acc);}
.c4{grid-column:span 4;} .c5{grid-column:span 5;} .c7{grid-column:span 7;} .c8{grid-column:span 8;} .rspan2{grid-row:span 2;}

/* Bar chart */
.bars{display:flex;align-items:flex-end;gap:3px;height:70px;margin-top:10px;}
.bar{flex:1;border-radius:3px 3px 0 0;background:var(--bg3);min-height:3px;transition:background 0.28s var(--ease);}
.bar-hi{background:linear-gradient(to top,var(--acc),#818cf8);}

/* Match row */
.match-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--bdr);}
.match-row:last-child{border-bottom:none;padding-bottom:0;}
.av{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;}
.match-name{font-size:13px;font-weight:600;color:var(--tx0);}
.match-role{font-size:11px;color:var(--tx3);}
.match-score{margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--grn);font-weight:600;}

/* HOW IT WORKS */
.steps-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;position:relative;}
.steps-grid::before{content:'';position:absolute;top:27px;left:13%;right:13%;height:1px;background:linear-gradient(90deg,transparent,var(--bdr) 20%,var(--bdr) 80%,transparent);z-index:0;}
.step{padding:0 14px;text-align:center;position:relative;z-index:1;}
.step-ring{
  width:54px;height:54px;border-radius:50%;
  background:var(--bg1);border:1px solid var(--bdr);
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 20px;transition:all var(--t);
}
[data-theme="light"] .step-ring{background:var(--bg0);}
.step:hover .step-ring{border-color:var(--acc);background:var(--accD);}
.step-num{font-family:var(--mono);font-size:13px;font-weight:500;color:var(--tx3);transition:color var(--t);}
.step:hover .step-num{color:var(--acc);}
.step-title{font-size:15px;font-weight:700;color:var(--tx0);margin-bottom:8px;}
.step-desc{font-size:13px;color:var(--tx3);line-height:1.65;}

/* PRICING */
.pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
.plan{
  background:var(--bg1);border:1px solid var(--bdr);border-radius:var(--rL);
  padding:28px;position:relative;overflow:hidden;
  transition:border-color var(--t),transform var(--t),box-shadow var(--t),background 0.28s var(--ease);
}
[data-theme="light"] .plan{background:var(--bg2);}
.plan:hover{border-color:var(--bdrH);transform:translateY(-3px);box-shadow:var(--sdw);}
.plan-featured{border-color:var(--accB) !important;}
.plan-featured-bg{position:absolute;inset:0;background:linear-gradient(160deg,var(--accD) 0%,transparent 55%);pointer-events:none;}
.plan-badge{position:absolute;top:16px;right:16px;background:var(--acc);color:#fff;font-size:9px;font-weight:800;padding:3px 9px;border-radius:5px;letter-spacing:1px;}
.plan-name{font-size:12px;font-weight:700;color:var(--tx2);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px;position:relative;z-index:1;}
.plan-price{font-size:44px;font-weight:800;color:var(--tx0);letter-spacing:-2.5px;line-height:1;position:relative;z-index:1;}
.plan-price sup{font-size:20px;font-weight:600;vertical-align:top;margin-top:8px;color:var(--tx2);}
.plan-price span{font-size:14px;color:var(--tx3);font-weight:400;letter-spacing:0;}
.plan-desc{font-size:13px;color:var(--tx3);margin:10px 0 22px;line-height:1.65;position:relative;z-index:1;}
.plan-btn{display:block;text-align:center;padding:10px;border-radius:var(--r);font-size:14px;font-weight:600;margin-bottom:22px;transition:all var(--t);font-family:var(--font);border:none;position:relative;z-index:1;}
.plan-btn-acc{background:var(--acc);color:#fff;}
.plan-btn-acc:hover{filter:brightness(1.1);}
.plan-btn-ghost{background:var(--bg3);color:var(--tx0);border:1px solid var(--bdr);}
.plan-btn-ghost:hover{border-color:var(--bdrH);background:var(--bg4);}
.plan-perks{list-style:none;display:flex;flex-direction:column;gap:9px;position:relative;z-index:1;}
.plan-perks li{display:flex;align-items:center;gap:10px;font-size:13px;}
.perk-yes{color:var(--tx1);}
.perk-no{color:var(--tx4);}
.chk{width:17px;height:17px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;}
.chk-y{background:var(--grnD);color:var(--grn);}
.chk-n{background:var(--bg3);color:var(--tx3);}

/* TESTIMONIALS */
.testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
.testi{
  background:var(--bg1);border:1px solid var(--bdr);border-radius:var(--rL);
  padding:24px;
  transition:border-color var(--t),transform var(--t),background 0.28s var(--ease);
}
[data-theme="light"] .testi{background:var(--bg2);}
.testi:hover{border-color:var(--bdrH);transform:translateY(-2px);}
.stars{display:flex;gap:2px;margin-bottom:14px;}
.star{color:var(--amb);font-size:13px;}
.testi-text{font-size:14px;color:var(--tx2);line-height:1.78;margin-bottom:20px;}
.testi-name{font-size:14px;font-weight:700;color:var(--tx0);}
.testi-role{font-size:12px;color:var(--tx3);}

/* CTA BAND */
.cta-band{
  margin:0 64px 80px;border-radius:var(--rXL);
  background:var(--bg1);border:1px solid var(--bdr);
  padding:80px 64px;text-align:center;position:relative;overflow:hidden;
  transition:background 0.28s var(--ease),border-color 0.28s var(--ease);
}
[data-theme="light"] .cta-band{background:var(--bg2);}
.cta-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:700px;height:400px;background:radial-gradient(ellipse,var(--accD) 0%,transparent 68%);pointer-events:none;}
.cta-h2{font-size:clamp(26px,3.2vw,50px);font-weight:800;letter-spacing:-2px;color:var(--tx0);margin-bottom:14px;position:relative;z-index:1;}
.cta-sub{font-size:16px;color:var(--tx2);margin-bottom:36px;position:relative;z-index:1;}
.cta-btns{display:flex;justify-content:center;gap:12px;position:relative;z-index:1;flex-wrap:wrap;}

/* FOOTER */
.footer{
  border-top:1px solid var(--bdr);padding:64px 64px 36px;
  background:var(--bg1);
  transition:background 0.28s var(--ease),border-color 0.28s var(--ease);
}
[data-theme="light"] .footer{background:var(--bg2);}
.footer-top{display:grid;grid-template-columns:2.2fr 1fr 1fr 1fr;gap:40px;margin-bottom:56px;}
.footer-brand-desc{font-size:13px;color:var(--tx3);margin-top:12px;line-height:1.65;max-width:240px;}
.footer-col-title{font-size:12px;font-weight:700;color:var(--tx0);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px;}
.footer-links-col{display:flex;flex-direction:column;gap:10px;}
.footer-link{font-size:13px;color:var(--tx3);transition:color var(--t);}
.footer-link:hover{color:var(--tx0);}
.footer-bottom{border-top:1px solid var(--bdr);padding-top:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;}
.footer-copy{font-size:12px;color:var(--tx3);}
.footer-bottom-links{display:flex;gap:20px;}
.footer-bottom-link{font-size:12px;color:var(--tx3);transition:color var(--t);}
.footer-bottom-link:hover{color:var(--tx0);}
.footer-love{font-size:12px;color:var(--acc);}

/* RESPONSIVE */
@media(max-width:1024px){
  .hero{grid-template-columns:1fr;padding:100px 40px 64px;gap:48px;}
  .hero-sub{max-width:100%;}
  .nav{padding:0 24px;}
  .nav-links{display:none;}
  .hamburger{display:flex;}
  .feats-grid{grid-template-columns:repeat(2,1fr);}
  .steps-grid{grid-template-columns:repeat(2,1fr);gap:32px;}
  .steps-grid::before{display:none;}
  .pricing-grid{grid-template-columns:1fr;max-width:400px;margin:0 auto;}
  .testi-grid{grid-template-columns:repeat(2,1fr);}
  .footer-top{grid-template-columns:1fr 1fr;}
  .bento{display:none;}
  .stats-band{padding:48px 40px;}
  .section{padding:72px 40px;}
  .cta-band{margin:0 40px 64px;padding:56px 40px;}
  .footer{padding:48px 40px 28px;}
}
@media(max-width:680px){
  .hero{padding:90px 20px 56px;}
  .hero-h1{font-size:38px;letter-spacing:-1.5px;}
  .hero-trust{gap:10px;}
  .feats-grid{grid-template-columns:1fr;}
  .steps-grid{grid-template-columns:1fr;}
  .testi-grid{grid-template-columns:1fr;}
  .section{padding:56px 20px;}
  .stats-band{padding:40px 20px;}
  .stats-grid{grid-template-columns:1fr 1px 1fr;grid-auto-rows:auto;}
  .stat-divider:nth-child(4),.stat-divider:last-child{display:none;}
  .stat-num{font-size:36px;}
  .cta-band{margin:0 20px 48px;padding:40px 20px;}
  .footer{padding:40px 20px 24px;}
  .footer-top{grid-template-columns:1fr;}
  .footer-bottom{flex-direction:column;align-items:flex-start;}
  .cta-btns{flex-direction:column;align-items:center;}
}
`;

/* ─────────────────────────────────────────────────────────────────────────────
   HOOKS
   ───────────────────────────────────────────────────────────────────────────── */
function useTypewriter(words, speed = 65, delSpeed = 38, pause = 2400) {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const word = words[idx % words.length];
    let t;
    if (!del && text.length < word.length)      t = setTimeout(() => setText(word.slice(0, text.length + 1)), speed);
    else if (!del && text.length === word.length) t = setTimeout(() => setDel(true), pause);
    else if (del && text.length > 0)             t = setTimeout(() => setText(word.slice(0, text.length - 1)), delSpeed);
    else { setDel(false); setIdx(i => i + 1); }
    return () => clearTimeout(t);
  }, [text, del, idx, words, speed, delSpeed, pause]);
  return text;
}

function useCounter(end, active, duration = 1700) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let cur = 0;
    const step = end / (duration / 16);
    const t = setInterval(() => {
      cur += step;
      if (cur >= end) { setV(end); clearInterval(t); }
      else setV(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [active, end, duration]);
  return v;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────────────────────────────────────── */
function StatItem({ value, suffix, label }) {
  const ref = useRef();
  const inV = useInView(ref, { once: true });
  const v   = useCounter(value, inV);
  return (
    <div className="stat-item" ref={ref}>
      <div className="stat-num">{v.toLocaleString()}<span className="stat-suf">{suffix}</span></div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Reveal({ children, delay = 0, className = "" }) {
  const ref  = useRef();
  const inV  = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inV ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function BarChart({ data }) {
  const ref  = useRef();
  const inV  = useInView(ref, { once: true });
  const max  = Math.max(...data);
  return (
    <div className="bars" ref={ref}>
      {data.map((v, i) => (
        <motion.div
          key={i}
          className={`bar${i >= data.length - 4 ? " bar-hi" : ""}`}
          initial={{ height: 3 }}
          animate={inV ? { height: `${(v / max) * 100}%` } : {}}
          transition={{ duration: 0.5, delay: i * 0.04, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function Terminal() {
  const [lines, setLines] = useState([]);
  const SCRIPT = [
    { cls: "t-prompt", txt: "$ swapnexus match --offer=\"React\" --want=\"UI/UX\"" },
    { cls: "t-ok",     txt: "→  Scanning 42,000 member profiles..." },
    { cls: "t-acc",    txt: "✓  3 high-compatibility matches found" },
    { cls: "t-ok",     txt: "   #1  @neha.design       [98% · Figma, Design Systems]" },
    { cls: "t-ok",     txt: "   #2  @rohan.codes       [94% · Go, PostgreSQL]" },
    { cls: "t-ok",     txt: "   #3  @priya.motion      [91% · Motion, GSAP]" },
    { cls: "t-warn",   txt: "?  Send proposal to @neha.design? [Y/n]" },
    { cls: "t-acc",    txt: "✓  Proposal sent · Workspace #4821 ready" },
    { cls: "t-acc",    txt: "✓  Smart contract drafted · Both notified" },
  ];
  useEffect(() => {
    let i = 0;
    const go = () => {
      if (i >= SCRIPT.length) return;
      setLines(l => [...l, SCRIPT[i]]);
      i++;
      setTimeout(go, i === 1 ? 500 : 680);
    };
    const init = setTimeout(go, 600);
    return () => clearTimeout(init);
  }, []);

  return (
    <div className="terminal">
      <div className="term-bar">
        <div className="term-dot" style={{ background:"#ff5f57" }} />
        <div className="term-dot" style={{ background:"#febc2e" }} />
        <div className="term-dot" style={{ background:"#28c840" }} />
        <span className="term-title">swapnexus — terminal</span>
      </div>
      <div className="term-body">
        {lines.map((l, i) => <div key={i} className={l.cls}>{l.txt}</div>)}
        {lines.length < SCRIPT.length && <span className="t-cursor" />}
      </div>
    </div>
  );
}

function Dashboard({ data }) {
  return (
    <div className="bento">
      <div className="bento-card c4">
        <div className="bento-label">Active Swaps</div>
        <div className="bento-val">{data.activeSwaps}</div>
        <div className="bento-up">↑ 2 new this week</div>
      </div>
      <div className="bento-card c8">
        <div className="bento-label">Skills Exchanged — 30 days</div>
        <BarChart data={data.chartData} />
      </div>
      <div className="bento-card c7 rspan2">
        <div className="bento-label">Top Matches for You</div>
        {data.matches.map(m => (
          <div key={m.name} className="match-row">
            <div className="av" style={{ background:m.color+"22", color:m.color }}>{m.av}</div>
            <div>
              <div className="match-name">{m.name}</div>
              <div className="match-role">{m.role}</div>
            </div>
            <div className="match-score">{m.score}</div>
          </div>
        ))}
      </div>
      <div className="bento-card c5">
        <div className="bento-label">SwapScore™</div>
        <div className="bento-val bento-score">{data.swapScore}</div>
        <div className="bento-sub">Top 8% of members</div>
      </div>
      <div className="bento-card c5">
        <div className="bento-label">Reputation</div>
        <div style={{ display:"flex", gap:3, marginTop:10 }}>
          {[1,2,3,4,5].map(s=><span key={s} style={{ fontSize:22, color:"var(--amb)" }}>★</span>)}
        </div>
        <div className="bento-sub" style={{ marginTop:6 }}>{data.reviews} verified reviews</div>
      </div>
    </div>
  );
}

function MobMenu({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="mob-menu"
          initial={{ opacity:0, y:-12 }}
          animate={{ opacity:1, y:0 }}
          exit={{ opacity:0, y:-12 }}
          transition={{ duration:0.18 }}
        >
          {MOCK.navLinks.map(l => (
            <a key={l} href="#" className="mob-link" onClick={onClose}>{l}</a>
          ))}
          <div style={{ display:"flex", gap:12, marginTop:20 }}>
            <a href="#" style={{ flex:1, textAlign:"center", padding:11, borderRadius:"var(--r)", background:"var(--bg3)", color:"var(--tx0)", fontSize:14, fontWeight:600, border:"1px solid var(--bdr)" }}>Sign In</a>
            <a href="#" style={{ flex:1, textAlign:"center", padding:11, borderRadius:"var(--r)", background:"var(--acc)", color:"#fff", fontSize:14, fontWeight:700 }}>Start Free</a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────────────────────────────────────── */
export default function Home() {
  const [apiMsg,  setApiMsg]  = useState(MOCK.hero.sub);
  const [loading, setLoading] = useState(true);
  const [menu,    setMenu]    = useState(false);
  const [theme,   setTheme]   = useState(() => {
    try { return localStorage.getItem("snx-theme") || "dark"; } catch { return "dark"; }
  });

  const typed = useTypewriter(MOCK.hero.words);

  // Inject CSS once
  useEffect(() => {
    let el = document.getElementById("snx-css");
    if (!el) { el = document.createElement("style"); el.id = "snx-css"; document.head.appendChild(el); }
    el.textContent = CSS;
  }, []);

  // Apply theme to <html> so :root cascades everywhere
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem("snx-theme", theme); } catch {}
  }, [theme]);

  // API — falls back to MOCK gracefully
  useEffect(() => {
    axios.get("/api/message")
      .then(r => { if (r.data?.message) setApiMsg(r.data.message); })
      .catch(() => {})
      .finally(() => setLoading(false));
    // TODO: replace MOCK sections with real endpoints:
    // axios.get("/api/stats").then(r => setStats(r.data));
    // axios.get("/api/features").then(r => setFeatures(r.data));
    // axios.get("/api/testimonials").then(r => setTestimonials(r.data));
  }, []);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", background:"var(--bg0)", fontFamily:"var(--font,sans-serif)" }}>
      <div style={{ width:36, height:36, border:"2px solid var(--bdr,#27272a)", borderTop:"2px solid var(--acc,#22d3ee)", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
      <p style={{ color:"var(--tx3,#71717a)", marginTop:16, fontSize:14 }}>Loading SwapNexus…</p>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", fontFamily:"var(--font)", background:"var(--bg0)", color:"var(--tx0)" }}>

      {/* ══ NAV ══ */}
      <nav className="nav">
        <a href="/" className="nav-logo">
          <div className="nav-mark">⟳</div>
          <span className="nav-wordmark">SwapNexus</span>
        </a>
        <div className="nav-links">
          {MOCK.navLinks.map(l => <a key={l} href="#" className="nav-link">{l}</a>)}
        </div>
        <div className="nav-right">
          <a href="#" className="nav-signin">Sign In</a>
          <motion.button className="toggle" onClick={toggleTheme} title="Toggle theme" whileTap={{ scale:0.88 }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={theme}
                initial={{ opacity:0, rotate:-40, scale:0.5 }}
                animate={{ opacity:1, rotate:0, scale:1 }}
                exit={{ opacity:0, rotate:40, scale:0.5 }}
                transition={{ duration:0.18 }}
                style={{ display:"flex", alignItems:"center", justifyContent:"center" }}
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </motion.span>
            </AnimatePresence>
          </motion.button>
          <a href="#" className="btn-primary">Get Started →</a>
          <button className="hamburger" onClick={() => setMenu(o=>!o)}>{menu?"✕":"☰"}</button>
        </div>
      </nav>

      <MobMenu open={menu} onClose={() => setMenu(false)} />

      {/* ══ HERO ══ */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-glow" />

        <motion.div
          initial={{ opacity:0, y:28 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.75, ease:[0.22,1,0.36,1] }}
          style={{ position:"relative", zIndex:2 }}
        >
          <div className="hero-badge">
            <span className="badge-dot" />
            {MOCK.hero.badge}
          </div>
          <h1 className="hero-h1">
            The platform to<br />
            <span className="hero-em">{typed}</span>
            <span className="hero-cursor" />
          </h1>
          <p className="hero-sub">{apiMsg}</p>
          <div className="hero-ctas">
            <motion.a href="#" className="btn-primary-lg" whileTap={{ scale:0.97 }}>Start Swapping Free →</motion.a>
            <motion.a href="#" className="btn-ghost-lg" whileTap={{ scale:0.97 }}>▷ Watch 2-min Demo</motion.a>
          </div>
          <div className="hero-trust">
            {[["✓","No credit card"],["✓","Free forever plan"],["✓","Cancel anytime"]].map(([c,t],i) => (
              <React.Fragment key={t}>
                {i>0 && <div className="trust-div"/>}
                <div className="trust-item"><span className="trust-check">{c}</span> {t}</div>
              </React.Fragment>
            ))}
          </div>
          <div className="hero-tags">
            {MOCK.skillTags.map(t => (
              <div key={t.label} className="skill-tag">
                <span className="skill-dot" style={{ background:t.color }} />
                {t.label}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity:0, scale:0.94, y:20 }}
          animate={{ opacity:1, scale:1, y:0 }}
          transition={{ duration:0.85, delay:0.18, ease:[0.22,1,0.36,1] }}
          style={{ position:"relative", zIndex:2 }}
        >
          <Terminal />
        </motion.div>
      </section>

      {/* ══ LOGOS ══ */}
      <div className="logos-strip">
        <div className="logos-fade-l" />
        <div className="logos-fade-r" />
        <div className="logos-label">Trusted by builders from</div>
        <div style={{ overflow:"hidden" }}>
          <div className="logos-track">
            {[...MOCK.companies, ...MOCK.companies].map((c, i) => (
              <React.Fragment key={i}>
                <div className="logo-chip">
                  <span
                    style={{ width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}
                    dangerouslySetInnerHTML={{ __html: c.svg }}
                  />
                  <span className="logo-chip-name">{c.name}</span>
                </div>
                <div className="logos-divider" />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ══ STATS ══ */}
      <div className="stats-band">
        <div className="stats-grid">
          {MOCK.stats.map((s,i)=>(
            <React.Fragment key={s.label}>
              <StatItem {...s} />
              {i < MOCK.stats.length-1 && <div className="stat-divider" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ══ FEATURES ══ */}
      <section className="section">
        <div className="inner">
          <Reveal>
            <div className="eyebrow">Platform Features</div>
            <h2 className="sh2">Everything a skill swap<br /><span className="sh2-acc">actually needs</span></h2>
            <p className="s-sub">We obsessed over every friction point in skill trading — so you can focus on building great things together.</p>
          </Reveal>
          <div className="feats-grid">
            {MOCK.features.map((f,i)=>(
              <motion.div key={f.title} className="feat"
                initial={{ opacity:0, y:20 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ duration:0.5, delay:i*0.07, ease:[0.22,1,0.36,1] }}
              >
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
                <div className="feat-tag">↗ {f.tag}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DASHBOARD ══ */}
      <section className="section section-alt">
        <div className="inner">
          <Reveal>
            <div className="eyebrow">Live Dashboard</div>
            <h2 className="sh2">Your skill economy,<br /><span className="sh2-acc">at a glance</span></h2>
            <p className="s-sub">Track swaps, monitor reputation, discover matches, and analyse skill demand — all in one place.</p>
          </Reveal>
          <Reveal delay={0.1}><Dashboard data={MOCK.dashboard} /></Reveal>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="section">
        <div className="inner">
          <Reveal>
            <div className="eyebrow">How It Works</div>
            <h2 className="sh2">From profile to<br /><span className="sh2-acc">first swap in minutes</span></h2>
            <p className="s-sub">Every unnecessary step removed so you spend time building, not navigating.</p>
          </Reveal>
          <div className="steps-grid">
            {MOCK.steps.map((s,i)=>(
              <motion.div key={s.num} className="step"
                initial={{ opacity:0, y:20 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ duration:0.5, delay:i*0.1 }}
              >
                <div className="step-ring"><span className="step-num">{s.num}</span></div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="section section-alt">
        <div className="inner">
          <Reveal>
            <div className="eyebrow">Testimonials</div>
            <h2 className="sh2">Real swaps,<br /><span className="sh2-acc">real outcomes</span></h2>
          </Reveal>
          <div className="testi-grid">
            {MOCK.testimonials.map((t,i)=>(
              <motion.div key={t.name} className="testi"
                initial={{ opacity:0, y:18 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ duration:0.5, delay:i*0.1 }}
              >
                <div className="stars">{[1,2,3,4,5].map(s=><span key={s} className="star">★</span>)}</div>
                <p className="testi-text">"{t.text}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div className="av" style={{ background:t.color+"22", color:t.color }}>{t.av}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section className="section">
        <div className="inner">
          <Reveal>
            <div className="eyebrow">Pricing</div>
            <h2 className="sh2">Simple, transparent<br /><span className="sh2-acc">pricing</span></h2>
            <p className="s-sub">Start free. Upgrade when swapping becomes your superpower. No hidden fees.</p>
          </Reveal>
          <div className="pricing-grid">
            {MOCK.plans.map((p,i)=>(
              <motion.div key={p.name} className={`plan${p.featured?" plan-featured":""}`}
                initial={{ opacity:0, y:24 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ duration:0.5, delay:i*0.1 }}
              >
                {p.featured && <div className="plan-featured-bg" />}
                {p.featured && <div className="plan-badge">MOST POPULAR</div>}
                <div className="plan-name">{p.name}</div>
                <div className="plan-price"><sup>$</sup>{p.price}<span>{p.period}</span></div>
                <div className="plan-desc">{p.desc}</div>
                <button className={`plan-btn ${p.featured?"plan-btn-acc":"plan-btn-ghost"}`}>{p.cta}</button>
                <ul className="plan-perks">
                  {p.perks.map(pk=>(
                    <li key={pk.text} className={pk.yes?"perk-yes":"perk-no"}>
                      <div className={`chk ${pk.yes?"chk-y":"chk-n"}`}>{pk.yes?"✓":"–"}</div>
                      {pk.text}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BAND ══ */}
      <Reveal>
        <div className="cta-band">
          <div className="cta-glow" />
          <h2 className="cta-h2">Ready to make your first swap?</h2>
          <p className="cta-sub">Join 42,000+ builders who grow without spending a rupee.</p>
          <div className="cta-btns">
            <motion.a href="#" className="btn-primary-lg" whileTap={{ scale:0.97 }}>Create Free Account →</motion.a>
            <motion.a href="#" className="btn-ghost-lg" whileTap={{ scale:0.97 }}>Browse Marketplace</motion.a>
          </div>
        </div>
      </Reveal>

      {/* ══ FOOTER ══ */}
      <footer className="footer">
        <div className="footer-top">
          <div>
            <div className="nav-logo">
              <div className="nav-mark">⟳</div>
              <span className="nav-wordmark">SwapNexus</span>
            </div>
            <p className="footer-brand-desc">The world's skill exchange platform — trade what you know for what you need, no money required.</p>
          </div>
          {[
            ["Product",  ["Explore Skills","Marketplace","SwapScore™","Smart Contracts","Workspace","Pricing"]],
            ["Company",  ["About Us","Blog","Careers","Press Kit","Partners"]],
            ["Support",  ["Help Center","Community","API Docs","Status Page","Contact"]],
          ].map(([heading, links])=>(
            <div key={heading}>
              <div className="footer-col-title">{heading}</div>
              <div className="footer-links-col">
                {links.map(l=><a key={l} href="#" className="footer-link">{l}</a>)}
              </div>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2025 SwapNexus Inc. All rights reserved.</span>
          <div className="footer-bottom-links">
            {["Privacy Policy","Terms of Service","Cookie Policy"].map(l=>(
              <a key={l} href="#" className="footer-bottom-link">{l}</a>
            ))}
          </div>
          <span className="footer-love">Built with swapped skills ♥</span>
        </div>
      </footer>
    </div>
  );
}