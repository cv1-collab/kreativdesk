import { j as jsxRuntimeExports, bP as Network, R as Plus, b$ as Webhook, C as CircleCheck, a8 as Copy, T as Trash2 } from './vendor-ui-B7yEkTas.js';
import { r as reactExports } from './vendor-core-egDwzlzP.js';
import { u as useLanguage, g as useToast } from './index-CYJ5UA-3.js';
import './vendor-3d-BeyKjty-.js';
import './vendor-charts-DTz6AAsj.js';
import './vendor-firebase-CKkb2kaw.js';

function API() {
  const { language, t: globalT } = useLanguage();
  const { addToast } = useToast();
  const isDe = language === "de";
  const [keys, setKeys] = reactExports.useState([
    { id: "1", name: "Zapier Integration", key: "kd_live_8f92...a1b2", created: "2025-10-12", lastUsed: "Heute, 14:32" },
    { id: "2", name: "Make.com Webhook", key: "kd_live_4x5c...9q8w", created: "2025-11-05", lastUsed: "Gestern, 09:15" }
  ]);
  const [copiedId, setCopiedId] = reactExports.useState(null);
  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2e3);
    addToast(isDe ? "Kopiert!" : "Copied!", "success");
  };
  const roadmap = [
    { q: isDe ? "Q3 2026" : "Q3 2026", desc: isDe ? "BIM 360 / Revit Direktsynchronisation" : "BIM 360 / Revit Direct Sync" },
    { q: isDe ? "Q4 2026" : "Q4 2026", desc: isDe ? "Slack & Microsoft Teams Bot" : "Slack & Microsoft Teams Bot" },
    { q: isDe ? "Q1 2027" : "Q1 2027", desc: isDe ? "Miro & Figma Whiteboard Einbindung" : "Miro & Figma Whiteboard Integration" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between bg-surface border border-border p-6 rounded-2xl shadow-sm gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold flex items-center gap-2 text-text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Network, { className: "text-blue-500", size: 24 }),
          " ",
          isDe ? "API & Schnittstellen" : "API & Integrations"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted mt-1 font-medium", children: isDe ? "Verwalte deine API-Schlüssel für externe Tools." : "Manage your API keys for external tools." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
        " ",
        isDe ? "Neuer Key" : "New Key"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-bold text-text-muted uppercase tracking-widest pl-1", children: isDe ? "Aktive API Keys" : "Active API Keys" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block bg-surface border border-border rounded-2xl overflow-hidden shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-[10px] uppercase tracking-wider text-text-muted bg-surface/50 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-5 font-bold", children: "Integration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-5 font-bold", children: "API Key" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-5 font-bold", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-5 text-right font-bold", children: "Aktionen" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/50", children: keys.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-white/[0.02] transition-colors group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-text-primary flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Webhook, { size: 14, className: "text-text-muted" }),
                " ",
                k.name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-text-muted mt-1 uppercase", children: [
                "Erstellt: ",
                k.created
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-background border border-border/50 px-2 py-1 rounded text-xs text-text-muted", children: k.key }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleCopy(k.id, k.key), className: "p-1.5 text-text-muted hover:text-text-primary transition-colors", children: copiedId === k.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14, className: "text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 14 }) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-[10px] font-bold text-emerald-500 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" }),
              " Active"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-2 text-red-500 hover:bg-red-500/10 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) }) })
          ] }, k.id)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden flex flex-col gap-3", children: keys.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-text-primary text-sm flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Webhook, { size: 14, className: "text-blue-500" }),
                " ",
                k.name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-text-muted mt-1 uppercase tracking-widest", children: [
                "Erstellt: ",
                k.created
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-text-muted hover:text-red-500 p-2 bg-background rounded-xl border border-border shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background border border-border/50 rounded-lg p-3 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs text-text-muted font-mono", children: k.key }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleCopy(k.id, k.key), className: "p-2 bg-surface border border-border rounded-md shadow-sm", children: copiedId === k.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14, className: "text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 14 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-text-muted font-bold pt-2 border-t border-border/50 flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Zuletzt verwendet:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-primary", children: k.lastUsed })
          ] })
        ] }, k.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-bold text-text-muted uppercase tracking-widest pl-1", children: isDe ? "Integration Roadmap" : "Integration Roadmap" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface border border-border rounded-2xl p-6 space-y-6 relative overflow-hidden", children: roadmap.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative pl-6 border-l-2 border-border/50 group hover:border-blue-500 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-background border-2 border-border group-hover:border-blue-500 transition-colors" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-[10px] font-bold text-blue-500 uppercase tracking-widest", children: item.q }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-text-primary mt-1 leading-relaxed", children: item.desc })
        ] }, i)) })
      ] })
    ] })
  ] });
}

export { API as default };
