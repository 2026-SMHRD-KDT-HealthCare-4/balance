import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

export default function StatisticsDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ 토큰 키 'token'으로 수정 (Login.jsx와 일치)
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { replace: true });
      return;
    }

    try {
      const userData = localStorage.getItem('user');
      setUser(userData ? JSON.parse(userData) : { name: '사용자' });
    } catch (e) {
      console.error('유저 정보 파싱 에러:', e);
    }

    // ✅ 백엔드 stats API 호출
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/stats/weekly', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWeeklyStats(res.data);
      } catch (e) {
        console.error('통계 데이터 불러오기 실패:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [navigate]);

  // ✅ 주간 통계 기반 그래프 데이터 생성
  const avgScore = weeklyStats?.avg_posture_score
    ? Math.round(parseFloat(weeklyStats.avg_posture_score))
    : null;

  const totalRecords = weeklyStats?.total_records
    ? parseInt(weeklyStats.total_records)
    : 0;

  const avgNeckAngle = weeklyStats?.avg_neck_angle
    ? parseFloat(weeklyStats.avg_neck_angle).toFixed(2)
    : null;

  // 자세 점수 상태 판단
  const getScoreLabel = (score) => {
    if (score === null) return { text: '데이터 없음', color: '#9CA3AF' };
    if (score >= 80) return { text: '좋음', color: '#7C9E87' };
    if (score >= 60) return { text: '보통', color: '#F59E0B' };
    return { text: '주의', color: '#EF4444' };
  };
  const scoreLabel = getScoreLabel(avgScore);

  // AI 인사이트 동적 생성
  const getInsight = () => {
    if (!weeklyStats || totalRecords === 0) {
      return {
        summary: '아직 측정 데이터가 없어요!',
        tip: '자세 모니터링 페이지에서 측정을 시작해보세요.'
      };
    }
    if (avgScore >= 80) {
      return {
        summary: `이번 주 평균 자세 점수 ${avgScore}점으로 좋아요! 🎉`,
        tip: `총 ${totalRecords}회 측정했어요. 꾸준히 유지해봐요!`
      };
    }
    return {
      summary: `이번 주 평균 자세 점수 ${avgScore}점이에요.`,
      tip: `총 ${totalRecords}회 측정했어요. 자세 교정이 필요해 보여요!`
    };
  };
  const insight = getInsight();

  // 그래프용 더미 주간 데이터 (실제 점수 반영)
  const chartData = avgScore
    ? [
        { name: '3주 전', score: Math.max(avgScore - 10, 50) },
        { name: '2주 전', score: Math.max(avgScore - 5, 55) },
        { name: '지난주', score: Math.max(avgScore - 2, 60) },
        { name: '이번주', score: avgScore },
      ]
    : [
        { name: '1주', score: 0 },
        { name: '2주', score: 0 },
        { name: '3주', score: 0 },
        { name: '4주', score: 0 },
      ];

  return (
    <div style={containerStyle}>
      {/* 상단 헤더 */}
      <header style={headerStyle}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: '800' }}>나의 기록 리포트</h1>
      </header>

      <main style={{ padding: '1.5rem' }}>
        {/* 1. AI 분석 섹션 */}
        <section style={aiInsightCard}>
          <div style={badgeStyle}>AI 분석</div>
          <h2 style={insightTitle}>{insight.summary}</h2>
          <p style={insightText}>{insight.tip}</p>
        </section>

        {/* 2. 주간 통계 요약 */}
        <section style={statsRowStyle}>
          <div style={statBoxStyle}>
            <p style={statLabelStyle}>평균 자세점수</p>
            <p style={{ ...statValueStyle, color: scoreLabel.color }}>
              {loading ? '...' : avgScore !== null ? `${avgScore}점` : '-'}
            </p>
            <p style={{ fontSize: '0.75rem', color: scoreLabel.color }}>{loading ? '' : scoreLabel.text}</p>
          </div>
          <div style={statBoxStyle}>
            <p style={statLabelStyle}>이번주 측정 횟수</p>
            <p style={statValueStyle}>
              {loading ? '...' : `${totalRecords}회`}
            </p>
          </div>
          <div style={statBoxStyle}>
            <p style={statLabelStyle}>평균 목 각도</p>
            <p style={statValueStyle}>
              {loading ? '...' : avgNeckAngle !== null ? `${avgNeckAngle}°` : '-'}
            </p>
          </div>
        </section>

        {/* 3. 자세 점수 추이 그래프 */}
        <section style={chartSection}>
          <h3 style={sectionTitle}>자세 점수 추이</h3>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#7C9E87" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 4. 스트레칭 달력 */}
        <section style={calendarSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={sectionTitle}>스트레칭 달력</h3>
          </div>
          <div style={calendarGrid}>
            <div style={placeholderStyle}>[4월 달력 영역 - 잔디 심기 UI]</div>
          </div>
        </section>
      </main>
    </div>
  );
}

// --- Styles ---
const containerStyle = { background: '#F9FAFB', minHeight: '100vh', maxWidth: '520px', margin: '0 auto' };
const headerStyle = { padding: '1.2rem', textAlign: 'center', background: '#fff', borderBottom: '1px solid #eee' };
const aiInsightCard = { background: '#2D2520', color: '#fff', borderRadius: '24px', padding: '1.5rem', marginBottom: '1.5rem' };
const badgeStyle = { display: 'inline-block', padding: '4px 8px', background: '#7C9E87', borderRadius: '6px', fontSize: '0.7rem', marginBottom: '10px' };
const insightTitle = { fontSize: '1rem', fontWeight: '800', marginBottom: '8px' };
const insightText = { fontSize: '0.85rem', color: '#D1D5DB', lineHeight: '1.4' };
const statsRowStyle = { display: 'flex', gap: '10px', marginBottom: '1.5rem' };
const statBoxStyle = { flex: 1, background: '#fff', borderRadius: '16px', padding: '1rem', textAlign: 'center' };
const statLabelStyle = { fontSize: '0.7rem', color: '#9CA3AF', marginBottom: '6px' };
const statValueStyle = { fontSize: '1.2rem', fontWeight: '800', color: '#2D2520' };
const chartSection = { background: '#fff', borderRadius: '24px', padding: '1.5rem', marginBottom: '1.5rem' };
const sectionTitle = { fontSize: '0.95rem', fontWeight: '700', marginBottom: '15px' };
const calendarSection = { background: '#fff', borderRadius: '24px', padding: '1.5rem' };
const calendarGrid = { marginTop: '10px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const placeholderStyle = { color: '#9CA3AF', fontSize: '0.85rem' };
