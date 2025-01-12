import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/protected-route';
import { MainNav } from '@/components/layout/MainNav';
import { Home } from '@/pages/home';
import { Dashboard } from '@/pages/dashboard';
import { Chat } from '@/pages/chat/Chat';
import { Discussions } from '@/pages/chat/Discussions';
import { Matrices } from '@/pages/matrices/Matrices';
import { MatrixAnalyzer } from '@/pages/matrices/MatrixAnalyzer';
import { History } from '@/pages/history/History';
import { AnalysisDetail } from '@/pages/matrices/AnalysisDetail';
import { AdminPage } from '@/pages/admin/AdminPage';
import UpgradePage from "@/pages/upgrade/UpgradePage"; 
import CancelPage from '@/pages/cancel/CancelPage';
import SuccessPage from '@/pages/success/SuccessPage'; // Correct the path if necessary
import StopFee from '@/pages/stopfee/StopFee.tsx'; // Correct the path if necessary




export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainNav />
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <MainNav />
            <Discussions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:fileId"
        element={
          <ProtectedRoute>
            <MainNav />
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/matrices"
        element={
          <ProtectedRoute>
            <MainNav />
            <Matrices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/matrices/:matrixId/analyze"
        element={
          <ProtectedRoute>
            <MainNav />
            <MatrixAnalyzer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <MainNav />
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/matrices/analyses/:analysisId"
        element={
          <ProtectedRoute>
            <MainNav />
            <AnalysisDetail />
          </ProtectedRoute>
        }
      />
    
<Route
        path="/upgrade"
        element={
          <ProtectedRoute>
            <MainNav />
            <UpgradePage />
          </ProtectedRoute>
        }
      />
    
<Route
  path="/cancel"
  element={
    <ProtectedRoute>
      <MainNav />
      <CancelPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/success"
  element={
    <ProtectedRoute>
      <MainNav />
      <SuccessPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/stopfee"
  element={
    <ProtectedRoute>
      <MainNav />
      <StopFee />
    </ProtectedRoute>
  }
/>


      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <MainNav />
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}