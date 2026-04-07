import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MyPage from './pages/MyPage'
import InitialSetupPage from './pages/InitialSetupPage'

function App() {
  return (
    <BrowserRouter>
      {/* 모바일 프레임 */}
      <div style={{
        maxWidth: '520px',
        minHeight: '100vh',
        margin: '0 auto',
        background: '#FAF8F5',
        position: 'relative',
        overflowX: 'hidden',
        boxShadow: '0 0 40px rgba(0,0,0,0.5)'  // 데스크탑에서 볼 때 구분선
      }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/home" element={<MyPage />} />
          <Route path="/setup" element={<InitialSetupPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App