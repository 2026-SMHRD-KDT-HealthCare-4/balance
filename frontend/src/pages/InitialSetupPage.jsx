import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoseDetection } from '../hooks/setupusePoseDetection';
import WebcamView from '../components/WebcamView';
import axios from 'axios';

const InitialSetupPage = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isSaving, setIsSaving] = useState(false);

  // 훅에서 데이터 추출 (비동기로 계산되므로 초기값은 null일 수 있음)
  const { shoulderWidth, neckVerticalDist, shoulderDiff } = usePoseDetection(videoRef, true);

  useEffect(() => {
    let timer;
    if (isMeasuring && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (isMeasuring && countdown === 0) {
      completeSetup();
    }
    return () => clearInterval(timer);
  }, [isMeasuring, countdown]);

  const startSetup = () => {
    setIsMeasuring(true);
    setCountdown(5);
  };

  /**
   * 백엔드 연동 및 기준값 저장 함수
   */
  const completeSetup = async () => {
    setIsSaving(true);
    try {
      // 1. 로컬 스토리지에서 유저 정보 확인
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
        navigate('/login');
        return;
      }
      const user = JSON.parse(userStr);

      // 2. 전송할 데이터 구성 (null 체크 및 숫자 변환)
      const baselineData = {
        user_id: user.user_id,
        baseShoulderWidth: parseFloat(shoulderWidth || 0),
        baseNeckDist: parseFloat(neckVerticalDist || 0),
        baseShoulderDiff: parseFloat(shoulderDiff || 0)
      };

      // 3. 백엔드 API 호출 (URL을 본인 서버 환경에 맞게 확인하세요)
      const response = await axios.post('http://localhost:5000/api/auth/save-baseline', baselineData);

      if (response.status === 200) {
        // 4. 로컬 스토리지에도 저장하여 모니터링 페이지에서 활용
        localStorage.setItem('user_baseline', JSON.stringify(baselineData));
        alert("정자세 기준 설정이 완료되었습니다!");
        navigate('/monitor'); 
      }
    } catch (error) {
      console.error("데이터 저장 중 오류 발생:", error);
      alert("기준값 저장 중 오류가 발생했습니다. 서버 연결을 확인해주세요.");
      setIsMeasuring(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', maxWidth: '520px', margin: '0 auto', background: '#FAF8F5', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2D2520' }}>📏 정자세 기준 설정</h1>
      
      <div style={infoBoxStyle}>
        <h2 style={{ color: '#7C9E87', fontSize: '1.1rem', margin: '0' }}>"정면을 보고 바른 자세를 취해주세요"</h2>
        <p style={{ color: '#8C7B6E', fontSize: '0.85rem', marginTop: '8px', lineHeight: '1.5' }}>
          5초 동안 측정된 값이 당신의 건강한 기준점이 됩니다.<br/>
          카메라를 정면으로 응시하고 어깨를 펴주세요.
        </p>
      </div>

      <div style={webcamContainerStyle}>
        <WebcamView videoRef={videoRef} isActive={true} />
        {isMeasuring && countdown > 0 && (
          <div style={overlayStyle}>{countdown}</div>
        )}
      </div>

      {!isMeasuring ? (
        <button onClick={startSetup} style={btnStyle}>측정 시작 (5초)</button>
      ) : (
        <div style={{ fontSize: '1.1rem', color: '#7C9E87', fontWeight: 'bold', padding: '15px' }}>
          {countdown > 0 ? "자세를 유지하세요..." : "서버에 전송 중..."}
        </div>
      )}

      {/* 실시간 데이터 미리보기 (에러 방지 처리 완료) */}
      <div style={dataPreviewStyle}>
        <div style={dataItemStyle}>
          <span>어깨 너비 비율</span>
          <strong>{typeof shoulderWidth === 'number' ? shoulderWidth.toFixed(4) : "0.0000"}</strong>
        </div>
        <div style={dataItemStyle}>
          <span>목 수직 거리</span>
          <strong>{typeof neckVerticalDist === 'number' ? neckVerticalDist.toFixed(4) : "0.0000"}</strong>
        </div>
      </div>
    </div>
  );
};

// --- 스타일링 정의 ---

const infoBoxStyle = {
  margin: '20px 0',
  padding: '18px',
  backgroundColor: '#F0EBE3',
  borderRadius: '15px',
  border: '1px solid #DDD5C8'
};

const webcamContainerStyle = {
  position: 'relative',
  marginBottom: '20px',
  borderRadius: '20px',
  overflow: 'hidden',
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  backgroundColor: '#000',
  aspectRatio: '4 / 3'
};

const overlayStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: '6rem',
  color: '#FAF8F5',
  fontWeight: '800',
  textShadow: '0 4px 15px rgba(0,0,0,0.4)',
  zIndex: 10
};

const btnStyle = {
  width: '100%',
  padding: '1.1rem',
  fontSize: '1.1rem',
  backgroundColor: '#7C9E87',
  color: '#FAF8F5',
  border: 'none',
  borderRadius: '15px',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 4px 10px rgba(124, 158, 135, 0.3)'
};

const dataPreviewStyle = {
  marginTop: '25px',
  display: 'flex',
  gap: '12px',
  justifyContent: 'center'
};

const dataItemStyle = {
  flex: 1,
  background: '#FFFFFF',
  padding: '15px',
  borderRadius: '12px',
  border: '1px solid #DDD5C8',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  fontSize: '0.8rem',
  color: '#8C7B6E'
};

export default InitialSetupPage;