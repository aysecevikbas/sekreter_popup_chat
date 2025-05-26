import React from 'react';
import './HospitalMock.css';
import ChatPopup from './ChatPopup'; // Pop-up bileşenini dahil et

const HospitalMock = () => {
  return (
    <div className="hospital-wrapper">
      <img
        src="/hastane-ekran.png"
        alt="Konya Numune Hastanesi"
        className="hospital-bg"
      />
      <ChatPopup /> {/* Buraya ChatPopup entegre edildi */}
    </div>
  );
};

export default HospitalMock;
