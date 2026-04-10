






import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 페이지 컴포넌트 임포트
import MainDashboard from './pages/MainDashboard';
// 주의: 파일명이 MonitorPage_Stretch.jsx라면 내부에서 export default가 되어 있어야 합니다.
import MonitorPage from './pages/MonitorPage_Stretch'; 
import StretchPage from './pages/StretchPage';
import InitialSetupPage from './pages/InitialSetupPage';

/**
 * App 컴포넌트: 라우팅 설정을 담당합니다.
 * 각 경로(path)에 맞춰 해당 페이지 컴포넌트를 렌더링합니다.
 */
function App() {
  return (
    // 전체 서비스를 감싸는 라우트 구성
    <Routes>
      {/* 메인 대시보드 (기본 경로) */}
      <Route path="/" element={<MainDashboard />} />
      
      {/* 자세 감시 및 스트레칭 안내 페이지 */}
      <Route path="/monitor" element={<MonitorPage />} />
      
      {/* 스트레칭 실습 페이지 */}
      <Route path="/stretch" element={<StretchPage />} />
      
      {/* 초기 설정(영점 조절 등) 페이지 */}
      <Route path="/setup" element={<InitialSetupPage />} />

      {/* 404 페이지 처리 (선택 사항: 잘못된 경로 접근 시 대시보드로 이동) */}
      <Route path="*" element={<MainDashboard />} />
    </Routes>
  );
}

export default App;