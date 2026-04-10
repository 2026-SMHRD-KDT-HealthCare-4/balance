const router = require('express').Router()
const auth = require('../middlewares/auth.middleware')
const { savePostureData, getPostureBySession } = require('../controllers/posture.controller')

// [수정] 프론트엔드 `${API_URL}/log`와 맞추기 위해 '/log' 추가
// 만약 메인 server.js에서 app.use('/api/pose', ...) 라고 되어 있다면 
// 실제 경로는 /api/pose/log 가 됩니다.
router.post('/log', auth, savePostureData)

// 세션별 자세 기록 조회
router.get('/session/:session_id', auth, getPostureBySession)

module.exports = router