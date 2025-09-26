const { v4: uuidv4 } = require('uuid');

class SimulationEngine {
  constructor() {
    this.activeSimulations = new Map();
    this.simulationHistory = [];
    this.templates = this.initializeTemplates();
  }

  initializeTemplates() {
    return {
      'rush_hour': {
        name: 'Rush Hour Traffic',
        description: 'Simulate peak hour traffic with increased train frequency',
        parameters: {
          trainFrequency: 2.5,
          passengerLoad: 0.9,
          duration: 3600,
          weatherConditions: 'normal'
        },
        objectives: ['minimize_delay', 'maximize_throughput', 'passenger_satisfaction']
      },
      'emergency_scenario': {
        name: 'Emergency Response',
        description: 'Simulate emergency situations and response protocols',
        parameters: {
          emergencyType: 'track_obstruction',
          affectedSections: ['SEC_001', 'SEC_002'],
          duration: 7200,
          responseTime: 300
        },
        objectives: ['minimize_disruption', 'safety_compliance', 'recovery_time']
      },
      'maintenance_window': {
        name: 'Maintenance Operations',
        description: 'Simulate planned maintenance impact on operations',
        parameters: {
          maintenanceType: 'track_renewal',
          blockedSections: ['SEC_003'],
          duration: 14400,
          alternativeRoutes: true
        },
        objectives: ['minimize_passenger_impact', 'optimize_resources', 'schedule_adherence']
      },
      'weather_impact': {
        name: 'Adverse Weather',
        description: 'Simulate operations during severe weather conditions',
        parameters: {
          weatherType: 'heavy_rain',
          visibility: 0.3,
          speedRestrictions: 0.6,
          duration: 5400
        },
        objectives: ['safety_first', 'minimize_cancellations', 'passenger_communication']
      }
    };
  }

  async startSimulation(config) {
    const simulationId = uuidv4();
    const startTime = new Date();
    
    const simulation = {
      id: simulationId,
      scenario: config.scenario,
      parameters: config.parameters,
      duration: config.duration,
      startTime: startTime.toISOString(),
      status: 'running',
      progress: 0,
      results: null,
      metrics: {
        trainsProcessed: 0,
        conflictsDetected: 0,
        optimizationsApplied: 0,
        averageDelay: 0
      }
    };

    this.activeSimulations.set(simulationId, simulation);
    
    // Start simulation process
    this.runSimulation(simulationId);
    
    return {
      simulationId,
      status: 'started',
      estimatedCompletion: new Date(Date.now() + config.duration * 1000).toISOString()
    };
  }

  async runSimulation(simulationId) {
    const simulation = this.activeSimulations.get(simulationId);
    if (!simulation) return;

    const totalSteps = 100;
    const stepDuration = (simulation.duration * 1000) / totalSteps;

    for (let step = 0; step < totalSteps && simulation.status === 'running'; step++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      
      // Update simulation progress and metrics
      simulation.progress = ((step + 1) / totalSteps) * 100;
      simulation.metrics = this.updateSimulationMetrics(simulation, step);
      
      // Simulate events during the simulation
      if (step % 10 === 0) {
        this.simulateRandomEvent(simulation);
      }
    }

    if (simulation.status === 'running') {
      this.completeSimulation(simulationId);
    }
  }

  updateSimulationMetrics(simulation, step) {
    const baseMetrics = simulation.metrics;
    
    return {
      trainsProcessed: baseMetrics.trainsProcessed + Math.floor(Math.random() * 3),
      conflictsDetected: baseMetrics.conflictsDetected + (Math.random() < 0.1 ? 1 : 0),
      optimizationsApplied: baseMetrics.optimizationsApplied + (Math.random() < 0.2 ? 1 : 0),
      averageDelay: Math.max(0, baseMetrics.averageDelay + (Math.random() - 0.5) * 2),
      currentStep: step,
      throughput: 85 + Math.random() * 15,
      efficiency: 78 + Math.random() * 20,
      safetyScore: 95 + Math.random() * 5
    };
  }

