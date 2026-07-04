import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// === SYNCHRONE IMPORTE ===
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import MaintenanceGuard from './components/MaintenanceGuard';
import Screensaver from './components/Screensaver';

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

// +++ NEU: Globales Cookie Banner +++
const CookieBanner = lazy(() => import('./components/CookieBanner'));

// +++ NEU: Der Trial Guard (Paywall) +++
const TrialGuard = lazy(() => import('./components/TrialGuard'));
const EmailVerificationGuard = lazy(() => import('./components/EmailVerificationGuard'));

// === LAZY LOADING (CODE SPLITTING) ===
const Layout = lazy(() => import('./components/Layout'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Finance = lazy(() => import('./components/Finance'));
const BIMViewer = lazy(() => import('./components/BIMViewer'));
const MeetChat = lazy(() => import('./components/MeetChat'));
const Calendar = lazy(() => import('./components/Calendar'));
const CRM = lazy(() => import('./components/CRM'));
const Whiteboard = lazy(() => import('./components/Whiteboard'));
const PitchDeck = lazy(() => import('./components/PitchDeck'));
const Defects = lazy(() => import('./components/Defects'));
const Documents = lazy(() => import('./components/Documents'));
const SiteMonitoring = lazy(() => import('./components/SiteMonitoring'));
const CompanyDashboard = lazy(() => import('./components/CompanyDashboard'));
const ProjectTeam = lazy(() => import('./components/ProjectTeam'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AIConcierge = lazy(() => import('./components/AIConcierge'));
const HelpCenter = lazy(() => import('./components/HelpCenter'));
const PricingPage = lazy(() => import('./components/PricingPage'));
const DemoApp = lazy(() => import('./components/DemoApp'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const Imprint = lazy(() => import('./components/Imprint'));
const TermsOfService = lazy(() => import('./components/LegalPage'));
const Settings = lazy(() => import('./components/Settings'));
const PublicLeadForm = lazy(() => import('./components/PublicLeadForm'));
const SuccessPage = lazy(() => import('./components/SuccessPage'));
const PlanEditorViewer = lazy(() => import('./components/PlanEditorViewer'));
const MobileUpload = lazy(() => import('./components/MobileUpload'));
const GuestMeet = lazy(() => import('./components/GuestMeet'));
const GlobalSuspenseFallback = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-background">
    <Loader2 className="w-10 h-10 text-accent-ai animate-spin" />
  </div>
);

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

                          <Routes>
                            {/* Öffentliche Routen */}
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
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

                            {/* Settings und Help bleiben OHNE TrialGuard erreichbar */}
                            <Route path="/help" element={<PrivateRoute><EmailVerificationGuard><HelpCenter /></EmailVerificationGuard></PrivateRoute>} />
                            <Route path="/settings" element={<PrivateRoute><EmailVerificationGuard><Settings /></EmailVerificationGuard></PrivateRoute>} />

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
                        </Suspense>

                      </MaintenanceGuard>

                    </VideoCallProvider>
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