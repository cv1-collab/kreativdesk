import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

// === SYNCHRONE IMPORTE ===
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import MaintenanceGuard from './components/MaintenanceGuard';
import Screensaver from './components/Screensaver';
import ErrorBoundary from './components/ErrorBoundary';

// Context-Provider
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { VideoCallProvider } from './contexts/VideoCallContext';
import { ToastProvider } from './contexts/ToastContext';
import { AIProvider } from './contexts/AIContext';

// Tour Provider
import { TourProvider } from './contexts/TourContext';
import ProductTour from './components/ProductTour';

function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      const component = await componentImport();
      sessionStorage.removeItem('page_has_reloaded_for_chunk');
      return component;
    } catch (error: any) {
      console.warn("[Chunk Load Error] Retrying / reloading page for fresh assets...", error);
      const pageHasAlreadyBeenReloaded = sessionStorage.getItem('page_has_reloaded_for_chunk');
      if (!pageHasAlreadyBeenReloaded) {
        sessionStorage.setItem('page_has_reloaded_for_chunk', 'true');
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      throw error;
    }
  });
}

// +++ NEU: Globales Cookie Banner +++
const CookieBanner = lazyWithRetry(() => import('./components/CookieBanner'));
const ResetPassword = lazyWithRetry(() => import('./components/ResetPassword'));

// +++ NEU: Der Trial Guard (Paywall) +++
const TrialGuard = lazyWithRetry(() => import('./components/TrialGuard'));
const EmailVerificationGuard = lazyWithRetry(() => import('./components/EmailVerificationGuard'));

// === LAZY LOADING (CODE SPLITTING) ===
const Layout = lazyWithRetry(() => import('./components/Layout'));
const Dashboard = lazyWithRetry(() => import('./components/Dashboard'));
const Finance = lazyWithRetry(() => import('./components/Finance'));
const BIMViewer = lazyWithRetry(() => import('./components/BIMViewer'));
const MeetChat = lazyWithRetry(() => import('./components/MeetChat'));
const Calendar = lazyWithRetry(() => import('./components/Calendar'));
const CRM = lazyWithRetry(() => import('./components/CRM'));
const Whiteboard = lazyWithRetry(() => import('./components/Whiteboard'));
const PitchDeck = lazyWithRetry(() => import('./components/PitchDeck'));
const Defects = lazyWithRetry(() => import('./components/Defects'));
const Documents = lazyWithRetry(() => import('./components/Documents'));
const SiteMonitoring = lazyWithRetry(() => import('./components/SiteMonitoring'));
const CompanyDashboard = lazyWithRetry(() => import('./components/CompanyDashboard'));
const ProjectTeam = lazyWithRetry(() => import('./components/ProjectTeam'));
const AdminDashboard = lazyWithRetry(() => import('./components/AdminDashboard'));
const AIConcierge = lazyWithRetry(() => import('./components/AIConcierge'));
const HelpCenter = lazyWithRetry(() => import('./components/HelpCenter'));
const PricingPage = lazyWithRetry(() => import('./components/PricingPage'));
const DemoApp = lazyWithRetry(() => import('./components/DemoApp'));
const PrivacyPolicy = lazyWithRetry(() => import('./components/PrivacyPolicy'));
const Imprint = lazyWithRetry(() => import('./components/Imprint'));
const TermsOfService = lazyWithRetry(() => import('./components/LegalPage'));
const Settings = lazyWithRetry(() => import('./components/Settings'));
const PublicLeadForm = lazyWithRetry(() => import('./components/PublicLeadForm'));
const SuccessPage = lazyWithRetry(() => import('./components/SuccessPage'));
const PlanEditorViewer = lazyWithRetry(() => import('./components/PlanEditorViewer'));
const MobileUpload = lazyWithRetry(() => import('./components/MobileUpload'));
const GuestMeet = lazyWithRetry(() => import('./components/GuestMeet'));
const GlobalSuspenseFallback = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-background">
    <Loader2 className="w-10 h-10 text-accent-ai animate-spin" />
  </div>
);

import { scrubLocalStorageFileUrls } from './utils';

