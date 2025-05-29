import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';
import InsertChartIcon from '@mui/icons-material/InsertChart';

const LogChartMui = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/logs');
        const questionCounts = res.data.logs.reduce((acc, log) => {
          const question = log.question.toLowerCase();
          acc[question] = (acc[question] || 0) + 1;
          return acc;
        }, {});
        const chartData = Object.entries(questionCounts).map(([question, count]) => ({
          name: question.length > 25 ? `${question.slice(0, 25)}...` : question,
          count
        }));
        setLogs(chartData);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      }
    };
    fetchLogs();
  }, []);

  return (
    <Card sx={{ maxWidth: 900, margin: '2rem auto', padding: 2, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <InsertChartIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            En Çok Sorulan Sorular
          </Typography>
        </Box>

        {logs.length === 0 ? (
          <Typography color="text.secondary" align="center">
            📉 Henüz yeterli veri yok.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={logs}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#f1f5f9', borderRadius: '6px' }}
                formatter={(value) => [`${value} kez`, 'Soru sayısı']}
              />
              <Bar dataKey="count" fill="#3f51b5" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default LogChartMui;
