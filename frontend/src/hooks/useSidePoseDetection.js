// [2번 파일] 측면 전용 탐지 훅
import { useEffect, useRef, useState, useCallback } from 'react';
import { initializeCapturePose, sendToCapturePose } from '../ai/mediapipe';
import { analyzeSidePosture } from '../ai/sidePoseAnalyzer'; // 1번 파일 불러오기

export const useSidePoseDetection = (videoRef, enabled = true) => {
  const [sideData, setSideData] = useState({ 
    angle: 0, 
    forwardRatio: 0,
    status: '대기' 
  });
  
  const requestRef = useRef();
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const onResults = useCallback((results) => {
    if (results.poseLandmarks && enabledRef.current) {
      // 측면 전용 분석 함수로 데이터 추출
      const analysis = analyzeSidePosture(results.poseLandmarks);
      setSideData(analysis);
    }
  }, []);

  const detect = useCallback(async () => {
    if (enabledRef.current && videoRef.current && videoRef.current.readyState === 4) {
      await sendToCapturePose(videoRef.current);
    }
    requestRef.current = requestAnimationFrame(detect);
  }, [videoRef]);

  useEffect(() => {
    const poseInstance = initializeCapturePose(onResults);
    detect();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      poseInstance.close();
    };
  }, [onResults, detect]);

  return sideData;
};