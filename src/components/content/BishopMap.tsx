/**
 * Stylised map of the Bishop Arts District (schematic street grid, not to
 * scale). No third-party embed: zero cookies, zero layout shift.
 */
export function BishopMap() {
  const st = "#151513";
  return (
    <svg viewBox="0 0 600 510" className="h-full w-full" role="img" aria-label="Map of the Bishop Arts District around N Bishop Ave and W Davis St, Dallas">
      <rect width="600" height="510" fill="#e4ded2" />
      {/* blocks */}
      <g fill="#ece7de">
        {[
          [20, 20, 150, 120],
          [200, 20, 160, 120],
          [390, 20, 190, 120],
          [20, 170, 150, 130],
          [390, 170, 190, 130],
          [20, 330, 150, 160],
          [200, 330, 160, 160],
          [390, 330, 190, 160],
        ].map(([x, y, w, h]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="4" />
        ))}
        <rect x="200" y="170" width="160" height="130" rx="4" fill="#d6cdbb" />
      </g>
      {/* park */}
      <rect x="400" y="350" width="80" height="60" rx="6" fill="#b9bd9c" />
      <text x="440" y="384" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="#3f4231">
        PARK
      </text>
      {/* streets */}
      <g stroke="#fbfaf7" strokeWidth="22" strokeLinecap="round">
        <path d="M185 0v510M375 0v510M0 155h600M0 315h600" />
      </g>
      <path d="M0 470 600 250" stroke="#fbfaf7" strokeWidth="16" />
      <g fontFamily="var(--font-mono)" fontSize="10" fill={st} letterSpacing="1.5">
        <text x="191" y="250" transform="rotate(-90 191 250)" textAnchor="middle">
          N BISHOP AVE
        </text>
        <text x="381" y="250" transform="rotate(-90 381 250)" textAnchor="middle">
          N MADISON AVE
        </text>
        <text x="500" y="151" textAnchor="middle">
          W 7TH ST
        </text>
        <text x="90" y="311" textAnchor="middle">
          W DAVIS ST
        </text>
        <text x="470" y="296" transform="rotate(-20 470 296)" textAnchor="middle">
          N ZANG BLVD
        </text>
      </g>
      {/* store */}
      <g transform="translate(280 235)">
        <circle r="34" fill="#2b36f0" opacity="0.15">
          <animate attributeName="r" values="22;40;22" dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0;0.3" dur="2.6s" repeatCount="indefinite" />
        </circle>
        <circle r="16" fill={st} />
        <circle r="7.5" fill="none" stroke="#f6f3ee" strokeWidth="4" strokeDasharray="44 3.2" transform="rotate(-96)" />
      </g>
      <g transform="translate(300 196)">
        <rect x="0" y="-16" width="118" height="26" rx="13" fill={st} />
        <text x="59" y="1" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="#f6f3ee" letterSpacing="1.2">
          ORDOVA · 421
        </text>
      </g>
      <text x="580" y="496" textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="#5c5850">
        N ↑ · not to scale
      </text>
    </svg>
  );
}
