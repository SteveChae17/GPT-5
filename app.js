import { PoseLandmarker, FilesetResolver, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";

const video = document.getElementById("camera");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const statusText = document.getElementById("status");

let poseLandmarker;
let webcamStream;
let animationId;

const connections = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [27, 31],
  [24, 26], [26, 28], [28, 32],
];

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.style.color = isError ? "#ff8f8f" : "#97ffc1";
}

function resizeCanvas() {
  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;
  canvas.width = width;
  canvas.height = height;
}

function drawSkeleton(result) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#02050b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!result.landmarks?.length) {
    return;
  }

  const drawingUtils = new DrawingUtils(ctx);

  for (const landmarks of result.landmarks) {
    drawingUtils.drawLandmarks(landmarks, {
      radius: 4,
      color: "#5bd1ff",
      fillColor: "#9ef6ff",
    });

    for (const [start, end] of connections) {
      drawingUtils.drawConnectors(landmarks, [[start, end]], {
        color: "#69ff9e",
        lineWidth: 3,
      });
    }
  }
}

async function detectLoop() {
  if (!poseLandmarker || video.readyState < 2) {
    animationId = requestAnimationFrame(detectLoop);
    return;
  }

  const result = poseLandmarker.detectForVideo(video, performance.now());
  drawSkeleton(result);
  animationId = requestAnimationFrame(detectLoop);
}

async function initPoseLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
  );

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 1,
  });
}

async function startCamera() {
  startBtn.disabled = true;
  setStatus("초기화 중...");

  try {
    await initPoseLandmarker();

    webcamStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    video.srcObject = webcamStream;
    await video.play();

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    setStatus("실행 중 (스켈레톤 렌더링)");
    detectLoop();
  } catch (error) {
    console.error(error);
    setStatus("실패: 카메라 권한 또는 네트워크를 확인하세요.", true);
    startBtn.disabled = false;
  }
}

startBtn.addEventListener("click", startCamera);

window.addEventListener("beforeunload", () => {
  cancelAnimationFrame(animationId);
  webcamStream?.getTracks().forEach((track) => track.stop());
});
