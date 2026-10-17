import React from 'react';

/**
 * Parses inline Markdown (**bold**, `code`) into clean React nodes
 * without exposing raw asterisks or backticks on mobile/desktop.
 */
export function renderInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match **bold**, *italic* (when not part of **), or `code`
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-bold text-text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded-md bg-surface border border-border text-xs font-mono text-blue-500"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    // Strip any stray unmatched double asterisks
    return <React.Fragment key={idx}>{part.replace(/\*\*/g, '')}</React.Fragment>;
  });
}

interface FormattedAiResponseProps {
  text: string;
  compact?: boolean;
  className?: string;
}

/**
 * Renders structured AI responses (headings, bullet lists, numbered lists, paragraphs, inline bold)
 * with mobile-first typography, hanging indentation, and overflow protection.
 */
export const FormattedAiResponse: React.FC<FormattedAiResponseProps> = ({
  text,
  compact = false,
  className = '',
}) => {
  if (!text) return null;

  const lines = text
    .replace(/\r\n/g, '\n')
    .split('\n');

  const elements: React.ReactNode[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = (keyPrefix: string) => {
    if (paragraphBuffer.length === 0) return;
    const joined = paragraphBuffer.join(' ').trim();
    if (joined) {
      elements.push(
        <p
          key={`p-${keyPrefix}`}
          className={`${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} leading-relaxed text-text-primary break-words`}
        >
          {renderInlineMarkdown(joined)}
        </p>
      );
    }
    paragraphBuffer = [];
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph(`empty-${idx}`);
      return;
    }

    // Markdown headings (###, ##, #)
    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph(`h-${idx}`);
      const headingText = headingMatch[2].replace(/\*\*/g, '').trim();
      elements.push(
        <h4
          key={`heading-${idx}`}
          className={`${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} font-extrabold text-text-primary pt-2 first:pt-0 break-words`}
        >
          {headingText}
        </h4>
      );
      return;
    }

    // Bullet list items (*, -, •)
    const bulletMatch = line.match(/^([*\-•])\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph(`b-${idx}`);
      const itemContent = bulletMatch[2].trim();
      elements.push(
        <div
          key={`bullet-${idx}`}
          className={`flex items-start gap-2.5 ${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} leading-relaxed text-text-primary pl-0.5`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
          <div className="flex-1 min-w-0 break-words">
            {renderInlineMarkdown(itemContent)}
          </div>
        </div>
      );
      return;
    }

    // Numbered list items (1., 2., etc.)
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      flushParagraph(`n-${idx}`);
      const num = numberedMatch[1];
      const itemContent = numberedMatch[2].trim();
      elements.push(
        <div
          key={`num-${idx}`}
          className={`flex items-start gap-2.5 ${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} leading-relaxed text-text-primary pl-0.5`}
        >
          <span className="text-[11px] font-black text-blue-500 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-md mt-0.5 shrink-0">
            {num}.
          </span>
          <div className="flex-1 min-w-0 break-words">
            {renderInlineMarkdown(itemContent)}
          </div>
        </div>
      );
      return;
    }

    paragraphBuffer.push(line);
  });

  flushParagraph('final');

  return (
    <div className={`space-y-2.5 min-w-0 break-words ${className}`}>
      {elements}
    </div>
  );
};

/**
 * Reliable, instant knowledge-base fallback for the Landing Page AI Concierge
 * in case the Gemini proxy is rate-limited, offline, or unreachable on mobile networks.
 */
