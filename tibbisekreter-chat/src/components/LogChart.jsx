import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const LogChart = () => {
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
    <div style={{ width: '100%', height: 400, padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        🧠 En Çok Sorulan Sorular
      </h2>

      {logs.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'gray' }}>
          📉 Henüz yeterli veri yok.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={logs}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="name" />
            <Tooltip formatter={(value) => `${value} kez`} />
            <Bar dataKey="count" fill="#4F46E5" isAnimationActive />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default LogChart;