  simulateRandomEvent(simulation) {
    const events = [
      'train_delay',
      'signal_failure',
      'weather_change',
      'emergency_stop',
      'maintenance_required',
      'passenger_incident'
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    
    if (!simulation.events) {
      simulation.events = [];
    }

    simulation.events.push({
      id: uuidv4(),
      type: event,
      timestamp: new Date().toISOString(),
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      description: this.getEventDescription(event),
      impact: this.calculateEventImpact(event)
    });
  }

  getEventDescription(eventType) {
    const descriptions = {
      'train_delay': 'Express train experiencing mechanical issues',
      'signal_failure': 'Signal system malfunction at Junction XYZ',
      'weather_change': 'Sudden weather deterioration affecting visibility',
      'emergency_stop': 'Emergency brake activation due to track obstruction',
      'maintenance_required': 'Urgent track maintenance needed',
      'passenger_incident': 'Medical emergency requiring train halt'
    };

    return descriptions[eventType] || 'Unspecified operational event';
  }

  calculateEventImpact(eventType) {
    const impacts = {
      'train_delay': { delay: 15, throughput: -5, safety: 0 },
      'signal_failure': { delay: 25, throughput: -15, safety: -10 },
      'weather_change': { delay: 10, throughput: -8, safety: -5 },
      'emergency_stop': { delay: 30, throughput: -20, safety: 5 },
      'maintenance_required': { delay: 45, throughput: -25, safety: -15 },
      'passenger_incident': { delay: 12, throughput: -3, safety: 0 }
    };

    return impacts[eventType] || { delay: 0, throughput: 0, safety: 0 };
  }

  completeSimulation(simulationId) {
    const simulation = this.activeSimulations.get(simulationId);
    if (!simulation) return;

    simulation.status = 'completed';
    simulation.endTime = new Date().toISOString();
    simulation.progress = 100;
    
    // Generate final results
    simulation.results = this.generateSimulationResults(simulation);
    
    // Move to history
    this.simulationHistory.push({ ...simulation });
    
    // Keep only last 50 simulations in history
    if (this.simulationHistory.length > 50) {
      this.simulationHistory = this.simulationHistory.slice(-50);
    }
  }

  generateSimulationResults(simulation) {
    const events = simulation.events || [];
    const totalDelay = events.reduce((sum, event) => sum + (event.impact?.delay || 0), 0);
    const totalThroughputImpact = events.reduce((sum, event) => sum + (event.impact?.throughput || 0), 0);
    
    return {
      summary: {
        totalTrainsProcessed: simulation.metrics.trainsProcessed,
        totalEvents: events.length,
        averageDelay: simulation.metrics.averageDelay,
        throughputEfficiency: Math.max(0, 90 + totalThroughputImpact),
        safetyScore: simulation.metrics.safetyScore,
        operationalCost: Math.floor(Math.random() * 100000) + 50000
      },
      performance: {
        punctualityRate: Math.max(0, 95 - totalDelay / 10),
        resourceUtilization: 85 + Math.random() * 10,
        passengerSatisfaction: Math.max(0, 4.5 - totalDelay / 100),
        energyEfficiency: 78 + Math.random() * 15,
        conflictResolutionRate: simulation.metrics.conflictsDetected > 0 ? 
          (simulation.metrics.optimizationsApplied / simulation.metrics.conflictsDetected) * 100 : 100
      },
      recommendations: this.generateRecommendations(simulation),
      detailedMetrics: {
        hourlyThroughput: this.generateHourlyData(),
        delayDistribution: this.generateDelayDistribution(),
        resourceUsage: this.generateResourceUsage(),
        costBreakdown: this.generateCostBreakdown()
      },
      events: events
    };
  }

  generateRecommendations(simulation) {
    const recommendations = [];
    const events = simulation.events || [];
    
    if (events.some(e => e.type === 'signal_failure')) {
      recommendations.push({
        type: 'infrastructure',
        priority: 'high',
        title: 'Upgrade Signal Systems',
        description: 'Implement redundant signaling to prevent failures',
        estimatedCost: 2500000,
        expectedBenefit: 'Reduce signal-related delays by 80%'
      });
    }

    if (simulation.metrics.averageDelay > 15) {
      recommendations.push({
        type: 'operational',
        priority: 'medium',
        title: 'Optimize Train Scheduling',
        description: 'Adjust timetables to reduce congestion',
        estimatedCost: 50000,
        expectedBenefit: 'Improve punctuality by 15%'
      });
    }

    if (events.some(e => e.type === 'maintenance_required')) {
      recommendations.push({
        type: 'maintenance',
        priority: 'high',
        title: 'Predictive Maintenance Program',
        description: 'Implement IoT sensors for proactive maintenance',
        estimatedCost: 1200000,
        expectedBenefit: 'Reduce unplanned maintenance by 60%'
      });
    }

    return recommendations;
  }

  generateHourlyData() {
    const hours = 24;
    return Array.from({ length: hours }, (_, i) => ({
      hour: i,
      throughput: 80 + Math.random() * 40,
      delays: Math.random() * 20,
      efficiency: 75 + Math.random() * 20
    }));
  }

  generateDelayDistribution() {
    return {
      '0-5min': 65 + Math.random() * 10,
      '5-15min': 20 + Math.random() * 8,
      '15-30min': 10 + Math.random() * 5,
      '30min+': 5 + Math.random() * 3
    };
  }

  generateResourceUsage() {
    return {
      tracks: 85 + Math.random() * 10,
      platforms: 78 + Math.random() * 15,
      signals: 92 + Math.random() * 5,
      personnel: 88 + Math.random() * 8
    };
  }

  generateCostBreakdown() {
    return {
      fuel: Math.floor(Math.random() * 50000) + 30000,
      personnel: Math.floor(Math.random() * 30000) + 20000,
      maintenance: Math.floor(Math.random() * 25000) + 15000,
      delays: Math.floor(Math.random() * 20000) + 5000,
      other: Math.floor(Math.random() * 15000) + 5000
    };
  }

  getSimulationStatus(simulationId) {
    const simulation = this.activeSimulations.get(simulationId) || 
                     this.simulationHistory.find(s => s.id === simulationId);
    return simulation;
  }

  getSimulationResults(simulationId) {
    const simulation = this.getSimulationStatus(simulationId);
    return simulation?.results;
  }

  stopSimulation(simulationId) {
    const simulation = this.activeSimulations.get(simulationId);
    if (!simulation) {
      throw new Error('Simulation not found or already completed');
    }

    simulation.status = 'stopped';
    simulation.endTime = new Date().toISOString();
    
    // Generate partial results
    simulation.results = this.generateSimulationResults(simulation);
    
    return {
      simulationId,
      status: 'stopped',
      finalProgress: simulation.progress
    };
  }

  getAllSimulations({ status, limit = 20, offset = 0 } = {}) {
    let allSimulations = [
      ...Array.from(this.activeSimulations.values()),
      ...this.simulationHistory
    ];

    if (status) {
      allSimulations = allSimulations.filter(s => s.status === status);
    }

    const total = allSimulations.length;
    const data = allSimulations
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(offset, offset + limit);

    return { data, total };
  }

  async runScenarioAnalysis(scenarios, comparisonMetrics = []) {
    const results = [];
    
    for (const scenario of scenarios) {
      const simulationConfig = {
        scenario: scenario.name,
        parameters: scenario.parameters,
        duration: scenario.duration || 3600
      };
      
      // Run quick simulation for analysis
      const quickResults = await this.runQuickSimulation(simulationConfig);
      results.push({
        scenario: scenario.name,
        results: quickResults,
        metrics: this.extractComparisonMetrics(quickResults, comparisonMetrics)
      });
    }

    return {
      scenarios: results,
      comparison: this.compareScenarios(results, comparisonMetrics),
      recommendations: this.generateScenarioRecommendations(results)
    };
  }

  async runQuickSimulation(config) {
    // Simplified simulation for quick analysis
    return {
      throughput: 80 + Math.random() * 20,
      averageDelay: Math.random() * 25,
      efficiency: 75 + Math.random() * 20,
      cost: Math.floor(Math.random() * 100000) + 50000,
      safetyScore: 90 + Math.random() * 10,
      passengerSatisfaction: 3.5 + Math.random() * 1.5
    };
  }

  extractComparisonMetrics(results, metrics) {
    if (metrics.length === 0) {
      return results;
    }
    
    const extracted = {};
    metrics.forEach(metric => {
      if (results[metric] !== undefined) {
        extracted[metric] = results[metric];
      }
    });
    
    return extracted;
  }

  compareScenarios(results, metrics) {
    const comparison = {};
    
    metrics.forEach(metric => {
      const values = results.map(r => r.metrics[metric] || r.results[metric]);
      comparison[metric] = {
        best: Math.max(...values),
        worst: Math.min(...values),
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        bestScenario: results[values.indexOf(Math.max(...values))].scenario
      };
    });
    
    return comparison;
  }

  generateScenarioRecommendations(results) {
    const bestOverall = results.reduce((best, current) => {
      const bestScore = (best.results.throughput + best.results.efficiency - best.results.averageDelay) / 3;
      const currentScore = (current.results.throughput + current.results.efficiency - current.results.averageDelay) / 3;
      return currentScore > bestScore ? current : best;
    });

    return [
      {
        type: 'best_scenario',
        title: `Implement ${bestOverall.scenario} Strategy`,
        description: 'This scenario showed the best overall performance',
        priority: 'high'
      }
    ];
  }

  getSimulationTemplates() {
    return this.templates;
  }

  exportSimulationData(simulationId, format = 'json') {
    const simulation = this.getSimulationStatus(simulationId);
    if (!simulation) return null;

    if (format === 'csv') {
      return this.convertToCSV(simulation);
    }
    
    return JSON.stringify(simulation, null, 2);
  }

  convertToCSV(simulation) {
    const events = simulation.events || [];
    let csv = 'Timestamp,Event Type,Severity,Description,Delay Impact\n';
    
    events.forEach(event => {
      csv += `${event.timestamp},${event.type},${event.severity},"${event.description}",${event.impact?.delay || 0}\n`;
    });
    
    return csv;
  }

  isHealthy() {
    return this.activeSimulations.size < 10; // Limit concurrent simulations
  }
}

module.exports = SimulationEngine;