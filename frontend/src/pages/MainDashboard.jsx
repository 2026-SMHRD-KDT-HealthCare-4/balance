import React, { useEffect, useState } from 'react'; // 리액트의 기본 도구(상태 관리, 생명주기 관리)를 가져옵니다.
import { useNavigate } from 'react-router-dom'; // 페이지 이동(경로 전환)을 도와주는 도구를 가져옵니다.
import { loadPostureScore } from '../utils/appUtils'; // 우리가 만든 유틸리티 파일에서 점수를 불러오는 함수를 가져옵니다.

const MainDashboard = () => {
  // 1. 페이지 이동을 위한 함수 선언 (예: 버튼 클릭 시 /monitor로 이동)
  const navigate = useNavigate();

  // 2. 현재 점수를 저장할 '상태(State)' 변수 선언
  // 초기값으로 loadPostureScore()를 실행해 저장된 점수를 가져와서 화면에 세팅합니다.
  const [currentScore, setCurrentScore] = useState(loadPostureScore());

  // 3. 화면이 나타날 때 실행되는 효과(Effect) 설정
  useEffect(() => {
    // ⏲️ 5초마다 실행되는 타이머 생성
    // 사용자가 다른 페이지(MonitorPage)에서 점수를 깎으면, 여기서 주기적으로 확인해 화면을 갱신합니다.
    const interval = setInterval(() => {
      // 로컬 스토리지에서 최신 점수를 읽어와 currentScore 상태를 업데이트합니다.
      setCurrentScore(loadPostureScore());
    }, 5000); // 5000ms = 5초 주기로 설정됨 (부하를 줄이기 위해 조절한 부분)

    // 🧹 클린업 함수: 이 컴포넌트가 사라질 때 타이머를 멈춰서 메모리 낭비를 방지합니다.
    return () => clearInterval(interval);
  }, []); // []는 페이지가 처음 로딩될 때 딱 한 번만 이 효과를 실행하겠다는 뜻입니다.

  return (
    // 전체 배경 레이아웃 설정 (여백, 중앙 정렬, 최소 높이 등)
    <div style={{ padding: '50px', textAlign: 'center', minHeight: '100vh', backgroundColor: '#fcfcfc' }}>
      
      {/* 서비스 로고 및 대제목 */}
      <h1 style={{ fontSize: '2.8rem', fontWeight: 'bold' }}>RE-BALANCE</h1>
      
      {/* 서비스 설명 문구 */}
      <p style={{ color: '#6b7280' }}>AI가 관리하는 실시간 거북목 케어</p>

      {/* 점수 표시를 위한 중앙 카드 섹션 */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '60px 0' }}>
        <div style={{ 
          padding: '40px 60px', 
          background: '#fff', 
          borderRadius: '24px', 
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)' // 은은한 그림자 효과
        }}>
          {/* 카드 내부 제목 */}
          <h3 style={{ color: '#888', fontSize: '1rem' }}>오늘의 자세 점수</h3>
          
          {/* 실시간으로 변하는 점수 숫자 표시 */}
          <p style={{ fontSize: '4rem', fontWeight: 'bold', color: '#3b82f6' }}>{currentScore}점</p>
        </div>
      </div>

      {/* 분석 모드로 넘어가는 버튼 */}
      <button 
        onClick={() => navigate('/monitor')} // 클릭 시 'monitor' 경로로 이동
        style={{ 
          padding: '20px 60px', 
          fontSize: '1.2rem', 
          fontWeight: 'bold', 
          backgroundColor: '#3b82f6', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '50px', 
          cursor: 'pointer' 
        }}
      >
        분석 모드 시작하기
      </button>
    </div>
  );
};

export default MainDashboard; // 이 컴포넌트를 다른 곳(App.jsx 등)에서 쓸 수 있도록 내보냅니다.