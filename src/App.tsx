import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { AuthProvider } from "./context/AuthContext";
import ProtectedLayout from "./components/Layout/ProtectedLayout";
import AppErrorBoundary from "./components/AppErrorBoundary";

// Pages (to be implemented)
import Login from "./pages/Login";
import Announcements from "./pages/Announcements";
import Surveys from "./pages/Surveys";
import SurveyDetail from "./pages/SurveyDetail";
import Hub from "./pages/Hub";
import HubDetail from "./pages/HubDetail";
import Account from "./pages/Account";

function App() {
  return (
    <AppErrorBoundary>
      <ConvexClientProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<Navigate to="/announcements" replace />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/surveys" element={<Surveys />} />
                <Route path="/surveys/:slug" element={<SurveyDetail />} />
                <Route path="/hub" element={<Hub />} />
                <Route path="/hub/:slug" element={<HubDetail />} />
                <Route path="/account" element={<Account />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ConvexClientProvider>
    </AppErrorBoundary>
  );
}

export default App;
