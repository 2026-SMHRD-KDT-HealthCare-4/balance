// src/services/posture.service.js
const { PostureData, Session } = require('../models');

const save = async (data) => {
  try {
    let finalSessionId = data.session_id;

    // 만약 session_id가 없다면 (비회원 데이터 연동 시)
    if (!finalSessionId && data.user_id) {
      console.log(`[Service] User ${data.user_id}의 세션을 확인합니다.`);
      
      // 1. 해당 유저의 가장 최근 세션 하나를 가져옵니다.
      let session = await Session.findOne({
        where: { user_id: data.user_id },
        order: [['start_time', 'DESC']]
      });

      // 2. 만약 세션이 아예 없다면 새로 하나 만듭니다. (에러 방지 핵심)
      if (!session) {
        console.log(`[Service] 세션이 없어 새로 생성합니다.`);
        session = await Session.create({
          user_id: data.user_id,
          created_at: new Date()
        });
      }
      finalSessionId = session.session_id;
    }

    // finalSessionId가 여기까지 왔는데도 null이면 에러를 던집니다.
    if (!finalSessionId) {
      throw new Error("데이터를 저장할 세션 ID를 확보하지 못했습니다.");
    }

    // 3. 최종 저장 (DB 컬럼명과 일치하는지 확인: session_id, neck_angle, shoulder_angle 등)
    return await PostureData.create({
      session_id: finalSessionId,
      neck_angle: data.neck_angle || 0,
      shoulder_angle: data.shoulder_angle || 0,
      posture_score: data.posture_score || 100,
      alarm_message: data.alarm_message || '정상',
      posture_measurement_time: new Date()
    });

  } catch (error) {
    console.error("!!!! [Posture Service Error] !!!!");
    console.error(error);
    throw error;
  }
};

const getBySession = async (session_id) => {
  return await PostureData.findAll({ where: { session_id } });
};

module.exports = { save, getBySession };