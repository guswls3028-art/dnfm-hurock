"use client";

import { useEffect, useMemo, useState } from "react";

function isExternal(url) {
  return url?.startsWith("http");
}

function Action({ action, className = "action-button" }) {
  if (!action.url) {
    return (
      <button
        className={`${className} is-disabled`}
        type="button"
        disabled
        title={action.reason}
        aria-label={`${action.label}: ${action.reason}`}
      >
        {action.label}
      </button>
    );
  }

  return (
    <a
      className={className}
      href={action.url}
      target={isExternal(action.url) ? "_blank" : undefined}
      rel={isExternal(action.url) ? "noreferrer" : undefined}
      data-note={action.note || undefined}
    >
      {action.label}
    </a>
  );
}

function Checklist({ site }) {
  const [checked, setChecked] = useState({});

  useEffect(() => {
    const stored = window.localStorage.getItem(site.checklistKey);
    setChecked(stored ? JSON.parse(stored) : {});
  }, [site.checklistKey]);

  function toggle(index, value) {
    const next = { ...checked, [index]: value };
    setChecked(next);
    window.localStorage.setItem(site.checklistKey, JSON.stringify(next));
  }

  return (
    <section className="work-panel checklist-panel" aria-labelledby="checklist-title">
      <div className="section-heading">
        <div>
          <p>{site.eyebrow}</p>
          <h2 id="checklist-title">{site.checklistTitle}</h2>
        </div>
      </div>
      <div className="checklist">
        {site.checklist.map((item, index) => {
          const id = `${site.id}-check-${index}`;

          return (
            <label className="check-row" htmlFor={id} key={item}>
              <input
                id={id}
                type="checkbox"
                checked={Boolean(checked[index])}
                onChange={(event) => toggle(index, event.target.checked)}
              />
              <span>{item}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

function LinkGroups({ groups }) {
  return groups.map((group) => (
    <article className="link-group" key={group.title}>
      <h3>{group.title}</h3>
      <div className="link-list">
        {group.links.map((link) =>
          link.url ? (
            <a
              href={link.url}
              key={link.label}
              target={isExternal(link.url) ? "_blank" : undefined}
              rel={isExternal(link.url) ? "noreferrer" : undefined}
            >
              {link.label}
            </a>
          ) : (
            <button type="button" disabled title={link.reason} key={link.label}>
              {link.label}
              <small>{link.reason}</small>
            </button>
          )
        )}
      </div>
    </article>
  ));
}

function Guides({ site }) {
  const [filter, setFilter] = useState("전체");
  const visibleGuides = useMemo(
    () => site.guides.filter((guide) => filter === "전체" || guide.category === filter),
    [filter, site.guides]
  );

  return (
    <section className="guide-zone" aria-labelledby="guide-title">
      <div className="section-heading">
        <div>
          <p>GUIDE STACK</p>
          <h2 id="guide-title">가이드 보드</h2>
        </div>
      </div>
      <div className="filter-row" role="tablist" aria-label="가이드 필터">
        {site.guideFilters.map((item) => (
          <button
            className={`filter-chip ${filter === item ? "is-active" : ""}`}
            type="button"
            data-filter={item}
            onClick={() => setFilter(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="guide-grid">
        {visibleGuides.map((guide) => (
          <article className="guide-card" data-category={guide.category} key={guide.title}>
            <span>{guide.category}</span>
            <h3>{guide.title}</h3>
            <p>{guide.body}</p>
            <div className="card-action">
              <Action action={{ label: guide.linkLabel, url: guide.url, reason: "링크 등록 전" }} className="text-link" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function SitePage({ site }) {
  return (
    <div className="app-shell" data-theme={site.theme}>
      <header className="topbar" aria-label="사이트 헤더">
        <a className="brand" href="/" aria-label="dnfm.kr 홈">
          <span className="brand-mark" aria-hidden="true">
            D
          </span>
          <span>
            <strong>{site.shortTitle}</strong>
            <small>{site.eyebrow}</small>
          </span>
        </a>
        <nav className="site-switcher" aria-label="사이트 전환">
          <a href="https://dnfm.kr">
            뉴비 훈련소
          </a>
          <a className="is-active" href="/" aria-current="page">
            허락
          </a>
        </nav>
      </header>

      <main id="app" tabIndex={-1}>
        <section className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">{site.hero.kicker}</p>
            <h1 aria-label={site.hero.headline}>
              {site.hero.headlineLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p className="hero-body">{site.hero.body}</p>
            <div className="action-row">
              {site.actions.map((action) => (
                <Action action={action} key={action.label} />
              ))}
            </div>
          </div>

          <aside className="radar-panel" aria-label={`${site.title} 요약`}>
            <div className="radar-screen" aria-hidden="true">
              <span className="scan-line" />
              <span className="node node-a" />
              <span className="node node-b" />
              <span className="node node-c" />
            </div>
            <div className="callout">
              <p>{site.hero.calloutTitle}</p>
              <strong>{site.eyebrow}</strong>
              <span>{site.hero.calloutBody}</span>
            </div>
          </aside>
        </section>

        <section className="stats-grid" aria-label="핵심 운영 지표">
          {site.stats.map((stat) => (
            <article className="stat-tile" key={stat.value}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
              <small>{stat.detail}</small>
            </article>
          ))}
        </section>

        <section className="brief-grid" aria-label="운영 브리핑">
          {site.briefing.map((item) => (
            <article className="brief-card" data-accent={item.accent} key={item.title}>
              <span className="brief-pin" aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </section>

        <div className="split-layout">
          <Checklist site={site} />
          <section className="work-panel links-panel" aria-labelledby="links-title">
            <div className="section-heading">
              <div>
                <p>LINK ROUTER</p>
                <h2 id="links-title">바로가기</h2>
              </div>
            </div>
            <div className="link-groups">
              <LinkGroups groups={site.linkGroups} />
            </div>
          </section>
        </div>

        <Guides site={site} />

        <section className="timeline-section" id={site.timelineId || "operations"} aria-labelledby="timeline-title">
          <div className="section-heading">
            <div>
              <p>OPERATIONS</p>
              <h2 id="timeline-title">{site.timelineTitle}</h2>
            </div>
          </div>
          <div className="timeline">
            {site.timeline.map((item) => (
              <article className="timeline-item" key={item.title}>
                <span>{item.time}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="site-footer">
          <p>{site.footerNote}</p>
        </footer>
      </main>
    </div>
  );
}
