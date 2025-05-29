import React from 'react';
import './HospitalMock.css';
import ChatPopup from './ChatPopup';

const HospitalMock = () => (
  <div className="hospital-wrapper">
    <img src="/hastane-ekran.png" alt="Konya Numune Hastanesi" className="hospital-bg"/>
    <ChatPopup />
  </div>
);

export default HospitalMock;
