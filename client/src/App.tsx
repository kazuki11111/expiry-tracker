import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ScanPage } from './pages/ScanPage';
import { ScanResultPage } from './pages/ScanResultPage';
import { AddProductPage } from './pages/AddProductPage';
import { SettingsPage } from './pages/SettingsPage';
import { startNotificationScheduler } from './services/notification';

export default function App() {
  useEffect(() => {
    startNotificationScheduler();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/scan/result" element={<ScanResultPage />} />
          <Route path="/add" element={<AddProductPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
