// import 방식 제거하고 CDN 방식으로 변경

export const initPose = (videoEl, onResults) => {
  const pose = new window.Pose({
    locateFile: (f) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`
  })

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  })

  pose.onResults(onResults)

  const camera = new window.Camera(videoEl, {
    onFrame: async () => await pose.send({ image: videoEl }),
    width: 640,
    height: 480
  })

  camera.start()
  return camera
}