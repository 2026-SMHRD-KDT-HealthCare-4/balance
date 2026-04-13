import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';

// [팀원 페이지 임포트]
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyPage from './pages/MyPage';
import Setting from './pages/Setting';
import Diagnosis from './pages/Diagnosis';
import SideCapturePage from './pages/SideCapturePage'; 
import TeamMonitorPage from './pages/TeamMonitorPage';
import InitialSetupPage from './pages/InitialSetupPage';
// [예훈님 페이지 임포트]
import MonitorPageStretch from './pages/MonitorPage_Stretch'; 
import StretchPage from './pages/StretchPage';

// 컴포넌트 임포트
import Footer from './components/Footer';

function MainLayout() {
  return (
    <div style={{ paddingBottom: '85px' }}>
      <Outlet />
      <Footer />
    </div>
  );
}

// 1. 라우팅 로직을 담당할 별도의 컴포넌트 생성
function AppContent() {
  const navigate = useNavigate();

  // 스트레칭 완료 시 실행될 함수
  const handleStretchFinish = () => {
    console.log("스트레칭 완료! 대시보드로 이동합니다.");
    navigate('/dashboard'); // 완료 후 대시보드로 이동
  };

  return (
    <div style={mobileFrameStyle}>
      <Routes>
        {/* --- [그룹 1] 하단 바 없는 페이지 --- */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/diagnosis" element={<Diagnosis />} />
        <Route path="/side-capture" element={<SideCapturePage />} />
        
        {/* ✅ onFinish prop으로 이동 함수를 전달합니다 */}
        <Route path="/stretch" element={<StretchPage onFinish={handleStretchFinish} />} />

        {/* --- [그룹 2] 하단 바 있는 페이지 --- */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/setup" element={<InitialSetupPage />} />
          <Route path="/monitor" element={<MonitorPageStretch />} />
          <Route path="/team-monitor" element={<TeamMonitorPage />} />
          <Route path="/sidecapturepage" element={<SideCapturePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* 2. BrowserRouter 내부에서 AppContent를 렌더링하여 useNavigate가 작동하게 함 */}
      <AppContent />
    </BrowserRouter>
  );
}

const mobileFrameStyle = {
  maxWidth: '520px',
  minHeight: '100vh',
  margin: '0 auto',
  background: '#F9FAFB',
  position: 'relative',
  overflowX: 'hidden',
  boxShadow: '0 0 40px rgba(0,0,0,0.05)'
};

export default App;