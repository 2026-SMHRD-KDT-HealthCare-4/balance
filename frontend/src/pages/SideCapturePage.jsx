import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as FaIcons from "react-icons/fa";
import WebcamView from '../components/WebcamView';
import { initializeCapturePose, sendToCapturePose } from '../ai/mediapipe';
import { useNeckDiagnostic } from '../hooks/useNeckDiagnostic';
import { savePoseLog } from '../api/poseApi';

const SideCapturePage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const isSavingRef = useRef(false); // 리렌더링 없이 즉각적인 상태 잠금을 위해 ref 사용
  
  const [timer, setTimer] = useState(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const { runAnalysis } = useNeckDiagnostic();

  

  // 1. 초기화는 마운트 시 단 한 번만!
  useEffect(() => {
    initializeCapturePose(async (results) => {
      if (!results || !results.poseLandmarks || isSavingRef.current) return;

      const analysisResult = runAnalysis(results.poseLandmarks);
      
      if (analysisResult) {
        isSavingRef.current = true; // 즉시 잠금
        console.log("📸 데이터 포착 성공:", analysisResult);
        
        try {
          await savePoseLog({
            angle: analysisResult.angle,
            status: analysisResult.status,
          });
        } catch (e) {
          console.error("서버 저장 실패");
        }

        navigate('/diagnosis', { 
          state: { result: analysisResult },
          replace: true 
        });
      }
    });

    // Cleanup: 페이지 이탈 시 카메라/AI 프로세스 정리 로직 필요 시 추가
  }, [runAnalysis, navigate]);


  // 뒤로가기 버튼 핸들러 (알림창 추가)
  const handleBackWithConfirm = () => {
    const leave = window.confirm("지금 나가면 측정 결과가 저장되지 않습니다. 그래도 나가시겠습니까?");
    if (leave) navigate('/');
  };

  const handleStartCapture = () => {
    setIsMeasuring(true);
    setTimer(5);
  };

  // 2. 타이머 로직 개선
  useEffect(() => {
    if (timer === null) return;
    if (timer > 0) {
      const id = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(id);
    } else {
      // 타이머 종료 시점
      if (videoRef.current && videoRef.current.readyState >= 2) {
        sendToCapturePose(videoRef.current);
      }
      setTimer(null);
      setIsMeasuring(false);
    }
  }, [timer]);

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <button onClick={handleBackWithConfirm} style={backBtnStyle}>
          <FaIcons.FaChevronLeft />
        </button>
        <h1 style={titleStyle}>측면 측정</h1>
        <div style={{ width: '40px' }}></div>
      </header>

      <div style={contentAreaStyle}>
        {/* 가독성을 위해 absolute 위치 수정 */}
        <p style={subTitleLabelStyle}>실루엣에 맞춰 측면으로 서주세요.</p>
        
        <div style={videoContainerStyle}>
          <WebcamView videoRef={videoRef} />
          
          {/* 가이드라인 중앙 정렬 최적화 */}
          <div style={guideOverlayWrapper}>
            <svg viewBox="0 0 640 480" style={{ width: '100%', height: '100%' }}>
              <path
                d="M320,30 C210,30 210,180 210,180 C130,210 120,320 120,400 C120,470 200,480 320,480 C440,480 520,470 520,400 C520,320 510,210 430,180 C430,180 430,30 320,30 Z"
                fill="none" 
                stroke="#e67e22" 
                strokeWidth="6" 
                strokeDasharray="15,10" 
                style={{ opacity: 0.8 }}
              />
            </svg>
          </div>

          {timer !== null && (
            <div style={timerOverlayStyle}>{timer > 0 ? timer : "📸"}</div>
          )}
        </div>
      </div>

      <div style={footerStyle}>
        <button 
          onClick={handleStartCapture} 
          style={{...buttonStyle, backgroundColor: isMeasuring ? '#ccc' : '#4A90E2'}}
          disabled={isMeasuring}
        >
          {isMeasuring ? "자세 고정 중..." : "측정 시작"}
        </button>
      </div>
    </div>
  );
};

// --- 스타일 개선: 중앙 정렬 및 가독성 최적화 ---

const videoContainerStyle = {
  position: 'relative',
  width: '640px',  // 고정하지 않으면 top: 50은 시한폭탄입니다.
  height: '480px', 
  margin: '0 auto',
  overflow: 'hidden'
};

const containerStyle = {
  position: 'fixed', 
  top: 0, 
  left: 0, 
  width: '100vw', 
  height: '100vh',
  backgroundColor: '#fff', // 전체 배경은 깔끔하게 화이트
  zIndex: 2000, 
  display: 'flex', 
  flexDirection: 'column'
};

const headerStyle = {
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  padding: '15px 20px',
  zIndex: 2100 // 카메라보다 위에 위치
};



const backBtnStyle = { background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' };
const titleStyle = { fontSize: '1.1rem', fontWeight: '800', margin: 0 };
const subTitleLabelStyle = {
  marginBottom: '20px',
  fontSize: '1rem',
  fontWeight: '600',
  color: '#333'
};

const contentAreaStyle = {
  flex: 1, 
  display: 'flex', 
  flexDirection: 'column', 
  justifyContent: 'center', 
  alignItems: 'center',
  position: 'relative', // 가이드라인과 텍스트 배치를 위해
  overflow: 'hidden'
};

const guideOverlayWrapper = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  pointerEvents: 'none'
};

const cameraWrapperStyle = {
  position: 'relative',
  width: '100%', // 부모(videoContainer) 안에서 꽉 차게
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const svgOverlayStyle = {
  position: 'absolute',
  top: '50px',     // px 단위를 명시적으로 작성 권장
  left: '100px',
  width: '80%', 
  height: 'auto',
  pointerEvents: 'none',
  zIndex: 10
};

const timerOverlayStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '80px', color: '#fff', fontWeight: 'bold' };
const footerStyle = { 
  padding: '30px 20px', 
  display: 'flex', 
  justifyContent: 'center',
  backgroundColor: '#fff'
};
const buttonStyle = { width: '100%', maxWidth: '350px', padding: '18px', fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', backgroundColor: '#4A90E2', border: 'none', borderRadius: '16px' };

export default SideCapturePage;