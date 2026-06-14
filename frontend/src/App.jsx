
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout components
import LandingLayout from './layouts/LandingLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Page components
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Detection from './pages/Detection';
import Inventory from './pages/Inventory';
import Alerts from './pages/Alerts';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page Layout and routes */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<Landing />} />
        </Route>

        {/* Dashboard Frame and sub-pages */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/detect" element={<Detection />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/alerts" element={<Alerts />} />
        </Route>

        {/* Fallback route redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
