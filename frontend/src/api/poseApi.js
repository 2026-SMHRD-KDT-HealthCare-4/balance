import axios from 'axios';

// 백엔드 주소는 유지하되, 현재는 사용하지 않습니다.
const API_URL = 'http://localhost:8000/api/pose';

/**
 * 분석된 자세 데이터를 서버에 보내지 않고, 
 * 콘솔 출력 및 UI 업데이트를 위한 가짜 응답을 반환하는 함수
 */
export const savePoseLog = async (postureData) => {
  // 1. 데이터 존재 여부 체크
  if (!postureData) return null;

  // 2. 숫자가 아닐 경우를 대비한 안전한 값 추출 (toFixed 에러 방지)
  const safeAngle = typeof postureData.angle === 'number' ? postureData.angle : 0;
  const safeShoulder = typeof postureData.shoulderDiff === 'number' ? postureData.shoulderDiff : 0;
  const safeForward = typeof postureData.forwardRatio === 'number' ? postureData.forwardRatio : 0;

  try {
    /* [주의] 백엔드 연결을 하지 않기 위해 아래의 실제 전송 로직은 주석 처리합니다.
      이 부분을 주석 처리하면 'Network Error'가 더 이상 발생하지 않습니다.
    */
    /*
    const response = await axios.post(`${API_URL}/log`, {
      angle: Number(safeAngle.toFixed(2)),           
      shoulderDiff: Number(safeShoulder.toFixed(2)),
      forwardRatio: Number(safeForward.toFixed(3)),
      status: postureData.status || '알 수 없음',
      createdAt: new Date().toISOString()
    }, {
      timeout: 5000 
    });
    return response.data;
    */

    // 3. 서버 전송 대신 브라우저 콘솔에 실시간 데이터 출력 (디버깅용)
    console.log("📊 [실시간 데이터 확인]:", {
      각도: safeAngle.toFixed(2),
      어깨비대칭: safeShoulder.toFixed(2),
      거북목지수: safeForward.toFixed(3),
      상태: postureData.status || '분석 중...'
    });

    // 4. 앱이 멈추지 않도록 성공 응답 형태를 흉내 내어 반환합니다.
    return { success: true, mode: "local_display_only" };

  } catch (error) {
    // 통신을 하지 않으므로 에러 발생 확률이 낮지만, 만약의 경우를 대비합니다.
    console.error("❌ 데이터 처리 중 오류 발생:", error.message);
    return null;
  }
};