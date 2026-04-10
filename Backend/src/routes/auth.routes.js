// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/login', authController.login); 
router.post('/register', authController.register);
// 기준값 저장 API 경로 추가
router.post('/save-baseline', authController.saveBaseline);

module.exports = router;