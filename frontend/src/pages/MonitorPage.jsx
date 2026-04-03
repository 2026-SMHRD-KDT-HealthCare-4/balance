import React, { useRef, useEffect } from 'react'; // 리액트 기본 도구
import { useNavigate } from 'react-router-dom'; // 페이지 이동 도구
import { useUnifiedPose } from '../hooks/useUnifiedPose'; // AI 자세 분석 커스텀 훅 (웹캠 데이터를 분석함)
import { sendPostureAlert, savePostureScore, loadPostureScore } from '../utils/appUtils'; // 공용 도구함에서 기능들 가져오기

const MonitorPage = () => {
  // 1. 비디오 엘리먼트를 직접 가리키기 위한 참조 변수 (웹캠 화면 연결용)
  const videoRef = useRef(null);
  
  // 2. 페이지 이동 함수 선언
  const navigate = useNavigate();

  // 3. AI 분석 훅 실행: videoRef를 전달하여 실시간으로 각도, 상태(정상/위험) 데이터를 받아옵니다.
  const { postureData } = useUnifiedPose(videoRef); 

  // 4. [실시간 감시 로직] 자세 상태가 바뀔 때마다 실행됩니다.
  useEffect(() => {
    // 만약 AI가 판정한 상태가 '위험'이라면?
    if (postureData.status === '위험') {
      sendPostureAlert(); // 🔔 서비스 워커를 통해 백그라운드 푸시 알림 발송
      
      // 📊 점수 차감: 현재 점수를 불러와서 1점을 뺀 뒤 다시 저장합니다. (최하점은 0점)
      savePostureScore(Math.max(0, loadPostureScore() - 1));
    }
  }, [postureData.status]); // [postureData.status]가 변경될 때만 이 내부 코드가 돌아갑니다.

  // 5. [임시 테스트용 함수] 웹캠 없이도 로직이 잘 돌아가는지 확인하기 위한 버튼 클릭 이벤트
  const handleTest = () => {
    sendPostureAlert(); // 알림 테스트
    savePostureScore(Math.max(0, loadPostureScore() - 10)); // 테스트 시엔 10점 크게 감점
    navigate('/stretch'); // 알림 확인 후 스트레칭 페이지로 잘 넘어가는지 테스트하기 위해 이동
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      
      {/* 상단 바: 뒤로가기 버튼, 제목, 테스트 버튼 배치 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={() => navigate('/')}>← 대시보드로</button>
        <h2>정밀 모니터링 중</h2>
        
        {/* 강제로 위험 상황을 만드는 빨간색 테스트 버튼 */}
        <button 
          onClick={handleTest} 
          style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}
        >
          테스트 알림
        </button>
      </div>

      {/* 영상 및 분석 데이터 표시 영역 */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* 실제 웹캠 화면이 나오는 비디오 태그 */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ 
            width: '720px', 
            borderRadius: '15px', 
            transform: 'scaleX(-1)' // 거울처럼 보이기 위해 좌우 반전
          }} 
        />
        
        {/* 영상 위에 겹쳐서 보여주는 분석 정보창 (우측 상단) */}
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          backgroundColor: 'rgba(255,255,255,0.9)', 
          padding: '15px', 
          borderRadius: '10px', 
          textAlign: 'left',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {/* AI가 계산한 실시간 목 각도 */}
          <p>📐 목 각도: <strong>{postureData.angle}°</strong></p>
          
          {/* 현재 상태 표시 (정상일 땐 초록색, 위험일 땐 빨간색 배경) */}
          <div style={{ 
            padding: '10px', 
            borderRadius: '5px', 
            textAlign: 'center', 
            fontWeight: 'bold', 
            backgroundColor: postureData.status === '위험' ? '#fee2e2' : '#d1fae5',
            color: postureData.status === '위험' ? '#dc2626' : '#059669' 
          }}>
            상태: {postureData.status}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitorPage;