import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/posture'; 

export const savePoseLog = async (postureData) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post(`${BASE_URL}/log`, {
      // 서비스 코드의 변수명과 최대한 맞춰서 보냅니다.
      angle: postureData.angle,
      shoulderDiff: postureData.shoulderDiff,
      status: postureData.status,
      session_id: postureData.session_id, // 세션 ID가 있다면 포함
      createdAt: new Date().toISOString()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error("데이터 전송 중 오류:", error);
    throw error;
  }
};