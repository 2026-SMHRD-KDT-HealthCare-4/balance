import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { saveBaseline } from '../api/poseApi'; 
import WebcamView from '../components/WebcamView';

const FrontSetupPage = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // 순수 감지 훅 사용 (스케줄러 없음)
  const { angle, shoulderDiff } = usePoseDetection(videoRef, true);

  useEffect(() => {
    let timer;
    if (isMeasuring && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (isMeasuring && countdown === 0) {
      completeFrontSetup();
    }
    return () => clearInterval(timer);
  }, [isMeasuring, countdown]);

  const completeFrontSetup = async () => {
    try {
      const data = {
        type: 'front',
        shoulderDiff: parseFloat(shoulderDiff) || 0,
        headAngle: parseFloat(angle) || 0,
        timestamp: new Date().toISOString()
      };
      
      await saveBaseline(data);
      localStorage.setItem('baseline_front', JSON.stringify(data));
      
      alert("✅ 정면 자세 측정이 완료되었습니다! 측면 측정을 시작합니다.");
      navigate('/setup-side'); 
    } catch (error) {
      alert("데이터 저장 중 오류가 발생했습니다.");
      setIsMeasuring(false);
    }
  };

  return (
    <div style={pageStyle}>
      <h1 style={{ color: '#333' }}>📷 1단계: 정면 자세 등록</h1>
      <p style={{ color: '#666' }}>화면을 똑바로 보고 어깨 수평을 맞춰주세요.</p>
      
      <div style={webcamContainer}>
        <WebcamView videoRef={videoRef} />
        {isMeasuring && countdown > 0 && (
          <div style={overlayStyle}>{countdown}</div>
        )}
      </div>

      <div style={infoStyle}>
        <p>실시간 어깨 불균형: <strong>{shoulderDiff}</strong></p>
        {!isMeasuring ? (
          <button onClick={() => setIsMeasuring(true)} style={btnStyle}>
            측정 시작 (5초)
          </button>
        ) : (
          <p style={{ color: '#ff4757', fontWeight: 'bold' }}>움직이지 말고 정면을 유지하세요!</p>
        )}
      </div>
    </div>
  );
};

// 스타일 정의
const pageStyle = { textAlign: 'center', padding: '40px' };
const webcamContainer = { position: 'relative', display: 'inline-block', margin: '20px', borderRadius: '15px', overflow: 'hidden', backgroundColor: '#000' };
const overlayStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '6rem', color: 'white', fontWeight: 'bold', textShadow: '2px 2px 10px rgba(0,0,0,0.5)' };
const infoStyle = { marginTop: '20px' };
const btnStyle = { padding: '15px 40px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' };

export default FrontSetupPage;