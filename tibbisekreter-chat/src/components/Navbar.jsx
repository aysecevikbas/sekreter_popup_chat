import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event, newValue) => {
    navigate(newValue);
  };

  return (
    <Box sx={{ bgcolor: '#f0f0f0' }}>
      <Tabs
        value={location.pathname}
        onChange={handleChange}
        centered
        indicatorColor="secondary"
        textColor="secondary"
        TabIndicatorProps={{
          style: {
            backgroundColor: '#6a1b9a', // Mor çizgi
            height: 3,
            borderRadius: 1,
          }
        }}
      >
        <Tab
          icon={<ChatBubbleOutlineIcon />}
          label="Chat"
          value="/"
          sx={{ color: location.pathname === '/' ? '#6a1b9a' : '#555' }}
        />
        <Tab
          icon={<BarChartIcon />}
          label="İstatistikler"
          value="/istatistikler"
          sx={{ color: location.pathname === '/istatistikler' ? '#6a1b9a' : '#555' }}
        />
      </Tabs>
    </Box>
  );
};

export default Navbar;
