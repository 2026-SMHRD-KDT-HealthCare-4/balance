import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

/**
 * 🚀 서비스 워커(PWA) 등록 로직
 * 개발 환경에서 빈번한 리로드로 인한 충돌을 방지하기 위해 
 * 'window.load' 이벤트 시점에 등록하는 것이 권장됩니다.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('✅ 서비스 워커 등록 성공 (범위):', reg.scope);
      })
      .catch((err) => {
        console.error('❌ 서비스 워커 등록 실패:', err);
      });
  });
}

// 💻 앱 렌더링
// StrictMode는 개발 단계에서 잠재적인 문제를 잡기 위해 렌더링을 두 번 발생시킵니다.
// 카메라/미디어 파이프 연동 시 두 번 실행되는 게 불편하다면 StrictMode를 제거해도 무방합니다.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);