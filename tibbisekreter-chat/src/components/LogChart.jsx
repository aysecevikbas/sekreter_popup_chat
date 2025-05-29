import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const LogChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/logs');
        const questionCounts = res.data.logs.reduce((acc, log) => {
          const question = log.question.toLowerCase();
          acc[question] = (acc[question] || 0) + 1;
          return acc;
        }, {});

        const labels = Object.keys(questionCounts);
        const data = Object.values(questionCounts);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Soru Sayısı',
              data,
              backgroundColor: '#4F46E5',
              borderRadius: 5,
              barThickness: 24
            },
          ],
        });
      } catch (err) {
        console.error("Veri alınamadı:", err);
      }
    };

    fetchLogs();
  }, []);

  const options = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: '🧠 En Çok Sorulan Sorular',
        font: {
          size: 18
        }
      }
    },
    scales: {
      x: {
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', p: 3 }}>
      {chartData ? (
        <>
          <Bar data={chartData} options={options} />

          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              mt: 8,
              opacity: 0.6,
              fontStyle: 'italic',
              fontFamily: '"Dancing Script", Georgia, serif',
              fontSize: '16px',
              color: '#6c757d',
              letterSpacing: '0.7px',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
              maxWidth: '600px',
              mx: 'auto',
              transition: 'opacity 2s ease-in'
            }}
          >
            Demek istediğim asalak bir sarmaşık olma sakın.<br />
            Varsın boyun olmasın bir söğütünki kadar.<br />
            Yaprakların bulutlara erişmezse bir zararın mı var?
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1,
                fontSize: '14px',
                fontStyle: 'normal',
                fontFamily: 'Georgia, serif',
                opacity: 0.5
              }}
            >
              — Cyrano de Bergerac
            </Typography>
          </Typography>
        </>
      ) : (
        <Typography align="center" color="text.secondary">
          📉 Henüz yeterli veri yok.
        </Typography>
      )}
    </Box>
  );
};

export default LogChart;
