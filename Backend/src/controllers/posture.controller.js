// src/controllers/posture.controller.js
const postureService = require('../services/posture.service');
const { User } = require('../models'); // ✅ 추가

/**
 * [1] 자세 데이터 저장 컨트롤러
 */
const savePostureData = async (req, res, next) => {
  try {
    const { angle, status, type } = req.body;
    
    // auth 미들웨어를 거치면 req.user에 유저 정보가 담깁니다.
    const user_id = req.user ? req.user.user_id : null;
    
    console.log("현재 요청 유저 ID:", user_id);

    const dataToSave = {
      user_id: user_id,
      neck_angle: type === 'side' ? angle : 0,
      shoulder_angle: type === 'front' ? angle : 0,
      alarm_message: status,
      posture_score: 100
    };

    const result = await postureService.save(dataToSave);
    res.status(201).json(result);
  } catch (e) {
    console.error("컨트롤러 저장 에러:", e);
    next(e);
  }
};

/**
 * [2] 세션별 자세 데이터 조회 컨트롤러
 */
const getPostureBySession = async (req, res, next) => {
  try {
    const { session_id } = req.params;
    const result = await postureService.getBySession(session_id);
    res.status(200).json(result);
  } catch (e) {
    console.error("컨트롤러 조회 에러:", e);
    next(e);
  }
};

/**
 * [3] 정자세 기준값(Baseline) 저장 컨트롤러 ✅ 추가
 */
const saveBaseline = async (req, res, next) => {
  try {
    const { baseShoulderWidth, baseNeckDist, baseShoulderDiff } = req.body;
    const user_id = req.user.user_id;

    await User.update({
      base_shoulder_width: baseShoulderWidth,
      base_neck_dist: baseNeckDist,
      base_shoulder_diff: baseShoulderDiff
    }, {
      where: { user_id }
    });

    res.status(200).json({ message: '기준값 저장 완료' });
  } catch (e) {
    console.error('baseline 저장 에러:', e);
    next(e);
  }
};

module.exports = { 
  savePostureData, 
  getPostureBySession,
  saveBaseline // ✅ 추가
};