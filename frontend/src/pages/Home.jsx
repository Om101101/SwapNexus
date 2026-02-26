import React, { useEffect, useState, useRef, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import axios from "axios";
import { motion, useInView, AnimatePresence } from "framer-motion";

/* ============================================================
   GLOBAL CSS — injected once
   ============================================================ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg:         #09090b;
    --bg-1:       #0f0f12;
    --bg-2:       #131317;
    --bg-3:       #18181d;
    --border:     #27272a;
    --border-hi:  #3f3f46;
    --text:       #fafafa;
    --text-2:     #a1a1aa;
    --text-3:     #71717a;
    --accent:     #0891b2;
    --accent-dim: rgba(8,145,178,0.12);
    --accent-glow:rgba(8,145,178,0.25);
    --accent-vis: #22d3ee;
    --green:      #4ade80;
    --amber:      #fbbf24;
    --radius:     10px;
    --radius-lg:  16px;
    --shadow:     0 0 0 1px var(--border);
    --font:       'Plus Jakarta Sans', sans-serif;
    --mono:       'JetBrains Mono', monospace;
    --transition: 0.2s cubic-bezier(0.4,0,0.2,1);
    --nav-bg:     rgba(9,9,11,0.82);
  }

  /* ── LIGHT THEME ── */
  [data-theme="light"] {
    --bg:         #ffffff;
    --bg-1:       #f4f4f5;
    --bg-2:       #e4e4e7;
    --bg-3:       #d4d4d8;
    --border:     #e4e4e7;
    --border-hi:  #a1a1aa;
    --text:       #09090b;
    --text-2:     #3f3f46;
    --text-3:     #71717a;
    --accent:     #0891b2;
    --accent-dim: rgba(8,145,178,0.08);
    --accent-glow:rgba(8,145,178,0.2);
    --accent-vis: #0891b2;
    --green:      #16a34a;
    --amber:      #d97706;
    --nav-bg:     rgba(255,255,255,0.88);
  }

  /* Smooth theme transition */
  *, *::before, *::after { transition: background-color 0.25s ease, border-color 0.25s ease, color 0.15s ease; }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; font-size: 16px; }
  body { background: var(--bg); color: var(--text); font-family: var(--font); -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  a { text-decoration: none; }
  img { display: block; max-width: 100%; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 3px; }

  /* Keyframes */
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
  @keyframes ping    { 75%,100%{transform:scale(2);opacity:0} }
  @keyframes orb1    { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.05)} }
  @keyframes orb2    { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,20px) scale(0.97)} }
  @keyframes floatY  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }

  /* Nav */
  .snx-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    height: 60px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px;
    background: var(--nav-bg);
    backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid var(--border);
  }
  .snx-nav-links { display: flex; gap: 4px; }
  .snx-nav-links a {
    color: var(--text-2); font-size: 14px; font-weight: 500; padding: 6px 12px;
    border-radius: 6px; transition: color var(--transition), background var(--transition);
  }
  .snx-nav-links a:hover { color: var(--text); background: var(--bg-3); }
  .snx-nav-right { display: flex; align-items: center; gap: 12px; }
  .snx-nav-signin { color: var(--text-2); font-size: 14px; font-weight: 500; padding: 6px 12px; border-radius: 6px; transition: color var(--transition); }
  .snx-nav-signin:hover { color: var(--text); }
  .snx-btn-sm {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 14px; font-weight: 600; padding: 7px 16px;
    border-radius: var(--radius); cursor: pointer; transition: all var(--transition);
    font-family: var(--font); border: 1px solid transparent;
  }
  .snx-btn-primary {
    background: var(--accent); color: #09090b;
  }
  .snx-btn-primary:hover { background: #67e8f9; box-shadow: 0 0 20px var(--accent-glow); transform: translateY(-1px); }
  .snx-btn-ghost { background: var(--bg-3); color: var(--text); border: 1px solid var(--border); }
  .snx-btn-ghost:hover { border-color: var(--border-hi); background: var(--bg-2); }
  .snx-btn-outline { background: transparent; color: var(--text); border: 1px solid var(--border); }
  .snx-btn-outline:hover { border-color: var(--accent); color: var(--accent); }

  /* Logo */
  .snx-logo { display: flex; align-items: center; gap: 10px; }
  .snx-logo-icon {
    width: 30px; height: 30px; border-radius: 8px;
    background: linear-gradient(135deg, var(--accent) 0%, #818cf8 100%);
    display: flex; align-items: center; justify-content: center; font-size: 15px;
  }
  .snx-logo-text { font-size: 16px; font-weight: 800; color: var(--text); letter-spacing: -0.5px; }

  /* Hero */
  .snx-hero {
    min-height: 100vh; position: relative; overflow: hidden;
    display: grid; grid-template-columns: 1fr 1fr;
    align-items: center; padding: 100px 64px 60px; gap: 48px;
  }
  .snx-hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accent-dim); border: 1px solid rgba(34,211,238,0.3);
    color: var(--accent); padding: 5px 12px 5px 8px; border-radius: 100px;
    font-size: 12px; font-weight: 600; letter-spacing: 0.3px; margin-bottom: 24px;
  }
  .snx-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); position: relative; }
  .snx-badge-dot::after { content:''; position:absolute; inset:-2px; border-radius:50%; background:var(--accent); animation: ping 1.5s cubic-bezier(0,0,.2,1) infinite; }
  .snx-hero-h1 {
    font-size: clamp(36px, 4.5vw, 64px); font-weight: 800;
    line-height: 1.1; letter-spacing: -2px; color: var(--text);
    margin-bottom: 20px;
  }
  .snx-hero-h1 em { font-style: normal; color: var(--accent); }
  .snx-hero-sub { font-size: 17px; color: var(--text-2); line-height: 1.75; font-weight: 400; max-width: 460px; margin-bottom: 36px; }
  .snx-hero-ctas { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 48px; }
  .snx-hero-cta-lg {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accent); color: #09090b; font-weight: 700;
    padding: 12px 24px; border-radius: var(--radius); font-size: 15px;
    transition: all var(--transition); font-family: var(--font);
  }
  .snx-hero-cta-lg:hover { background: #67e8f9; box-shadow: 0 8px 32px var(--accent-glow); transform: translateY(-2px); }
  .snx-hero-cta-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    color: var(--text-2); font-size: 15px; font-weight: 500;
    padding: 12px 20px; border-radius: var(--radius);
    border: 1px solid var(--border); transition: all var(--transition);
    font-family: var(--font);
  }
  .snx-hero-cta-ghost:hover { color: var(--text); border-color: var(--border-hi); background: var(--bg-3); }
  .snx-hero-meta { display: flex; align-items: center; gap: 24px; }
  .snx-hero-meta-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-3); }
  .snx-hero-meta-item strong { color: var(--text-2); }
  .snx-meta-div { width: 1px; height: 14px; background: var(--border); }

  /* Terminal / Code mockup */
  .snx-terminal {
    background: var(--bg-1); border: 1px solid var(--border);
    border-radius: var(--radius-lg); overflow: hidden;
    box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px var(--border);
    animation: floatY 6s ease-in-out infinite;
  }
  .snx-term-bar { display:flex; align-items:center; gap:8px; padding:12px 16px; border-bottom:1px solid var(--border); background:var(--bg-2); }
  .snx-term-dot { width:11px; height:11px; border-radius:50%; }
  .snx-term-title { margin-left:auto; margin-right:auto; font-family:var(--mono); font-size:12px; color:var(--text-3); }
  .snx-term-body { padding:20px; font-family:var(--mono); font-size:13px; line-height:2; }
  .snx-term-prompt { color:var(--text-3); }
  .snx-term-cmd { color:var(--text); }
  .snx-term-out { color:var(--green); }
  .snx-term-acc { color:var(--accent); }
  .snx-term-warn { color:var(--amber); }
  .snx-cursor { display:inline-block; width:8px; height:14px; background:var(--accent); border-radius:1px; animation:blink 1s step-end infinite; vertical-align:middle; margin-left:2px; }

  /* Skill cards in hero */
  .snx-skill-cards { display:flex; flex-wrap:wrap; gap:8px; margin-top:20px; }
  .snx-skill-card {
    display:flex; align-items:center; gap:8px;
    background:var(--bg-2); border:1px solid var(--border);
    border-radius:8px; padding:8px 12px;
    font-size:13px; font-weight:500; color:var(--text-2);
    transition: all var(--transition);
  }
  .snx-skill-card:hover { border-color:var(--accent); color:var(--text); background:var(--accent-dim); }
  .snx-skill-dot { width:7px; height:7px; border-radius:50%; }

  /* Logos strip */
  .snx-logos { border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:28px 64px; display:flex; align-items:center; justify-content:center; gap:0; overflow:hidden; }
  .snx-logos-label { font-size:13px; color:var(--text-3); white-space:nowrap; margin-right:40px; flex-shrink:0; }
  .snx-logos-track { display:flex; align-items:center; gap:48px; overflow:hidden; }
  .snx-logo-item { font-size:14px; font-weight:700; color:var(--text-3); letter-spacing:-0.5px; white-space:nowrap; }

  /* Stats */
  .snx-stats { background:var(--bg-1); border-bottom:1px solid var(--border); padding:56px 64px; }
  .snx-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:32px; max-width:960px; margin:0 auto; }
  .snx-stat { text-align:center; }
  .snx-stat-num { font-size:42px; font-weight:800; color:var(--text); letter-spacing:-2px; line-height:1; margin-bottom:6px; }
  .snx-stat-num span { color:var(--accent); }
  .snx-stat-label { font-size:13px; color:var(--text-3); font-weight:500; }

  /* Section */
  .snx-section { padding:96px 64px; }
  .snx-section-inner { max-width:1100px; margin:0 auto; }
  .snx-eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:12px; font-weight:700; color:var(--accent); letter-spacing:2px; text-transform:uppercase; margin-bottom:14px; }
  .snx-eyebrow::before { content:''; width:16px; height:1px; background:var(--accent); }
  .snx-h2 { font-size:clamp(28px,3vw,46px); font-weight:800; letter-spacing:-1.5px; color:var(--text); line-height:1.15; margin-bottom:16px; }
  .snx-h2 em { font-style:normal; color:var(--accent); }
  .snx-sub { font-size:16px; color:var(--text-2); line-height:1.7; max-width:540px; margin-bottom:56px; font-weight:400; }

  /* Feature grid */
  .snx-features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--border); border:1px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; }
  .snx-feature {
    background:var(--bg); padding:32px; position:relative; overflow:hidden;
    transition: background var(--transition);
  }
  .snx-feature:hover { background:var(--bg-1); }
  .snx-feature::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,var(--accent-dim) 0%,transparent 60%); opacity:0; transition:opacity var(--transition); }
  .snx-feature:hover::after { opacity:1; }
  .snx-feature-icon { width:40px; height:40px; border-radius:10px; background:var(--bg-3); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:18px; margin-bottom:18px; position:relative; z-index:1; }
  .snx-feature-title { font-size:15px; font-weight:700; color:var(--text); margin-bottom:8px; position:relative; z-index:1; }
  .snx-feature-desc { font-size:13px; color:var(--text-3); line-height:1.7; position:relative; z-index:1; }
  .snx-feature-tag { display:inline-block; margin-top:16px; font-size:11px; font-weight:600; color:var(--accent); letter-spacing:0.5px; position:relative; z-index:1; }

  /* How it works */
  .snx-how-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0; position:relative; }
  .snx-how-grid::before { content:''; position:absolute; top:28px; left:10%; right:10%; height:1px; background:linear-gradient(90deg,transparent,var(--border),var(--border),var(--border),transparent); z-index:0; }
  .snx-step { padding:0 16px; text-align:center; position:relative; z-index:1; }
  .snx-step-num-wrap { width:56px; height:56px; border-radius:50%; background:var(--bg-2); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; margin:0 auto 20px; position:relative; transition:all var(--transition); }
  .snx-step:hover .snx-step-num-wrap { border-color:var(--accent); background:var(--accent-dim); }
  .snx-step-num { font-family:var(--mono); font-size:14px; font-weight:500; color:var(--text-3); }
  .snx-step:hover .snx-step-num { color:var(--accent); }
  .snx-step-title { font-size:15px; font-weight:700; color:var(--text); margin-bottom:8px; }
  .snx-step-desc { font-size:13px; color:var(--text-3); line-height:1.65; }

  /* Bento / Dashboard preview */
  .snx-bento { display:grid; grid-template-columns:repeat(12,1fr); grid-template-rows:repeat(3,140px); gap:12px; margin-top:16px; }
  .snx-bento-card {
    background:var(--bg-1); border:1px solid var(--border); border-radius:var(--radius-lg);
    padding:20px; overflow:hidden; position:relative;
    transition:border-color var(--transition), box-shadow var(--transition);
  }
  .snx-bento-card:hover { border-color:var(--border-hi); box-shadow:0 8px 32px rgba(0,0,0,0.3); }
  .snx-bento-label { font-size:11px; font-weight:700; color:var(--text-3); letter-spacing:1px; text-transform:uppercase; margin-bottom:10px; }
  .snx-bento-value { font-size:32px; font-weight:800; color:var(--text); letter-spacing:-1px; }
  .snx-bento-sub { font-size:12px; color:var(--text-3); margin-top:4px; }
  .snx-bento-up { font-size:11px; color:var(--green); font-weight:600; }
  .c-7-5 { grid-column: span 7; }
  .c-5   { grid-column: span 5; }
  .c-4   { grid-column: span 4; }
  .c-3   { grid-column: span 3; }
  .c-6   { grid-column: span 6; }
  .c-8   { grid-column: span 8; }

  /* Match card */
  .snx-match { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--border); }
  .snx-match:last-child { border-bottom:none; }
  .snx-avatar { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; flex-shrink:0; }
  .snx-match-name { font-size:13px; font-weight:600; color:var(--text); }
  .snx-match-role { font-size:11px; color:var(--text-3); }
  .snx-match-score { margin-left:auto; font-family:var(--mono); font-size:12px; color:var(--green); font-weight:500; }

  /* Mini chart bars */
  .snx-mini-bars { display:flex; align-items:flex-end; gap:4px; height:60px; margin-top:12px; }
  .snx-bar { flex:1; border-radius:3px 3px 0 0; background:var(--bg-3); min-height:4px; transition:all 0.4s; }
  .snx-bar-accent { background:linear-gradient(to top, var(--accent), #818cf8); }

  /* Pricing */
  .snx-pricing-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .snx-plan {
    background:var(--bg-1); border:1px solid var(--border); border-radius:var(--radius-lg);
    padding:28px; transition:all var(--transition); position:relative; overflow:hidden;
  }
  .snx-plan:hover { border-color:var(--border-hi); transform:translateY(-2px); box-shadow:0 16px 48px rgba(0,0,0,0.3); }
  .snx-plan-featured {
    border-color:var(--accent) !important;
    background:linear-gradient(160deg,rgba(34,211,238,0.06) 0%,var(--bg-1) 60%);
  }
  .snx-plan-featured-badge { position:absolute; top:16px; right:16px; background:var(--accent); color:#09090b; font-size:10px; font-weight:800; padding:3px 8px; border-radius:4px; letter-spacing:0.5px; }
  .snx-plan-name { font-size:13px; font-weight:700; color:var(--text-2); text-transform:uppercase; letter-spacing:1px; margin-bottom:16px; }
  .snx-plan-price { font-size:42px; font-weight:800; color:var(--text); letter-spacing:-2px; line-height:1; }
  .snx-plan-price sup { font-size:20px; font-weight:600; vertical-align:top; margin-top:8px; color:var(--text-2); }
  .snx-plan-price span { font-size:14px; color:var(--text-3); font-weight:400; letter-spacing:0; }
  .snx-plan-desc { font-size:13px; color:var(--text-3); margin:10px 0 24px; line-height:1.6; }
  .snx-plan-btn { display:block; text-align:center; padding:10px; border-radius:var(--radius); font-size:14px; font-weight:600; margin-bottom:24px; transition:all var(--transition); font-family:var(--font); }
  .snx-plan-btn-featured { background:var(--accent); color:#09090b; }
  .snx-plan-btn-featured:hover { background:#67e8f9; }
  .snx-plan-btn-ghost { background:var(--bg-3); color:var(--text); border:1px solid var(--border); }
  .snx-plan-btn-ghost:hover { border-color:var(--border-hi); }
  .snx-plan-features { list-style:none; display:flex; flex-direction:column; gap:10px; }
  .snx-plan-features li { display:flex; align-items:center; gap:10px; font-size:13px; color:var(--text-2); }
  .snx-check { width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .snx-check-yes { background:rgba(74,222,128,0.15); color:var(--green); }
  .snx-check-no { background:var(--bg-3); color:var(--text-3); }

  /* Testimonials */
  .snx-testimonials { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .snx-testi {
    background:var(--bg-1); border:1px solid var(--border); border-radius:var(--radius-lg);
    padding:24px; transition:all var(--transition);
  }
  .snx-testi:hover { border-color:var(--border-hi); }
  .snx-stars { display:flex; gap:2px; margin-bottom:14px; }
  .snx-star { color:var(--amber); font-size:12px; }
  .snx-testi-text { font-size:14px; color:var(--text-2); line-height:1.75; margin-bottom:20px; font-weight:400; }
  .snx-testi-author { display:flex; align-items:center; gap:10px; }
  .snx-testi-name { font-size:14px; font-weight:700; color:var(--text); }
  .snx-testi-role { font-size:12px; color:var(--text-3); }

  /* CTA */
  .snx-cta-band {
    margin:0 64px 80px; border-radius:20px;
    background:var(--bg-1); border:1px solid var(--border);
    padding:72px 64px; text-align:center; position:relative; overflow:hidden;
  }
  .snx-cta-glow { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:600px; height:300px; background:radial-gradient(ellipse,var(--accent-dim) 0%,transparent 70%); pointer-events:none; }
  .snx-cta-band h2 { font-size:clamp(28px,3vw,48px); font-weight:800; letter-spacing:-2px; color:var(--text); margin-bottom:12px; position:relative; z-index:1; }
  .snx-cta-band p { font-size:16px; color:var(--text-2); margin-bottom:36px; position:relative; z-index:1; }
  .snx-cta-actions { display:flex; justify-content:center; gap:12px; position:relative; z-index:1; flex-wrap:wrap; }

  /* Footer */
  .snx-footer { border-top:1px solid var(--border); padding:60px 64px 32px; background:var(--bg); }
  .snx-footer-top { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:40px; margin-bottom:48px; }
  .snx-footer-brand p { font-size:13px; color:var(--text-3); margin-top:12px; line-height:1.6; max-width:260px; }
  .snx-footer-col-title { font-size:12px; font-weight:700; color:var(--text-2); text-transform:uppercase; letter-spacing:1px; margin-bottom:16px; }
  .snx-footer-links { display:flex; flex-direction:column; gap:10px; }
  .snx-footer-links a { font-size:13px; color:var(--text-3); transition:color var(--transition); }
  .snx-footer-links a:hover { color:var(--text); }
  .snx-footer-bottom { border-top:1px solid var(--border); padding-top:24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; }
  .snx-footer-bottom-text { font-size:12px; color:var(--text-3); }
  .snx-footer-bottom-links { display:flex; gap:20px; }
  .snx-footer-bottom-links a { font-size:12px; color:var(--text-3); transition:color var(--transition); }
  .snx-footer-bottom-links a:hover { color:var(--text); }

  /* Theme Toggle */
  .snx-theme-toggle {
    width: 36px; height: 36px; border-radius: 8px;
    background: var(--bg-2); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 16px; transition: all var(--transition);
    flex-shrink: 0;
  }
  .snx-theme-toggle:hover { background: var(--bg-3); border-color: var(--border-hi); transform: scale(1.05); }

  /* Grid BG */
  .snx-grid-bg {
    position:absolute; inset:0; pointer-events:none;
    background-image: linear-gradient(var(--border) 1px, transparent 1px),
                      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 64px 64px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
    opacity: 0.5;
  }
  .snx-gradient-top { position:absolute; top:-200px; left:50%; transform:translateX(-50%); width:800px; height:600px; background:radial-gradient(ellipse, var(--accent-dim) 0%, transparent 70%); pointer-events:none; }

  /* Responsive */
  @media (max-width: 1024px) {
    .snx-hero { grid-template-columns:1fr; padding:100px 32px 60px; gap:48px; }
    .snx-hero-sub { max-width:100%; }
    .snx-features-grid { grid-template-columns:repeat(2,1fr); }
    .snx-how-grid { grid-template-columns:repeat(2,1fr); gap:32px; }
    .snx-how-grid::before { display:none; }
    .snx-pricing-grid { grid-template-columns:1fr; max-width:420px; margin:0 auto; }
    .snx-testimonials { grid-template-columns:repeat(2,1fr); }
    .snx-footer-top { grid-template-columns:1fr 1fr; }
    .snx-bento { display:none; }
    .snx-stats-grid { grid-template-columns:repeat(2,1fr); }
    .snx-section { padding:72px 32px; }
    .snx-logos { padding:24px 32px; }
    .snx-stats { padding:48px 32px; }
    .snx-nav { padding:0 20px; }
    .snx-nav-links { display:none; }
    .snx-cta-band { margin:0 32px 60px; padding:48px 32px; }
    .snx-footer { padding:48px 32px 28px; }
    .snx-footer-bottom { flex-direction:column; align-items:flex-start; }
  }
  @media (max-width: 640px) {
    .snx-hero { padding:90px 20px 48px; }
    .snx-hero-h1 { font-size:36px; letter-spacing:-1.5px; }
    .snx-hero-meta { flex-wrap:wrap; gap:12px; }
    .snx-features-grid { grid-template-columns:1fr; }
    .snx-how-grid { grid-template-columns:1fr; }
    .snx-testimonials { grid-template-columns:1fr; }
    .snx-section { padding:56px 20px; }
    .snx-stats-grid { grid-template-columns:repeat(2,1fr); gap:24px; }
    .snx-stat-num { font-size:32px; }
    .snx-cta-band { margin:0 20px 48px; padding:36px 20px; }
    .snx-logos { flex-direction:column; gap:16px; padding:24px 20px; }
    .snx-logos-label { margin-right:0; margin-bottom:8px; }
    .snx-logos-track { flex-wrap:wrap; justify-content:center; gap:20px; }
    .snx-footer { padding:40px 20px 24px; }
    .snx-footer-top { grid-template-columns:1fr; }
    .snx-cta-actions { flex-direction:column; align-items:center; }
  }
`;

/* ============================================================
   TYPEWRITER HOOK
   ============================================================ */
function useTypewriter(words, speed = 65, deleteSpeed = 40, pause = 2200) {
  const [displayed, setDisplayed] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIdx % words.length];
    let t;
    if (!deleting && displayed.length < word.length) {
      t = setTimeout(
        () => setDisplayed(word.slice(0, displayed.length + 1)),
        speed,
      );
    } else if (!deleting && displayed.length === word.length) {
      t = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && displayed.length > 0) {
      t = setTimeout(
        () => setDisplayed(word.slice(0, displayed.length - 1)),
        deleteSpeed,
      );
    } else {
      setDeleting(false);
      setWordIdx((i) => i + 1);
    }
    return () => clearTimeout(t);
  }, [displayed, deleting, wordIdx, words, speed, deleteSpeed, pause]);

  return displayed;
}

/* ============================================================
   COUNTER HOOK
   ============================================================ */
function useCounter(end, inView, duration = 1600) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= end) {
        setVal(end);
        clearInterval(t);
      } else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [inView, end, duration]);
  return val;
}

/* ============================================================
   3D SCENE — subtle, professional
   ============================================================ */
function Knot() {
  const r = useRef();
  useFrame(({ clock }) => {
    if (r.current) {
      r.current.rotation.x = clock.getElapsedTime() * 0.22;
      r.current.rotation.y = clock.getElapsedTime() * 0.38;
    }
  });
  return (
    <mesh ref={r}>
      <torusKnotGeometry args={[1.1, 0.32, 200, 40]} />
      <meshStandardMaterial
        color="#22d3ee"
        emissive="#0891b2"
        emissiveIntensity={0.3}
        metalness={0.8}
        roughness={0.15}
        wireframe={false}
      />
    </mesh>
  );
}

/* ============================================================
   STAT ITEM
   ============================================================ */
function StatItem({ end, suffix, label }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true });
  const val = useCounter(end, inView);
  return (
    <div className="snx-stat" ref={ref}>
      <div className="snx-stat-num">
        {val.toLocaleString()}
        <span>{suffix}</span>
      </div>
      <div className="snx-stat-label">{label}</div>
    </div>
  );
}

/* ============================================================
   MINI BAR CHART — decorative
   ============================================================ */
function MiniBarChart({ data, accent }) {
  const max = Math.max(...data);
  return (
    <div className="snx-mini-bars">
      {data.map((v, i) => (
        <div
          key={i}
          className={`snx-bar ${accent && i >= data.length - 3 ? "snx-bar-accent" : ""}`}
          style={{
            height: `${(v / max) * 100}%`,
            transitionDelay: `${i * 40}ms`,
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   DATA
   ============================================================ */
const NAV_LINKS = ["Explore", "Marketplace", "Community", "Docs", "Pricing"];

const HERO_WORDS = [
  "Exchange Skills.",
  "Ship Together.",
  "Grow Faster.",
  "Build Anything.",
];

const COMPANIES = [
  "GitHub",
  "Vercel",
  "Stripe",
  "Linear",
  "Figma",
  "Notion",
  "Railway",
  "Supabase",
];

const STATS_DATA = [
  { end: 42000, suffix: "+", label: "Active Members" },
  { end: 128000, suffix: "+", label: "Skills Exchanged" },
  { end: 97, suffix: "%", label: "Satisfaction Rate" },
  { end: 90, suffix: "+", label: "Countries" },
];

const FEATURES = [
  {
    icon: "⚡",
    title: "AI-Powered Matching",
    desc: "Our matching engine analyzes 40+ signals — skills, timezone, work style, and project scope — to find your ideal collaborator in seconds.",
    tag: "Powered by ML",
  },
  {
    icon: "🔄",
    title: "Fair Exchange Protocol",
    desc: "Our time-banking system ensures every swap is equitable. 1 hour of your skill equals 1 hour of theirs — transparent and community-audited.",
    tag: "Blockchain Verified",
  },
  {
    icon: "🛡️",
    title: "Skill Verification",
    desc: "Submit a real project sample for peer review. Earn a verified badge that tells potential swap partners exactly what they're getting.",
    tag: "Peer Reviewed",
  },
  {
    icon: "📦",
    title: "Built-in Workspace",
    desc: "Kanban boards, file sharing, milestone tracking, and encrypted messaging — your collaboration tools, zero context switching.",
    tag: "All-in-one",
  },
  {
    icon: "💬",
    title: "Smart Contracts",
    desc: "Define deliverables, deadlines, and revision rounds upfront. Our lightweight agreement layer protects both parties automatically.",
    tag: "Zero Legal Fees",
  },
  {
    icon: "📈",
    title: "SwapScore™ Analytics",
    desc: "Track your reputation, swap history, and skill demand. Know when to price up and which skills the market needs most.",
    tag: "Real-time Data",
  },
];

const HOW_STEPS = [
  {
    num: "01",
    title: "Create Your Profile",
    desc: "List skills you offer and skills you want. Add portfolio samples that showcase your best work.",
  },
  {
    num: "02",
    title: "Get Matched",
    desc: "Our AI surfaces the most compatible swap partners based on skills, availability, and ratings.",
  },
  {
    num: "03",
    title: "Agree on Scope",
    desc: "Define deliverables, hours, and timeline in our lightweight agreement builder. Both parties sign.",
  },
  {
    num: "04",
    title: "Collaborate & Close",
    desc: "Work in the built-in workspace, hit milestones, collect your swap, and leave a verified review.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "0",
    desc: "Everything you need to start swapping skills and building your reputation.",
    cta: "Get Started Free",
    ctaClass: "snx-plan-btn-ghost",
    featured: false,
    features: [
      { text: "5 active swap proposals", yes: true },
      { text: "Basic AI matching", yes: true },
      { text: "Community workspace", yes: true },
      { text: "SwapScore™ profile", yes: true },
      { text: "Smart contracts", yes: false },
      { text: "Priority matching", yes: false },
    ],
  },
  {
    name: "Pro",
    price: "19",
    desc: "For serious builders who swap skills multiple times a month.",
    cta: "Start Free Trial",
    ctaClass: "snx-plan-btn-featured",
    featured: true,
    features: [
      { text: "Unlimited swap proposals", yes: true },
      { text: "Advanced AI matching", yes: true },
      { text: "Private workspace rooms", yes: true },
      { text: "Smart contracts & escrow", yes: true },
      { text: "Priority matching queue", yes: true },
      { text: "Analytics dashboard", yes: true },
    ],
  },
  {
    name: "Team",
    price: "49",
    desc: "Built for agencies, startups, and collectives sharing a skill pool.",
    cta: "Talk to Sales",
    ctaClass: "snx-plan-btn-ghost",
    featured: false,
    features: [
      { text: "Everything in Pro", yes: true },
      { text: "Up to 10 team members", yes: true },
      { text: "Shared skill inventory", yes: true },
      { text: "Team analytics & reporting", yes: true },
      { text: "Dedicated success manager", yes: true },
      { text: "SLA & uptime guarantee", yes: true },
    ],
  },
];

const TESTIMONIALS = [
  {
    name: "Arjun Mehta",
    role: "Full Stack Dev · Mumbai",
    avatar: "AM",
    color: "#22d3ee",
    text: "I traded 6 hours of Next.js consulting for brand identity work worth ₹40,000. SwapNexus made it feel like the most natural business transaction I've ever done.",
  },
  {
    name: "Sofia Reyes",
    role: "UX Designer · Barcelona",
    avatar: "SR",
    color: "#818cf8",
    text: "Found a backend engineer through the AI matching — within 48 hours we had a scope agreed, a workspace set up, and were shipping code together. It's genuinely magical.",
  },
  {
    name: "David Chen",
    role: "Growth Marketer · Toronto",
    avatar: "DC",
    color: "#4ade80",
    text: "Swapped SEO strategy sessions for mobile app development. The smart contract meant zero awkward conversations about scope. My newsletter grew 3x in 60 days.",
  },
];

const SKILL_TAGS = [
  { label: "React / Next.js", color: "#22d3ee" },
  { label: "UI/UX Design", color: "#818cf8" },
  { label: "Python / ML", color: "#4ade80" },
  { label: "DevOps", color: "#f59e0b" },
  { label: "Copywriting", color: "#f472b6" },
  { label: "Mobile Dev", color: "#34d399" },
];

const MATCHES = [
  {
    name: "Neha Sharma",
    role: "UI Designer",
    avatar: "NS",
    color: "#818cf8",
    score: "98% match",
  },
  {
    name: "Rohan Das",
    role: "Go Engineer",
    avatar: "RD",
    color: "#4ade80",
    score: "94% match",
  },
  {
    name: "Emma Liu",
    role: "Data Scientist",
    avatar: "EL",
    color: "#f59e0b",
    score: "91% match",
  },
];

const BAR_DATA = [12, 19, 8, 24, 31, 28, 35, 22, 40, 38, 45, 52, 48, 60];

/* ============================================================
   TERMINAL MOCKUP
   ============================================================ */
function Terminal() {
  const [line, setLine] = useState(0);
  const lines = [
    {
      type: "prompt",
      content: '$ swapnexus find --skill="React" --need="UI/UX"',
    },
    { type: "out", content: "→ Scanning 42,000 members..." },
    { type: "acc", content: "✓ Found 3 high-compatibility matches" },
    { type: "out", content: "→ Top match: @neha.design  [98% compat]" },
    { type: "out", content: "→ Skill: Figma, Prototyping, Design Systems" },
    { type: "warn", content: "! Send swap proposal? [Y/n]" },
    { type: "acc", content: "✓ Proposal sent. Workspace created." },
  ];

  useEffect(() => {
    if (line >= lines.length) return;
    const t = setTimeout(() => setLine((l) => l + 1), line === 0 ? 400 : 700);
    return () => clearTimeout(t);
  }, [line, lines.length]);

  const color = (type) => {
    if (type === "out") return "var(--text-2)";
    if (type === "acc") return "var(--green)";
    if (type === "warn") return "var(--amber)";
    return "var(--text)";
  };

  return (
    <div className="snx-terminal">
      <div className="snx-term-bar">
        <div className="snx-term-dot" style={{ background: "#ff5f57" }} />
        <div className="snx-term-dot" style={{ background: "#febc2e" }} />
        <div className="snx-term-dot" style={{ background: "#28c840" }} />
        <span className="snx-term-title">swapnexus — zsh</span>
      </div>
      <div className="snx-term-body">
        {lines.slice(0, line).map((l, i) => (
          <div key={i} style={{ color: color(l.type) }}>
            {l.content}
          </div>
        ))}
        {line < lines.length && <span className="snx-cursor" />}
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD BENTO
   ============================================================ */
function BentoDashboard() {
  return (
    <div className="snx-bento">
      {/* Swaps active */}
      <div className="snx-bento-card c-4">
        <div className="snx-bento-label">Active Swaps</div>
        <div className="snx-bento-value">7</div>
        <div className="snx-bento-up">↑ 2 new this week</div>
      </div>
      {/* Bar chart */}
      <div className="snx-bento-card c-8">
        <div className="snx-bento-label">Skills Exchanged (30d)</div>
        <MiniBarChart data={BAR_DATA} accent />
      </div>
      {/* Matches */}
      <div className="snx-bento-card c-7-5" style={{ gridRow: "span 2" }}>
        <div className="snx-bento-label">Top Matches For You</div>
        {MATCHES.map((m) => (
          <div key={m.name} className="snx-match">
            <div
              className="snx-avatar"
              style={{ background: m.color + "22", color: m.color }}
            >
              {m.avatar}
            </div>
            <div>
              <div className="snx-match-name">{m.name}</div>
              <div className="snx-match-role">{m.role}</div>
            </div>
            <div className="snx-match-score">{m.score}</div>
          </div>
        ))}
      </div>
      {/* Swap score */}
      <div className="snx-bento-card c-5">
        <div className="snx-bento-label">Your SwapScore™</div>
        <div className="snx-bento-value" style={{ color: "var(--accent)" }}>
          847
        </div>
        <div className="snx-bento-sub">Top 8% of all members</div>
      </div>
      {/* Rep */}
      <div className="snx-bento-card c-5">
        <div className="snx-bento-label">Reputation</div>
        <div style={{ display: "flex", gap: 3, marginTop: 8 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} style={{ fontSize: 20, color: "var(--amber)" }}>
              ★
            </span>
          ))}
        </div>
        <div className="snx-bento-sub" style={{ marginTop: 6 }}>
          48 verified reviews
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SECTION WRAPPER
   ============================================================ */
function RevealSection({ children, className = "", style = {} }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   MOBILE MENU
   ============================================================ */
function MobileMenu({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          style={{
            position: "fixed",
            top: 60,
            left: 0,
            right: 0,
            background: "var(--bg-1)",
            borderBottom: "1px solid var(--border)",
            padding: "20px 24px",
            zIndex: 199,
          }}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href="#"
              onClick={onClose}
              style={{
                display: "block",
                padding: "12px 0",
                color: "var(--text-2)",
                fontSize: 15,
                fontWeight: 500,
                borderBottom: "1px solid var(--border)",
              }}
            >
              {l}
            </a>
          ))}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <a
              href="#"
              style={{
                flex: 1,
                textAlign: "center",
                padding: "11px",
                borderRadius: "var(--radius)",
                background: "var(--bg-3)",
                color: "var(--text)",
                fontSize: 14,
                fontWeight: 600,
                border: "1px solid var(--border)",
              }}
            >
              Sign In
            </a>
            <a
              href="#"
              style={{
                flex: 1,
                textAlign: "center",
                padding: "11px",
                borderRadius: "var(--radius)",
                background: "var(--accent)",
                color: "#09090b",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Start Free
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
const Home = () => {
  const [message, setMessage] = useState(
    "Trade the skills you have for the skills you need — no money required.",
  );
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("snx-theme") || "dark";
    } catch {
      return "dark";
    }
  });
  const typedWord = useTypewriter(HERO_WORDS);

  // Apply theme to root element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("snx-theme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  useEffect(() => {
    axios
      .get("/api/message")
      .then((res) => {
        if (res.data?.message) setMessage(res.data.message);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Inject CSS
  useEffect(() => {
    const id = "snx-styles";
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = GLOBAL_CSS;
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--bg,#09090b)",
          fontFamily: "var(--font,'Plus Jakarta Sans',sans-serif)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "2px solid #27272a",
            borderTop: "2px solid #22d3ee",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <p style={{ color: "#71717a", marginTop: 16, fontSize: 14 }}>
          Loading SwapNexus…
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        data-theme={theme}
        style={{
          fontFamily: "var(--font)",
          background: "var(--bg)",
          color: "var(--text)",
          minHeight: "100vh",
        }}
      >
        {/* ── NAV ── */}
        <nav className="snx-nav">
          <div className="snx-logo">
            <div className="snx-logo-icon">⟳</div>
            <span className="snx-logo-text">SwapNexus</span>
          </div>

          <div className="snx-nav-links">
            {NAV_LINKS.map((l) => (
              <a key={l} href="#" className="snx-nav-links a">
                {l}
              </a>
            ))}
          </div>

          <div className="snx-nav-right">
            <a
              href="#"
              className="snx-nav-signin"
              style={{ color: "var(--text-2)", fontSize: 14, fontWeight: 500 }}
            >
              Sign In
            </a>
            {/* Theme Toggle */}
            <motion.button
              className="snx-theme-toggle"
              onClick={toggleTheme}
              title={
                theme === "dark"
                  ? "Switch to Light Mode"
                  : "Switch to Dark Mode"
              }
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.08 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 30, scale: 0.6 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {theme === "dark" ? "☀️" : "🌙"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <a href="#" className="snx-btn-sm snx-btn-primary">
              Get Started →
            </a>
            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                display: "none",
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "6px 10px",
                cursor: "pointer",
                color: "var(--text-2)",
                fontSize: 18,
              }}
              id="snx-hamburger"
            >
              ☰
            </button>
          </div>
        </nav>

        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* ── HERO ── */}
        <section className="snx-hero">
          <div className="snx-grid-bg" />
          <div className="snx-gradient-top" />

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "relative", zIndex: 2 }}
          >
            <div className="snx-hero-badge">
              <span className="snx-badge-dot" />
              Now in Public Beta — 42,000+ members and growing
            </div>

            <h1 className="snx-hero-h1">
              The platform to
              <br />
              <em>{typedWord}</em>
              <span className="snx-cursor" />
            </h1>

            <p className="snx-hero-sub">{message}</p>

            <div className="snx-hero-ctas">
              <a href="#" className="snx-hero-cta-lg">
                Start Swapping Free
                <span>→</span>
              </a>
              <a href="#" className="snx-hero-cta-ghost">
                <span>▷</span> Watch 2-min Demo
              </a>
            </div>

            <div className="snx-hero-meta">
              <div className="snx-hero-meta-item">
                <strong style={{ color: "var(--green)" }}>✓</strong> No credit
                card
              </div>
              <div className="snx-meta-div" />
              <div className="snx-hero-meta-item">
                <strong style={{ color: "var(--green)" }}>✓</strong> Free
                forever plan
              </div>
              <div className="snx-meta-div" />
              <div className="snx-hero-meta-item">
                <strong style={{ color: "var(--green)" }}>✓</strong> Cancel
                anytime
              </div>
            </div>

            <div className="snx-skill-cards">
              {SKILL_TAGS.map((s) => (
                <div key={s.label} className="snx-skill-card">
                  <div
                    className="snx-skill-dot"
                    style={{ background: s.color }}
                  />
                  {s.label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Terminal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "relative", zIndex: 2 }}
          >
            <Terminal />
          </motion.div>
        </section>

        {/* ── LOGOS STRIP ── */}
        <div className="snx-logos">
          <span className="snx-logos-label">Trusted by teams at</span>
          <div className="snx-logos-track">
            {COMPANIES.map((c) => (
              <span key={c} className="snx-logo-item">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="snx-stats">
          <div className="snx-stats-grid">
            {STATS_DATA.map((s) => (
              <StatItem key={s.label} {...s} />
            ))}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section className="snx-section">
          <div className="snx-section-inner">
            <RevealSection>
              <div className="snx-eyebrow">Platform Features</div>
              <h2 className="snx-h2">
                Everything a skill swap
                <br />
                <em>actually needs</em>
              </h2>
              <p className="snx-sub">
                We obsessed over every friction point in skill trading — so you
                can focus on building great things together.
              </p>
            </RevealSection>

            <div className="snx-features-grid">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="snx-feature"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="snx-feature-icon">{f.icon}</div>
                  <div className="snx-feature-title">{f.title}</div>
                  <div className="snx-feature-desc">{f.desc}</div>
                  <span className="snx-feature-tag">↗ {f.tag}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DASHBOARD PREVIEW ── */}
        <section
          className="snx-section"
          style={{
            background: "var(--bg-1)",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="snx-section-inner">
            <RevealSection>
              <div className="snx-eyebrow">Dashboard Preview</div>
              <h2 className="snx-h2">
                Your skill economy,
                <br />
                <em>at a glance</em>
              </h2>
              <p className="snx-sub">
                Track swaps, monitor your reputation, discover matches, and
                analyze skill demand — all in one place.
              </p>
            </RevealSection>
            <RevealSection>
              <BentoDashboard />
            </RevealSection>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="snx-section">
          <div className="snx-section-inner">
            <RevealSection>
              <div className="snx-eyebrow">How It Works</div>
              <h2 className="snx-h2">
                From profile to
                <br />
                <em>first swap in minutes</em>
              </h2>
              <p className="snx-sub">
                We've removed every unnecessary step so you can spend time
                building, not navigating.
              </p>
            </RevealSection>

            <div className="snx-how-grid">
              {HOW_STEPS.map((s, i) => (
                <motion.div
                  key={s.num}
                  className="snx-step"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="snx-step-num-wrap">
                    <span className="snx-step-num">{s.num}</span>
                  </div>
                  <div className="snx-step-title">{s.title}</div>
                  <div className="snx-step-desc">{s.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section
          className="snx-section"
          style={{
            background: "var(--bg-1)",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="snx-section-inner">
            <RevealSection>
              <div className="snx-eyebrow">Testimonials</div>
              <h2 className="snx-h2">
                Real swaps,
                <br />
                <em>real outcomes</em>
              </h2>
            </RevealSection>

            <div className="snx-testimonials">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  className="snx-testi"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="snx-stars">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <span key={j} className="snx-star">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="snx-testi-text">"{t.text}"</p>
                  <div className="snx-testi-author">
                    <div
                      className="snx-avatar"
                      style={{ background: t.color + "22", color: t.color }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <div className="snx-testi-name">{t.name}</div>
                      <div className="snx-testi-role">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="snx-section">
          <div className="snx-section-inner">
            <RevealSection>
              <div className="snx-eyebrow">Pricing</div>
              <h2 className="snx-h2">
                Simple, transparent
                <br />
                <em>pricing</em>
              </h2>
              <p className="snx-sub">
                Start for free. Upgrade when swapping becomes your superpower.
                No hidden fees, ever.
              </p>
            </RevealSection>

            <div className="snx-pricing-grid">
              {PLANS.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  className={`snx-plan ${plan.featured ? "snx-plan-featured" : ""}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  {plan.featured && (
                    <div className="snx-plan-featured-badge">MOST POPULAR</div>
                  )}
                  <div className="snx-plan-name">{plan.name}</div>
                  <div className="snx-plan-price">
                    <sup>$</sup>
                    {plan.price}
                    <span>/mo</span>
                  </div>
                  <div className="snx-plan-desc">{plan.desc}</div>
                  <a href="#" className={`snx-plan-btn ${plan.ctaClass}`}>
                    {plan.cta}
                  </a>
                  <ul className="snx-plan-features">
                    {plan.features.map((f) => (
                      <li key={f.text}>
                        <div
                          className={`snx-check ${f.yes ? "snx-check-yes" : "snx-check-no"}`}
                        >
                          {f.yes ? "✓" : "–"}
                        </div>
                        <span
                          style={{
                            color: f.yes ? "var(--text-2)" : "var(--text-3)",
                          }}
                        >
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BAND ── */}
        <RevealSection>
          <div className="snx-cta-band">
            <div className="snx-cta-glow" />
            <h2>Ready to make your first swap?</h2>
            <p>
              Join 42,000+ builders who grow their skills without spending a
              rupee.
            </p>
            <div className="snx-cta-actions">
              <a href="#" className="snx-hero-cta-lg">
                Create Free Account →
              </a>
              <a href="#" className="snx-hero-cta-ghost">
                Browse Skill Marketplace
              </a>
            </div>
          </div>
        </RevealSection>

        {/* ── FOOTER ── */}
        <footer className="snx-footer">
          <div className="snx-footer-top">
            <div className="snx-footer-brand">
              <div className="snx-logo">
                <div className="snx-logo-icon">⟳</div>
                <span className="snx-logo-text">SwapNexus</span>
              </div>
              <p>
                The world's skill exchange platform. Trade what you know for
                what you need — no money required.
              </p>
            </div>
            {[
              [
                "Product",
                [
                  "Explore Skills",
                  "Marketplace",
                  "SwapScore™",
                  "Smart Contracts",
                  "Workspace",
                  "Pricing",
                ],
              ],
              [
                "Company",
                ["About Us", "Blog", "Careers", "Press Kit", "Partners"],
              ],
              [
                "Support",
                ["Help Center", "Community", "API Docs", "Status", "Contact"],
              ],
            ].map(([heading, links]) => (
              <div key={heading}>
                <div className="snx-footer-col-title">{heading}</div>
                <div className="snx-footer-links">
                  {links.map((l) => (
                    <a key={l} href="#">
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="snx-footer-bottom">
            <span className="snx-footer-bottom-text">
              © 2025 SwapNexus Inc. All rights reserved.
            </span>
            <div className="snx-footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
            <span
              className="snx-footer-bottom-text"
              style={{ color: "var(--accent)" }}
            >
              Built with swapped skills ♥
            </span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
