const express = require('express');
const router = express.Router();

// Get performance dashboard data
router.get('/dashboard', (req, res) => {
  const { timeRange = '24h' } = req.query;
  
  const dashboardData = {
    overview: {
      totalTrains: 156,
      onTimeTrains: 132,
      delayedTrains: 18,
      cancelledTrains: 6,
      averageDelay: 12.3,
      punctualityRate: 84.6,
      throughputEfficiency: 91.2,
      sectionUtilization: 78.5
    },
    trends: {
      punctuality: generateTrendData(timeRange, 85, 5),
      throughput: generateTrendData(timeRange, 90, 8),
      delays: generateTrendData(timeRange, 15, 10),
      efficiency: generateTrendData(timeRange, 88, 6)
    },
    topIssues: [
      {
        issue: 'Signal delays at Junction XYZ',
        frequency: 23,
        impact: 'High',
        avgDelay: 18.5
      },
      {
        issue: 'Platform congestion at Kanpur',
        frequency: 15,
        impact: 'Medium',
        avgDelay: 8.2
      },
      {
        issue: 'Weather-related slowdowns',
        frequency: 12,
        impact: 'Low',
        avgDelay: 5.1
      }
    ],
    predictions: {
      nextHourDelay: 8.5,
      peakHourImpact: 'Medium',
      weatherImpact: 'Low',
      maintenanceWindows: [
        {
          section: 'SEC_001',
          startTime: '2024-01-16T02:00:00Z',
          duration: 120,
          impact: 'Minimal'
        }
      ]
    }
  };

  res.json({
    success: true,
    data: dashboardData,
    timeRange,
    lastUpdated: new Date().toISOString()
  });
});

// Get detailed performance metrics
router.get('/performance', (req, res) => {
  const { metric, period = '7d', granularity = 'hour' } = req.query;
  
  const performanceData = {
    punctuality: {
      current: 87.3,
      target: 90.0,
      trend: 'improving',
      history: generateTimeSeriesData(period, granularity, 85, 10)
    },
    throughput: {
      current: 142,
      target: 150,
      trend: 'stable',
      history: generateTimeSeriesData(period, granularity, 140, 15)
    },
    efficiency: {
      current: 89.1,
      target: 92.0,
      trend: 'improving',
      history: generateTimeSeriesData(period, granularity, 88, 8)
    },
    safety: {
      current: 99.8,
      target: 99.9,
      trend: 'stable',
      history: generateTimeSeriesData(period, granularity, 99.5, 0.5)
    }
  };

  const responseData = metric ? performanceData[metric] : performanceData;

  res.json({
    success: true,
    data: responseData,
    period,
    granularity
  });
});

// Get cost analysis
router.get('/costs', (req, res) => {
  const { period = '30d' } = req.query;
  
  const costData = {
    total: 2450000,
    breakdown: {
      fuel: 980000,
      personnel: 720000,
      maintenance: 450000,
      delays: 180000,
      infrastructure: 120000
    },
    trends: {
      fuel: generateCostTrend(period, 980000, 0.05),
      personnel: generateCostTrend(period, 720000, 0.02),
      maintenance: generateCostTrend(period, 450000, 0.08),
      delays: generateCostTrend(period, 180000, 0.15)
    },
    savings: {
      aiOptimization: 125000,
      predictiveMaintenance: 85000,
      energyEfficiency: 65000,
      routeOptimization: 45000
    },
    projections: {
      nextMonth: 2380000,
      nextQuarter: 7200000,
      yearEnd: 28500000
    }
  };

  res.json({
    success: true,
    data: costData,
    period
  });
});

// Get passenger analytics
router.get('/passengers', (req, res) => {
  const passengerData = {
    totalPassengers: 125000,
    satisfactionScore: 4.2,
    complaintRate: 2.1,
    demographics: {
      business: 35,
      leisure: 45,
      commuter: 20
    },
    peakHours: [
      { hour: 7, passengers: 8500 },
      { hour: 8, passengers: 12000 },
      { hour: 9, passengers: 9800 },
      { hour: 17, passengers: 11200 },
      { hour: 18, passengers: 13500 },
      { hour: 19, passengers: 10800 }
    ],
    feedback: {
      punctuality: 3.8,
      comfort: 4.1,
      cleanliness: 4.3,
      staff: 4.5,
      information: 3.9
    },
    trends: {
      growth: 5.2,
      retention: 87.3,
      satisfaction: 'improving'
    }
  };

  res.json({
    success: true,
    data: passengerData
  });
});

