// [1번 파일] 측면 전용 분석 로직
export const analyzeSidePosture = (landmarks) => {
  const ear = landmarks[7];      // 왼쪽 귀
  const shoulder = landmarks[11]; // 왼쪽 어깨

  if (!ear || !shoulder) return { angle: 0, forwardRatio: 0, status: '감지 불가' };

  // 어깨와 귀의 x, y 좌표 차이 계산
  const dx = Math.abs(shoulder.x - ear.x);
  const dy = Math.abs(shoulder.y - ear.y);

  // 아크탄젠트(atan2)로 거북목 각도(CVA) 계산
  const radian = Math.atan2(dx, dy);
  const angleDeg = radian * (180 / Math.PI);

  return {
    angle: angleDeg.toFixed(1),
    forwardRatio: (dx / dy).toFixed(3),
    status: angleDeg > 20 ? '거북목 위험' : '정상'
  };
};