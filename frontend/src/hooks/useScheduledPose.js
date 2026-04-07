import { useState, useEffect, useRef } from 'react';
import { usePoseDetection } from './usePoseDetection';
import { savePoseLog } from '../api/poseApi';

export const useScheduledPose = (videoRef) => {
  const SETTINGS = {
    CHECK_DURATION: 60 * 1000,      // 1분간 측정
    CHECK_INTERVAL: 60 * 60 * 1000, // 1시간 대기
    SEND_INTERVAL: 10 * 1000        // 10초마다 서버 전송
  };

  const [isActive, setIsActive] = useState(false);
  const lastSentTime = useRef(0);

  // 1. 순수 감지 훅 연결 (isActive가 true일 때만 AI 작동)
  const postureData = usePoseDetection(videoRef, isActive);

  // 2. 스케줄링 로직 (1분 ON / 1시간 OFF)
  useEffect(() => {
    let timer;

    const scheduleNext = () => {
      setIsActive(true);
      console.log("=== [스케줄러] 자세 검사 시작 (1분) ===");
      lastSentTime.current = 0; // 측정 시작 시 즉시 전송 허용

      timer = setTimeout(() => {
        setIsActive(false);
        console.log("=== [스케줄러] 대기 모드 진입 (1시간) ===");
        timer = setTimeout(scheduleNext, SETTINGS.CHECK_INTERVAL);
      }, SETTINGS.CHECK_DURATION);
    };

    scheduleNext();

    return () => clearTimeout(timer); // 언마운트 시 타이머 정리
  }, []);

  // 3. 서버 전송 로직 (isActive일 때만 주기적으로 실행)
  useEffect(() => {
    if (isActive) {
      const now = Date.now();
      if (now - lastSentTime.current > SETTINGS.SEND_INTERVAL) {
        savePoseLog(postureData)
          .then(() => {
            lastSentTime.current = now;
            console.log(`[기록] 서버 전송 완료: ${new Date().toLocaleTimeString()}`);
          })
          .catch(() => console.warn("데이터 전송 실패"));
      }
    }
  }, [postureData, isActive]);

  return { ...postureData, isActive };
};