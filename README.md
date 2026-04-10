# Webcam Skeleton Test

웹캠 화면에서 원본 영상을 노출하지 않고, 포즈 스켈레톤만 캔버스에 렌더링하는 테스트용 예제입니다.

## 실행 방법

정적 파일 서버로 실행하세요.

```bash
python3 -m http.server 8080
```

브라우저에서 `http://localhost:8080` 접속 후 **카메라 시작** 버튼을 누르면 됩니다.

## 특징

- `<video>`는 입력 소스로만 사용하고 화면에는 보이지 않게 처리
- `<canvas>` 배경 위에 관절 점 + 연결선(스켈레톤)만 렌더링
- MediaPipe Pose Landmarker (`@mediapipe/tasks-vision`) 사용
