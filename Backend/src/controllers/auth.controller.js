// controllers/auth.controller.js
const authService = require('../services/auth.service');
const { User } = require('../models'); // Sequelize 모델 가져오기

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (e) { next(e); }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (e) { next(e); }
};

// --- 정자세 기준값 저장 함수 추가 ---
const saveBaseline = async (req, res, next) => {
  try {
    // 프론트에서 보낸 baselineData 구조분해
    const { baseShoulderWidth, baseNeckDist, baseShoulderDiff, user_id } = req.body;

    // DB 업데이트
    await User.update({
      base_shoulder_width: baseShoulderWidth,
      base_neck_dist: baseNeckDist,
      base_shoulder_diff: baseShoulderDiff
    }, {
      where: { user_id: user_id } // 실제 환경에서는 인증 미들웨어의 req.user.user_id 사용 권장
    });

    res.status(200).json({ message: "기준값이 성공적으로 저장되었습니다." });
  } catch (e) { next(e); }
};

module.exports = { register, login, saveBaseline };