import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HospitalMock from './components/HospitalMock';
import LogChart from './components/LogChart';
import Navbar from './components/Navbar'; // MUI tab bar

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navbar /> {/* Üstteki modern sekme menüsü */}
        
        {/* Sayfa içerikleri burada */}
        <Routes>
          <Route path="/" element={<HospitalMock />} />
          <Route path="/istatistikler" element={<LogChart />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
