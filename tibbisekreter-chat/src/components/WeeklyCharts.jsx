/**
 * WeeklyCharts.jsx - Haftalık İstatistik Grafikleri
 * Son 7 güne ait verileri görselleştirir
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from 'recharts';
import axios from 'axios';

const WeeklyCharts = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Renk paleti - sağlık teması
  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#795548'];

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await axios.get(`${apiUrl}/api/stats/weekly`);
      
      if (response.data.success) {
        setWeeklyData(response.data);
      } else {
        setError('Veri alınamadı');
      }
    } catch (err) {
      console.error('Haftalık veri hatası:', err);
      setError('Sunucuya bağlanılamadı');
    } finally {
      setLoading(false);
    }
  };

  // Özel tooltip bileşeni
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <div className="tooltip-label">{label}</div>
          <div className="tooltip-value">
            {`Soru Sayısı: ${payload[0].value}`}
          </div>
        </div>
      );
    }
    return null;
  };

  // Pie chart için özel label
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // %5'ten küçük dilimler için label gösterme
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Haftalık veriler yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Veri Yüklenemedi</h3>
        <p>{error}</p>
        <button onClick={fetchWeeklyData} className="tab-button">
          🔄 Tekrar Dene
        </button>
      </div>
    );
  }

  if (!weeklyData || weeklyData.total_questions === 0) {
    return (
      <div className="error-container">
        <div className="error-icon">📊</div>
        <h3>Bu Hafta Henüz Veri Yok</h3>
        <p>Son 7 günde hiç soru sorulmamış.</p>
      </div>
    );
  }

  return (
    <div className="weekly-charts">
      {/* Özet İstatistikler */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-number">{weeklyData.total_questions}</div>
          <div className="stat-label">Toplam Soru</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{weeklyData.categories.length}</div>
          <div className="stat-label">Farklı Kategori</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {Math.round(weeklyData.total_questions / 7)}
          </div>
          <div className="stat-label">Günlük Ortalama</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">7</div>
          <div className="stat-label">Gün</div>
        </div>
      </div>

      {/* Ana Grafikler */}
      <div className="charts-grid">
        {/* Kategori Dağılımı - Pie Chart */}
        <div className="chart-card">
          <h3 className="chart-title-small">📊 Soru Kategorileri Dağılımı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={weeklyData.categories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {weeklyData.categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [value, 'Soru Sayısı']}
                labelFormatter={(label) => `Kategori: ${label}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Günlük Trend - Line Chart */}
        <div className="chart-card">
          <h3 className="chart-title-small">📈 Günlük Soru Trendi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData.daily_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#4CAF50" 
                strokeWidth={3}
                dot={{ fill: '#4CAF50', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#4CAF50', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Kategori Detay Tablosu - Bar Chart */}
      <div className="chart-card">
        <h3 className="chart-title-small">📋 Kategori Detayları</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={weeklyData.categories.sort((a, b) => b.value - a.value)}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#4CAF50" radius={[4, 4, 0, 0]}>
              {weeklyData.categories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tarih Aralığı Bilgisi */}
      <div className="tab-description" style={{ marginTop: '20px' }}>
        <p>
          📅 <strong>Analiz Dönemi:</strong> {weeklyData.date_range.start} - {weeklyData.date_range.end}
          <br />
          🏥 <strong>Kullanım Amacı:</strong> Haftalık hasta sorunlarının takibi ve hemşire müdahale planlaması
        </p>
      </div>
    </div>
  );
};

export default WeeklyCharts; 