export function getLandingAiFallbackAnswer(query: string, lang: 'de' | 'en' = 'de'): string {
  const q = query.toLowerCase();

  if (lang === 'en') {
    if (q.includes('year 2') || q.includes('renewal') || q.includes('follow') || q.includes('folgekosten')) {
      return `### Follow-up Costs from Year 2\nFrom the second year onwards, the one-time **Implementation Package** is completely waived. You only pay the annual software license:\n* **Studio OS:** **CHF 6,800 / year** (incl. 5 internal seats)\n* **Agency OS:** **CHF 16,800 / year** (incl. 15 internal seats)\n* **Enterprise OS:** from **CHF 45,000 / year** (incl. 25+ internal seats)\n* **External Guests & Craftsmen:** Always **100% free and unlimited** across all plans.`;
    }
    if (q.includes('seat') || q.includes('license') || q.includes('lizenz') || q.includes('7 ') || q.includes('user')) {
      return `### Additional Internal Licenses\nEvery additional internal governance seat on B2B systems costs **CHF 780 / year** (**CHF 65 / month**, excl. VAT).\n* **Example with 7 users (Studio OS):** Base license (**5 seats included**) + 2 additional seats (**2 × CHF 780 = CHF 1,560 / year**).\n* **External project partners:** Clients, specialist planners, and craftsmen are **always free and unlimited**.`;
    }
    if (q.includes('bim') || q.includes('3d') || q.includes('ifc') || q.includes('cad')) {
      return `### 3D BIM (IFC) & 2D CAD in Browser\nKreativ-Desk OS includes a native browser-based **3D BIM Viewer** and **2D CAD Plan Studio**:\n* **Supported Formats:** Standard **IFC models** (3D BIM) as well as **PDF, PNG, and JPG** floor plans (2D CAD).\n* **Features:** Direct browser navigation without plugins, AI collision checks, true-to-scale calibration, defect pins, and mobile site sync.`;
    }
    if (q.includes('data') || q.includes('swiss') || q.includes('security') || q.includes('server') || q.includes('daten')) {
      return `### Swiss Data Residency & Security\nYour project data is protected according to strict Swiss standards:\n* **Server Location:** Hosted in **ISO-27001 certified data centers in Zurich (Switzerland)**.\n* **Compliance:** Fully compliant with the **Swiss Federal Act on Data Protection (nDSG)** and **GDPR**.\n* **Zero AI Training:** Your plans, invoices, and documents are strictly tenant-isolated and are **never** used to train public AI models.`;
    }
    return `### Kreativ-Desk OS Overview\nKreativ-Desk OS is the Swiss operating system for architecture, construction, and agencies:\n* **SaaS Plans:** **Starter** (**CHF 49/mo** billed yearly), **Pro** (**CHF 89/mo** incl. 3D BIM & AI), and **Team Starter** (**CHF 240/mo** incl. 3 seats & Swiss QR-bills).\n* **B2B Systems:** **Studio OS** (**CHF 6,800/yr**), **Agency OS** (**CHF 16,800/yr**), and **Enterprise OS** (from **CHF 45,000/yr**).\n* **Free External Access:** Craftsmen, clients, and external planners are **unlimited and free of charge**.`;
  }

  // German responses (Swiss spelling 'ss')
  if (q.includes('folge') || q.includes('jahr 2') || q.includes('2. jahr') || q.includes('zweite')) {
    return `### Folgekosten ab dem 2. Jahr\nAb dem zweiten Jahr entfällt das einmalige **Implementation Package** komplett. Du bezahlst nur noch die reine Software-Jahreslizenz:\n* **Studio OS:** **CHF 6'800 / Jahr** (inkl. 5 internen Governance-Lizenzen)\n* **Agency OS:** **CHF 16'800 / Jahr** (inkl. 15 internen Governance-Lizenzen)\n* **Enterprise OS:** ab **CHF 45'000 / Jahr** (inkl. 25+ internen Lizenzen)\n* **Externe Partner:** Handwerker, Bauherren und Fachplaner sind in allen Tarifen **dauerhaft kostenlos und unbegrenzt**.`;
  }

  if (q.includes('zusatz') || q.includes('lizenz') || q.includes('seat') || q.includes('7 ') || q.includes('nutzer')) {
    return `### Kosten für Zusatzlizenzen\nJede zusätzliche interne Governance-Lizenz in den B2B-Systemen kostet exakt **CHF 780 / Jahr** (**CHF 65 / Monat** exkl. MwSt.).\n* **Rechenbeispiel bei 7 Nutzern (Studio OS):** Im Studio OS sind **5 Lizenzen inklusive**. Für 2 weitere interne Mitarbeitende kommen **2 × CHF 780 = CHF 1'560 / Jahr** hinzu.\n* **Wichtig:** Externe Handwerker (Field Guests), Bauherren und Fachplaner benötigen **keine** kostenpflichtige Lizenz – sie sind **100% kostenlos und unbegrenzt** einladbar.`;
  }

  if (q.includes('bim') || q.includes('3d') || q.includes('ifc') || q.includes('cad') || q.includes('format')) {
    return `### 3D-BIM Viewer (IFC) & 2D-CAD Studio\nKreativ-Desk OS verarbeitet alle gängigen Planungs- und Architekturformate direkt im Browser ohne Zusatzsoftware:\n* **3D-BIM Modelle:** Volle Unterstützung für **IFC-Dateien** (Industry Foundation Classes) inkl. Bauteilstruktur, Röntgen-Modus, Schnittachsen und **KI-Kollisionsprüfung**.\n* **2D-CAD & Werkpläne:** Hochauflösende **PDF-, PNG- und JPG-Pläne** mit Massstabs-Kalibrierung, Flächen-/Raummessung, Layern und direkter Mängel-Verortung auf dem Smartphone.`;
  }

  if (q.includes('daten') || q.includes('sicher') || q.includes('schweiz') || q.includes('server') || q.includes('dsg')) {
    return `### Schweizer Datenhoheit & Sicherheit\nDeine Projektdaten unterliegen höchsten Schweizer Sicherheitsstandards:\n* **Serverstandort Schweiz:** Alle Datenbanken und Cloud-Speicher werden in **Zürich (Region eu-central-2)** in **ISO-27001-zertifizierten Rechenzentren** betrieben.\n* **Rechtskonformität:** 100% konform mit dem **Schweizer Datenschutzgesetz (nDSG)** sowie der **DSGVO**.\n* **Kein KI-Training:** Deine Pläne, Belege und Finanzdaten sind strikt mandantenisoliert und werden **niemals** für das Training öffentlicher KI-Modelle verwendet.`;
  }

  if (q.includes('preis') || q.includes('kost') || q.includes('abo') || q.includes('starter') || q.includes('pro')) {
    return `### Preise & Lizenzmodelle im Überblick\nWir bieten flexible SaaS-Abos sowie dedizierte B2B-Systeme (alle Preise netto exkl. MwSt.):\n* **SaaS Starter:** **CHF 49 / Monat** (bei jährlicher Abrechnung) – 1 Seat, 15 GB Speicher, 2D-CAD & Mängelmanagement.\n* **SaaS Pro:** **CHF 89 / Monat** (jährlich) – 1 Seat, 100 GB Speicher, **3D-BIM Viewer (IFC)**, KI-Pitch-Deck & Mobile App.\n* **SaaS Team Starter:** **CHF 240 / Monat** (jährlich) – **3 Seats inklusive**, 250 GB Speicher, Offerten- & **Schweizer QR-Rechnungs-Studio**.\n* **B2B Projekt-Systeme:** **Studio OS** (**CHF 6'800 / Jahr** für 5 Seats) und **Agency OS** (**CHF 16'800 / Jahr** für 15 Seats).\n* **Externe Gäste:** Handwerker & Bauherren sind in jedem Tarif **kostenlos & unbegrenzt**.`;
  }

  return `### Kreativ-Desk OS – Offizielle Kurzinfo\nGerne helfe ich dir zu **${query}** weiter:\n* **Plattform:** Schweizer All-in-One Betriebssystem für Architektur, Bauleitung, Generalplanung und Agenturen.\n* **Kernmodule:** Nativer **3D-BIM Viewer (IFC)**, **2D-CAD Planstudio**, **BKP 1–9 Live-Budgetierung**, **Schweizer QR-Rechnungen**, **Mobile Mängel-App** und **Revisionssicherer Datenraum**.\n* **Konditionen:** SaaS-Pläne ab **CHF 49 / Monat** oder mandantenisolierte B2B-Systeme ab **CHF 6'800 / Jahr** (inkl. 5 Lizenzen). Externe Handwerker & Bauherren sind **immer kostenlos**.\n* **Datenhaltung:** 100% Serverstandort **Zürich (Schweiz)** nach ISO 27001 & Schweizer DSG.`;
}
