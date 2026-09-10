// 🔥 Schweizer Architekturgrundriss (Wohnen / Essen / Küche mit Kochinsel / Zimmer)
export const dummySvgPlan = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800" style="background-color:#ffffff; font-family:sans-serif;">
  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="1"/></pattern>
  <rect width="100%" height="100%" fill="url(#grid)" />
  <g stroke="#1e293b" stroke-width="8" stroke-linecap="square">
    <line x1="100" y1="100" x2="1100" y2="100"/>
    <line x1="1100" y1="100" x2="1100" y2="700"/>
    <line x1="1100" y1="700" x2="100" y2="700"/>
    <line x1="100" y1="700" x2="100" y2="100"/>
    <line x1="450" y1="100" x2="450" y2="700"/>
    <line x1="100" y1="400" x2="450" y2="400"/>
    <line x1="850" y1="100" x2="850" y2="250"/> 
    <line x1="450" y1="450" x2="800" y2="450"/> 
    <line x1="800" y1="450" x2="800" y2="700"/> 
  </g>
  <g stroke="#3b82f6" stroke-width="6" fill="#eff6ff">
    <rect x="150" y="96" width="120" height="8"/> 
    <rect x="150" y="696" width="150" height="8"/> 
    <rect x="550" y="696" width="150" height="8"/> 
    <rect x="850" y="696" width="200" height="8"/> 
    <rect x="1096" y="350" width="8" height="250"/> 
  </g>
  <g stroke="#64748b" stroke-width="6" fill="#f1f5f9">
    <rect x="950" y="96" width="100" height="8"/>
  </g>
  <g stroke="#94a3b8" stroke-width="3" fill="#f8fafc">
    <rect x="454" y="104" width="392" height="60"/> 
    <rect x="550" y="114" width="60" height="40" rx="4"/>
    <circle cx="580" cy="134" r="8" fill="#cbd5e1" stroke="none"/>
    <rect x="500" y="250" width="260" height="90" rx="4"/> 
    <circle cx="550" cy="295" r="14"/>
    <circle cx="590" cy="295" r="14"/>
    <circle cx="570" cy="265" r="12"/>
    <circle cx="680" cy="365" r="15" fill="#e2e8f0" stroke="#94a3b8"/>
    <circle cx="730" cy="365" r="15" fill="#e2e8f0" stroke="#94a3b8"/>
  </g>
  <rect x="1040" y="104" width="56" height="150" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>
  <g font-size="20" fill="#475569" text-anchor="middle" font-weight="bold">
    <text x="950" y="520" font-size="28" fill="#0f172a">Wohnen / Essen</text>
    <text x="950" y="550" font-size="16">48.5 m²</text>
    <text x="630" y="215" font-size="24" fill="#0f172a">Küche</text>
    <text x="950" y="220" font-size="20" fill="#0f172a">Entrée</text>
    <text x="275" y="250" font-size="24" fill="#0f172a">Zimmer 1</text>
    <text x="275" y="550" font-size="24" fill="#0f172a">Master Bedroom</text>
    <text x="625" y="580" font-size="24" fill="#0f172a">Zimmer 2</text>
  </g>
</svg>
`)}`;
