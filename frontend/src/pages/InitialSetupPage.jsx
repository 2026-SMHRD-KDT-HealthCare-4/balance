// pages/InitialSetupPage.jsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { initPose } from '../ai/mediapipe'
import { calcAngleWithPose } from '../ai/poseAnalyzer'

export default function InitialSetupPage() {
  const videoRef   = useRef(null)
  const cameraRef  = useRef(null)
  const navigate   = useNavigate()

  const [step, setStep] = useState('front')  // front → side → done
  const [timer, setTimer] = useState(5)
  const [capturing, setCapturing] = useState(false)
  const [baselineAngle, setBaselineAngle] = useState(null)
  const anglesRef = useRef([])  // 5초간 각도 누적

  useEffect(() => {
    if (!videoRef.current) return

    cameraRef.current = initPose(videoRef.current, (results) => {
      if (!results.poseLandmarks || !capturing) return

      // 각도 수집
      const angle = calcAngleWithPose(results.poseLandmarks)
      anglesRef.current.push(angle)
    })

    return () => cameraRef.current?.stop()
  }, [capturing])

  // 5초 타이머
  useEffect(() => {
    if (!capturing) return

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          finishCapture()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [capturing])

  const startCapture = () => {
    anglesRef.current = []
    setTimer(5)
    setCapturing(true)
  }

  const finishCapture = () => {
    setCapturing(false)

    // 5초간 수집한 각도의 평균값을 기준값으로 설정
    const angles = anglesRef.current
    const avg = angles.reduce((a, b) => a + b, 0) / angles.length
    setBaselineAngle(avg.toFixed(1))

    if (step === 'front') {
      setStep('side')
      setTimer(5)
    } else {
      setStep('done')
    }
  }

  const handleComplete = () => {
    // 기준값 저장 후 메인으로 이동
    localStorage.setItem('baselineAngle', baselineAngle)
    navigate('/home')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#FAF8F5',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '2rem'
    }}>
      <h2 style={{ color: '#2D2520', marginBottom: '0.5rem' }}>
        {step === 'front' && '정면 정자세 촬영'}
        {step === 'side'  && '측면 자세 촬영'}
        {step === 'done'  && '측정 완료!'}
      </h2>

      <p style={{ color: '#8C7B6E', marginBottom: '1.5rem', textAlign: 'center' }}>
        {step === 'front' && '카메라를 정면으로 바라보고 바른 자세를 유지해주세요'}
        {step === 'side'  && '카메라 측면으로 돌아서 바른 자세를 유지해주세요'}
        {step === 'done'  && `기준 각도: ${baselineAngle}° 로 설정됐어요`}
      </p>

      {/* 웹캠 화면 */}
      {step !== 'done' && (
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <video
            ref={videoRef}
            style={{ width: 320, height: 240, borderRadius: 12, background: '#000' }}
            autoPlay playsInline muted
          />
          {/* 타이머 오버레이 */}
          {capturing && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '4rem', fontWeight: 800,
              color: '#7C9E87'
            }}>
              {timer}
            </div>
          )}
        </div>
      )}

      {/* 버튼 */}
      {step !== 'done' && !capturing && (
        <button onClick={startCapture} style={btnStyle}>
          {step === 'front' ? '정면 촬영 시작' : '측면 촬영 시작'}
        </button>
      )}

      {capturing && (
        <p style={{ color: '#7C9E87', fontWeight: 700 }}>
          측정 중... {timer}초
        </p>
      )}

      {step === 'done' && (
        <button onClick={handleComplete} style={btnStyle}>
          측정 완료 → 시작하기
        </button>
      )}
    </div>
  )
}

const btnStyle = {
  background: '#7C9E87', color: '#FAF8F5',
  border: 'none', borderRadius: '12px',
  padding: '1rem 2rem', fontSize: '1rem',
  fontWeight: 700, cursor: 'pointer'
}