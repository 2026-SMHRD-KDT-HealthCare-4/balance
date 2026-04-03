import React, { useState, useRef, useEffect } from 'react';
import { useUnifiedPose } from '../hooks/useUnifiedPose';
import StretchPage from './StretchPage';

const MainDashboard = () => {
  const videoRef = useRef(null);
  const [isStretchingMode, setIsStretchingMode] = useState(false);
  
  // 통합 훅 사용
  const { postureData, rawLandmarks } = useUnifiedPose(videoRef);

  // '위험' 상태 자동 감지 시 전환
  useEffect(() => {
    if (postureData.status === '위험' && !isStretchingMode) {
      setIsStretchingMode(true);
    }
  }, [postureData.status, isStretchingMode]);

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '20px' }}>
      {isStretchingMode ? (
        <StretchPage 
          landmarks={rawLandmarks} 
          onFinish={() => setIsStretchingMode(false)} 
        />
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>실시간 자세 모니터링</h2>
          
          <div style={{ position: 'relative', display: 'inline-block', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '720px',
                height: '540px',
                backgroundColor: '#000',
                objectFit: 'cover',
                transform: 'scaleX(-1)' // 거울 모드 적용
              }}
            />
            
            {/* 실시간 상태 정보 오버레이 (의성님 MonitorPage 스타일 반영) */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '15px',
              borderRadius: '15px',
              textAlign: 'left',
              fontSize: '0.9rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <p>📐 목 꺾임: <strong>{postureData.angle}°</strong></p>
              <p>⚖️ 어깨 비대칭: <strong>{postureData.shoulderDiff}</strong></p>
              <p>🐢 거북목 지수: <strong>{postureData.forwardRatio}</strong></p>
              <p>🕒 CVA 각도: <strong>{postureData.cva}°</strong></p>
              <hr style={{ margin: '10px 0' }} />
              <div style={{ 
                textAlign: 'center',
                padding: '5px',
                borderRadius: '5px',
                backgroundColor: postureData.status === '위험' ? '#fee2e2' : postureData.status === '주의' ? '#fef3c7' : '#d1fae5',
                color: postureData.status === '위험' ? '#b91c1c' : postureData.status === '주의' ? '#b45309' : '#047857',
                fontWeight: 'bold'
              }}>
                {postureData.status}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', color: '#6b7280' }}>
            <p>* 카메라를 정면으로 바라봐 주세요. '위험' 감지 시 자동으로 스트레칭이 시작됩니다.</p>
            <button 
              onClick={() => setIsStretchingMode(true)}
              style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              수동 스트레칭 테스트
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;