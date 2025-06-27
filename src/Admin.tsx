import React, { useState, useEffect } from 'react';

const API_URL = 'https://你的后端API地址/api/music-stat/detail';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'lc5201314';

export default function Admin() {
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // 查询相关
  const [adminKey, setAdminKey] = useState('');
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // 自动填充密钥
    setAdminKey(ADMIN_PASS);
  }, []);

  // 登录逻辑
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      setIsLogin(true);
      setLoginError('');
    } else {
      setLoginError('账号或密码错误');
    }
  };

  // 查询逻辑
  const handleQuery = async () => {
    setMsg('查询中...');
    setRecords([]);
    try {
      const res = await fetch(`${API_URL}?patientId=${patientId}&date=${date}&adminKey=${adminKey}`);
      const data = await res.json();
      if (data.records) {
        setRecords(data.records);
        setMsg(`共${data.records.length}条`);
      } else {
        setMsg(data.msg || '无数据');
      }
    } catch {
      setMsg('查询失败');
    }
  };

  if (!isLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <form onSubmit={handleLogin} className="bg-white/90 rounded-2xl shadow-xl p-8 w-full max-w-xs flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-center text-purple-700 mb-2">管理后台登录</h2>
          <input
            className="px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-400 outline-none"
            placeholder="账号"
            value={user}
            onChange={e => setUser(e.target.value)}
            autoFocus
          />
          <input
            className="px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-400 outline-none"
            placeholder="密码"
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
          />
          {loginError && <div className="text-red-500 text-sm text-center">{loginError}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg shadow hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            登录
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white/90 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">患者请求明细查询</h2>
        <div className="flex flex-wrap gap-4 items-center justify-center mb-6">
          <input
            className="px-4 py-2 rounded-xl border border-gray-300 focus:border-purple-400 outline-none"
            placeholder="管理密钥"
            type="password"
            value={adminKey}
            onChange={e => setAdminKey(e.target.value)}
            style={{ minWidth: 120 }}
          />
          <input
            className="px-4 py-2 rounded-xl border border-gray-300 focus:border-purple-400 outline-none"
            placeholder="患者编号"
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
            style={{ minWidth: 120 }}
          />
          <input
            className="px-4 py-2 rounded-xl border border-gray-300 focus:border-purple-400 outline-none"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ minWidth: 140 }}
          />
          <button
            onClick={handleQuery}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            查询
          </button>
        </div>
        {msg && <div className="text-gray-500 text-center mb-4">{msg}</div>}
        {records.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl overflow-hidden shadow">
              <thead>
                <tr className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
                  <th className="py-2 px-4">时间</th>
                  <th className="py-2 px-4">患者编号</th>
                  <th className="py-2 px-4">请求内容</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec, i) => (
                  <tr key={i} className="border-b last:border-b-0 hover:bg-purple-50">
                    <td className="py-2 px-4 whitespace-nowrap">{new Date(rec.timestamp).toLocaleString()}</td>
                    <td className="py-2 px-4 whitespace-nowrap">{rec.patientId}</td>
                    <td className="py-2 px-4">
                      <pre className="bg-gray-50 rounded p-2 text-xs max-w-xl overflow-x-auto whitespace-pre-wrap break-all">{JSON.stringify(rec.formData, null, 2)}</pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 