const express = require('express');
const router = express.Router();
const SimulationEngine = require('../services/SimulationEngine');

const simulationEngine = new SimulationEngine();

// Start a new simulation
router.post('/start', async (req, res) => {
  try {
    const { scenario, parameters, duration } = req.body;
    
    if (!scenario) {
      return res.status(400).json({
        success: false,
        error: 'Scenario is required'
      });
    }

    const simulation = await simulationEngine.startSimulation({
      scenario,
      parameters: parameters || {},
      duration: duration || 3600 // Default 1 hour
    });

    res.json({
      success: true,
      data: simulation,
      message: 'Simulation started successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to start simulation',
      details: error.message
    });
  }
});

// Get simulation status
router.get('/:simulationId/status', (req, res) => {
  try {
    const { simulationId } = req.params;
    const status = simulationEngine.getSimulationStatus(simulationId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Simulation not found'
      });
    }

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get simulation status',
      details: error.message
    });
  }
});

// Get simulation results
router.get('/:simulationId/results', (req, res) => {
  try {
    const { simulationId } = req.params;
    const results = simulationEngine.getSimulationResults(simulationId);
    
    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'Simulation results not found'
      });
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get simulation results',
      details: error.message
    });
  }
});

// Stop simulation
router.post('/:simulationId/stop', (req, res) => {
  try {
    const { simulationId } = req.params;
    const result = simulationEngine.stopSimulation(simulationId);
    
    res.json({
      success: true,
      data: result,
      message: 'Simulation stopped successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to stop simulation',
      details: error.message
    });
  }
});

// Get all simulations
router.get('/', (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    const simulations = simulationEngine.getAllSimulations({
      status,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: simulations.data,
      pagination: {
        total: simulations.total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get simulations',
      details: error.message
    });
  }
});

// Run scenario analysis
router.post('/scenario-analysis', async (req, res) => {
  try {
    const { scenarios, comparisonMetrics } = req.body;
    
    if (!scenarios || !Array.isArray(scenarios)) {
      return res.status(400).json({
        success: false,
        error: 'Scenarios array is required'
      });
    }

    const analysis = await simulationEngine.runScenarioAnalysis(scenarios, comparisonMetrics);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Scenario analysis failed',
      details: error.message
    });
  }
});

// Get simulation templates
router.get('/templates', (req, res) => {
  try {
    const templates = simulationEngine.getSimulationTemplates();
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get simulation templates',
      details: error.message
    });
  }
});

// Export simulation data
router.get('/:simulationId/export', (req, res) => {
  try {
    const { simulationId } = req.params;
    const { format = 'json' } = req.query;
    
    const exportData = simulationEngine.exportSimulationData(simulationId, format);
    
    if (!exportData) {
      return res.status(404).json({
        success: false,
        error: 'Simulation not found'
      });
    }

    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=simulation_${simulationId}.${format}`);
    res.send(exportData);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to export simulation data',
      details: error.message
    });
  }
});

module.exports = router;