function RecoveryRedirectGuard({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    scrubLocalStorageFileUrls();
    const fullUrl = window.location.href;
    const isRecovery = fullUrl.includes('type=recovery') || fullUrl.includes('type%3Drecovery') || sessionStorage.getItem('is_password_recovery') === 'true';

    if (isRecovery && !window.location.pathname.startsWith('/reset-password')) {
      sessionStorage.setItem('is_password_recovery', 'true');
      window.location.href = `/reset-password${window.location.search}${window.location.hash}`;
    }
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <ProjectProvider>
              <AIProvider>
                <TourProvider>
                  <BrowserRouter>
                    <RecoveryRedirectGuard>
                      <VideoCallProvider>

                        <MaintenanceGuard>
                          <Screensaver />

                          <Suspense fallback={null}>
                            <AIConcierge />
                          </Suspense>
                          <Suspense fallback={null}>
                            <ProductTour />
                          </Suspense>
                          <Suspense fallback={null}>
                            <CookieBanner />
                          </Suspense>

                          <Suspense fallback={<GlobalSuspenseFallback />}>
                            <ErrorBoundary>
                              <Routes>
                                {/* Öffentliche Routen */}
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route path="/pricing" element={<PricingPage />} />
                                <Route path="/success" element={<SuccessPage />} />
                                <Route path="/guest-meet/:joinId" element={<GuestMeet />} />

                                {/* Legal Routen */}
                                <Route path="/privacy" element={<PrivacyPolicy />} />
                                <Route path="/imprint" element={<Imprint />} />
                                <Route path="/terms" element={<TermsOfService />} />

                                <Route path="/lead-form/:companyId" element={<PublicLeadForm />} />
                                <Route path="/lead-form" element={<PublicLeadForm />} />

                                <Route path="/mobile-upload/:type/:sessionId" element={<MobileUpload />} />
                                <Route path="/deck" element={<PitchDeck />} />

                                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

                                {/* +++ HIER WIRD DER TRIAL GUARD INTEGRIERT +++ */}
                                <Route path="/app" element={
                                  <PrivateRoute>
                                    <EmailVerificationGuard>
                                      <TrialGuard>
                                        <CompanyDashboard />
                                      </TrialGuard>
                                    </EmailVerificationGuard>
                                  </PrivateRoute>
                                } />

                                {/* Settings, Help, Meet und Dashboard-Tabs bleiben OHNE ein spezifisches Projekt erreichbar */}
                                <Route path="/help" element={<PrivateRoute><EmailVerificationGuard><HelpCenter /></EmailVerificationGuard></PrivateRoute>} />
                                <Route path="/settings" element={<PrivateRoute><EmailVerificationGuard><Settings /></EmailVerificationGuard></PrivateRoute>} />
                                <Route path="/meet" element={<PrivateRoute><EmailVerificationGuard><TrialGuard><CompanyDashboard /></TrialGuard></EmailVerificationGuard></PrivateRoute>} />
                                <Route path="/agenda" element={<PrivateRoute><EmailVerificationGuard><TrialGuard><CompanyDashboard /></TrialGuard></EmailVerificationGuard></PrivateRoute>} />
                                <Route path="/finance" element={<PrivateRoute><EmailVerificationGuard><TrialGuard><CompanyDashboard /></TrialGuard></EmailVerificationGuard></PrivateRoute>} />
                                <Route path="/projects" element={<PrivateRoute><EmailVerificationGuard><TrialGuard><CompanyDashboard /></TrialGuard></EmailVerificationGuard></PrivateRoute>} />
                                <Route path="/documents" element={<PrivateRoute><EmailVerificationGuard><TrialGuard><CompanyDashboard /></TrialGuard></EmailVerificationGuard></PrivateRoute>} />
                                <Route path="/templates" element={<PrivateRoute><EmailVerificationGuard><TrialGuard><CompanyDashboard /></TrialGuard></EmailVerificationGuard></PrivateRoute>} />
                                <Route path="/leads" element={<PrivateRoute><EmailVerificationGuard><TrialGuard><CompanyDashboard /></TrialGuard></EmailVerificationGuard></PrivateRoute>} />
                                <Route path="/crm" element={<PrivateRoute><EmailVerificationGuard><TrialGuard><CompanyDashboard /></TrialGuard></EmailVerificationGuard></PrivateRoute>} />
                                <Route path="/audit" element={<PrivateRoute><EmailVerificationGuard><TrialGuard><CompanyDashboard /></TrialGuard></EmailVerificationGuard></PrivateRoute>} />

                                {/* +++ PROJEKT BEREICH (KOMPLETT GESCHÜTZT) +++ */}
                                <Route path="/project/:projectId" element={
                                  <PrivateRoute>
                                    <EmailVerificationGuard>
                                      <TrialGuard>
                                        <Layout />
                                      </TrialGuard>
                                    </EmailVerificationGuard>
                                  </PrivateRoute>
                                }>
                                  <Route index element={<Dashboard />} />
                                  <Route path="team" element={<ProjectTeam />} />
                                  <Route path="calendar" element={<Calendar />} />
                                  <Route path="finance" element={<Finance />} />
                                  <Route path="bim" element={<BIMViewer />} />
                                  <Route path="plans" element={<PlanEditorViewer />} />
                                  <Route path="meet" element={<MeetChat />} />
                                  <Route path="crm" element={<CRM />} />
                                  <Route path="whiteboard" element={<Whiteboard />} />
                                  <Route path="pitch" element={<PitchDeck />} />
                                  <Route path="defects" element={<Defects />} />
                                  <Route path="documents" element={<Documents />} />
                                  <Route path="site" element={<SiteMonitoring />} />
                                </Route>
                              </Routes>
                            </ErrorBoundary>
                          </Suspense>

                        </MaintenanceGuard>

                        <Analytics />
                      </VideoCallProvider>
                    </RecoveryRedirectGuard>
                  </BrowserRouter>
                </TourProvider>
              </AIProvider>
            </ProjectProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}