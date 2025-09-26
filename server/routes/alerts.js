const express = require('express');
const router = express.Router();
const AlertSystem = require('../services/AlertSystem');

const alertSystem = new AlertSystem();

// Get all alerts
router.get('/', (req, res) => {
  const { severity, status, limit = 50, offset = 0 } = req.query;
  
  try {
    const alerts = alertSystem.getAlerts({
      severity,
      status,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: alerts.data,
      pagination: {
        total: alerts.total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve alerts',
      details: error.message
    });
  }
});

// Get alert by ID
router.get('/:id', (req, res) => {
  try {
    const alert = alertSystem.getAlert(req.params.id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve alert',
      details: error.message
    });
  }
});

// Create new alert
router.post('/', (req, res) => {
  try {
    const { type, severity, title, description, source, metadata } = req.body;
    
    if (!type || !severity || !title) {
      return res.status(400).json({
        success: false,
        error: 'Type, severity, and title are required'
      });
    }

    const alert = alertSystem.createAlert({
      type,
      severity,
      title,
      description,
      source,
      metadata
    });

    res.status(201).json({
      success: true,
      data: alert,
      message: 'Alert created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create alert',
      details: error.message
    });
  }
});

// Update alert status
router.put('/:id/status', (req, res) => {
  try {
    const { status, resolution, assignedTo } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const alert = alertSystem.updateAlertStatus(req.params.id, {
      status,
      resolution,
      assignedTo
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert,
      message: 'Alert status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update alert status',
      details: error.message
    });
  }
});

// Acknowledge alert
router.post('/:id/acknowledge', (req, res) => {
  try {
    const { acknowledgedBy, notes } = req.body;
    
    const alert = alertSystem.acknowledgeAlert(req.params.id, {
      acknowledgedBy,
      notes
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert,
      message: 'Alert acknowledged successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to acknowledge alert',
      details: error.message
    });
  }
});

// Get alert statistics
router.get('/stats/summary', (req, res) => {
  try {
    const { period = '24h' } = req.query;
    const stats = alertSystem.getAlertStatistics(period);

    res.json({
      success: true,
      data: stats,
      period
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get alert statistics',
      details: error.message
    });
  }
});

// Get alerts by severity
router.get('/severity/:level', (req, res) => {
  try {
    const { level } = req.params;
    const { limit = 20 } = req.query;
    
    const alerts = alertSystem.getAlertsBySeverity(level, parseInt(limit));

    res.json({
      success: true,
      data: alerts,
      severity: level
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get alerts by severity',
      details: error.message
    });
  }
});

// Get active alerts
router.get('/status/active', (req, res) => {
  try {
    const activeAlerts = alertSystem.getActiveAlerts();

    res.json({
      success: true,
      data: activeAlerts,
      count: activeAlerts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get active alerts',
      details: error.message
    });
  }
});

// Bulk update alerts
router.put('/bulk/status', (req, res) => {
  try {
    const { alertIds, status, assignedTo } = req.body;
    
    if (!alertIds || !Array.isArray(alertIds) || !status) {
      return res.status(400).json({
        success: false,
        error: 'Alert IDs array and status are required'
      });
    }

    const results = alertSystem.bulkUpdateAlerts(alertIds, {
      status,
      assignedTo
    });

    res.json({
      success: true,
      data: results,
      message: `Updated ${results.updated} alerts successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update alerts',
      details: error.message
    });
  }
});

// Delete alert
router.delete('/:id', (req, res) => {
  try {
    const deleted = alertSystem.deleteAlert(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete alert',
      details: error.message
    });
  }
});

// Get alert trends
router.get('/trends/analysis', (req, res) => {
  try {
    const { period = '7d', groupBy = 'day' } = req.query;
    const trends = alertSystem.getAlertTrends(period, groupBy);

    res.json({
      success: true,
      data: trends,
      period,
      groupBy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get alert trends',
      details: error.message
    });
  }
});

module.exports = router;