// Get predictive analytics
router.get('/predictions', (req, res) => {
  const { horizon = '24h', confidence = 0.8 } = req.query;
  
  const predictions = {
    delays: {
      next1h: { value: 8.5, confidence: 0.92 },
      next4h: { value: 12.3, confidence: 0.85 },
      next24h: { value: 15.7, confidence: 0.78 }
    },
    throughput: {
      next1h: { value: 145, confidence: 0.89 },
      next4h: { value: 138, confidence: 0.82 },
      next24h: { value: 142, confidence: 0.75 }
    },
    maintenance: {
      urgentNeeded: [
        {
          component: 'Signal_XYZ_001',
          probability: 0.85,
          timeframe: '72h',
          impact: 'High'
        },
        {
          component: 'Track_Section_5',
          probability: 0.62,
          timeframe: '168h',
          impact: 'Medium'
        }
      ]
    },
    weather: {
      impact: 'Low',
      riskPeriods: [
        {
          start: '2024-01-16T14:00:00Z',
          end: '2024-01-16T18:00:00Z',
          type: 'Rain',
          severity: 'Moderate'
        }
      ]
    },
    demand: {
      peakTimes: [
        { time: '08:00', load: 0.95 },
        { time: '18:00', load: 0.92 },
        { time: '20:00', load: 0.78 }
      ]
    }
  };

  res.json({
    success: true,
    data: predictions,
    horizon,
    confidence: parseFloat(confidence)
  });
});

// Get comparative analysis
router.get('/compare', (req, res) => {
  const { sections, metrics, period = '7d' } = req.query;
  
  const sectionList = sections ? sections.split(',') : ['SEC_001', 'SEC_002', 'SEC_003'];
  const metricList = metrics ? metrics.split(',') : ['punctuality', 'throughput', 'efficiency'];
  
  const comparison = sectionList.map(section => ({
    section,
    metrics: metricList.reduce((acc, metric) => {
      acc[metric] = {
        value: 80 + Math.random() * 20,
        trend: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)],
        rank: Math.floor(Math.random() * sectionList.length) + 1
      };
      return acc;
    }, {})
  }));

  res.json({
    success: true,
    data: {
      comparison,
      summary: {
        bestPerforming: sectionList[0],
        mostImproved: sectionList[1],
        needsAttention: sectionList[2]
      }
    },
    period
  });
});

// Export analytics data
router.get('/export', (req, res) => {
  const { format = 'json', type = 'dashboard' } = req.query;
  
  // This would generate the appropriate export format
  const exportData = {
    exportId: require('uuid').v4(),
    type,
    format,
    generatedAt: new Date().toISOString(),
    dataUrl: `/api/analytics/download/${require('uuid').v4()}`
  };

  res.json({
    success: true,
    data: exportData
  });
});

// Helper functions
function generateTrendData(timeRange, baseValue, variance) {
  const points = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
  return Array.from({ length: points }, (_, i) => ({
    timestamp: new Date(Date.now() - (points - i - 1) * (timeRange === '24h' ? 3600000 : 86400000)).toISOString(),
    value: baseValue + (Math.random() - 0.5) * variance * 2
  }));
}

function generateTimeSeriesData(period, granularity, baseValue, variance) {
  const intervals = {
    hour: period === '24h' ? 24 : period === '7d' ? 168 : 720,
    day: period === '7d' ? 7 : 30,
    week: 4
  };
  
  const points = intervals[granularity] || 24;
  const intervalMs = granularity === 'hour' ? 3600000 : granularity === 'day' ? 86400000 : 604800000;
  
  return Array.from({ length: points }, (_, i) => ({
    timestamp: new Date(Date.now() - (points - i - 1) * intervalMs).toISOString(),
    value: baseValue + (Math.random() - 0.5) * variance * 2
  }));
}

function generateCostTrend(period, baseValue, volatility) {
  const points = period === '7d' ? 7 : 30;
  return Array.from({ length: points }, (_, i) => ({
    date: new Date(Date.now() - (points - i - 1) * 86400000).toISOString().split('T')[0],
    value: baseValue * (1 + (Math.random() - 0.5) * volatility * 2)
  }));
}

module.exports = router;