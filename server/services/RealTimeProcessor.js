const { v4: uuidv4 } = require('uuid');

class RealTimeProcessor {
  constructor() {
    this.dataStreams = new Map();
    this.processors = new Map();
    this.subscribers = new Map();
    this.isProcessing = false;
    this.processingStats = {
      messagesProcessed: 0,
      errorsEncountered: 0,
      averageProcessingTime: 0,
      lastProcessedAt: null
    };
    
    this.initializeProcessors();
  }

  initializeProcessors() {
    // Train position processor
    this.processors.set('train_positions', {
      process: (data) => this.processTrainPositions(data),
      validate: (data) => this.validateTrainPositionData(data),
      transform: (data) => this.transformTrainPositionData(data)
    });

    // Signal status processor
    this.processors.set('signal_status', {
      process: (data) => this.processSignalStatus(data),
      validate: (data) => this.validateSignalData(data),
      transform: (data) => this.transformSignalData(data)
    });

    // Performance metrics processor
    this.processors.set('performance_metrics', {
      process: (data) => this.processPerformanceMetrics(data),
      validate: (data) => this.validatePerformanceData(data),
      transform: (data) => this.transformPerformanceData(data)
    });

    // Alert processor
    this.processors.set('alerts', {
      process: (data) => this.processAlerts(data),
      validate: (data) => this.validateAlertData(data),
      transform: (data) => this.transformAlertData(data)
    });
  }

  // Main processing method
  async processRealTimeData(streamType, data) {
    const startTime = Date.now();
    
    try {
      const processor = this.processors.get(streamType);
      if (!processor) {
        throw new Error(`No processor found for stream type: ${streamType}`);
      }

      // Validate incoming data
      if (!processor.validate(data)) {
        throw new Error(`Invalid data format for stream type: ${streamType}`);
      }

      // Transform data if needed
      const transformedData = processor.transform(data);

      // Process the data
      const result = await processor.process(transformedData);

      // Update statistics
      this.updateProcessingStats(Date.now() - startTime);

      // Notify subscribers
      this.notifySubscribers(streamType, result);

      return result;

    } catch (error) {
      this.processingStats.errorsEncountered++;
      console.error(`Error processing ${streamType} data:`, error);
      throw error;
    }
  }

  // Train position processing
  processTrainPositions(data) {
    const processedData = {
      trainId: data.trainId,
      position: data.position,
      speed: data.speed,
      heading: data.heading,
      timestamp: data.timestamp || new Date().toISOString(),
      sectionId: this.determineSectionFromPosition(data.position),
      nextSignal: this.calculateNextSignal(data.position, data.heading),
      estimatedArrival: this.calculateETA(data),
      status: this.determineTrainStatus(data)
    };

    // Store in data stream
    this.updateDataStream('train_positions', data.trainId, processedData);

    // Check for conflicts or alerts
    this.checkForConflicts(processedData);

    return processedData;
  }

  validateTrainPositionData(data) {
    return data && 
           data.trainId && 
           data.position && 
           Array.isArray(data.position) && 
           data.position.length === 2 &&
           typeof data.speed === 'number';
  }

  transformTrainPositionData(data) {
    return {
      ...data,
      position: [parseFloat(data.position[0]), parseFloat(data.position[1])],
      speed: parseFloat(data.speed),
      heading: data.heading ? parseFloat(data.heading) : 0
    };
  }

  // Signal status processing
  processSignalStatus(data) {
    const processedData = {
      signalId: data.signalId,
      aspect: data.aspect,
      location: data.location,
      timestamp: data.timestamp || new Date().toISOString(),
      healthStatus: data.healthStatus || 'normal',
      lastMaintenance: data.lastMaintenance,
      nextScheduledMaintenance: data.nextScheduledMaintenance,
      affectedTrains: this.findAffectedTrains(data.signalId)
    };

    this.updateDataStream('signal_status', data.signalId, processedData);

    // Check for signal failures or issues
    if (data.aspect === 'failed' || data.healthStatus === 'critical') {
      this.generateSignalAlert(processedData);
    }

    return processedData;
  }

  validateSignalData(data) {
    const validAspects = ['green', 'yellow', 'red', 'failed'];
    return data && 
           data.signalId && 
           data.aspect && 
           validAspects.includes(data.aspect);
  }

  transformSignalData(data) {
    return {
      ...data,
      aspect: data.aspect.toLowerCase(),
      healthStatus: data.healthStatus || 'normal'
    };
  }

