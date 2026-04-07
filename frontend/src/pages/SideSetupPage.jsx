import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidePoseDetection } from '../hooks/useSidePoseDetection';
import { saveBaseline } from '../api/poseApi'; 
import WebcamView from '../components/WebcamView';

const SideSetupPage = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // 순수 감지 훅 사용 (스케줄러 없음)
  const { angle, forwardRatio } = useSidePoseDetection(videoRef, true);

  useEffect(() => {
    let timer;
    if (isMeasuring && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (isMeasuring && countdown === 0) {
      completeSideSetup();
    }
    return () => clearInterval(timer);
  }, [isMeasuring, countdown]);

  const completeSideSetup = async () => {
    try {
      const data = {
        type: 'side',
        forwardRatio: parseFloat(forwardRatio) || 0,
        sideAngle: parseFloat(angle) || 0,
        timestamp: new Date().toISOString()
      };

      await saveBaseline(data);
      localStorage.setItem('baseline_side', JSON.stringify(data));

      alert("🎉 모든 자세 등록이 완료되었습니다! 모니터링을 시작합니다.");
      navigate('/monitor'); 
    } catch (error) {
      alert("데이터 저장 중 오류가 발생했습니다.");
      setIsMeasuring(false);
    }
  };

  return (
    <div style={pageStyle}>
      <h1 style={{ color: '#333' }}>📐 2단계: 측면 자세 등록</h1>
      <p style={{ color: '#666' }}>옆으로 서서 모니터를 보는 평소 자세를 취해주세요.</p>
      
      <div style={webcamContainer}>
        <WebcamView videoRef={videoRef} />
        {isMeasuring && countdown > 0 && (
          <div style={overlayStyle}>{countdown}</div>
        )}
      </div>

      <div style={infoStyle}>
        <p>실시간 거북목 각도: <strong>{angle}°</strong></p>
        {!isMeasuring ? (
          <button onClick={() => setIsMeasuring(true)} style={btnStyleSide}>
            측정 시작 (5초)
          </button>
        ) : (
          <p style={{ color: '#ff4757', fontWeight: 'bold' }}>5초간 자세를 유지하세요!</p>
        )}
      </div>
    </div>
  );
};

// 스타일 정의 (Front와 동일하거나 유사하게)
const pageStyle = { textAlign: 'center', padding: '40px' };
const webcamContainer = { position: 'relative', display: 'inline-block', margin: '20px', borderRadius: '15px', overflow: 'hidden', backgroundColor: '#000' };
const overlayStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '6rem', color: 'white', fontWeight: 'bold', textShadow: '2px 2px 10px rgba(0,0,0,0.5)' };
const infoStyle = { marginTop: '20px' };
const btnStyleSide = { padding: '15px 40px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#2ed573', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' };

export default SideSetupPage;