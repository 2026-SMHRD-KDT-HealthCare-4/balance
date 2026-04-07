import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaCamera, FaLock, FaRegBell } from "react-icons/fa";
import { TbStretching, TbReportAnalytics } from "react-icons/tb";
import { MdOutlineSecurity } from "react-icons/md";
import { useState, useEffect } from 'react';

function Landing() {
  const navigate = useNavigate();
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 350px 이상 스크롤 시 하단 고정바 노출
      setShowSticky(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ background: '#FAF8F5', minHeight: '100vh', color: '#2D2520', fontFamily: 'Pretendard, sans-serif' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        minHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '0 1.25rem',
        gap: '1.5rem'
      }}>
        <span style={{
          background: '#7C9E8722', border: '1px solid #7C9E87',
          borderRadius: '999px', padding: '0.4rem 1rem',
          fontSize: '0.85rem', color: '#5C7A65', fontWeight: 600
        }}>
          비인지형 자세 교정 솔루션
        </span>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 8vw, 2.4rem)', // 앱 화면에서도 부담 없는 크기
          fontWeight: 800,
          lineHeight: 1.3,
          margin: 0,
          letterSpacing: '-0.04em', // 자간을 더 조여서 단단해 보이게
          textAlign: 'center',
          maxWidth: '520px', // 앱 뷰 최적화 폭
          wordBreak: 'keep-all', // 단어 단위 줄바꿈 (매우 중요)
          marginInline: 'auto', // 중앙 정렬 보장
        }}>
          내 목 나이, 지금 몇 살일까?<br />
          <span style={{ 
            color: '#7C9E87',
            display: 'inline-block', // 한 줄 덩어리 유지
            marginTop: '0.3rem' 
          }}>
            AI 30초 정밀 측정
          </span>
        </h1>

        <p style={{
          fontSize: '1rem', // 본문도 살짝 줄여서 제목을 돋보이게
          color: '#8C7B6E',
          maxWidth: '420px', // 본문은 제목보다 더 좁아야 예쁩니다 (황금비율)
          lineHeight: 1.6,
          margin: '1.2rem auto 0',
          wordBreak: 'keep-all',
          opacity: 0.85
        }}>
          거북목 예방의 시작은 정확한 상태 확인부터.<br />
          AI가 분석한 나의 실시간 자세 점수를 확인하세요.
        </p>

        <p style={{
          fontSize: '1.15rem',
          color: '#8C7B6E',
          maxWidth: '520px', // 본문 폭을 좁히면 자동으로 줄이 예쁘게 잡힙니다.
          lineHeight: 1.8,
          margin: '1.5rem auto 0', // 중앙 정렬 유지하며 상단 여백
          wordBreak: 'keep-all',
          opacity: 0.9
        }}>
          업무에 집중하는 동안 AI가 당신의 척추를 지킵니다.<br />
          영상은 즉시 파기되고, 오직 당신의 '바른 자세'만 기록에 남습니다.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/diagnosis')}
            style={{
              background: '#7C9E87', color: '#FAF8F5',
              border: 'none', borderRadius: '12px',
              padding: '1.2rem 2.5rem', fontSize: '1.1rem',
              fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 10px 20px -5px rgba(124, 158, 135, 0.4)'
            }}
          >
            지금 거북목 진단하러가기 →
          </button>
        </div>
      </section>

      {/* Re:balance Process */}
      <section style={{ padding: '6rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>
          당신의 하루를 지키는 AI 페이스메이커
        </h2>
        <p style={{ textAlign: 'center', color: '#8C7B6E', marginBottom: '4rem' }}>
          앱을 켜두기만 하세요. 나머지는 Re:balance가 알아서 합니다.
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {processSteps.map((s, idx) => (
            <div key={idx} style={{
              background: '#FFFFFF', borderRadius: '24px',
              padding: '2rem', border: '1px solid #EEE',
              boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
            }}>
              <div style={{ 
                width: '50px', height: '50px', background: '#F0EBE3', 
                borderRadius: '12px', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.5rem',
                color: '#7C9E87'
              }}>
                {s.icon}
              </div>
              <h3 style={{ fontWeight: 800, marginBottom: '0.75rem', fontSize: '1.2rem' }}>
                {s.title}
              </h3>
              <p style={{ color: '#8C7B6E', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Security Focus Section */}
      <section style={{ 
        background: '#2D2520', color: '#FAF8F5', 
        padding: '5rem 2rem', borderRadius: '40px', 
        margin: '2rem', textAlign: 'center' 
      }}>
        <MdOutlineSecurity style={{ fontSize: '3rem', color: '#7C9E87', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          "영상이 저장될까 봐 걱정되시나요?"
        </h2>
        <p style={{ maxWidth: '700px', margin: '0 auto 2.5rem', opacity: 0.8, lineHeight: 1.8 }}>
          Re:balance는 사용자 프라이버시를 최우선으로 합니다. <br />
          브라우저 내에서 즉시 <strong>좌표값만 추출(Skeleton Tracking)</strong>한 뒤,<br />
          원본 영상은 서버로 전송되지 않고 즉시 휘발됩니다. 안심하고 업무에만 집중하세요.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}><FaLock /> 군사급 데이터 암호화</div>
            <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}><FaCamera /> 영상 즉시 파기 원칙</div>
        </div>
      </section>

      {/* --- Sticky CTA Bar --- */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: `translateX(-50%) translateY(${showSticky ? '0' : '120px'})`,
        opacity: showSticky ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        width: '90%',
        maxWidth: '450px',
        zIndex: 1000
      }}>
        <button
          onClick={() => navigate('/diagnosis')}
          style={{
            width: '100%',
            padding: '1.1rem',
            background: '#7C9E87',
            color: '#FAF8F5',
            border: 'none',
            borderRadius: '16px',
            fontSize: '1.05rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 15px 30px rgba(124, 158, 135, 0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <FaCamera /> 지금 거북목 진단하러가기
        </button>
      </div>
    </div>
  );
}

const processSteps = [
  { icon: <FaCamera />, title: '비침습적 모니터링', desc: '1시간마다 조용히 당신의 자세를 체크합니다. 업무 흐름을 방해하지 않는 정교한 AI 엔진을 경험하세요.' },
  { icon: <FaRegBell />, title: '스마트 피드백', desc: '거북목 각도가 임계치를 넘으면 즉시 알림을 보냅니다. 나쁜 자세가 습관이 되기 전에 고쳐앉으세요.' },
  { icon: <TbStretching />, title: '인터랙티브 스트레칭', desc: '카메라 가이드에 맞춰 정확한 동작을 수행하면 Pass! 게임처럼 즐겁게 목 근육을 풀어줍니다.' },
  { icon: <TbReportAnalytics />, title: '성장 대시보드', desc: '나의 자세 점수와 스트레칭 기록을 시각화합니다. 점차 젊어지는 당신의 목 나이를 확인하세요.' },
];

export default Landing;