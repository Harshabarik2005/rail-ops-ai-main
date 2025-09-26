const { v4: uuidv4 } = require('uuid');

class AlertSystem {
  constructor() {
    this.alerts = [];
    this.alertRules = this.initializeAlertRules();
    this.subscribers = new Map();
    this.alertHistory = [];
  }

  initializeAlertRules() {
    return [
      {
        id: 'delay_threshold',
        type: 'performance',
        condition: (data) => data.delay > 15,
        severity: 'medium',
        title: 'Train Delay Threshold Exceeded',
        description: 'Train delay has exceeded 15 minutes'
      },
      {
        id: 'critical_delay',
        type: 'performance',
        condition: (data) => data.delay > 30,
        severity: 'high',
        title: 'Critical Train Delay',
        description: 'Train delay has exceeded 30 minutes'
      },
      {
        id: 'signal_failure',
        type: 'infrastructure',
        condition: (data) => data.signalStatus === 'failed',
        severity: 'high',
        title: 'Signal System Failure',
        description: 'Critical signal system malfunction detected'
      },
      {
        id: 'track_obstruction',
        type: 'safety',
        condition: (data) => data.trackObstruction === true,
        severity: 'critical',
        title: 'Track Obstruction Detected',
        description: 'Obstruction detected on active track'
      },
      {
        id: 'capacity_exceeded',
        type: 'capacity',
        condition: (data) => data.utilization > 95,
        severity: 'medium',
        title: 'Section Capacity Near Limit',
        description: 'Section utilization has exceeded 95%'
      },
      {
        id: 'maintenance_overdue',
        type: 'maintenance',
        condition: (data) => data.maintenanceOverdue === true,
        severity: 'medium',
        title: 'Maintenance Overdue',
        description: 'Scheduled maintenance is overdue'
      }
    ];
  }

  createAlert(alertData) {
    const alert = {
      id: uuidv4(),
      type: alertData.type,
      severity: alertData.severity,
      title: alertData.title,
      description: alertData.description,
      source: alertData.source || 'system',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      acknowledgedAt: null,
      acknowledgedBy: null,
      resolvedAt: null,
      resolvedBy: null,
      metadata: alertData.metadata || {},
      actions: this.generateRecommendedActions(alertData.type, alertData.severity),
      escalationLevel: 0,
      assignedTo: null,
      notes: []
    };

    this.alerts.unshift(alert);
    this.notifySubscribers('alert_created', alert);
    
    // Auto-escalate critical alerts
    if (alert.severity === 'critical') {
      this.escalateAlert(alert.id);
    }

    return alert;
  }

  generateRecommendedActions(type, severity) {
    const actionMap = {
      'performance': [
        'Review train schedule',
        'Check for conflicts',
        'Consider rerouting',
        'Notify passengers'
      ],
      'infrastructure': [
        'Dispatch maintenance team',
        'Activate backup systems',
        'Implement safety protocols',
        'Update control systems'
      ],
      'safety': [
        'Immediate train halt',
        'Deploy safety personnel',
        'Clear affected area',
        'Investigate cause'
      ],
      'capacity': [
        'Optimize train scheduling',
        'Consider alternate routes',
        'Implement holding patterns',
        'Monitor closely'
      ],
      'maintenance': [
        'Schedule immediate maintenance',
        'Assess safety impact',
        'Plan service disruption',
        'Notify stakeholders'
      ]
    };

    const baseActions = actionMap[type] || ['Investigate issue', 'Take appropriate action'];
    
    if (severity === 'critical') {
      return ['IMMEDIATE ACTION REQUIRED', ...baseActions];
    }
    
    return baseActions;
  }

  getAlerts({ severity, status, limit = 50, offset = 0 } = {}) {
    let filteredAlerts = [...this.alerts];

    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }

    if (status) {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    }

    const total = filteredAlerts.length;
    const data = filteredAlerts.slice(offset, offset + limit);

