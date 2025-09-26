const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Mock database - in production, use a real database
let trains = [
  {
    id: '12002',
    number: '12002',
    name: 'Shatabdi Express',
    type: 'express',
    priority: 'high',
    currentStation: 'New Delhi',
    nextStation: 'Kanpur Central',
    status: 'on-time',
    delay: 0,
    position: { lat: 28.6139, lng: 77.2090 },
    speed: 85,
    capacity: 1200,
    occupancy: 980,
    route: ['New Delhi', 'Ghaziabad', 'Aligarh', 'Kanpur Central'],
    schedule: {
      departure: '2024-01-15T06:00:00Z',
      arrival: '2024-01-15T12:30:00Z'
    },
    constraints: {
      maxSpeed: 130,
      length: 24,
      weight: 800
    }
  },
  {
    id: '22470',
    number: '22470',
    name: 'Rajdhani Express',
    type: 'express',
    priority: 'high',
    currentStation: 'Gwalior',
    nextStation: 'Jhansi',
    status: 'delayed',
    delay: 15,
    position: { lat: 26.2183, lng: 78.1828 },
    speed: 75,
    capacity: 1500,
    occupancy: 1350,
    route: ['New Delhi', 'Gwalior', 'Jhansi', 'Bhopal'],
    schedule: {
      departure: '2024-01-15T17:00:00Z',
      arrival: '2024-01-16T08:45:00Z'
    },
    constraints: {
      maxSpeed: 140,
      length: 22,
      weight: 750
    }
  },
  {
    id: '16032',
    number: '16032',
    name: 'Andaman Express',
    type: 'mail',
    priority: 'medium',
    currentStation: 'Mathura',
    nextStation: 'Agra',
    status: 'on-time',
    delay: 0,
    position: { lat: 27.4924, lng: 77.6737 },
    speed: 65,
    capacity: 1800,
    occupancy: 1200,
    route: ['Chennai', 'Mathura', 'Agra', 'Delhi'],
    schedule: {
      departure: '2024-01-14T22:30:00Z',
      arrival: '2024-01-16T06:15:00Z'
    },
    constraints: {
      maxSpeed: 110,
      length: 26,
      weight: 900
    }
  },
  {
    id: '54783',
    number: '54783',
    name: 'Freight Service',
    type: 'freight',
    priority: 'low',
    currentStation: 'Etawah',
    nextStation: 'Kanpur Central',
    status: 'holding',
    delay: 25,
    position: { lat: 26.7751, lng: 79.0159 },
    speed: 0,
    capacity: 2500,
    occupancy: 2200,
    route: ['Mumbai', 'Etawah', 'Kanpur Central', 'Lucknow'],
    schedule: {
      departure: '2024-01-14T14:00:00Z',
      arrival: '2024-01-15T18:30:00Z'
    },
    constraints: {
      maxSpeed: 75,
      length: 58,
      weight: 3200
    }
  }
];

// Get all trains
router.get('/', (req, res) => {
  const { status, priority, type } = req.query;
  let filteredTrains = trains;

  if (status) {
    filteredTrains = filteredTrains.filter(train => train.status === status);
  }
  if (priority) {
    filteredTrains = filteredTrains.filter(train => train.priority === priority);
  }
  if (type) {
    filteredTrains = filteredTrains.filter(train => train.type === type);
  }

  res.json({
    success: true,
    data: filteredTrains,
    total: filteredTrains.length
  });
});

// Get train by ID
router.get('/:id', (req, res) => {
  const train = trains.find(t => t.id === req.params.id);
  if (!train) {
    return res.status(404).json({
      success: false,
      error: 'Train not found'
    });
  }
  res.json({
    success: true,
    data: train
  });
});

