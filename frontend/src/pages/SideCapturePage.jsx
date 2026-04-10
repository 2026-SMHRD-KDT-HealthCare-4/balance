import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as FaIcons from "react-icons/fa";
import WebcamView from '../components/WebcamView';
import { initializeCapturePose, sendToCapturePose } from '../ai/mediapipe';
import { useNeckDiagnostic } from '../hooks/useNeckDiagnostic';
import { savePoseLog } from '../api/poseApi';

const SideCapturePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const videoRef = useRef(null);
  const isSavingRef = useRef(false);
  
  const [timer, setTimer] = useState(null);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const diagnostic = useNeckDiagnostic();
  const runAnalysis = diagnostic?.runAnalysis || diagnostic; 

  useEffect(() => {
    initializeCapturePose(async (results) => {
      if (!results || !results.poseLandmarks || isSavingRef.current) return;

      const analysisResult = typeof runAnalysis === 'function' ? runAnalysis(results.poseLandmarks) : null;
      
      if (analysisResult) {
        isSavingRef.current = true; 
        console.log("📸 데이터 포착 성공:", analysisResult);
        
        // --- [수정 포인트] 데이터 임시 저장 로직 ---
        // 비로그인 사용자나 메인에서 진단하러 온 사용자를 위해 로컬 스토리지에 박제
        const diagnosisData = {
          baseShoulderWidth: analysisResult.shoulderWidth || 0,
          baseNeckDist: analysisResult.neckVerticalDist || analysisResult.angle, // 거리 혹은 각도
          baseShoulderDiff: analysisResult.shoulderDiff || 0,
          measuredAt: new Date().toISOString(),
          isInitial: true // 이 데이터가 초기 기준값임을 표시
        };
        
        // 회원가입 전까지 유지될 임시 저장소
        localStorage.setItem('temp_diagnosis', JSON.stringify(diagnosisData));
        // 모니터링 페이지에서 즉시 사용할 수 있도록 baseline도 같이 업데이트
        localStorage.setItem('user_baseline', JSON.stringify(diagnosisData));

        try {
          // 로그인된 유저라면 기존처럼 서버에도 저장 시도
          const token = localStorage.getItem('token');
          if (token) {
            await savePoseLog({
              angle: analysisResult.angle,
              status: analysisResult.status,
            });
          }

          if (from === 'mypage') {
            localStorage.setItem('lastSideCaptureDate', new Date().toISOString());
          }
        } catch (e) {
          console.error("서버 저장 실패 (로그인 상태 확인 필요)");
        }

        // 페이지 이동
        if (from === 'mypage') {
          alert("주간 측면 기록이 완료되었습니다!");
          navigate('/mypage', { replace: true });
        } else {
          // 진단 결과 페이지로 이동 (분석 결과를 state로 들고 감)
          navigate('/diagnosis', { 
            state: { result: analysisResult },
            replace: true 
          });
        }
      }
    });
  }, [runAnalysis, navigate, from]); 

  const handleBackWithConfirm = () => {
    const leave = window.confirm("지금 나가면 측정 결과가 저장되지 않습니다. 그래도 나가시겠습니까?");
    if (leave) {
      if (from === 'mypage') navigate('/mypage', { replace: true });
      else navigate('/');
    }
  };

  const handleStartCapture = () => {
    setIsMeasuring(true);
    setTimer(5);
  };

  useEffect(() => {
    if (timer === null) return;
    if (timer > 0) {
      const id = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(id);
    } else {
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
        <p style={subTitleLabelStyle}>실루엣에 맞춰 측면으로 서주세요.</p>
        
        <div style={videoContainerStyle}>
          <WebcamView videoRef={videoRef} />
          
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

// --- 스타일 객체 ---
const containerStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#fff', zIndex: 2000, display: 'flex', flexDirection: 'column' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', zIndex: 2100 };
const videoContainerStyle = { position: 'relative', width: '100%', maxWidth: '640px', aspectRatio: '4/3', margin: '0 auto', overflow: 'hidden', background: '#000' };
const backBtnStyle = { background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' };
const titleStyle = { fontSize: '1.1rem', fontWeight: '800', margin: 0 };
const subTitleLabelStyle = { marginBottom: '20px', fontSize: '1rem', fontWeight: '600', color: '#333' };
const contentAreaStyle = { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' };
const guideOverlayWrapper = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' };
const timerOverlayStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '80px', color: '#fff', fontWeight: 'bold' };
const footerStyle = { padding: '30px 20px', display: 'flex', justifyContent: 'center', backgroundColor: '#fff' };
const buttonStyle = { width: '100%', maxWidth: '350px', padding: '18px', fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', border: 'none', borderRadius: '16px' };

export default SideCapturePage;