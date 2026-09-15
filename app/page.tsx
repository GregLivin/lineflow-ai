'use client';

import Link from 'next/link';
import { useState } from 'react';
import LiveClock from '../components/LiveClock';
import ProductionSchedule from '../components/ProductionSchedule';
import TeamMessageBoard from '../components/TeamMessageBoard';
import LanguageToggle, { getLanguage, translations, LineFlowLanguage } from '../components/LanguageToggle';

export default function Home() {
  const [language,setLanguage]=useState<LineFlowLanguage>(()=>typeof window==='undefined'?'en':getLanguage());
  const t=translations[language];
  return (
    <main className="shell homeShell">
      <style>{`
        .clockMobileCompact { display: none; }
        .demoAccessFooter { margin:14px 0 4px; padding:10px 14px; border-top:1px solid var(--border); color:var(--muted); font-size:.72rem; line-height:1.5; text-align:center; }
        .demoAccessFooter strong { color:var(--text); }
        .homeLanguageRow{display:flex;justify-content:flex-end;margin-bottom:10px}.languageToggle{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid var(--border);border-radius:999px;background:rgba(8,17,31,.72);font-size:.78rem}.languageChoice{border:0;background:transparent;color:var(--muted);font-weight:800;cursor:pointer;padding:3px 5px}.languageChoice.activeLanguage{color:var(--accent)}.languageDivider{color:var(--border)}
        @media (max-width: 680px) {
          .homeHeroCompact { padding: 14px 16px !important; }.homeLanguageRow{margin-bottom:8px}.languageToggle{font-size:.72rem;padding:6px 8px}
          .homeHeroCompact .heroTopRow { flex-direction: column !important; align-items: stretch !important; gap: 10px !important; }.homeHeroCompact .brandRow { gap: 10px; align-items: center; }.homeHeroCompact .logoMark { width:44px; height:44px; border-radius:14px; font-size:.8rem; flex:0 0 auto; }.homeHeroCompact .eyebrow { font-size:.58rem; margin-bottom:2px; }.homeHeroCompact h1 { font-size:1.8rem !important; }.homeHeroCompact .liveClock { width:100%; min-width:0; padding:8px 12px; border-radius:12px; text-align:left; }.homeHeroCompact .clockDesktop { display:none; }.homeHeroCompact .clockMobileCompact { display:flex; align-items:center; justify-content:space-between; gap:8px; color:var(--muted); font-size:.76rem; }.homeHeroCompact .clockMobileCompact strong { color:var(--text); font-size:.95rem; }.homeHeroCompact .operationsStatusRow { margin-top:10px !important; }.homeHeroCompact .systemMeta { font-size:.72rem; line-height:1.35; }.homeHeroCompact .heroBottomRow { margin-top:8px !important; gap:10px !important; align-items:center !important; justify-content:flex-end !important; }.homeHeroCompact .homeActions { width:auto !important; flex:0 0 auto; }.homeHeroCompact .homeActions .primaryButton { width:auto !important; min-height:38px; padding:0 18px; border-radius:11px; }.homeShell > .teamMessageBoard, .homeShell > .scheduleSection { margin-top:12px; }.homeShell > .teamMessageBoard { padding:14px 16px !important; }.demoAccessFooter { font-size:.65rem; padding:9px 8px; }
        }
      `}</style>
      <div className="homeLanguageRow"><LanguageToggle onChange={setLanguage}/></div>
      <section className="hero operationsHero homeHeroCompact" style={{ padding: '18px 22px' }}>
        <div className="heroTopRow" style={{ alignItems: 'center', gap: 18 }}><div className="brandRow"><div className="logoMark">LF</div><div><p className="eyebrow">{t.productionSystem}</p><h1 style={{ fontSize:'clamp(2rem, 5vw, 3.25rem)' }}>LineFlow AI</h1></div></div><LiveClock /></div>
        <div className="operationsStatusRow" style={{ marginTop:14 }}><span className="systemMeta">{t.homeMeta}</span></div>
        <div className="heroBottomRow" style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:16, flexWrap:'wrap', marginTop:12 }}><div className="actions homeActions" style={{ margin:0 }}><Link className="primaryButton linkButton" href="/login">{t.signIn}</Link></div></div>
      </section>
      <TeamMessageBoard />
      <ProductionSchedule publicView />
      <div className="demoAccessFooter"><strong>{t.demoUsernames}</strong> leadership · supervisor · planner · boomspecialist · boomhandler · hoodhandler · line1–line4 &nbsp;|&nbsp; {t.password} <strong>12345</strong></div>
    </main>
  );
}
