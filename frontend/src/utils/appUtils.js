// src/utils/appUtils.js

// 🎯 [중요] 여기가 바로 "학습된 데이터"가 들어갈 곳입니다.
// 지금 적힌 숫자는 예시이며, 2단계에서 추출한 숫자로 덮어쓰세요!
export const PERFECT_POSE_DATA = {
  neck_stretch: {
    nose: { x: 0.5, y: 0.3 }, // 예시: 코의 평균 x, y
    left_shoulder: { x: 0.6, y: 0.5 }, // 예시: 왼쪽 어깨 평균
    right_shoulder: { x: 0.4, y: 0.5 }, // 예시: 오른쪽 어깨 평균
    threshold: 0.1 // 허용 오차 (얼마나 닮아야 하는지)
  }
};

// 유사도 계산 (두 좌표 사이의 거리)
export const getSimilarity = (p1, p2) => {
  if (!p1 || !p2) return 999;
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

// --- 기존 점수/알림 함수는 그대로 아래에 유지 ---
export const loadPostureScore = () => {
  const savedScore = localStorage.getItem('RE_BALANCE_POSTURE_SCORE');
  return savedScore ? parseInt(savedScore, 10) : 100;
};
export const savePostureScore = (score) => {
  localStorage.setItem('RE_BALANCE_POSTURE_SCORE', score.toString());
};
export const sendPostureAlert = async () => {
  if (Notification.permission !== "granted") await Notification.requestPermission();
  const reg = await navigator.serviceWorker.ready;
  if (reg) reg.showNotification("🚨 자세 경고!", { body: "자세를 교정하세요!", tag: "posture" });
};