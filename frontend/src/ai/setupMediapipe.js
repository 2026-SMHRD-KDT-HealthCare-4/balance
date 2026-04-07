// src/ai/setupMediapipe.js

const setupPose = new window.Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
});

setupPose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

export const initializeSetupPose = (onResults) => {
  setupPose.onResults(onResults);
  return setupPose;
};

export const sendToSetupPose = async (image) => {
  await setupPose.send({ image });
};