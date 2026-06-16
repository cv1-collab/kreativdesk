import { j as jsxRuntimeExports, p as Lock, h as Building2, C as CircleCheck, L as LoaderCircle, Z as Zap, w as Shield } from './vendor-ui-B7yEkTas.js';
import { r as reactExports } from './vendor-core-egDwzlzP.js';
import { a as useAuth, c as cn } from './index-CYJ5UA-3.js';
import { i as initiateSubscriptionCheckout } from './stripeClient-BC1X81DY.js';
import './vendor-3d-BeyKjty-.js';
import './vendor-charts-DTz6AAsj.js';
import './vendor-firebase-CKkb2kaw.js';

function TrialGuard({ children }) {
  const { currentUser } = useAuth();
  const [isLocked, setIsLocked] = reactExports.useState(false);
  const [interval, setInterval] = reactExports.useState("year");
  const [isLoading, setIsLoading] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!currentUser || currentUser.email === "cv1@gmx.ch") {
      setIsLocked(false);
      return;
    }
    if (currentUser.role === "employee") {
      setIsLocked(false);
      return;
    }
    if (currentUser.trialEndsAt) {
      const today = /* @__PURE__ */ new Date();
      const trialEnd = new Date(currentUser.trialEndsAt);
      if (today > trialEnd && currentUser.plan?.includes("Trial")) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }
    } else {
      setIsLocked(false);
    }
  }, [currentUser]);
  const handleCheckout = async (planName) => {
    if (!currentUser?.uid || !currentUser?.email) return;
    setIsLoading(planName);
    try {
      await initiateSubscriptionCheckout(planName, interval, currentUser.uid, currentUser.email);
    } catch (error) {
      console.error("Checkout fehlgeschlagen", error);
      setIsLoading(null);
    }
  };
  if (!isLocked) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[99999] bg-[#09090b]/95 backdrop-blur-2xl overflow-y-auto flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl w-full animate-in zoom-in-95 duration-500 py-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20 border border-red-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 32 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl md:text-4xl font-black text-[#fafafa] mb-4 tracking-tight", children: "Deine Testphase ist abgelaufen." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#a1a1aa] text-lg max-w-2xl mx-auto", children: "Du hast Kreativ Desk 30 Tage lang in vollem Umfang genutzt. Wähle jetzt dein passendes Setup, um nahtlos an deinen Projekten weiterzuarbeiten. Deine Daten sind sicher." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[#18181b] border border-[#27272a] p-1 rounded-xl flex items-center shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setInterval("month"),
          className: cn("px-6 py-2.5 rounded-lg text-sm font-bold transition-all", interval === "month" ? "bg-[#27272a] text-[#fafafa] shadow" : "text-[#a1a1aa] hover:text-[#fafafa]"),
          children: "Monatlich"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setInterval("year"),
          className: cn("px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2", interval === "year" ? "bg-[#27272a] text-[#fafafa] shadow" : "text-[#a1a1aa] hover:text-[#fafafa]"),
          children: [
            "Jährlich ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded-md uppercase tracking-widest border border-emerald-500/20", children: "Spar 20%" })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[#18181b] border border-[#27272a] rounded-2xl p-6 md:p-8 shadow-sm flex flex-col relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-bold text-[#fafafa] mb-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 20, className: "text-[#a1a1aa]" }),
          " Starter"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-3xl font-black text-[#fafafa] mb-1", children: [
          "CHF ",
          interval === "year" ? "35" : "45",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-[#a1a1aa]", children: "/ Monat" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#a1a1aa] mb-6", children: "Perfekt für Freelancer zur 2D-Planorganisation." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-4 mb-8 flex-1 text-sm font-medium text-[#a1a1aa]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, className: "text-emerald-500 shrink-0" }),
            " 3 Aktive Projekte"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, className: "text-emerald-500 shrink-0" }),
            " 5 GB Cloud Speicher"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, className: "text-emerald-500 shrink-0" }),
            " PDF-Offerten & Rechnungen"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleCheckout("Starter"),
            disabled: isLoading !== null,
            className: "w-full py-3.5 bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] rounded-xl font-bold transition-all flex items-center justify-center gap-2",
            children: isLoading === "Starter" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 18, className: "animate-spin" }) : "Jetzt abonnieren"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[#18181b] border-2 border-blue-500 rounded-2xl p-6 md:p-8 shadow-2xl shadow-blue-500/10 flex flex-col relative transform md:-translate-y-4 z-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg", children: "Beliebteste Wahl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-bold text-[#fafafa] mb-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 20, className: "text-blue-500" }),
          " Pro"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-3xl font-black text-[#fafafa] mb-1", children: [
          "CHF ",
          interval === "year" ? "65" : "79",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-[#a1a1aa]", children: "/ Monat" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#a1a1aa] mb-6", children: "Für Bauleiter, die 3D BIM und KI-Power benötigen." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-4 mb-8 flex-1 text-sm font-medium text-[#a1a1aa]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, className: "text-blue-500 shrink-0" }),
            " Unbegrenzte Projekte"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, className: "text-blue-500 shrink-0" }),
            " 3D BIM Viewer (IFC)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, className: "text-blue-500 shrink-0" }),
            " Mobile Mängel-App (Live-Sync)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, className: "text-blue-500 shrink-0" }),
            " 50 GB Cloud Speicher"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleCheckout("Pro"),
            disabled: isLoading !== null,
            className: "w-full py-3.5 bg-blue-600 text-white hover:bg-blue-500 rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2",
            children: isLoading === "Pro" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 18, className: "animate-spin" }) : "Pro abonnieren"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[#18181b] border border-[#27272a] rounded-2xl p-6 md:p-8 shadow-sm flex flex-col relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-bold text-[#fafafa] mb-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 20, className: "text-purple-500" }),
          " Expert"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-3xl font-black text-[#fafafa] mb-1", children: [
          "CHF ",
          interval === "year" ? "159" : "199",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-[#a1a1aa]", children: "/ Monat" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#a1a1aa] mb-6", children: "Für Power-User: Finanzen & API-Automatisierung." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-4 mb-8 flex-1 text-sm font-medium text-[#a1a1aa]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, className: "text-purple-500 shrink-0" }),
            " Alles aus dem Pro-Plan"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, className: "text-purple-500 shrink-0" }),
            " API & Webhooks (Zapier/Make)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, className: "text-purple-500 shrink-0" }),
            " Eigenes Branding & Domain"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, className: "text-purple-500 shrink-0" }),
            " 250 GB Cloud Speicher"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleCheckout("Expert"),
            disabled: isLoading !== null,
            className: "w-full py-3.5 bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] rounded-xl font-bold transition-all flex items-center justify-center gap-2",
            children: isLoading === "Expert" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 18, className: "animate-spin" }) : "Expert abonnieren"
          }
        )
      ] })
    ] })
  ] }) });
}

export { TrialGuard as default };
