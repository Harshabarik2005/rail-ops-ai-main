const express = require('express');
const router = express.Router();
const TrafficOptimizer = require('../services/TrafficOptimizer');

const optimizer = new TrafficOptimizer();

// Get current optimization recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const recommendations = await optimizer.getRecommendations();
    res.json({
      success: true,
      data: recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get optimization recommendations',
      details: error.message
    });
  }
});

// Run optimization for specific section
router.post('/optimize/:sectionId', async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { constraints, objectives } = req.body;
    
    const result = await optimizer.optimizeSection(sectionId, {
      constraints: constraints || {},
      objectives: objectives || ['minimize_delay', 'maximize_throughput']
    });

    res.json({
      success: true,
      data: result,
      sectionId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Optimization failed',
      details: error.message
    });
  }
});

// Get optimization history
router.get('/history', (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  
  const history = optimizer.getOptimizationHistory(parseInt(limit), parseInt(offset));
  
  res.json({
    success: true,
    data: history,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      total: history.length
    }
  });
});

// Get optimization performance metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await optimizer.getPerformanceMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get optimization metrics',
      details: error.message
    });
  }
});

// Apply optimization recommendation
router.post('/apply/:recommendationId', async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const { override = false } = req.body;
    
    const result = await optimizer.applyRecommendation(recommendationId, override);
    
    res.json({
      success: true,
      data: result,
      message: 'Optimization recommendation applied successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to apply recommendation',
      details: error.message
    });
  }
});

// Get conflict resolution suggestions
router.get('/conflicts/resolve', async (req, res) => {
  try {
    const conflicts = await optimizer.detectConflicts();
    const resolutions = await optimizer.generateResolutions(conflicts);
    
    res.json({
      success: true,
      data: {
        conflicts,
        resolutions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate conflict resolutions',
      details: error.message
    });
  }
});

// What-if analysis
router.post('/what-if', async (req, res) => {
  try {
    const { scenario, parameters } = req.body;
    
    if (!scenario) {
      return res.status(400).json({
        success: false,
        error: 'Scenario is required for what-if analysis'
      });
    }

    const analysis = await optimizer.runWhatIfAnalysis(scenario, parameters);
    
    res.json({
      success: true,
      data: analysis,
      scenario,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'What-if analysis failed',
      details: error.message
    });
  }
});

// Get optimization algorithm status
router.get('/status', (req, res) => {
  const status = optimizer.getStatus();
  res.json({
    success: true,
    data: status
  });
});

// Update optimization parameters
router.put('/parameters', async (req, res) => {
  try {
    const { parameters } = req.body;
    
    if (!parameters) {
      return res.status(400).json({
        success: false,
        error: 'Parameters are required'
      });
    }

    await optimizer.updateParameters(parameters);
    
    res.json({
      success: true,
      message: 'Optimization parameters updated successfully',
      data: parameters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update parameters',
      details: error.message
    });
  }
});

module.exports = router;