/**
 * LogChart.jsx - En Çok Sorulan Sorular ve Çoklu Grafikler
 * Hem liste hem de çeşitli grafik türleri
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  AreaChart, Area, RadialBarChart, RadialBar
} from 'recharts';
import axios from 'axios';
import './LogChart.css';

const LogChart = () => {
  const [logs, setLogs] = useState([]);
  const [weeklyData, setWeeklyData] = useState(null);
  const [allTimeData, setAllTimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Renk paleti
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      console.log('🔗 API URL:', apiUrl);
      
      // Paralel olarak tüm verileri çek
      console.log('📡 API çağrıları başlatılıyor...');
      
      const [logsResponse, weeklyResponse, allTimeResponse] = await Promise.all([
        axios.get(`${apiUrl}/logs`).catch(err => {
          console.error('❌ Logs API hatası:', err);
          return { data: { logs: [] } };
        }),
        axios.get(`${apiUrl}/api/stats/weekly`).catch(err => {
          console.error('❌ Weekly API hatası:', err);
          return { data: { success: false } };
        }),
        axios.get(`${apiUrl}/api/stats/all`).catch(err => {
          console.error('❌ All-time API hatası:', err);
          return { data: { success: false } };
        })
      ]);
      
      console.log('📊 Logs Response:', logsResponse.data);
      console.log('📅 Weekly Response:', weeklyResponse.data);
      console.log('📈 All-time Response:', allTimeResponse.data);
      
      // En çok sorulan sorular listesi
      if (logsResponse.data && logsResponse.data.logs) {
        const questionCounts = {};
        logsResponse.data.logs.forEach(log => {
          const question = log.question.trim();
          if (question) {
            questionCounts[question] = (questionCounts[question] || 0) + 1;
          }
        });

        const sortedQuestions = Object.entries(questionCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 12);

        console.log('📝 Sorted Questions:', sortedQuestions);
        setLogs(sortedQuestions);
      }

      // Haftalık veriler
      if (weeklyResponse.data.success) {
        console.log('✅ Weekly data set');
        setWeeklyData(weeklyResponse.data);
      } else {
        console.log('❌ Weekly data failed');
      }

      // Tüm zamanlar verileri
      if (allTimeResponse.data.success) {
        console.log('✅ All-time data set');
        setAllTimeData(allTimeResponse.data);
      } else {
        console.log('❌ All-time data failed');
      }

    } catch (err) {
      console.error('❌ Genel veri yükleme hatası:', err);
      setError('Veriler yüklenemedi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Özel tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <div className="tooltip-label">{label}</div>
          <div className="tooltip-value">
            {`Sayı: ${payload[0].value}`}
          </div>
        </div>
      );
    }
    return null;
  };

  console.log('🎯 Render durumu:', { 
    loading, 
    error, 
    logsCount: logs.length, 
    hasWeeklyData: !!weeklyData, 
    hasAllTimeData: !!allTimeData 
  });

  if (loading) {
    return (
      <div className="stats-container">
        <div className="stats-header">
          <h2>📊 İstatistikler Yükleniyor...</h2>
        </div>
        <div className="loading-message">Tüm veriler yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-container">
        <div className="stats-header">
          <h2>📊 İstatistikler</h2>
        </div>
        <div className="error-message">{error}</div>
        <button onClick={fetchAllData} className="retry-button">
          🔄 Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="stats-container">
      {/* Ana Başlık */}
      <div className="stats-header">
        <h2>🌸 En Çok Sorulan Sorular</h2>
        <p className="stats-subtitle">
          Deneme istediğim esaslar bir sormayık olma sakın.<br />
          Varsan beyan etmesen bir sözlüklük budur.<br />
          Yaprakların bulutlara erişmeye bir zamanı mı var?
        </p>
      </div>

      {/* Debug Bilgisi */}
      <div className="debug-info" style={{ 
        background: '#f0f0f0', 
        padding: '10px', 
        margin: '10px 0', 
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        <strong>Debug:</strong> Logs: {logs.length}, Weekly: {weeklyData ? 'Var' : 'Yok'}, AllTime: {allTimeData ? 'Var' : 'Yok'}
      </div>

      {/* En Çok Sorulan Sorular Listesi */}
      <div className="questions-list">
        {logs.length === 0 ? (
          <div className="no-data">Henüz soru sorulmamış.</div>
        ) : (
          logs.map(([question, count], index) => (
            <div key={index} className="question-item">
              <div className="question-text">{question}</div>
              <div className="question-bar">
                <div 
                  className="question-bar-fill" 
                  style={{ width: `${(count / logs[0][1]) * 100}%` }}
                ></div>
              </div>
              <div className="question-count">{count}</div>
            </div>
          ))
        )}
      </div>

      {/* Grafikler Bölümü - Her zaman göster */}
      <div className="charts-section">
        <h3 className="section-title">📈 Detaylı Analizler</h3>
        
        {/* Veri yoksa bilgi mesajı */}
        {(!weeklyData && !allTimeData) && (
          <div className="no-charts-data">
            <p>📊 Grafik verileri yükleniyor veya mevcut değil.</p>
            <p>Backend API'lerinden veri alınamadı.</p>
          </div>
        )}
        
        {/* Grafikler Grid */}
        <div className="charts-grid">
          
          {/* 1. Kategori Dağılımı - Pie Chart */}
          {allTimeData && allTimeData.categories && allTimeData.categories.length > 0 ? (
            <div className="chart-card">
              <h4 className="chart-title">🎯 Kategori Dağılımı</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={allTimeData.categories}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {allTimeData.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-card">
              <h4 className="chart-title">🎯 Kategori Dağılımı</h4>
              <div className="no-data">Kategori verisi bulunamadı</div>
            </div>
          )}

          {/* 2. Haftalık Trend - Line Chart */}
          {weeklyData && weeklyData.daily_trend && weeklyData.daily_trend.length > 0 ? (
            <div className="chart-card">
              <h4 className="chart-title">📅 Haftalık Trend</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData.daily_trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
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
                    stroke="#667eea" 
                    strokeWidth={3}
                    dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-card">
              <h4 className="chart-title">📅 Haftalık Trend</h4>
              <div className="no-data">Haftalık veri bulunamadı</div>
            </div>
          )}

          {/* 3. Kategori Detayları - Bar Chart */}
          {allTimeData && allTimeData.categories && allTimeData.categories.length > 0 ? (
            <div className="chart-card">
              <h4 className="chart-title">📊 Kategori Detayları</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={allTimeData.categories.sort((a, b) => b.value - a.value)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={11}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {allTimeData.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-card">
              <h4 className="chart-title">📊 Kategori Detayları</h4>
              <div className="no-data">Kategori detay verisi bulunamadı</div>
            </div>
          )}

          {/* 4. Aylık Trend - Area Chart */}
          {allTimeData && allTimeData.monthly_trend && allTimeData.monthly_trend.length > 0 ? (
            <div className="chart-card">
              <h4 className="chart-title">📈 Aylık Aktivite</h4>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={allTimeData.monthly_trend.slice(-6)}>
                  <defs>
                    <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => {
                      const [year, month] = value.split('-');
                      return `${month}/${year.slice(-2)}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#667eea" 
                    fillOpacity={1} 
                    fill="url(#colorArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-card">
              <h4 className="chart-title">📈 Aylık Aktivite</h4>
              <div className="no-data">Aylık veri bulunamadı</div>
            </div>
          )}

        </div>
      </div>

      {/* Özet İstatistikler */}
      <div className="summary-stats">
        <h3 className="section-title">📋 Özet İstatistikler</h3>
        <div className="stats-grid">
          {allTimeData ? (
            <>
              <div className="stat-item">
                <div className="stat-number">{allTimeData.total_questions || 0}</div>
                <div className="stat-label">Toplam Soru</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{allTimeData.categories ? allTimeData.categories.length : 0}</div>
                <div className="stat-label">Kategori Sayısı</div>
              </div>
            </>
          ) : (
            <>
              <div className="stat-item">
                <div className="stat-number">-</div>
                <div className="stat-label">Toplam Soru</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">-</div>
                <div className="stat-label">Kategori Sayısı</div>
              </div>
            </>
          )}
          {weeklyData ? (
            <>
              <div className="stat-item">
                <div className="stat-number">{weeklyData.total_questions || 0}</div>
                <div className="stat-label">Bu Hafta</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{weeklyData.total_questions ? Math.round(weeklyData.total_questions / 7) : 0}</div>
                <div className="stat-label">Günlük Ortalama</div>
              </div>
            </>
          ) : (
            <>
              <div className="stat-item">
                <div className="stat-number">-</div>
                <div className="stat-label">Bu Hafta</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">-</div>
                <div className="stat-label">Günlük Ortalama</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogChart;
