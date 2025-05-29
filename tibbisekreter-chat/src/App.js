import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HospitalMock from './components/HospitalMock';
import LogChart from './components/LogChart';

// Ana uygulama bileşeni
const App = () => {
  return (
    <Router>
      <div className="App">
        {/* Uygulama navigasyonu */}
        <nav style={{ padding: '10px', background: '#f4f4f4', display: 'flex', gap: '20px' }}>
          <Link to="/">💬 Chat</Link>
          <Link to="/istatistikler">📊 İstatistikler</Link>
        </nav>

        {/* Sayfa içerikleri burada gösterilecek */}
        <Routes>
          <Route path="/" element={<HospitalMock />} />
          <Route path="/istatistikler" element={<LogChart />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
