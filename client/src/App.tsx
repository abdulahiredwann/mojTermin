import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import LandingPage from "./components/LandingPage";
import PrivacyPage from "./components/PrivacyPage";
import { AdminComingSoonPage } from "./components/admin/AdminComingSoonPage";
import { AdminAppointmentsPage } from "./components/admin/AdminAppointmentsPage";
import { AdminHospitalsPage } from "./components/admin/AdminHospitalsPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminLoginPage } from "./components/admin/AdminLoginPage";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <LanguageProvider>
      <AdminAuthProvider>
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminComingSoonPage title="User list" />} />
                <Route path="users" element={<AdminComingSoonPage title="User list" />} />
                <Route path="appointments" element={<AdminAppointmentsPage />} />
                <Route path="hospitals" element={<AdminHospitalsPage />} />
                <Route path="settings" element={<AdminComingSoonPage title="Setting" />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </LanguageProvider>
  );
}

export default App;
