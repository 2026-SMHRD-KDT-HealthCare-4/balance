



import React, { useState, useRef, useEffect } from 'react';
import usePoseDetection from '../hooks/usePoseDetection'; 
import StretchPage from './StretchPage';

const MonitorPage = () => {
  const videoRef = useRef(null);
  const [isStretchMode, setIsStretchMode] = useState(false);
  const detectCountRef = useRef(0);

  const postureData = usePoseDetection(videoRef);

  useEffect(() => {
    if (isStretchMode) return;

    if (postureData && postureData.angle > 0 && postureData.angle < 45) {
      detectCountRef.current += 1;
      if (detectCountRef.current >= 5) {
        handleStartStretch();
      }
    } else {
      detectCountRef.current = 0; 
    }
  }, [postureData, isStretchMode]);

  const handleStartStretch = () => {
    setIsStretchMode(true);
  };

  return (
    <div style={{ 
      width: '100vw',
      height: '100vh',
      backgroundColor: '#020617',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {!isStretchMode ? (
        <>
          {/* 상태 UI */}
          <div style={{ 
            position: 'absolute',
            top: '20px',
            left: '20px',
            color: 'white',
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '15px 25px',
            borderRadius: '16px',
            zIndex: 20
          }}>
            <p style={{ margin: 0 }}>
              상태: <span style={{ color: postureData.status === '정상' ? '#10b981' : '#f43f5e' }}>
                {postureData.status}
              </span>
            </p>
            <p style={{ margin: '5px 0 0 0' }}>
              목 각도: {Math.round(postureData.angle || 0)}°
            </p>
          </div>

          {/* 🔥 핵심: 고정된 카메라 박스 */}
          <div style={{
            width: '800px',
            height: '500px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: 'scaleX(-1)',
                borderRadius: '30px',
                border: '2px solid rgba(255,255,255,0.1)',
                backgroundColor: '#000'
              }}
            />
          </div>
        </>
      ) : (
        <StretchPage 
          videoRef={videoRef}   // 🔥 중요: 같은 카메라 계속 사용
          key="stretch-page-session"
          onFinish={() => {
            detectCountRef.current = 0; 
            setIsStretchMode(false);
          }} 
        />
      )}
    </div>
  );
};

export default MonitorPage;