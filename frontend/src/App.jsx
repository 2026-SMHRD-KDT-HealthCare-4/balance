import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MonitorPage from './pages/MonitorPage';
import InitialSetupPage from './pages/InitialSetupPage';
import FrontSetupPage from './pages/FrontSetupPage';
import SideSetupPage from './pages/SideSetupPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<div>로그인 페이지 (준비 중)</div>} />
        <Route path="/setup" element={<InitialSetupPage />} />
        <Route path="/monitor" element={<MonitorPage />} />
        <Route path="/" element={<div>대시보드 (준비 중)</div>} />
        <Route path="/capture/front" element={<FrontSetupPage />} />
        <Route path="/capture/side" element={<SideSetupPage />} />
      </Routes>
    </Router>
  );
}

export default App;