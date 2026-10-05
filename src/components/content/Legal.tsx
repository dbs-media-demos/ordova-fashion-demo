import type { ReactNode } from "react";

export function LegalBody({ updated, sections }: { updated: string; sections: { h: string; p: ReactNode }[] }) {
  return (
    <div className="container-x pb-24">
      <p className="t-mono text-muted">Last updated {updated}</p>
      <div className="mt-10 grid gap-12 md:grid-cols-12">
        <nav aria-label="On this page" className="md:col-span-3">
          <ol className="t-mono space-y-2 text-[0.66rem] md:sticky md:top-28">
            {sections.map((s, i) => (
              <li key={s.h}>
                <a href={`#s${i}`} className="link-u">
                  {String(i + 1).padStart(2, "0")} {s.h}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="max-w-2xl space-y-10 leading-relaxed md:col-span-8 md:col-start-5">
          {sections.map((s, i) => (
            <section key={s.h} id={`s${i}`} className="scroll-mt-28">
              <h2 className="t-h3">{s.h}</h2>
              <div className="mt-3 space-y-3 text-muted">{s.p}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
