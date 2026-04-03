import React, { useState, useRef, useEffect } from 'react';
import { PERFECT_POSE_DATA, getSimilarity } from '../utils/appUtils';

const STRETCH_STEPS = [
  { id: 1, name: "목 옆으로 당기기", image: "/images/stretch_neck.png" },
];

const StretchPage = ({ landmarks, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [holdTime, setHoldTime] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [statusMessage, setStatusMessage] = useState("준비하세요!");
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  // 타이머 로직 (기존과 동일)
  useEffect(() => {
    if (isHolding) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setHoldTime(prev => (prev >= 5000 ? 5000 : prev + 100));
        }, 100);
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setHoldTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isHolding]);

  // 성공 판정 (기존과 동일)
  useEffect(() => {
    if (holdTime >= 5000) {
      setStatusMessage("참 잘했어요!");
      setTimeout(() => onFinish(), 1000);
    }
  }, [holdTime, onFinish]);

  // 🚀 핵심: 데이터 기반 판정 및 캔버스 그리기
  useEffect(() => {
    if (!landmarks || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = containerRef.current.clientWidth;
    canvas.height = containerRef.current.clientHeight;

    // 1. 데이터 유사도 판정
    const target = PERFECT_POSE_DATA.neck_stretch;
    const currentNose = landmarks[0];
    
    // [학습 데이터 비교] 현재 코 위치와 정석 코 위치 사이의 거리 계산
    const diff = getSimilarity(currentNose, target.nose);
    
    // 오차 범위(threshold)보다 작으면 정석 자세로 인정!
    const correct = diff < target.threshold;
    setIsHolding(correct);
    setStatusMessage(correct ? "자세 유지 중!" : "정석 자세를 취해주세요");

    // 2. 스켈레톤 그리기 (기존 로직 유지)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = correct ? "#00FF00" : "#FF0000"; // 성공 시 초록, 아니면 빨간 선
    ctx.lineWidth = 5;
    
    // ... (스켈레톤 그리기 로직: 이전과 동일하므로 생략 가능) ...
  }, [landmarks, currentStep]);

  return (
    <div ref={containerRef} style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000' }}>
       {/* UI 레이아웃은 이전과 동일하게 유지 */}
       <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
       <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', background: 'rgba(0,0,0,0.5)', padding: '20px' }}>
         <h1>{STRETCH_STEPS[currentStep].name}</h1>
         <p>{statusMessage}</p>
         <progress value={holdTime} max="5000" />
       </div>
    </div>
  );
};

export default StretchPage;