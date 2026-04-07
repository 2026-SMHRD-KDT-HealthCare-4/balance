// CVA 각도 계산
export const calcCVA = (ear, shoulder) => {
  const dx = ear.x - shoulder.x
  const dy = ear.y - shoulder.y
  return Math.abs(Math.atan2(dy, dx) * (180 / Math.PI))
}

// Pose 모델 각도 계산
export const calcAngleWithPose = (poseLandmarks) => {
  const ear = {
    x: (poseLandmarks[7].x + poseLandmarks[8].x) / 2,
    y: (poseLandmarks[7].y + poseLandmarks[8].y) / 2
  }
  const shoulder = {
    x: (poseLandmarks[11].x + poseLandmarks[12].x) / 2,
    y: (poseLandmarks[11].y + poseLandmarks[12].y) / 2
  }
  return calcCVA(ear, shoulder)
}

// 위험 단계 판별
export const getAlertLevel = (angle) => {
  if (angle >= 80) return 'normal'
  if (angle >= 65) return 'caution'
  return 'danger'
}