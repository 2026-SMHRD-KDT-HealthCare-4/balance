import { useEffect } from "react";

function Dashboard() {
  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      window.location.href = "/";
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div>
      <h1>대시보드</h1>

      <button onClick={logout}>
        로그아웃
      </button>
    </div>
  );
}

export default Dashboard;