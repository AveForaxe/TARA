import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { Home } from './pages/Home';
import { Kegiatan } from './pages/Kegiatan';
import { Pasar } from './pages/Pasar';
import { Lapor } from './pages/Lapor';
import { Dasbor } from './pages/Dasbor';
import { DashboardAdmin } from './pages/admin/DashboardAdmin';
import { DataWarga } from './pages/admin/DataWarga';
import { ManajemenLaporan } from './pages/admin/ManajemenLaporan';
import { Keuangan } from './pages/admin/Keuangan';
import { AuditLogs } from './pages/admin/AuditLogs';
import { ManajemenKegiatan } from './pages/admin/ManajemenKegiatan';
import { ManajemenProduk } from './pages/admin/ManajemenProduk';

import { ADMIN_PATH } from './utils/constants';
import { DashboardDeveloper } from './pages/admin/DashboardDeveloper';
import { DashboardKeuangan } from './pages/admin/DashboardKeuangan';
import { DashboardKarangTaruna } from './pages/admin/DashboardKarangTaruna';
import { DashboardRT } from './pages/admin/DashboardRT';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Portal Warga */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/kegiatan" element={<Layout><Kegiatan /></Layout>} />
            <Route path="/pasar" element={<Layout><Pasar /></Layout>} />
            <Route path="/lapor" element={<Layout><Lapor /></Layout>} />
            <Route path="/dasbor" element={<Layout><Dasbor /></Layout>} />

            {/* Admin Portal (TARA-SYSTEM) */}
            <Route path={`${ADMIN_PATH}`} element={<AdminLayout><div style={{color:'white', padding: '40px', textAlign: 'center'}}>Memuat Dashboard...</div></AdminLayout>} />
            
            {/* Role Dashboards */}
            <Route path={`${ADMIN_PATH}/developer`} element={<AdminLayout><DashboardDeveloper /></AdminLayout>} />
            <Route path={`${ADMIN_PATH}/admin`} element={<AdminLayout><DashboardAdmin /></AdminLayout>} />
            <Route path={`${ADMIN_PATH}/keuangan`} element={<AdminLayout><DashboardKeuangan /></AdminLayout>} />
            <Route path={`${ADMIN_PATH}/karang-taruna`} element={<AdminLayout><DashboardKarangTaruna /></AdminLayout>} />
            <Route path={`${ADMIN_PATH}/rt`} element={<AdminLayout><DashboardRT /></AdminLayout>} />

            {/* Admin Modules */}
            <Route path={`${ADMIN_PATH}/warga`} element={<AdminLayout><DataWarga /></AdminLayout>} />
            <Route path={`${ADMIN_PATH}/keuangan-data`} element={<AdminLayout><Keuangan /></AdminLayout>} />
            <Route path={`${ADMIN_PATH}/laporan`} element={<AdminLayout><ManajemenLaporan /></AdminLayout>} />
            <Route path={`${ADMIN_PATH}/kegiatan`} element={<AdminLayout><ManajemenKegiatan /></AdminLayout>} />
            <Route path={`${ADMIN_PATH}/logs`} element={<AdminLayout><AuditLogs /></AdminLayout>} />
            <Route path={`${ADMIN_PATH}/produk`} element={<AdminLayout><ManajemenProduk /></AdminLayout>} />

            {/* Fallbacks */}
            <Route path={`${ADMIN_PATH}/*`} element={<AdminLayout><NotFound /></AdminLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
