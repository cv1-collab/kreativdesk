import { j as jsxRuntimeExports, A as AnimatePresence, m as motion } from './vendor-ui-B7yEkTas.js';
import { r as reactExports, L as Link } from './vendor-core-egDwzlzP.js';
import { u as useLanguage } from './index-CYJ5UA-3.js';
import './vendor-3d-BeyKjty-.js';
import './vendor-charts-DTz6AAsj.js';
import './vendor-firebase-CKkb2kaw.js';

const localTranslations = {
  en: {
    cookie_title: "We use cookies",
    cookie_desc: "We use cookies to ensure you get the best experience on our website and to analyze traffic securely.",
    cookie_accept: "Accept all",
    cookie_decline: "Decline essential",
    footer_privacy: "Privacy Policy"
  },
  de: {
    cookie_title: "Wir nutzen Cookies",
    cookie_desc: "Diese Website verwendet Cookies, um eine bestmögliche Erfahrung zu bieten und den Traffic sicher zu analysieren.",
    cookie_accept: "Alle akzeptieren",
    cookie_decline: "Nur essenzielle",
    footer_privacy: "Datenschutz"
  }
};
function CookieBanner() {
  const [showCookieBanner, setShowCookieBanner] = reactExports.useState(false);
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  reactExports.useEffect(() => {
    const consent = localStorage.getItem("kreativ_cookie_consent");
    if (!consent) {
      setTimeout(() => setShowCookieBanner(true), 1500);
    }
  }, []);
  const handleCookieConsent = (type) => {
    localStorage.setItem("kreativ_cookie_consent", type);
    setShowCookieBanner(false);
    if (type === "all") {
      window.dispatchEvent(new CustomEvent("cookieConsentGranted"));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showCookieBanner && /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { y: 100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 100, opacity: 0 },
      className: "fixed bottom-0 left-0 right-0 z-[99999] p-4 md:p-6 pointer-events-none",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto bg-surface/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 pointer-events-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-lg mb-2 text-text-primary", children: t("cookie_title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-text-muted font-medium", children: [
            t("cookie_desc"),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/privacy", className: "text-accent-ai hover:underline", children: t("footer_privacy") }),
            "."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 w-full md:w-auto shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleCookieConsent("essential"), className: "flex-1 md:flex-none px-6 py-3 bg-background border border-border hover:bg-white/5 text-text-primary rounded-xl text-sm font-bold transition-colors", children: t("cookie_decline") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleCookieConsent("all"), className: "flex-1 md:flex-none px-6 py-3 bg-accent-ai hover:bg-accent-ai/90 text-white rounded-xl text-sm font-bold shadow-lg transition-all", children: t("cookie_accept") })
        ] })
      ] })
    }
  ) });
}

export { CookieBanner as default };
