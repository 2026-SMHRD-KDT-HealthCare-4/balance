import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 1. 라우터 불러오기
import App from './App'
import './index.css'

// 🚀 서비스 워커 등록 로직 (이미 성공하셨던 그 코드입니다)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✅ 서비스 워커 등록 성공:', reg.scope))
      .catch(err => console.log('❌ 서비스 워커 등록 실패:', err));
  });
}

// 💻 앱 렌더링 (BrowserRouter로 감싸기)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* 2. 여기서 감싸줘야 App 내부의 Routes가 작동합니다 */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)