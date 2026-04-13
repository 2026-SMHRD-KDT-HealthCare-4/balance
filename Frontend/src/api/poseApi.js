import axios from 'axios';

// Vite Proxy 설정을 활용하므로 /api로 시작하는 상대 경로를 사용합니다.
const API_URL = '/api/posture'; 

/**
 * [1] 분석된 자세 데이터를 서버 DB에 저장 (측정용)
 */
export const savePoseLog = async (postureData) => {
  try {
    // 백엔드 라우터(posture.routes.js)의 router.post('/log')와 주소를 맞춤
    const response = await axios.post(`${API_URL}/log`, {
      angle: postureData.angle,
      status: postureData.status,
      type: postureData.type, // 'front' 또는 'side'
    }, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("자세 데이터 전송 실패:", error);
    throw error;
  }
};

/**
 * [2] 사용자의 정자세 기준값(Baseline)을 서버에 저장 (Setup 페이지용)
 */
export const saveBaseline = async (baselineData) => {
  try {
    // 백엔드 주소 설계에 따라 /baseline 또는 다른 경로일 수 있습니다.
    const response = await axios.post(`${API_URL}/baseline`, {
      ...baselineData,
      updatedAt: new Date().toISOString()
    }, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  } catch (error) {
    console.error("기준값 저장 실패:", error);
    throw error;
  }
};