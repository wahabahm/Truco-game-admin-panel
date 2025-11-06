import express from 'express';
import Alert from '../models/Alert.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * Get admin alerts dashboard
 */
router.get('/alerts/dashboard', async (req, res) => {
  try {
    const total = await Alert.countDocuments();
    const active = await Alert.countDocuments({ status: 'active' });
    const acknowledged = await Alert.countDocuments({ status: 'acknowledged' });
    const resolved = await Alert.countDocuments({ status: 'resolved' });
    const dismissed = await Alert.countDocuments({ status: 'dismissed' });

    const recentAlerts = await Alert.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      dashboard: {
        summary: {
          total,
          active,
          acknowledged,
          resolved,
          dismissed
        },
        recentAlerts: recentAlerts.map(alert => ({
          id: alert._id.toString(),
          title: alert.title,
          message: alert.message,
          type: alert.type,
          severity: alert.severity,
          status: alert.status,
          createdAt: alert.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get admin alerts dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * List all alerts (admin)
 */
router.get('/alerts', async (req, res) => {
  try {
    const { status, type, severity } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;

    const alerts = await Alert.find(filter)
      .populate('createdBy', 'name email')
      .populate('acknowledgedBy', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('dismissedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      alerts: alerts.map(alert => ({
        id: alert._id.toString(),
        title: alert.title,
        message: alert.message,
        type: alert.type,
        severity: alert.severity,
        status: alert.status,
        createdBy: alert.createdBy ? {
          id: alert.createdBy._id.toString(),
          name: alert.createdBy.name,
          email: alert.createdBy.email
        } : null,
        acknowledgedBy: alert.acknowledgedBy ? {
          id: alert.acknowledgedBy._id.toString(),
          name: alert.acknowledgedBy.name
        } : null,
        acknowledgedAt: alert.acknowledgedAt,
        resolvedBy: alert.resolvedBy ? {
          id: alert.resolvedBy._id.toString(),
          name: alert.resolvedBy.name
        } : null,
        resolvedAt: alert.resolvedAt,
        dismissedBy: alert.dismissedBy ? {
          id: alert.dismissedBy._id.toString(),
          name: alert.dismissedBy.name
        } : null,
        dismissedAt: alert.dismissedAt,
        relatedMatchId: alert.relatedMatchId?.toString() || null,
        relatedTournamentId: alert.relatedTournamentId?.toString() || null,
        relatedUserId: alert.relatedUserId?.toString() || null,
        metadata: alert.metadata,
        createdAt: alert.createdAt,
        updatedAt: alert.updatedAt
      }))
    });
  } catch (error) {
    console.error('Admin list alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * Get alert by ID (admin)
 */
router.get('/alerts/:id', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('acknowledgedBy', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('dismissedBy', 'name email')
      .lean();

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      alert: {
        id: alert._id.toString(),
        title: alert.title,
        message: alert.message,
        type: alert.type,
        severity: alert.severity,
        status: alert.status,
        createdBy: alert.createdBy ? {
          id: alert.createdBy._id.toString(),
          name: alert.createdBy.name,
          email: alert.createdBy.email
        } : null,
        acknowledgedBy: alert.acknowledgedBy ? {
          id: alert.acknowledgedBy._id.toString(),
          name: alert.acknowledgedBy.name
        } : null,
        acknowledgedAt: alert.acknowledgedAt,
        resolvedBy: alert.resolvedBy ? {
          id: alert.resolvedBy._id.toString(),
          name: alert.resolvedBy.name
        } : null,
        resolvedAt: alert.resolvedAt,
        dismissedBy: alert.dismissedBy ? {
          id: alert.dismissedBy._id.toString(),
          name: alert.dismissedBy.name
        } : null,
        dismissedAt: alert.dismissedAt,
        relatedMatchId: alert.relatedMatchId?.toString() || null,
        relatedTournamentId: alert.relatedTournamentId?.toString() || null,
        relatedUserId: alert.relatedUserId?.toString() || null,
        metadata: alert.metadata,
        createdAt: alert.createdAt,
        updatedAt: alert.updatedAt
      }
    });
  } catch (error) {
    console.error('Admin get alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * Acknowledge alert (admin)
 */
router.post('/alerts/:id/acknowledge', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    if (alert.status === 'resolved' || alert.status === 'dismissed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot acknowledge a resolved or dismissed alert'
      });
    }

    alert.status = 'acknowledged';
    alert.acknowledgedBy = req.user.id;
    alert.acknowledgedAt = new Date();
    await alert.save();

    res.json({
      success: true,
      message: 'Alert acknowledged',
      alert: {
        id: alert._id.toString(),
        status: alert.status,
        acknowledgedAt: alert.acknowledgedAt
      }
    });
  } catch (error) {
    console.error('Admin acknowledge alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * Resolve alert (admin)
 */
router.post('/alerts/:id/resolve', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    if (alert.status === 'dismissed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot resolve a dismissed alert'
      });
    }

    alert.status = 'resolved';
    alert.resolvedBy = req.user.id;
    alert.resolvedAt = new Date();
    await alert.save();

    res.json({
      success: true,
      message: 'Alert resolved',
      alert: {
        id: alert._id.toString(),
        status: alert.status,
        resolvedAt: alert.resolvedAt
      }
    });
  } catch (error) {
    console.error('Admin resolve alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * Dismiss alert (admin)
 */
router.post('/alerts/:id/dismiss', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    if (alert.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot dismiss a resolved alert'
      });
    }

    alert.status = 'dismissed';
    alert.dismissedBy = req.user.id;
    alert.dismissedAt = new Date();
    await alert.save();

    res.json({
      success: true,
      message: 'Alert dismissed',
      alert: {
        id: alert._id.toString(),
        status: alert.status,
        dismissedAt: alert.dismissedAt
      }
    });
  } catch (error) {
    console.error('Admin dismiss alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * Bulk acknowledge alerts (admin)
 */
router.post('/alerts/bulk/acknowledge', [
  body('alertIds').isArray().withMessage('alertIds must be an array'),
  body('alertIds.*').isMongoId().withMessage('Invalid alert ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { alertIds } = req.body;

    const result = await Alert.updateMany(
      {
        _id: { $in: alertIds },
        status: { $in: ['active'] }
      },
      {
        $set: {
          status: 'acknowledged',
          acknowledgedBy: req.user.id,
          acknowledgedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} alerts acknowledged`,
      acknowledgedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Admin bulk acknowledge alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * Get alerts summary/stats (admin)
 */
router.get('/alerts/stats/summary', async (req, res) => {
  try {
    const total = await Alert.countDocuments();
    const active = await Alert.countDocuments({ status: 'active' });
    const acknowledged = await Alert.countDocuments({ status: 'acknowledged' });
    const resolved = await Alert.countDocuments({ status: 'resolved' });
    const dismissed = await Alert.countDocuments({ status: 'dismissed' });

    const byType = await Alert.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const bySeverity = await Alert.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      summary: {
        total,
        active,
        acknowledged,
        resolved,
        dismissed,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        bySeverity: bySeverity.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Admin get alerts summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

