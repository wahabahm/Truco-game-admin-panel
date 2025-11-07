import express from 'express';
import { body, validationResult } from 'express-validator';
import Alert from '../models/Alert.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/alerts/create:
 *   post:
 *     summary: Create alert
 *     description: Create a new alert with title, message, type, and severity
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *                 example: System Maintenance
 *               message:
 *                 type: string
 *                 example: Scheduled maintenance tonight at 2 AM
 *               type:
 *                 type: string
 *                 enum: [info, warning, error, success, system]
 *                 default: info
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 default: medium
 *               relatedMatchId:
 *                 type: string
 *                 nullable: true
 *               relatedTournamentId:
 *                 type: string
 *                 nullable: true
 *               relatedUserId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Alert created successfully
 *       400:
 *         description: Validation error
 */
/**
 * Create alert
 */
router.post('/create', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('type').optional().isIn(['info', 'warning', 'error', 'success', 'system']),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical'])
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

    const alert = await Alert.create({
      title: req.body.title,
      message: req.body.message,
      type: req.body.type || 'info',
      severity: req.body.severity || 'medium',
      createdBy: req.user.id,
      relatedMatchId: req.body.relatedMatchId || null,
      relatedTournamentId: req.body.relatedTournamentId || null,
      relatedUserId: req.body.relatedUserId || null,
      metadata: req.body.metadata || {}
    });

    res.status(201).json({
      success: true,
      alert: {
        id: alert._id.toString(),
        title: alert.title,
        message: alert.message,
        type: alert.type,
        severity: alert.severity,
        status: alert.status,
        createdAt: alert.createdAt
      }
    });
  } catch (error) {
    logger.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: List alerts
 *     description: Retrieve a list of all alerts with optional filtering
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, acknowledged, resolved, dismissed]
 *         description: Filter alerts by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [info, warning, error, success, system]
 *         description: Filter alerts by type
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter alerts by severity
 *     responses:
 *       200:
 *         description: List of alerts retrieved successfully
 */
/**
 * List alerts
 */
router.get('/', async (req, res) => {
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
    logger.error('List alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/alerts/{id}:
 *   get:
 *     summary: Get alert by ID
 *     description: Retrieve a specific alert by its ID
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert retrieved successfully
 *       404:
 *         description: Alert not found
 */
/**
 * Get alert by ID
 */
router.get('/:id', async (req, res) => {
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
    logger.error('Get alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/alerts/{id}:
 *   post:
 *     summary: Acknowledge alert
 *     description: Mark an alert as acknowledged
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert acknowledged successfully
 *       400:
 *         description: Cannot acknowledge resolved or dismissed alert
 *       404:
 *         description: Alert not found
 */
/**
 * Acknowledge alert
 */
router.post('/:id', async (req, res) => {
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
    logger.error('Acknowledge alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/alerts/{id}/resolve:
 *   post:
 *     summary: Resolve alert
 *     description: Mark an alert as resolved
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert resolved successfully
 *       400:
 *         description: Cannot resolve dismissed alert
 *       404:
 *         description: Alert not found
 */
/**
 * Resolve alert
 */
router.post('/:id/resolve', async (req, res) => {
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
    logger.error('Resolve alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/alerts/{id}/dismiss:
 *   post:
 *     summary: Dismiss alert
 *     description: Mark an alert as dismissed
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert dismissed successfully
 *       400:
 *         description: Cannot dismiss resolved alert
 *       404:
 *         description: Alert not found
 */
/**
 * Dismiss alert
 */
router.post('/:id/dismiss', async (req, res) => {
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
    logger.error('Dismiss alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/alerts/stats/summary:
 *   get:
 *     summary: Get alerts summary
 *     description: Returns summary statistics for alerts grouped by status, type, and severity
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alerts summary retrieved successfully
 */
/**
 * Get alerts summary/stats
 */
router.get('/stats/summary', async (req, res) => {
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
    logger.error('Get alerts summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/alerts/bulk/acknowledge:
 *   post:
 *     summary: Bulk acknowledge alerts
 *     description: Acknowledge multiple alerts at once
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alertIds
 *             properties:
 *               alertIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["alert_id_1", "alert_id_2"]
 *     responses:
 *       200:
 *         description: Alerts acknowledged successfully
 *       400:
 *         description: Validation error
 */
/**
 * Bulk acknowledge alerts
 */
router.post('/bulk/acknowledge', [
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
    logger.error('Bulk acknowledge alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