// Update train status
router.put('/:id/status', (req, res) => {
  const { status, delay, position, speed } = req.body;
  const trainIndex = trains.findIndex(t => t.id === req.params.id);
  
  if (trainIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Train not found'
    });
  }

  trains[trainIndex] = {
    ...trains[trainIndex],
    status: status || trains[trainIndex].status,
    delay: delay !== undefined ? delay : trains[trainIndex].delay,
    position: position || trains[trainIndex].position,
    speed: speed !== undefined ? speed : trains[trainIndex].speed,
    lastUpdated: new Date().toISOString()
  };

  res.json({
    success: true,
    data: trains[trainIndex]
  });
});

// Get train real-time data
router.get('/:id/realtime', (req, res) => {
  const train = trains.find(t => t.id === req.params.id);
  if (!train) {
    return res.status(404).json({
      success: false,
      error: 'Train not found'
    });
  }

  // Simulate real-time data
  const realTimeData = {
    trainId: train.id,
    position: train.position,
    speed: train.speed + (Math.random() - 0.5) * 10,
    heading: Math.random() * 360,
    nextSignal: {
      id: 'SIG_' + Math.floor(Math.random() * 1000),
      distance: Math.random() * 5000,
      aspect: ['green', 'yellow', 'red'][Math.floor(Math.random() * 3)]
    },
    trackSection: 'SEC_' + Math.floor(Math.random() * 100),
    fuel: Math.random() * 100,
    engineHealth: 85 + Math.random() * 15,
    timestamp: new Date().toISOString()
  };

  res.json({
    success: true,
    data: realTimeData
  });
});

// Emergency stop
router.post('/:id/emergency-stop', (req, res) => {
  const { reason, location } = req.body;
  const trainIndex = trains.findIndex(t => t.id === req.params.id);
  
  if (trainIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Train not found'
    });
  }

  trains[trainIndex].status = 'emergency-stop';
  trains[trainIndex].speed = 0;
  trains[trainIndex].emergencyReason = reason;
  trains[trainIndex].emergencyLocation = location;
  trains[trainIndex].emergencyTime = new Date().toISOString();

  // In a real system, this would trigger immediate alerts and safety protocols
  console.log(`EMERGENCY STOP: Train ${trains[trainIndex].number} - ${reason}`);

  res.json({
    success: true,
    message: 'Emergency stop activated',
    data: trains[trainIndex]
  });
});

// Get train conflicts
router.get('/:id/conflicts', (req, res) => {
  const train = trains.find(t => t.id === req.params.id);
  if (!train) {
    return res.status(404).json({
      success: false,
      error: 'Train not found'
    });
  }

  // Simulate conflict detection
  const conflicts = [
    {
      id: uuidv4(),
      type: 'track_occupation',
      severity: 'medium',
      conflictingTrain: '22470',
      location: 'Junction XYZ',
      estimatedTime: '2024-01-15T14:30:00Z',
      resolution: 'Hold train at previous station'
    },
    {
      id: uuidv4(),
      type: 'platform_availability',
      severity: 'low',
      location: 'Kanpur Central Platform 3',
      estimatedTime: '2024-01-15T15:45:00Z',
      resolution: 'Redirect to Platform 2'
    }
  ];

  res.json({
    success: true,
    data: conflicts
  });
});

// Get train performance metrics
router.get('/:id/metrics', (req, res) => {
  const train = trains.find(t => t.id === req.params.id);
  if (!train) {
    return res.status(404).json({
      success: false,
      error: 'Train not found'
    });
  }

  const metrics = {
    punctuality: train.delay <= 5 ? 'excellent' : train.delay <= 15 ? 'good' : 'poor',
    fuelEfficiency: 85 + Math.random() * 15,
    passengerSatisfaction: 4.2 + Math.random() * 0.8,
    onTimePerformance: Math.max(0, 100 - train.delay * 2),
    averageSpeed: train.speed,
    distanceCovered: Math.random() * 500 + 100,
    co2Emissions: Math.random() * 50 + 20
  };

  res.json({
    success: true,
    data: metrics
  });
});

module.exports = router;