    return { data, total };
  }

  getAlert(alertId) {
    return this.alerts.find(alert => alert.id === alertId);
  }

  updateAlertStatus(alertId, updateData) {
    const alertIndex = this.alerts.findIndex(alert => alert.id === alertId);
    if (alertIndex === -1) return null;

    const alert = this.alerts[alertIndex];
    const previousStatus = alert.status;

    this.alerts[alertIndex] = {
      ...alert,
      status: updateData.status,
      updatedAt: new Date().toISOString(),
      assignedTo: updateData.assignedTo || alert.assignedTo,
      resolvedAt: updateData.status === 'resolved' ? new Date().toISOString() : alert.resolvedAt,
      resolvedBy: updateData.status === 'resolved' ? updateData.assignedTo : alert.resolvedBy,
      resolution: updateData.resolution || alert.resolution
    };

    // Add status change to notes
    this.alerts[alertIndex].notes.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: 'status_change',
      content: `Status changed from ${previousStatus} to ${updateData.status}`,
      author: updateData.assignedTo || 'system'
    });

    this.notifySubscribers('alert_updated', this.alerts[alertIndex]);
    return this.alerts[alertIndex];
  }

  acknowledgeAlert(alertId, ackData) {
    const alertIndex = this.alerts.findIndex(alert => alert.id === alertId);
    if (alertIndex === -1) return null;

    this.alerts[alertIndex] = {
      ...this.alerts[alertIndex],
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: ackData.acknowledgedBy,
      updatedAt: new Date().toISOString()
    };

    // Add acknowledgment note
    if (ackData.notes) {
      this.alerts[alertIndex].notes.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'acknowledgment',
        content: ackData.notes,
        author: ackData.acknowledgedBy
      });
    }

    this.notifySubscribers('alert_acknowledged', this.alerts[alertIndex]);
    return this.alerts[alertIndex];
  }

  escalateAlert(alertId) {
    const alertIndex = this.alerts.findIndex(alert => alert.id === alertId);
    if (alertIndex === -1) return null;

    this.alerts[alertIndex].escalationLevel += 1;
    this.alerts[alertIndex].updatedAt = new Date().toISOString();

    // Add escalation note
    this.alerts[alertIndex].notes.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: 'escalation',
      content: `Alert escalated to level ${this.alerts[alertIndex].escalationLevel}`,
      author: 'system'
    });

    this.notifySubscribers('alert_escalated', this.alerts[alertIndex]);
    return this.alerts[alertIndex];
  }

  getAlertStatistics(period = '24h') {
    const now = new Date();
    const periodMs = period === '24h' ? 24 * 60 * 60 * 1000 : 
                    period === '7d' ? 7 * 24 * 60 * 60 * 1000 : 
                    30 * 24 * 60 * 60 * 1000;
    
    const cutoffTime = new Date(now.getTime() - periodMs);
    const periodAlerts = this.alerts.filter(alert => 
      new Date(alert.createdAt) >= cutoffTime
    );

    const stats = {
      total: periodAlerts.length,
      active: periodAlerts.filter(a => a.status === 'active').length,
      acknowledged: periodAlerts.filter(a => a.acknowledgedAt !== null).length,
      resolved: periodAlerts.filter(a => a.status === 'resolved').length,
      bySeverity: {
        critical: periodAlerts.filter(a => a.severity === 'critical').length,
        high: periodAlerts.filter(a => a.severity === 'high').length,
        medium: periodAlerts.filter(a => a.severity === 'medium').length,
        low: periodAlerts.filter(a => a.severity === 'low').length
      },
      byType: {},
      averageResolutionTime: this.calculateAverageResolutionTime(periodAlerts),
      escalationRate: periodAlerts.filter(a => a.escalationLevel > 0).length / periodAlerts.length * 100
    };

    // Calculate by type
    const types = [...new Set(periodAlerts.map(a => a.type))];
    types.forEach(type => {
      stats.byType[type] = periodAlerts.filter(a => a.type === type).length;
    });

    return stats;
  }

  calculateAverageResolutionTime(alerts) {
    const resolvedAlerts = alerts.filter(a => a.resolvedAt !== null);
    if (resolvedAlerts.length === 0) return 0;

    const totalTime = resolvedAlerts.reduce((sum, alert) => {
      const created = new Date(alert.createdAt);
      const resolved = new Date(alert.resolvedAt);
      return sum + (resolved.getTime() - created.getTime());
    }, 0);

    return Math.round(totalTime / resolvedAlerts.length / (1000 * 60)); // Return in minutes
  }

  getAlertsBySeverity(severity, limit = 20) {
    return this.alerts
      .filter(alert => alert.severity === severity)
      .slice(0, limit);
  }

  getActiveAlerts() {
    return this.alerts.filter(alert => alert.status === 'active');
  }

  bulkUpdateAlerts(alertIds, updateData) {
    let updated = 0;
    const results = [];

    alertIds.forEach(alertId => {
      const result = this.updateAlertStatus(alertId, updateData);
      if (result) {
        updated++;
        results.push(result);
      }
    });

    return { updated, results };
  }

  deleteAlert(alertId) {
    const alertIndex = this.alerts.findIndex(alert => alert.id === alertId);
    if (alertIndex === -1) return false;

    const deletedAlert = this.alerts.splice(alertIndex, 1)[0];
    this.alertHistory.push({
      ...deletedAlert,
      deletedAt: new Date().toISOString()
    });

    this.notifySubscribers('alert_deleted', deletedAlert);
    return true;
  }

  getAlertTrends(period = '7d', groupBy = 'day') {
    const now = new Date();
    const periodMs = period === '24h' ? 24 * 60 * 60 * 1000 : 
                    period === '7d' ? 7 * 24 * 60 * 60 * 1000 : 
                    30 * 24 * 60 * 60 * 1000;
    
    const cutoffTime = new Date(now.getTime() - periodMs);
    const periodAlerts = this.alerts.filter(alert => 
      new Date(alert.createdAt) >= cutoffTime
    );

    const groupSize = groupBy === 'hour' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const groups = Math.ceil(periodMs / groupSize);

    const trends = Array.from({ length: groups }, (_, i) => {
      const groupStart = new Date(cutoffTime.getTime() + i * groupSize);
      const groupEnd = new Date(groupStart.getTime() + groupSize);
      
      const groupAlerts = periodAlerts.filter(alert => {
        const alertTime = new Date(alert.createdAt);
        return alertTime >= groupStart && alertTime < groupEnd;
      });

      return {
        timestamp: groupStart.toISOString(),
        total: groupAlerts.length,
        critical: groupAlerts.filter(a => a.severity === 'critical').length,
        high: groupAlerts.filter(a => a.severity === 'high').length,
        medium: groupAlerts.filter(a => a.severity === 'medium').length,
        low: groupAlerts.filter(a => a.severity === 'low').length
      };
    });

    return trends;
  }

  // Event monitoring and automatic alert generation
  monitorData(data) {
    this.alertRules.forEach(rule => {
      try {
        if (rule.condition(data)) {
          // Check if similar alert already exists
          const existingAlert = this.alerts.find(alert => 
            alert.type === rule.type && 
            alert.status === 'active' &&
            alert.metadata?.sourceId === data.sourceId
          );

          if (!existingAlert) {
            this.createAlert({
              type: rule.type,
              severity: rule.severity,
              title: rule.title,
              description: rule.description,
              source: 'automated_monitoring',
              metadata: {
                ruleId: rule.id,
                sourceId: data.sourceId,
                triggerData: data
              }
            });
          }
        }
      } catch (error) {
        console.error(`Error evaluating alert rule ${rule.id}:`, error);
      }
    });
  }

  // Subscription management for real-time notifications
  subscribe(channel, callback) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel).add(callback);
  }

  unsubscribe(channel, callback) {
    if (this.subscribers.has(channel)) {
      this.subscribers.get(channel).delete(callback);
    }
  }

  notifySubscribers(channel, data) {
    if (this.subscribers.has(channel)) {
      this.subscribers.get(channel).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in alert subscriber callback:`, error);
        }
      });
    }
  }

  isHealthy() {
    return this.alerts.length < 1000; // Prevent memory issues
  }

  // Initialize with some sample alerts for demo
  initializeSampleAlerts() {
    const sampleAlerts = [
      {
        type: 'performance',
        severity: 'medium',
        title: 'Train 12002 Delayed',
        description: 'Shatabdi Express is running 18 minutes behind schedule',
        source: 'traffic_monitor',
        metadata: { trainId: '12002', delay: 18 }
      },
      {
        type: 'infrastructure',
        severity: 'high',
        title: 'Signal Malfunction at Junction XYZ',
        description: 'Primary signal system showing intermittent failures',
        source: 'signal_monitor',
        metadata: { signalId: 'SIG_XYZ_001', location: 'Junction XYZ' }
      },
      {
        type: 'capacity',
        severity: 'medium',
        title: 'High Section Utilization',
        description: 'Delhi-Kanpur section operating at 96% capacity',
        source: 'capacity_monitor',
        metadata: { sectionId: 'SEC_001', utilization: 96 }
      }
    ];

    sampleAlerts.forEach(alert => this.createAlert(alert));
  }
}

module.exports = AlertSystem;