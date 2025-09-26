const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Mock sections data
let sections = [
  {
    id: 'SEC_001',
    name: 'Delhi-Kanpur Section',
    controller: 'Section Controller A',
    status: 'operational',
    length: 485.2,
    tracks: 2,
    stations: ['New Delhi', 'Ghaziabad', 'Aligarh', 'Kanpur Central'],
    capacity: {
      maxTrains: 24,
      currentTrains: 18,
      utilization: 75
    },
    performance: {
      punctualityRate: 87.3,
      throughput: 142,
      averageDelay: 12.3,
      efficiency: 89.1
    },
    infrastructure: {
      signals: 45,
      junctions: 8,
      platforms: 12,
      maintenanceWindows: []
    },
    constraints: {
      maxSpeed: 130,
      gradients: [
        { location: 'km_125', grade: 1.2 },
        { location: 'km_340', grade: -0.8 }
      ],
      restrictions: []
    }
  },
  {
    id: 'SEC_002',
    name: 'Kanpur-Lucknow Section',
    controller: 'Section Controller B',
    status: 'operational',
    length: 78.5,
    tracks: 2,
    stations: ['Kanpur Central', 'Unnao', 'Lucknow'],
    capacity: {
      maxTrains: 16,
      currentTrains: 12,
      utilization: 75
    },
    performance: {
      punctualityRate: 91.2,
      throughput: 98,
      averageDelay: 8.7,
      efficiency: 92.4
    },
    infrastructure: {
      signals: 28,
      junctions: 4,
      platforms: 8,
      maintenanceWindows: []
    },
    constraints: {
      maxSpeed: 110,
      gradients: [],
      restrictions: []
    }
  }
];

// Get all sections
router.get('/', (req, res) => {
  const { status, controller } = req.query;
  let filteredSections = sections;

  if (status) {
    filteredSections = filteredSections.filter(section => section.status === status);
  }
  if (controller) {
    filteredSections = filteredSections.filter(section => 
      section.controller.toLowerCase().includes(controller.toLowerCase())
    );
  }

  res.json({
    success: true,
    data: filteredSections,
    total: filteredSections.length
  });
});

// Get section by ID
router.get('/:id', (req, res) => {
  const section = sections.find(s => s.id === req.params.id);
  if (!section) {
    return res.status(404).json({
      success: false,
      error: 'Section not found'
    });
  }

  res.json({
    success: true,
    data: section
  });
});

// Get section real-time status
router.get('/:id/status', (req, res) => {
  const section = sections.find(s => s.id === req.params.id);
  if (!section) {
    return res.status(404).json({
      success: false,
      error: 'Section not found'
    });
  }

  const realTimeStatus = {
    sectionId: section.id,
    timestamp: new Date().toISOString(),
    operationalStatus: section.status,
    activeTrains: section.capacity.currentTrains,
    utilization: section.capacity.utilization,
    currentConditions: {
      weather: 'Clear',
      visibility: 'Good',
      temperature: 22,
      windSpeed: 8
    },
    alerts: [
      {
        id: uuidv4(),
        type: 'maintenance',
        severity: 'low',
        message: 'Scheduled maintenance at Signal XYZ in 2 hours',
        timestamp: new Date().toISOString()
      }
    ],
    performance: {
      ...section.performance,
      lastUpdated: new Date().toISOString()
    }
  };

  res.json({
    success: true,
    data: realTimeStatus
  });
});

// Get section trains
router.get('/:id/trains', (req, res) => {
  const section = sections.find(s => s.id === req.params.id);
  if (!section) {
    return res.status(404).json({
      success: false,
      error: 'Section not found'
    });
  }

  // Mock trains in section
  const trainsInSection = [
    {
      id: '12002',
      number: '12002',
      name: 'Shatabdi Express',
      currentLocation: 'km_125.5',
      speed: 85,
      direction: 'UP',
      nextStation: 'Aligarh',
      eta: new Date(Date.now() + 1800000).toISOString(),
      status: 'on-time'
    },
    {
      id: '22470',
      number: '22470',
      name: 'Rajdhani Express',
      currentLocation: 'km_340.2',
      speed: 95,
      direction: 'DOWN',
      nextStation: 'Ghaziabad',
      eta: new Date(Date.now() + 2700000).toISOString(),
      status: 'delayed'
    }
  ];

  res.json({
    success: true,
    data: trainsInSection,
    sectionId: section.id
  });
});

