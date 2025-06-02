/**
 * AllTimeCharts.jsx - Tüm Zamanlar İstatistik Grafikleri
 * Geçmiş tüm verilerin kapsamlı analizini görselleştirir
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import axios from 'axios';

const AllTimeCharts = () => {
  const [allTimeData, setAllTimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Renk paleti - bilimsel tema
  const COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'];

  useEffect(() => {
    fetchAllTimeData();
  }, []);

  const fetchAllTimeData = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await axios.get(`${apiUrl}/api/stats/all`);
      
      if (response.data.success) {
        setAllTimeData(response.data);
      } else {
        setError('Veri alınamadı');
      }
    } catch (err) {
      console.error('Tüm zamanlar veri hatası:', err);
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

  // Aylık tooltip
  const MonthlyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const [year, month] = label.split('-');
      const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
      ];
      const monthName = monthNames[parseInt(month) - 1];
      
      return (
        <div className="custom-tooltip">
          <div className="tooltip-label">{`${monthName} ${year}`}</div>
          <div className="tooltip-value">
            {`Soru Sayısı: ${payload[0].value}`}
          </div>
        </div>
      );
    }
    return null;
  };

  // Pie chart için özel label
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.03) return null; // %3'ten küçük dilimler için label gösterme
    
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
        fontSize="11"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Toplam kategori sayısını hesapla
  const getTotalCategories = () => {
    return allTimeData ? allTimeData.categories.length : 0;
  };

  // En popüler kategoriyi bul
  const getMostPopularCategory = () => {
    if (!allTimeData || allTimeData.categories.length === 0) return 'N/A';
    const sorted = allTimeData.categories.sort((a, b) => b.value - a.value);
    return sorted[0].name;
  };

  // Ortalama aylık soru sayısı
  const getMonthlyAverage = () => {
    if (!allTimeData || allTimeData.monthly_trend.length === 0) return 0;
    const total = allTimeData.monthly_trend.reduce((sum, month) => sum + month.count, 0);
    return Math.round(total / allTimeData.monthly_trend.length);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Tüm veriler yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Veri Yüklenemedi</h3>
        <p>{error}</p>
        <button onClick={fetchAllTimeData} className="tab-button">
          🔄 Tekrar Dene
        </button>
      </div>
    );
  }

  if (!allTimeData || allTimeData.total_questions === 0) {
    return (
      <div className="error-container">
        <div className="error-icon">📊</div>
        <h3>Henüz Veri Yok</h3>
        <p>Sistemde hiç soru kaydı bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="all-time-charts">
      {/* Özet İstatistikler */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-number">{allTimeData.total_questions}</div>
          <div className="stat-label">Toplam Soru</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{getTotalCategories()}</div>
          <div className="stat-label">Kategori Sayısı</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{getMonthlyAverage()}</div>
          <div className="stat-label">Aylık Ortalama</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{allTimeData.monthly_trend.length}</div>
          <div className="stat-label">Aktif Ay</div>
        </div>
      </div>

      {/* Ana Grafikler */}
      <div className="charts-grid">
        {/* Genel Kategori Dağılımı - Pie Chart */}
        <div className="chart-card">
          <h3 className="chart-title-small">🎯 Genel Kategori Dağılımı</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={allTimeData.categories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {allTimeData.categories.map((entry, index) => (
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

        {/* Aylık Trend - Area Chart */}
        <div className="chart-card">
          <h3 className="chart-title-small">📈 Aylık Soru Trendi</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={allTimeData.monthly_trend}>
              <defs>
                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1f77b4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1f77b4" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => {
                  const [year, month] = value.split('-');
                  return `${month}/${year.slice(-2)}`;
                }}
              />
              <YAxis />
              <Tooltip content={<MonthlyTooltip />} />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#1f77b4" 
                fillOpacity={1} 
                fill="url(#colorTrend)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detaylı Kategori Analizi - Horizontal Bar Chart */}
      <div className="chart-card">
        <h3 className="chart-title-small">📊 Detaylı Kategori Analizi</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            layout="horizontal"
            data={allTimeData.categories.sort((a, b) => b.value - a.value)}
            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#1f77b4" radius={[0, 4, 4, 0]}>
              {allTimeData.categories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Aylık Detay Tablosu */}
      <div className="chart-card">
        <h3 className="chart-title-small">📅 Aylık Aktivite Detayları</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={allTimeData.monthly_trend.slice(-12)} // Son 12 ay
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => {
                const [year, month] = value.split('-');
                const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
                return `${monthNames[parseInt(month) - 1]} ${year.slice(-2)}`;
              }}
            />
            <YAxis />
            <Tooltip content={<MonthlyTooltip />} />
            <Bar dataKey="count" fill="#2ca02c" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Analiz Özeti */}
      <div className="tab-description" style={{ marginTop: '20px' }}>
        <p>
          🔬 <strong>Bilimsel Analiz Özeti:</strong><br />
          • En popüler kategori: <strong>{getMostPopularCategory()}</strong><br />
          • Veri toplama dönemi: <strong>{allTimeData.first_record}</strong> - <strong>{allTimeData.last_record}</strong><br />
          • Aylık ortalama soru sayısı: <strong>{getMonthlyAverage()}</strong><br />
          🎯 <strong>Kullanım Alanları:</strong> Uzun vadeli trend analizi, bilimsel araştırmalar, sistem optimizasyonu
        </p>
      </div>
    </div>
  );
};

export default AllTimeCharts; 