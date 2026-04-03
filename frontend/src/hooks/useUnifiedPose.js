import { useEffect, useRef, useState } from 'react';
import { initializePose, sendToPose } from '../ai/mediapipe';
import { analyzePosture } from '../ai/posetureAnalyzer'; // 의성님 정면 분석기
import { calculateCVA } from '../ai/poseAnalyzer';      // 사용자님 CVA 분석기
import { savePoseLog } from '../api/poseApi';

export const useUnifiedPose = (videoRef) => {
  const [postureData, setPostureData] = useState({ 
    angle: 0, 
    shoulderDiff: 0, 
    forwardRatio: 0, 
    cva: 0, 
    status: '대기' 
  });
  const [rawLandmarks, setRawLandmarks] = useState(null);
  const requestRef = useRef();
  const lastSentTime = useRef(0); 

  const onResults = async (results) => {
    if (results.poseLandmarks) {
      // 1. 의성님 로직 실행 (상세 데이터 추출)
      const ueseongAnalysis = analyzePosture(results.poseLandmarks);
      // 2. 사용자님 로직 실행 (CVA 추출)
      const yehoonCVA = calculateCVA(results.poseLandmarks);

      // 데이터 통합 업데이트
      const combined = {
        ...ueseongAnalysis,
        cva: yehoonCVA
      };
      setPostureData(combined);
      setRawLandmarks(results.poseLandmarks);

      // 3. 서버 전송 제어 (의성님 최신 로직 반영: 30초 간격)
      const now = Date.now();
      if (now - lastSentTime.current > 30000) {
        try {
          await savePoseLog(ueseongAnalysis);
          lastSentTime.current = now; 
          console.log("정기 데이터 저장 완료 (30초 간격)");
        } catch (err) {
          console.warn("데이터 전송 실패: 네트워크 상태를 확인하세요.");
        }
      }
    }
  };

  const detect = async () => {
    if (videoRef.current && videoRef.current.readyState === 4) {
      await sendToPose(videoRef.current);
    }
    requestRef.current = requestAnimationFrame(detect);
  };

  useEffect(() => {
    const poseInstance = initializePose(onResults);
    detect();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      poseInstance.close();
    };
  }, []);

  return { postureData, rawLandmarks };
};