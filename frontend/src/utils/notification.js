// 알림 권한 요청 함수
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("이 브라우저는 알림을 지원하지 않습니다.");
    return;
  }

  if (Notification.permission !== "granted") {
    await Notification.requestPermission();
  }
};

// 알림 발송 및 클릭 시 이동 처리
export const sendPostureAlert = (navigate) => {
  if (Notification.permission === "granted") {
    const notification = new Notification("🚨 스마트 포스처 경고", {
      body: "거북목 위험 상태입니다! 클릭하여 스트레칭을 시작하세요.",
      icon: "/favicon.svg", // 프로젝트의 아이콘 경로
    });

    // 알림 클릭 시 스트레칭 페이지로 이동
    notification.onclick = () => {
      window.focus();
      navigate('/stretch');
    };
  }
};