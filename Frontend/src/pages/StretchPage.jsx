import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs'; 
import * as tmPose from '@teachablemachine/pose';

const STRETCH_STEPS = [
  { id: "NeckStretch", name: "목 스트레칭",     image: "/images/sideneck.jpg" },
  { id: "OverHand",    name: "옆구리 스트레칭", image: "/images/overhand.jpg" }
];

const HOLD_TARGET = 3000; // 3초 유지
const REST_TARGET = 3000; // 3초 휴식
const TOTAL_REPEATS = 2;

const StretchPage = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [holdTime, setHoldTime] = useState(0);
  const [repeatCount, setRepeatCount] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isResting, setIsResting] = useState(false); 

  const canvasRef = useRef(null);
  const webcamRef = useRef(null);
  const requestRef = useRef();

  // ✅ currentStep을 ref로도 유지 → predict 클로저에서 최신값 참조 가능
  const currentStepRef = useRef(currentStep);
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  // 1. 모델 및 웹캠 초기화
  useEffect(() => {
    const MODEL_URL = "https://teachablemachine.withgoogle.com/models/2U5oQKq_T/";
    let model;

    const init = async () => {
      try {
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
      } catch (err) {
        console.error("모델 또는 웹캠 초기화 실패:", err);
      }
    };

    init();
    return () => {
      if (requestRef.current) window.cancelAnimationFrame(requestRef.current);
      if (webcamRef.current) webcamRef.current.stop();
    };
  }, []);

  // 2. 타이머 로직
  useEffect(() => {
    let timer;
    if (isResting) {
      timer = setInterval(() => {
        setHoldTime((prev) => {
          const nextTime = prev + 100;
          if (nextTime >= REST_TARGET) {
            setIsResting(false); 
            return 0;
          }
          return nextTime;
        });
      }, 100);
    } 
    else if (isCorrect) {
      timer = setInterval(() => {
        setHoldTime((prev) => {
          const nextTime = prev + 100;
          if (nextTime >= HOLD_TARGET) {
            const nextCount = repeatCount + 1;
            if (nextCount < TOTAL_REPEATS) {
              setRepeatCount(nextCount);
              setIsResting(true);
              return 0;
            } else {
              if (currentStep < STRETCH_STEPS.length - 1) {
                setCurrentStep(prev => prev + 1);
                setRepeatCount(0);
                setIsResting(true);
                return 0;
              } else {
                onFinish();
                return 0;
              }
            }
          }
          return nextTime;
        });
      }, 100);
    } else {
      setHoldTime(0);
    }
    return () => clearInterval(timer);
  }, [isCorrect, isResting, repeatCount, currentStep, onFinish]);

  // ✅ null 체크 + try-catch + posenetOutput 유효성 검사 추가
  const predict = async (model) => {
    if (!webcamRef.current || !webcamRef.current.canvas) return;
    if (!model) return;

    try {
      const { pose, posenetOutput } = await model.estimatePose(webcamRef.current.canvas);

      // ✅ posenetOutput이 유효한지 확인
      if (!posenetOutput) return;

      const prediction = await model.predict(posenetOutput);
      console.log(prediction.map(p => `${p.className}: ${p.probability.toFixed(2)}`).join(' | '));

      // ✅ currentStepRef로 최신 step 참조 (클로저 stale 문제 방지)
      const step = STRETCH_STEPS[currentStepRef.current];
      const target = prediction.find(p => p.className === step.id);
      setIsCorrect(target && target.probability > 0.9);
      draw(pose);
    } catch (err) {
      // 에러가 나도 loop는 계속 돌아야 하므로 throw하지 않음
      console.warn("predict 스킵 (일시적 에러):", err.message);
    }
  };

  const draw = (pose) => {
    if (!canvasRef.current || !webcamRef.current) return;
    const canvas = canvasRef.current;
    // ✅ willReadFrequently: true 추가 → Canvas2D readback 경고 해결
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const video = webcamRef.current.canvas;
    const scale = Math.min(canvas.width / video.width, canvas.height / video.height);
    const x = (canvas.width - video.width * scale) / 2;
    const y = (canvas.height - video.height * scale) / 2;

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, video.width, video.height, canvas.width - (x + video.width * scale), y, video.width * scale, video.height * scale);
    ctx.restore();

    if (pose) {
      const normalizedKeypoints = pose.keypoints.map(kp => ({
        ...kp,
        position: {
          x: canvas.width - (x + kp.position.x * scale),
          y: y + kp.position.y * scale
        }
      }));
      tmPose.drawKeypoints(normalizedKeypoints, 0.5, ctx);
      tmPose.drawSkeleton(normalizedKeypoints, 0.5, ctx);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.title}>{STRETCH_STEPS[currentStep].name}</h2>
        
        <div style={styles.countBadge}>
          {currentStep + 1} / {STRETCH_STEPS.length} 번째 동작 : 
          <span style={{color: '#38bdf8'}}> {Math.min(repeatCount + 1, TOTAL_REPEATS)} / {TOTAL_REPEATS}회</span>
        </div>

        <div style={styles.imgContainer}>
          <img src={STRETCH_STEPS[currentStep].image} style={styles.guideImg} alt="guide" />
        </div>

        <div style={styles.progressSection}>
          <p style={{ ...styles.statusText, color: isResting ? '#fbbf24' : (isCorrect ? '#22c55e' : '#94a3b8') }}>
            {isResting ? `잠시 쉬세요...` : (isCorrect ? "✨ 그대로 유지하세요!" : "자세를 맞춰보세요")}
          </p>
          
          <div style={styles.gaugeBg}>
            <div style={{ 
              ...styles.gaugeFill, 
              width: isResting ? '0%' : `${(holdTime / HOLD_TARGET) * 100}%`,
              background: isCorrect ? '#22c55e' : '#64748b',
              transition: isCorrect ? 'width 0.1s linear' : 'none'
            }} />
          </div>

          <div style={styles.dotContainer}>
            {[0, 1].map(i => {
              const isFinished = i < repeatCount;
              return (
                <div key={i} style={{
                  ...styles.dot,
                  backgroundColor: isFinished ? '#22c55e' : '#334155',
                  boxShadow: (i === repeatCount && isCorrect && !isResting) ? '0 0 10px #38bdf8' : 'none',
                  border: isFinished ? 'none' : '1px solid #475569'
                }} />
              );
            })}
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
  countBadge: { backgroundColor: '#1e293b', padding: '10px', borderRadius: '8px', textAlign: 'center', color: '#f8fafc', fontWeight: 'bold', marginBottom: '15px', border: '1px solid #38bdf8' },
  imgContainer: { width: '100%', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#1e293b', marginBottom: '20px', border: '2px solid #334155' },
  guideImg: { width: '100%', height: 'auto', display: 'block', objectFit: 'contain' },
  statusText: { fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px', height: '1.5rem' },
  mainContent: { flex: 1, position: 'relative', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  canvas: { width: '100%', height: '100%', objectFit: 'contain' },
  progressSection: { marginTop: 'auto', paddingBottom: '20px' },
  gaugeBg: { width: '100%', height: '14px', background: '#334155', borderRadius: '7px', overflow: 'hidden' },
  gaugeFill: { height: '100%', borderRadius: '7px' },
  dotContainer: { display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' },
  dot: { width: '12px', height: '12px', borderRadius: '50%', transition: 'all 0.3s' }
};

export default StretchPage;
