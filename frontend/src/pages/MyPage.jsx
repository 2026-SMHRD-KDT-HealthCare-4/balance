import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VscGear } from "react-icons/vsc";
import { TbStretching } from "react-icons/tb";
import { TbStretching2 } from "react-icons/tb";
import { FcStatistics } from "react-icons/fc";
import { FaHome } from "react-icons/fa";

// 1. 아침 랜덤 인삿말 DB
const GREETINGS = [
  "좋은 아침이에요, 00님! 기지개 한 번 켜고 시작할까요?",
  "오늘도 바른 자세와 함께 활기찬 하루 보내세요!",
  "어제보다 더 곧은 허리를 위하여! 오늘도 화이팅입니다.",
  "자세가 곧아야 집중력도 올라가는 법! 지금 자세는 어떠신가요?"
];

const statusConfig = {
  good: { color: '#22c55e', label: '바름' },
  caution: { color: '#f59e0b', label: '주의' },
  danger: { color: '#ef4444', label: '위험' }
};

// 2. 실시간 자세 측정 게이지 컴포넌트
const RealtimeGauge = ({ value }) => {
  const getStatus = (angle) => {
    if (angle >= 50) return statusConfig.good;
    if (angle >= 30) return statusConfig.caution;
    return statusConfig.danger;
  };

  const status = getStatus(value);
  const barWidth = (Math.min(Math.max(value, 0), 60) / 60) * 100;

  return (
    <div style={gaugeCardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#374151' }}>실시간 자세 측정값</h3>
        <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>최근 1시간 기준</span>
      </div>
      <div style={gaugeBgStyle}>
        <div style={{ ...gaugeFillStyle, width: `${barWidth}%`, background: status.color }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>위험 (0°)</span>
        <strong style={{ fontSize: '1rem', color: status.color }}>현재 {value}° ({status.label})</strong>
        <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>정상 (60°)</span>
      </div>
    </div>
  );
};

export default function MyPage() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");
  const currentAngle = 38.4; // 실제 데이터 연결 시 활용

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * GREETINGS.length);
    setGreeting(GREETINGS[randomIdx]);
  }, []);

  // 로그아웃 로직 정의
  const handleLogout = () => {
    // 1. (선택) 로그인 토큰이나 사용자 정보를 지웁니다.
    localStorage.removeItem('userToken'); 
    
    // 2. 알림창 표시
    alert('로그아웃 되었습니다.');

    // 3. 랜딩 페이지('/')로 이동하며 히스토리를 교체(replace)합니다.
    navigate('/', { replace: true });
  };

  return (
    <div style={containerStyle}>
      {/* 1. 헤더: 로그아웃 버튼 수정 */}
      <header style={headerStyle}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#7C9E87' }}>Re:balance</h1>
        <button onClick={handleLogout} style={logoutButtonStyle}>
          로그아웃
        </button>
      </header>

      <main style={{ padding: '1.5rem' }}>
        <p style={greetingTextStyle}>{greeting}</p>

        {/* 2. AI 피드백 */}
        <section style={aiCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#374151' }}>00님, 오후 3시에 자세가 가장 무너졌어요.</h2>
          </div>
          <p style={aiTextStyle}>"집중력이 떨어질 때 고개가 숙여지는 경향이 있으니 주의하세요!"</p>
        </section>

        {/* 3. 캐릭터 카드 & 실시간 상태 */}
        <section style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <p style={smallLabel}>목 나이</p>
              <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>28세</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={smallLabel}>오늘의 스트레칭</p>
              <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#7C9E87' }}>4 / 5회</span>
            </div>
          </div>
          <div style={characterPlaceholder}>[캐릭터 위치]</div>
          
          {/* 실시간 게이지 통합 */}
          <RealtimeGauge value={currentAngle} />
        </section>

        {/* 4. 맞춤 스트레칭 추천 */}
        <section style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>맞춤 스트레칭 추천</h3>
          <div style={recommendCard}>
            <div style={recommendIcon}><TbStretching2 /></div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>승모근 이완 스트레칭</p>
              <p style={{ fontSize: '0.75rem', color: '#888' }}>굽은 등과 어깨 통증 완화 (3분)</p>
            </div>
            <button style={playBtnStyle}>▶</button>
          </div>
        </section>

        <div style={{ height: '120px' }} />
      </main>

      {/* 5. 플로팅 버튼 */}
      <div style={floatingActionWrapper}>
        <button onClick={() => navigate('/camera')} style={stickyButtonStyle}>
          실시간 거북목 측정 시작
        </button>
      </div>

      {/* 6. 하단 메뉴바 */}
      <footer style={footerStyle}>
        <div style={navItemStyle}><FaHome /><span style={labelStyle}>HOME</span></div>
        <div style={navItemStyle}><TbStretching /><span style={labelStyle}>스트레칭</span></div>
        <div style={navItemStyle}><FcStatistics /><span style={labelStyle}>기록</span></div>        
        <div style={{...navItemStyle, color: '#070707'}}><VscGear /><span style={labelStyle}>설정</span></div>
      </footer>
    </div>
  );
}

// --- 스타일 (기존 코드 유지 및 게이지 스타일 추가) ---

const gaugeCardStyle = {
  marginTop: '20px',
  padding: '15px',
  background: '#F9FAFB',
  borderRadius: '16px',
};

const gaugeBgStyle = {
  height: '10px',
  background: '#E5E7EB',
  borderRadius: '5px',
  overflow: 'hidden'
};

const gaugeFillStyle = {
  height: '100%',
  borderRadius: '5px',
  transition: 'width 0.5s ease-in-out'
};

const characterPlaceholder = {
  height: '120px',
  background: '#F3F4F6',
  borderRadius: '15px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '10px'
};

// ... (이외 제공해주신 스타일 객체들과 동일)
const containerStyle = { background: '#F9FAFB', minHeight: '100vh', maxWidth: '520px', margin: '0 auto', position: 'relative' };
const headerStyle = { padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' };
const logoutButtonStyle = { padding: '6px 12px', background: '#F3F4F6', border: 'none', borderRadius: '8px', fontSize: '0.75rem', color: '#6B7280', fontWeight: '600' };
const greetingTextStyle = { fontSize: '1.1rem', fontWeight: '800', color: '#2D2520', marginBottom: '1.5rem', padding: '0 5px' };
const aiCardStyle = { background: '#E8F0EA', borderRadius: '20px', padding: '1.2rem', marginBottom: '1.2rem' };
const aiTextStyle = { fontSize: '0.85rem', color: '#4B5563', margin: 0 };
const cardStyle = { background: '#fff', borderRadius: '24px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' };
const smallLabel = { fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' };
const recommendCard = { display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '1rem', borderRadius: '20px', border: '1px solid #F3F4F6' };
const recommendIcon = { width: '45px', height: '45px', background: '#F0F7F2', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const playBtnStyle = { background: '#7C9E87', color: '#fff', border: 'none', width: '30px', height: '30px', borderRadius: '50%' };
const floatingActionWrapper = { position: 'fixed', bottom: '85px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '520px', padding: '0 1.5rem', zIndex: 999 };
const stickyButtonStyle = { width: '100%', padding: '1.1rem', background: '#2D2520', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '1rem', fontWeight: '800' };
const footerStyle = { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '520px', background: '#D9D3D0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '80px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' };
const navItemStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 };
const labelStyle = { fontSize: '0.6rem', fontWeight: '700', marginTop: '4px' };