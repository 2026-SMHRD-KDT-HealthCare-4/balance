import React from 'react';

const InitialSetupPage = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>초기 자세 설정</h1>
      <p>가장 올바른 자세를 잡고 버튼을 눌러 기준점을 저장하세요.</p>
      <button style={{ padding: '10px 20px', cursor: 'pointer' }}>기준점 저장</button>
    </div>
  );
};

// 🚨 이 부분이 반드시 있어야 App.jsx에서 에러가 안 납니다!
export default InitialSetupPage;