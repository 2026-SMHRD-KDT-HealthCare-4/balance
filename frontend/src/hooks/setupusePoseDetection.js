import { useEffect, useRef, useState, useCallback } from 'react';
import { initializeCapturePose, sendToCapturePose } from '../ai/mediapipe';
import { analyzePosture } from '../ai/setupposeAnalyzer';

export const usePoseDetection = (videoRef, enabled = true) => {
  const [postureData, setPostureData] = useState({ 
    shoulderWidth: "0.0000",
    neckVerticalDist: "0.0000",
    status: '대기'
  });

  const requestRef = useRef();
  const poseInstanceRef = useRef(null);
  const isClosingRef = useRef(false);
  const enabledRef = useRef(enabled);
  
  // ✅ 최신 데이터를 추적하여 불필요한 setPostureData 방지
  const lastDataRef = useRef(postureData);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  const onResults = useCallback((results) => {
    if (isClosingRef.current || !enabledRef.current) return;
    if (results && results.poseLandmarks) {
      const analysis = analyzePosture(results.poseLandmarks);
      if (analysis) {
        // ✅ 소수점 3자리 비교로 미세한 떨림에 의한 렌더링 방지
        const isSame = 
          parseFloat(lastDataRef.current.shoulderWidth).toFixed(3) === parseFloat(analysis.shoulderWidth).toFixed(3) &&
          parseFloat(lastDataRef.current.neckVerticalDist).toFixed(3) === parseFloat(analysis.neckVerticalDist).toFixed(3) &&
          lastDataRef.current.status === analysis.status;

        if (!isSame) {
          lastDataRef.current = analysis;
          setPostureData(analysis);
        }
      }
    }
  }, []); // 의존성 배열을 완전히 비워야 초기 1회만 생성됩니다.

  const detect = useCallback(async () => {
    if (isClosingRef.current || !enabledRef.current) return;
    if (videoRef.current && videoRef.current.readyState >= 3) {
      try {
        if (poseInstanceRef.current) {
          await sendToCapturePose(poseInstanceRef.current, videoRef.current);
        }
      } catch (err) {
        if (!err.message?.includes('deleted')) console.warn("AI Loop Error:", err);
      }
    }
    // ✅ 재귀 호출 시에도 enabledRef 확인
    if (!isClosingRef.current && enabledRef.current) {
      requestRef.current = requestAnimationFrame(detect);
    }
  }, [videoRef]); // videoRef가 바뀔 때만 재생성

  useEffect(() => {
    isClosingRef.current = false;
    
    const initTimer = setTimeout(() => {
      if (!isClosingRef.current && !poseInstanceRef.current) {
        console.log("🚀 AI 모델 초기화 시작");
        poseInstanceRef.current = initializeCapturePose(onResults);
        detect();
      }
    }, 500);

    return () => {
      console.log("🧹 AI 리소스 정리");
      isClosingRef.current = true;
      clearTimeout(initTimer);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (poseInstanceRef.current) {
        try {
          poseInstanceRef.current.close();
        } catch (e) { console.error("모델 종료 에러:", e); }
        poseInstanceRef.current = null;
      }
    };
  }, []); // 의존성 배열에서 onResults와 detect를 빼서 무한 초기화를 방지합니다.

  return postureData;
};