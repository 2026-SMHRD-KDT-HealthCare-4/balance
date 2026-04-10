import React, { useRef, useEffect, useState } from 'react';
import { useScheduledPose } from '../hooks/useScheduledPose';
import WebcamView from '../components/WebcamView';
import axios from 'axios';

const MonitorPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const pipVideoRef = useRef(null);
  
  const [baseline, setBaseline] = useState(null);
  const [user, setUser] = useState(null);
  const [lastSavedTime, setLastSavedTime] = useState(0); 
  const [sessionId, setSessionId] = useState(null); // [추가] 실제 DB 세션 ID 저장

  const { status, isActive, currentData } = useScheduledPose(videoRef);

  const statusRef = useRef(status);
  const dataRef = useRef(currentData);
  const isActiveRef = useRef(isActive);

  // 1. 초기 데이터 로드 및 세션 생성
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    const savedBaseline = JSON.parse(localStorage.getItem('user_baseline'));
    
    if (savedUser) setUser(savedUser);
    if (savedBaseline) setBaseline(savedBaseline);

    if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
    if (!pipVideoRef.current) pipVideoRef.current = document.createElement('video');

    // [추가] 페이지 진입 시 세션 생성 API 호출
    const createSession = async () => {
  try {
    const token = localStorage.getItem('token');
    // [수정] /api/sessions 뒤에 /start 를 추가합니다.
    const response = await axios.post('http://localhost:5000/api/sessions/start', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data && response.data.id) {
      setSessionId(response.data.id);
      console.log("🚀 세션 생성 완료 ID:", response.data.id);
    }
  } catch (error) {
    console.error("세션 생성 실패:", error.response?.status === 404 ? "경로(/start)를 확인하세요" : error.message);
  }
};

    createSession();
  }, []);

  // 2. 실시간 데이터 저장 로직
  useEffect(() => {
    statusRef.current = status;
    dataRef.current = currentData;
    isActiveRef.current = isActive;

    const currentTime = Date.now();
    
    // 세션 ID가 있을 때만 저장 시도
    if (sessionId && isActive && status === '주의' && (currentTime - lastSavedTime > 5000)) {
      savePostureLog();
      setLastSavedTime(currentTime);
    }
  }, [status, currentData, isActive, lastSavedTime, sessionId]);

  const savePostureLog = async () => {
  try {
    if (!user || !currentData || !sessionId) return;
    const token = localStorage.getItem('token');
    
    const logData = {
      session_id: sessionId,
      neck_angle: parseFloat(currentData.nvd || 0),
      shoulder_angle: parseFloat(currentData.sw || 0),
      status: status, // 이제 DB 컬럼명과 일치합니다.
      posture_score: status === '정상' ? 100 : 50,
    };

    // 만약 poseApi.js를 사용하신다면 아래처럼 호출하세요.
    // await savePoseLog(logData); 

    // 직접 axios를 쓰신다면 아래 주소를 유지하세요.
    const response = await axios.post('http://localhost:5000/api/posture/log', logData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.status === 201) console.log("✅ DB 저장 성공");
  } catch (error) {
    console.error("저장 실패:", error.response?.status === 404 ? "백엔드 라우트(/log)를 확인하세요" : error.message);
  }
};

  // --- 이하 PIP 및 렌더링 로직 (동일) ---

  const handleTextPIP = async () => {
    try {
      if (!canvasRef.current || !pipVideoRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const pipVideo = pipVideoRef.current;

      canvas.width = 300;
      canvas.height = 160;

      const drawFrame = () => {
        ctx.fillStyle = '#FAF8F5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (isActiveRef.current) {
          ctx.fillStyle = '#7C9E87';
          ctx.font = 'bold 20px Arial';
          ctx.fillText("🔍 Re:balance 감시 중", canvas.width / 2, 40);

          const curStatus = statusRef.current;
          ctx.fillStyle = curStatus === '주의' ? '#E67E22' : '#27AE60';
          ctx.font = 'bold 45px Arial';
          ctx.fillText(`${curStatus || '로딩중'}`, canvas.width / 2, 90);
          
          ctx.fillStyle = '#8C7B6E';
          ctx.font = '14px Arial';
          ctx.fillText(`아침 기준 대비 분석 중`, canvas.width / 2, 135);
        } else {
          ctx.fillStyle = '#7f8c8d';
          ctx.font = 'bold 28px Arial';
          ctx.fillText("🔒 휴식 시간", canvas.width / 2, canvas.height / 2);
        }
      };

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        return;
      }

      drawFrame();
      if (!pipVideo.srcObject) {
        pipVideo.srcObject = canvas.captureStream(10);
        pipVideo.muted = true;
      }
      await pipVideo.play();

      setTimeout(async () => {
        try {
          await pipVideo.requestPictureInPicture();
          const interval = setInterval(() => {
            if (!document.pictureInPictureElement) {
              clearInterval(interval);
              return;
            }
            drawFrame();
          }, 500);
        } catch (e) { console.error("PIP 요청 실패:", e); }
      }, 100);
    } catch (error) { console.error("PIP 오류:", error); }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#FAF8F5', minHeight: '100vh' }}>
      <h1 style={{ color: '#2D2520', marginBottom: '10px' }}>실시간 자세 모니터링</h1>
      <p style={{ color: '#8C7B6E', marginBottom: '30px' }}>아침에 설정한 기준값으로 자세를 분석합니다.</p>
      
      <button onClick={handleTextPIP} style={btnStyle}>📺 PIP 알림창 띄우기</button>

      {isActive ? (
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={webcamWrapperStyle(status)}>
            <WebcamView videoRef={videoRef} />
            {status === '주의' && <div style={warningOverlayStyle}>⚠️ 자세를 바로잡으세요!</div>}
          </div>

          <div style={infoBoxStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.9rem', color: '#8C7B6E' }}>현재 상태</span>
                <h2 style={{ color: status === '주의' ? '#E67E22' : '#7C9E87', margin: '5px 0' }}>{status || '분석중'}</h2>
              </div>
              <div style={{ borderLeft: '1px solid #DDD5C8', height: '40px' }}></div>
              <div>
                <span style={{ fontSize: '0.9rem', color: '#8C7B6E' }}>아침 기준 목 거리</span>
                <h2 style={{ color: '#2D2520', margin: '5px 0' }}>
                  {baseline && typeof baseline.baseNeckDist === 'number' ? baseline.baseNeckDist.toFixed(3) : '미설정'}
                </h2>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#A0948C', marginTop: '15px' }}>
              실시간 데이터 — 어깨: {typeof currentData?.sw === 'number' ? currentData.sw.toFixed(3) : '0.000'} | 
              목: {typeof currentData?.nvd === 'number' ? currentData.nvd.toFixed(3) : '0.000'}
            </p>
          </div>
        </div>
      ) : (
        <div style={breakBoxStyle}>
          <h2 style={{ color: '#8C7B6E' }}>🔒 현재는 휴식 시간입니다.</h2>
          <p>잠시 스트레칭을 하며 휴식을 취하세요.</p>
        </div>
      )}
    </div>
  );
};

const btnStyle = { marginBottom: '30px', padding: '15px 40px', backgroundColor: '#7C9E87', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const webcamWrapperStyle = (status) => ({ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: status === '주의' ? '5px solid #E67E22' : '5px solid #7C9E87', transition: 'border 0.3s ease' });
const warningOverlayStyle = { position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(230, 126, 34, 0.9)', color: 'white', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', zIndex: 10 };
const infoBoxStyle = { marginTop: '25px', padding: '25px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #DDD5C8' };
const breakBoxStyle = { maxWidth: '600px', margin: '0 auto', height: '350px', backgroundColor: '#F0EBE3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', border: '1px solid #DDD5C8' };

export default MonitorPage;