  // Performance metrics processing
  processPerformanceMetrics(data) {
    const processedData = {
      metricType: data.metricType,
      value: data.value,
      unit: data.unit,
      timestamp: data.timestamp || new Date().toISOString(),
      sectionId: data.sectionId,
      trend: this.calculateTrend(data.metricType, data.value),
      threshold: this.getThreshold(data.metricType),
      status: this.evaluateMetricStatus(data.metricType, data.value)
    };

    this.updateDataStream('performance_metrics', `${data.sectionId}_${data.metricType}`, processedData);

    // Check for threshold violations
    if (processedData.status === 'critical' || processedData.status === 'warning') {
      this.generatePerformanceAlert(processedData);
    }

    return processedData;
  }

  validatePerformanceData(data) {
    return data && 
           data.metricType && 
           typeof data.value === 'number' &&
           data.sectionId;
  }

  transformPerformanceData(data) {
    return {
      ...data,
      value: parseFloat(data.value)
    };
  }

  // Alert processing
  processAlerts(data) {
    const processedData = {
      alertId: data.alertId || uuidv4(),
      type: data.type,
      severity: data.severity,
      message: data.message,
      source: data.source,
      timestamp: data.timestamp || new Date().toISOString(),
      affectedEntities: data.affectedEntities || [],
      recommendedActions: this.generateRecommendedActions(data.type, data.severity),
      escalationRequired: this.shouldEscalate(data.severity),
      estimatedResolutionTime: this.estimateResolutionTime(data.type, data.severity)
    };

    this.updateDataStream('alerts', processedData.alertId, processedData);

    return processedData;
  }

  validateAlertData(data) {
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    return data && 
           data.type && 
           data.severity && 
           validSeverities.includes(data.severity) &&
           data.message;
  }

  transformAlertData(data) {
    return {
      ...data,
      severity: data.severity.toLowerCase(),
      type: data.type.toLowerCase()
    };
  }

  // Helper methods
  determineSectionFromPosition(position) {
    // Simplified section determination based on position
    const [x, y] = position;
    if (x < 200) return 'SEC_001';
    if (x < 400) return 'SEC_002';
    return 'SEC_003';
  }

  calculateNextSignal(position, heading) {
    // Simplified next signal calculation
    return {
      signalId: `SIG_${Math.floor(Math.random() * 1000)}`,
      distance: Math.random() * 5000 + 500,
      aspect: ['green', 'yellow', 'red'][Math.floor(Math.random() * 3)]
    };
  }

  calculateETA(data) {
    // Simplified ETA calculation
    const baseTime = 30 + Math.random() * 60; // 30-90 minutes
    return new Date(Date.now() + baseTime * 60000).toISOString();
  }

  determineTrainStatus(data) {
    if (data.speed === 0) return 'stopped';
    if (data.speed < 20) return 'slow';
    if (data.speed > 100) return 'high_speed';
    return 'normal';
  }

  findAffectedTrains(signalId) {
    // Find trains that might be affected by this signal
    const trainPositions = this.dataStreams.get('train_positions') || new Map();
    const affectedTrains = [];
    
    trainPositions.forEach((trainData, trainId) => {
      // Simplified logic to determine if train is affected
      if (Math.random() < 0.3) { // 30% chance for demo
        affectedTrains.push(trainId);
      }
    });
    
    return affectedTrains;
  }

  calculateTrend(metricType, currentValue) {
    // Simplified trend calculation
    const trends = ['improving', 'stable', 'declining'];
    return trends[Math.floor(Math.random() * trends.length)];
  }

  getThreshold(metricType) {
    const thresholds = {
      'punctuality': { warning: 85, critical: 75 },
      'throughput': { warning: 80, critical: 70 },
      'delay': { warning: 15, critical: 30 },
      'utilization': { warning: 90, critical: 95 }
    };
    
    return thresholds[metricType] || { warning: 80, critical: 90 };
  }

  evaluateMetricStatus(metricType, value) {
    const threshold = this.getThreshold(metricType);
    
    if (metricType === 'delay') {
      if (value >= threshold.critical) return 'critical';
      if (value >= threshold.warning) return 'warning';
      return 'normal';
    } else {
      if (value <= threshold.critical) return 'critical';
      if (value <= threshold.warning) return 'warning';
      return 'normal';
    }
  }

  generateRecommendedActions(type, severity) {
    const actions = {
      'signal_failure': ['Dispatch maintenance team', 'Activate backup signals', 'Implement manual control'],
      'train_delay': ['Investigate cause', 'Adjust schedule', 'Notify passengers'],
      'capacity_exceeded': ['Implement holding patterns', 'Consider alternate routes', 'Optimize scheduling'],
      'safety_violation': ['Immediate stop', 'Investigate incident', 'Review safety protocols']
    };
    
    return actions[type] || ['Investigate issue', 'Take appropriate action'];
  }

