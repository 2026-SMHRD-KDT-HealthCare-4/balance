const { PostureData } = require('../models')

// 자세 데이터 저장
const save = async (data) => {
  // 프론트에서 보낸 키값들을 DB 컬럼명에 맞게 매핑
  const posture = await PostureData.create({
    session_id: data.session_id || null, 
    
    // 프론트엔드에서 보낸 값(neck_angle 또는 angle)을 매핑
    neck_angle: data.neck_angle || data.angle || 0, 
    
    // 프론트엔드에서 보낸 값(shoulder_angle 또는 shoulderDiff)을 매핑
    shoulder_angle: data.shoulder_angle || data.shoulderDiff || 0,
    
    // ✅ 중요: 모델에 추가한 status 컬럼에 값을 넣어줍니다.
    status: data.status || '정상', 
    
    posture_score: data.posture_score || (data.status === '정상' ? 100 : 50),
    alarm_message: data.status || data.alarm_message || null,
    posture_measurement_time: data.createdAt || new Date()
  })
  return posture
}

// 세션별 자세 기록 조회
const getBySession = async (session_id) => {
  const postureList = await PostureData.findAll({
    where: { session_id },
    order: [['posture_measurement_time', 'ASC']]
  })
  return postureList
}

module.exports = { save, getBySession }