



import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs'; 
import * as tmPose from '@teachablemachine/pose';

const STRETCH_STEPS = [
  { id: "NeckStretch", name: "목 스트레칭", image: "/images/sideneck.jpg" },
  { id: "CrossArm", name: "팔 교차 스트레칭", image: "/images/shoulder.jpg" },
  { id: "SideStretch", name: "옆구리 스트레칭", image: "/images/side.jpg" }
];

const StretchPage = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [holdTime, setHoldTime] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const canvasRef = useRef(null);
  const webcamRef = useRef(null);
  const requestRef = useRef();

  // 1. 모델 초기화 로직
  useEffect(() => {
    const MODEL_URL = "https://teachablemachine.withgoogle.com/models/lkqFDDGhE/";
    let model;

    const init = async () => {
      model = await tmPose.load(MODEL_URL + 'model.json', MODEL_URL + 'metadata.json');
      const size = 400; 
      const webcam = new tmPose.Webcam(size, size, true);
      await webcam.setup();
      await webcam.play();
      webcamRef.current = webcam;

      const loop = async () => {
        webcam.update();
        await predict(model);
        requestRef.current = window.requestAnimationFrame(loop);
      };
      requestRef.current = window.requestAnimationFrame(loop);
    };

    init();
    return () => {
      if (requestRef.current) window.cancelAnimationFrame(requestRef.current);
      if (webcamRef.current) webcamRef.current.stop();
    };
  }, []);

  // ★ 2. 수정된 타이머 로직: 단계 전환 시 강제 초기화 추가
  useEffect(() => {
    let timer;
    if (isCorrect) {
      timer = setInterval(() => {
        setHoldTime((prev) => {
          const nextTime = prev + 100;

          if (nextTime >= 3000) {
            // 3초 도달 시
            if (currentStep < STRETCH_STEPS.length - 1) {
              // 다음 단계로 넘어가기 전 상태 초기화
              setIsCorrect(false); 
              setHoldTime(0);
              setCurrentStep((prevStep) => prevStep + 1);
              return 0;
            } else {
              onFinish(); // 마지막 단계 완료
              return 0;
            }
          }
          return nextTime;
        });
      }, 100);
    } else {
      setHoldTime(0);
    }

    return () => clearInterval(timer);
  }, [isCorrect, currentStep, onFinish]);

  const predict = async (model) => {
    if (!webcamRef.current || !model) return;
    const { pose, posenetOutput } = await model.estimatePose(webcamRef.current.canvas);
    const prediction = await model.predict(posenetOutput);

    const step = STRETCH_STEPS[currentStep];
    const target = prediction.find(p => p.className === step.id);
    
    // 인식 감도 설정 (0.4~0.5 추천)
    const correct = target && target.probability > 0.9;
    
    // 이전에 강제로 false를 만든 직후라면 잠시 인식을 멈춤 (자세 겹침 방지)
    setIsCorrect(correct);
    draw(pose);
  };

  const draw = (pose) => {
    if (!canvasRef.current || !webcamRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const video = webcamRef.current.canvas;
    const vWidth = video.width;
    const vHeight = video.height;

    const scale = Math.min(canvas.width / vWidth, canvas.height / vHeight);
    const x = (canvas.width - vWidth * scale) / 2;
    const y = (canvas.height - vHeight * scale) / 2;

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, vWidth, vHeight, canvas.width - (x + vWidth * scale), y, vWidth * scale, vHeight * scale);
    ctx.restore();

    if (pose) {
      const minPartConfidence = 0.5;
      const normalizedKeypoints = pose.keypoints.map(kp => ({
        ...kp,
        position: {
          x: canvas.width - (x + kp.position.x * scale),
          y: y + kp.position.y * scale
        }
      }));
      tmPose.drawKeypoints(normalizedKeypoints, minPartConfidence, ctx);
      tmPose.drawSkeleton(normalizedKeypoints, minPartConfidence, ctx);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.title}>{STRETCH_STEPS[currentStep].name}</h2>
        <div style={styles.imgContainer}>
          <img 
            src={STRETCH_STEPS[currentStep].image} 
            key={STRETCH_STEPS[currentStep].id} // 이미지가 바뀔 때 컴포넌트 갱신 유도
            style={styles.guideImg} 
            alt="guide" 
          />
        </div>
        <div style={styles.progressSection}>
          <p style={{ ...styles.statusText, color: isCorrect ? '#22c55e' : '#94a3b8' }}>
            {isCorrect ? "✨ 유지하세요! (3초)" : "자세를 맞춰보세요"}
          </p>
          <div style={styles.gaugeBg}>
            <div style={{ 
              ...styles.gaugeFill, 
              width: `${(holdTime / 3000) * 100}%`,
              transition: isCorrect ? 'width 0.1s linear' : 'none'
            }} />
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        <canvas ref={canvasRef} style={styles.canvas} />
      </div>
    </div>
  );
};

const styles = {
  container: { position: 'fixed', inset: 0, display: 'flex', background: '#020617', zIndex: 9999 },
  sidebar: { width: '350px', background: '#0f172a', padding: '30px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e293b' },
  title: { color: '#38bdf8', marginBottom: '20px', fontSize: '1.5rem', textAlign: 'center' },
  imgContainer: { width: '100%', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#1e293b', marginBottom: '20px', border: '2px solid #334155' },
  guideImg: { width: '100%', height: 'auto', display: 'block', objectFit: 'contain' },
  statusText: { fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' },
  mainContent: { flex: 1, position: 'relative', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  canvas: { width: '100%', height: '100%', objectFit: 'contain' },
  progressSection: { marginTop: 'auto', paddingBottom: '20px' },
  gaugeBg: { width: '100%', height: '12px', background: '#334155', borderRadius: '6px', overflow: 'hidden' },
  gaugeFill: { height: '100%', background: '#22c55e', borderRadius: '6px' }
};

export default StretchPage;