  shouldEscalate(severity) {
    return severity === 'critical' || severity === 'high';
  }

  estimateResolutionTime(type, severity) {
    const baseTimes = {
      'signal_failure': 60,
      'train_delay': 30,
      'capacity_exceeded': 45,
      'safety_violation': 15
    };
    
    const baseTime = baseTimes[type] || 30;
    const severityMultiplier = severity === 'critical' ? 0.5 : severity === 'high' ? 0.7 : 1.0;
    
    return Math.round(baseTime * severityMultiplier);
  }

  checkForConflicts(trainData) {
    // Simplified conflict detection
    const otherTrains = this.dataStreams.get('train_positions') || new Map();
    
    otherTrains.forEach((otherTrainData, otherTrainId) => {
      if (otherTrainId !== trainData.trainId) {
        const distance = this.calculateDistance(trainData.position, otherTrainData.position);
        
        if (distance < 1000 && trainData.sectionId === otherTrainData.sectionId) {
          this.generateConflictAlert(trainData, otherTrainData);
        }
      }
    });
  }

  calculateDistance(pos1, pos2) {
    const [x1, y1] = pos1;
    const [x2, y2] = pos2;
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  generateSignalAlert(signalData) {
    this.processRealTimeData('alerts', {
      type: 'signal_failure',
      severity: 'high',
      message: `Signal ${signalData.signalId} is showing ${signalData.aspect} status`,
      source: 'signal_monitor',
      affectedEntities: signalData.affectedTrains
    });
  }

  generatePerformanceAlert(metricData) {
    this.processRealTimeData('alerts', {
      type: 'performance_degradation',
      severity: metricData.status === 'critical' ? 'high' : 'medium',
      message: `${metricData.metricType} has reached ${metricData.status} level: ${metricData.value}${metricData.unit}`,
      source: 'performance_monitor',
      affectedEntities: [metricData.sectionId]
    });
  }

  generateConflictAlert(train1, train2) {
    this.processRealTimeData('alerts', {
      type: 'train_conflict',
      severity: 'high',
      message: `Potential conflict detected between trains ${train1.trainId} and ${train2.trainId}`,
      source: 'conflict_detector',
      affectedEntities: [train1.trainId, train2.trainId]
    });
  }

  // Data stream management
  updateDataStream(streamType, entityId, data) {
    if (!this.dataStreams.has(streamType)) {
      this.dataStreams.set(streamType, new Map());
    }
    
    this.dataStreams.get(streamType).set(entityId, {
      ...data,
      lastUpdated: new Date().toISOString()
    });
  }

  getDataStream(streamType, entityId = null) {
    const stream = this.dataStreams.get(streamType);
    if (!stream) return null;
    
    if (entityId) {
      return stream.get(entityId);
    }
    
    return Array.from(stream.values());
  }

  // Subscription management
  subscribe(streamType, callback) {
    if (!this.subscribers.has(streamType)) {
      this.subscribers.set(streamType, new Set());
    }
    this.subscribers.get(streamType).add(callback);
  }

  unsubscribe(streamType, callback) {
    if (this.subscribers.has(streamType)) {
      this.subscribers.get(streamType).delete(callback);
    }
  }

  notifySubscribers(streamType, data) {
    if (this.subscribers.has(streamType)) {
      this.subscribers.get(streamType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  // Statistics and monitoring
  updateProcessingStats(processingTime) {
    this.processingStats.messagesProcessed++;
    this.processingStats.lastProcessedAt = new Date().toISOString();
    
    // Update average processing time
    const currentAvg = this.processingStats.averageProcessingTime;
    const count = this.processingStats.messagesProcessed;
    this.processingStats.averageProcessingTime = 
      (currentAvg * (count - 1) + processingTime) / count;
  }

  getProcessingStats() {
    return {
      ...this.processingStats,
      activeStreams: this.dataStreams.size,
      totalSubscribers: Array.from(this.subscribers.values())
        .reduce((sum, subs) => sum + subs.size, 0),
      isHealthy: this.isHealthy()
    };
  }

  isHealthy() {
    const errorRate = this.processingStats.errorsEncountered / 
                     Math.max(this.processingStats.messagesProcessed, 1);
    return errorRate < 0.05 && this.processingStats.averageProcessingTime < 1000;
  }

  // Cleanup and maintenance
  cleanup() {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    this.dataStreams.forEach((stream, streamType) => {
      stream.forEach((data, entityId) => {
        if (new Date(data.lastUpdated).getTime() < cutoffTime) {
          stream.delete(entityId);
        }
      });
    });
  }
}

module.exports = RealTimeProcessor;