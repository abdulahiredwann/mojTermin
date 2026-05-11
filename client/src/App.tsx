import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import LandingPage from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import PrivacyPage from "./components/PrivacyPage";
import { SignupPage } from "./components/SignupPage";
import { AdminComingSoonPage } from "./components/admin/AdminComingSoonPage";
import { AdminAppointmentsPage } from "./components/admin/AdminAppointmentsPage";
import { AdminHospitalsPage } from "./components/admin/AdminHospitalsPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminLoginPage } from "./components/admin/AdminLoginPage";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { UserAuthProvider } from "./contexts/UserAuthContext";
import { UserDashboardPage } from "./components/UserDashboardPage";
import { UserProtectedRoute } from "./components/UserProtectedRoute";
import { UserSettingsPage } from "./components/UserSettingsPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <LanguageProvider>
      <AdminAuthProvider>
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <UserAuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route element={<UserProtectedRoute />}>
              <Route path="/user/dashboard" element={<UserDashboardPage />} />
              <Route path="/user/settings" element={<UserSettingsPage />} />
            </Route>

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
          </UserAuthProvider>
        </BrowserRouter>
      </AdminAuthProvider>
    </LanguageProvider>
  );
}

export default App;