// Get section capacity analysis
router.get('/:id/capacity', (req, res) => {
  const section = sections.find(s => s.id === req.params.id);
  if (!section) {
    return res.status(404).json({
      success: false,
      error: 'Section not found'
    });
  }

  const capacityAnalysis = {
    current: {
      utilization: section.capacity.utilization,
      activeTrains: section.capacity.currentTrains,
      maxCapacity: section.capacity.maxTrains,
      availableSlots: section.capacity.maxTrains - section.capacity.currentTrains
    },
    forecast: {
      next1h: section.capacity.utilization + Math.random() * 10 - 5,
      next4h: section.capacity.utilization + Math.random() * 15 - 7,
      next24h: section.capacity.utilization + Math.random() * 20 - 10
    },
    bottlenecks: [
      {
        location: 'Junction XYZ',
        type: 'signal_capacity',
        impact: 'Medium',
        recommendation: 'Install additional signals'
      },
      {
        location: 'Kanpur Central',
        type: 'platform_capacity',
        impact: 'High',
        recommendation: 'Optimize platform allocation'
      }
    ],
    optimization: {
      potentialIncrease: 15,
      requiredInvestment: 2500000,
      paybackPeriod: 18
    }
  };

  res.json({
    success: true,
    data: capacityAnalysis
  });
});

// Get section conflicts
router.get('/:id/conflicts', (req, res) => {
  const section = sections.find(s => s.id === req.params.id);
  if (!section) {
    return res.status(404).json({
      success: false,
      error: 'Section not found'
    });
  }

  const conflicts = [
    {
      id: uuidv4(),
      type: 'track_occupation',
      severity: 'medium',
      trains: ['12002', '22470'],
      location: 'km_125.5',
      estimatedTime: new Date(Date.now() + 1800000).toISOString(),
      description: 'Potential track conflict between express trains',
      resolution: {
        recommended: 'Hold train 22470 for 5 minutes',
        alternatives: [
          'Reduce speed of train 12002',
          'Use alternate track'
        ]
      }
    },
    {
      id: uuidv4(),
      type: 'signal_conflict',
      severity: 'low',
      trains: ['16032'],
      location: 'Signal_ABC',
      estimatedTime: new Date(Date.now() + 3600000).toISOString(),
      description: 'Signal timing optimization needed',
      resolution: {
        recommended: 'Adjust signal timing by 30 seconds',
        alternatives: [
          'Manual signal override'
        ]
      }
    }
  ];

  res.json({
    success: true,
    data: conflicts,
    sectionId: section.id
  });
});

// Update section status
router.put('/:id/status', (req, res) => {
  const { status, reason } = req.body;
  const sectionIndex = sections.findIndex(s => s.id === req.params.id);
  
  if (sectionIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Section not found'
    });
  }

  const validStatuses = ['operational', 'maintenance', 'emergency', 'closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
    });
  }

  sections[sectionIndex].status = status;
  sections[sectionIndex].lastStatusChange = {
    timestamp: new Date().toISOString(),
    reason: reason || 'Status updated via API',
    previousStatus: sections[sectionIndex].status
  };

  res.json({
    success: true,
    data: sections[sectionIndex],
    message: `Section status updated to ${status}`
  });
});

// Add maintenance window
router.post('/:id/maintenance', (req, res) => {
  const { startTime, endTime, type, description, affectedTracks } = req.body;
  const sectionIndex = sections.findIndex(s => s.id === req.params.id);
  
  if (sectionIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Section not found'
    });
  }

  const maintenanceWindow = {
    id: uuidv4(),
    startTime,
    endTime,
    type: type || 'routine',
    description: description || 'Scheduled maintenance',
    affectedTracks: affectedTracks || [],
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };

  sections[sectionIndex].infrastructure.maintenanceWindows.push(maintenanceWindow);

  res.json({
    success: true,
    data: maintenanceWindow,
    message: 'Maintenance window scheduled successfully'
  });
});

// Get section performance history
router.get('/:id/performance/history', (req, res) => {
  const { period = '7d', metric } = req.query;
  const section = sections.find(s => s.id === req.params.id);
  
  if (!section) {
    return res.status(404).json({
      success: false,
      error: 'Section not found'
    });
  }

  const points = period === '24h' ? 24 : period === '7d' ? 7 : 30;
  const intervalMs = period === '24h' ? 3600000 : 86400000;

  const generateHistory = (baseValue, variance) => {
    return Array.from({ length: points }, (_, i) => ({
      timestamp: new Date(Date.now() - (points - i - 1) * intervalMs).toISOString(),
      value: baseValue + (Math.random() - 0.5) * variance * 2
    }));
  };

  const performanceHistory = {
    punctualityRate: generateHistory(section.performance.punctualityRate, 10),
    throughput: generateHistory(section.performance.throughput, 20),
    averageDelay: generateHistory(section.performance.averageDelay, 8),
    efficiency: generateHistory(section.performance.efficiency, 12)
  };

  const responseData = metric ? performanceHistory[metric] : performanceHistory;

  res.json({
    success: true,
    data: responseData,
    sectionId: section.id,
    period
  });
});

module.exports = router;