import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useNotification = (morningTime = "10:00", afternoonTime = "15:30") => {
  const navigate = useNavigate();
  // 타이머 중복 생성을 막기 위해 ref를 사용합니다.
  const intervalRef = useRef(null);

  useEffect(() => {
    let lastNotifiedTime = ""; 

    const requestPermission = async () => {
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") {
        await Notification.requestPermission();
      }
    };
    requestPermission();

    const sendNotification = (title, body) => {
      if (Notification.permission === "granted") {
        const noti = new Notification(title, {
          body: body,
          icon: 'https://cdn-icons-png.flaticon.com/512/3048/3048398.png',
          tag: 'stretch-alert', // tag를 고정하면 같은 종류의 알림은 하나만 뜹니다.
          requireInteraction: true,
        });

        // 💡 클릭 이벤트 수정
        noti.onclick = (event) => {
          event.preventDefault();
          window.focus(); // 창을 앞으로 가져오기
          
          // 알림 닫기보다 이동을 먼저 처리하거나 동시에 처리합니다.
          navigate('/monitor'); 
          noti.close();
        };
      }
    };

    // 기존에 돌아가던 타이머가 있다면 정리 (중복 방지 핵심)
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const isMorning = currentTime === morningTime;
      const isAfternoon = currentTime === afternoonTime;

      if ((isMorning || isAfternoon) && lastNotifiedTime !== currentTime) {
        lastNotifiedTime = currentTime; 
        
        const title = isMorning ? "☀️ 오전 스트레칭 시간" : "☕ 오후 스트레칭 시간";
        const body = isMorning 
          ? "거북목 예방을 위해 잠시 몸을 풀어주세요!" 
          : "집중력이 떨어질 땐 스트레칭이 최고예요.";
        
        sendNotification(title, body);
      }
    }, 1000); 

    // 컴포넌트가 사라질 때 타이머를 확실히 제거합니다.
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [navigate, morningTime, afternoonTime]);
};