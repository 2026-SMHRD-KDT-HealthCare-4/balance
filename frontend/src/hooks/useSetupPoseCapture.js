// src/hooks/useCapturePose.js
import { useEffect, useRef, useState } from 'react';
import { initializeSetupPose, sendToSetupPose } from '../ai/setupMediapipe';
import { saveBaseline } from '../api/poseApi';

const LANDMARK = {
  NOSE: 0,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
};

const normalizePoint = (landmark) => {
  if (!landmark) return null;

  return {
    x: landmark.x,
    y: landmark.y,
    z: landmark.z,
    visibility: landmark.visibility ?? 0,
  };
};

const getBetterVisiblePoint = (leftPoint, rightPoint) => {
  if (!leftPoint && !rightPoint) return null;
  if (!leftPoint) return { side: 'right', point: rightPoint };
  if (!rightPoint) return { side: 'left', point: leftPoint };

  return leftPoint.visibility >= rightPoint.visibility
    ? { side: 'left', point: leftPoint }
    : { side: 'right', point: rightPoint };
};

export const useCapturePose = ({ videoRef, mode }) => {
  // mode: 'front' | 'side'
  const requestRef = useRef(null);

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isPoseDetected, setIsPoseDetected] = useState(false);
  const [capturedData, setCapturedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const extractFrontData = (poseLandmarks) => {
    const nose = normalizePoint(poseLandmarks[LANDMARK.NOSE]);
    const leftShoulder = normalizePoint(poseLandmarks[LANDMARK.LEFT_SHOULDER]);
    const rightShoulder = normalizePoint(poseLandmarks[LANDMARK.RIGHT_SHOULDER]);

    if (!nose || !leftShoulder || !rightShoulder) return null;

    return {
      captureType: 'front',
      nose,
      leftShoulder,
      rightShoulder,
    };
  };

  const extractSideData = (poseLandmarks) => {
    const nose = normalizePoint(poseLandmarks[LANDMARK.NOSE]);
    const leftEar = normalizePoint(poseLandmarks[LANDMARK.LEFT_EAR]);
    const rightEar = normalizePoint(poseLandmarks[LANDMARK.RIGHT_EAR]);
    const leftShoulder = normalizePoint(poseLandmarks[LANDMARK.LEFT_SHOULDER]);
    const rightShoulder = normalizePoint(poseLandmarks[LANDMARK.RIGHT_SHOULDER]);

    const selectedEar = getBetterVisiblePoint(leftEar, rightEar);
    const selectedShoulder = getBetterVisiblePoint(leftShoulder, rightShoulder);

    if (!nose || !selectedEar || !selectedShoulder) return null;

    return {
      captureType: 'side',
      facingSide: selectedEar.side,
      nose,
      ear: selectedEar.point,
      shoulder: selectedShoulder.point,
    };
  };

  const onResults = (results) => {
    if (!results.poseLandmarks) {
      setIsPoseDetected(false);
      setCapturedData(null);
      return;
    }

    const data =
      mode === 'front'
        ? extractFrontData(results.poseLandmarks)
        : extractSideData(results.poseLandmarks);

    if (data) {
      setIsPoseDetected(true);
      setCapturedData(data);
      setMessage('');
    } else {
      setIsPoseDetected(false);
      setCapturedData(null);
    }
  };

  const detect = async () => {
    try {
      if (videoRef.current && videoRef.current.readyState === 4) {
        if (!isCameraReady) setIsCameraReady(true);
        await sendToSetupPose(videoRef.current);
      }
    } catch (error) {
      console.error('MediaPipe 처리 중 오류:', error);
    }

    requestRef.current = requestAnimationFrame(detect);
  };

  const saveCapturedPose = async () => {
    if (!capturedData) {
      setMessage('랜드마크가 감지되지 않았습니다. 자세를 다시 맞춰주세요.');
      return false;
    }

    try {
      setIsSaving(true);
      setMessage('');

      await saveBaseline({
        ...capturedData,
      });

      setMessage('저장 완료');
      return true;
    } catch (error) {
      console.error('좌표 저장 실패:', error);
      setMessage('저장 실패');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const poseInstance = initializeSetupPose(onResults);
    detect();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      poseInstance.close();
    };
  }, []);

  return {
    isCameraReady,
    isPoseDetected,
    capturedData,
    isSaving,
    message,
    saveCapturedPose,
  };
};