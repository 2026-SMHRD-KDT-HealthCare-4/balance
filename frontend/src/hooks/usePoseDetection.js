import { useEffect, useRef, useState, useCallback } from 'react';
import { initializePose } from '../ai/mediapipe';
import { analyzePosture } from '../ai/posetureAnalyzer'; 
import { savePoseLog } from '../api/poseApi';

const usePoseDetection = (videoRef) => {
  const [postureData, setPostureData] = useState({ 
    angle: 0, 
    shoulderDiff: 0, 
    forwardRatio: 0, 
    status: '대기', 
    landmarks: null,
    avgNoseY: 0, 
    avgWidth: 0 
  });
  
  const isInitialized = useRef(false);
  const lastSentTime = useRef(0);
  const history = useRef({ noseY: [], width: [] });

  const getAverage = (arr) => arr.length === 0 ? 0 : arr.reduce((a, b) => a + b) / arr.length;

  const onResults = useCallback((results) => {
    if (results.poseLandmarks) {
      const now = Date.now();
      const lms = results.poseLandmarks;

      const currentNoseY = lms[0].y; 
      const currentWidth = Math.abs(lms[11].x - lms[12].x);

      history.current.noseY = [...history.current.noseY, currentNoseY].slice(-5);
      history.current.width = [...history.current.width, currentWidth].slice(-5);

      const avgNoseY = getAverage(history.current.noseY);
      const avgWidth = getAverage(history.current.width);

      const analysis = analyzePosture(lms); 
      
      setPostureData({
        ...analysis,
        avgNoseY,
        avgWidth,
        landmarks: lms 
      });

      if (now - lastSentTime.current > 30000) {
        savePoseLog(analysis).catch(() => {});
        lastSentTime.current = now;
      }
    }
  }, []);

  useEffect(() => {
    if (isInitialized.current) return;
    
    let poseInstance = null;
    let currentStream = null;

    const startCamera = async () => {
      if (!videoRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
        });
        
        if (!videoRef.current) return;

        currentStream = stream;
        videoRef.current.srcObject = stream;
        isInitialized.current = true; 

        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current.play();
            poseInstance = initializePose(videoRef.current, onResults);
          } catch (playError) {
            console.error("비디오 재생 실패:", playError);
          }
        };
      } catch (err) {
        console.error("카메라 시작 실패:", err);
        isInitialized.current = false;
      }
    };

    startCamera();

    return () => { 
      if (poseInstance && typeof poseInstance.close === 'function') poseInstance.close();
      if (currentStream) currentStream.getTracks().forEach(track => track.stop());
      isInitialized.current = false;
    };
  }, [onResults, videoRef]);

  return postureData;
};

export default usePoseDetection;