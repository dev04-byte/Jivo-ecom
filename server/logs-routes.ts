import { Express } from 'express';
import { storage } from './storage';
import { authenticateUser, requireAdmin } from './rbac-middleware';

export function setupLogsRoutes(app: Express) {
  // Get system logs (Admin only)
  app.get('/api/admin/logs', 
    authenticateUser,
    requireAdmin,
    async (req, res) => {
      try {
        const {
          module,
          action,
          user_id,
          table_name,
          start_date,
          end_date,
          severity,
          limit = 100,
          offset = 0
        } = req.query;

        const filters: any = {};
        if (module) filters.module = module as string;
        if (action) filters.action = action as string;
        if (user_id) filters.user_id = parseInt(user_id as string);
        if (table_name) filters.table_name = table_name as string;
        if (severity) filters.severity = severity as string;
        if (start_date) filters.start_date = new Date(start_date as string);
        if (end_date) filters.end_date = new Date(end_date as string);
        if (limit) filters.limit = parseInt(limit as string);
        if (offset) filters.offset = parseInt(offset as string);

        const logs = await storage.getLogs(filters);
        res.json(logs);
      } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
      }
    }
  );

  // Get PO activity logs (Admin only)
  app.get('/api/admin/po-logs', 
    authenticateUser,
    requireAdmin,
    async (req, res) => {
      try {
        const {
          po_id,
          po_type,
          activity_type,
          user_id,
          start_date,
          end_date,
          limit = 100,
          offset = 0
        } = req.query;

        const filters: any = {};
        if (po_id) filters.po_id = parseInt(po_id as string);
        if (po_type) filters.po_type = po_type as string;
        if (activity_type) filters.activity_type = activity_type as string;
        if (user_id) filters.user_id = parseInt(user_id as string);
        if (start_date) filters.start_date = new Date(start_date as string);
        if (end_date) filters.end_date = new Date(end_date as string);
        if (limit) filters.limit = parseInt(limit as string);
        if (offset) filters.offset = parseInt(offset as string);

        const logs = await storage.getPOLogs(filters);
        res.json(logs);
      } catch (error) {
        console.error('Error fetching PO logs:', error);
        res.status(500).json({ error: 'Failed to fetch PO logs' });
      }
    }
  );

  // Get PO logs for a specific PO
  app.get('/api/admin/po/:id/logs', 
    authenticateUser,
    requireAdmin,
    async (req, res) => {
      try {
        const poId = parseInt(req.params.id);
        const logs = await storage.getPOLogs({ 
          po_id: poId,
          limit: 500 // Get more logs for specific PO
        });
        res.json(logs);
      } catch (error) {
        console.error('Error fetching PO specific logs:', error);
        res.status(500).json({ error: 'Failed to fetch PO logs' });
      }
    }
  );

  // Get log statistics (Admin only)
  app.get('/api/admin/logs/stats', 
    authenticateUser,
    requireAdmin,
    async (req, res) => {
      try {
        // Get basic statistics about logs
        const allLogs = await storage.getLogs({ limit: 10000 });
        const poLogs = await storage.getPOLogs({ limit: 10000 });

        const stats = {
          total_system_logs: allLogs.length,
          total_po_logs: poLogs.length,
          logs_by_module: {},
          logs_by_severity: {},
          logs_by_action: {},
          po_logs_by_type: {},
          recent_activity: allLogs.slice(0, 10)
        };

        // Aggregate stats
        allLogs.forEach(log => {
          stats.logs_by_module[log.module] = (stats.logs_by_module[log.module] || 0) + 1;
          stats.logs_by_severity[log.severity || 'INFO'] = (stats.logs_by_severity[log.severity || 'INFO'] || 0) + 1;
          stats.logs_by_action[log.action] = (stats.logs_by_action[log.action] || 0) + 1;
        });

        poLogs.forEach(log => {
          stats.po_logs_by_type[log.po_type] = (stats.po_logs_by_type[log.po_type] || 0) + 1;
        });

        res.json(stats);
      } catch (error) {
        console.error('Error fetching log statistics:', error);
        res.status(500).json({ error: 'Failed to fetch log statistics' });
      }
    }
  );

  // Export logs (Admin only)
  app.get('/api/admin/logs/export', 
    authenticateUser,
    requireAdmin,
    async (req, res) => {
      try {
        const {
          module,
          action,
          user_id,
          start_date,
          end_date,
          format = 'csv'
        } = req.query;

        const filters: any = { limit: 50000 }; // Large limit for export
        if (module) filters.module = module as string;
        if (action) filters.action = action as string;
        if (user_id) filters.user_id = parseInt(user_id as string);
        if (start_date) filters.start_date = new Date(start_date as string);
        if (end_date) filters.end_date = new Date(end_date as string);

        const logs = await storage.getLogs(filters);

        if (format === 'csv') {
          const csvHeader = 'ID,Timestamp,Username,User Role,Action,Module,Sub Module,Table Name,Record ID,Field Name,Old Value,New Value,Description,Severity,IP Address\n';
          const csvData = logs.map(log => 
            `${log.id},"${log.timestamp}","${log.username}","${log.user_role || ''}","${log.action}","${log.module}","${log.sub_module || ''}","${log.table_name}",${log.record_id},"${log.field_name || ''}","${log.old_value || ''}","${log.new_value || ''}","${log.description || ''}","${log.severity}","${log.ip_address || ''}"`
          ).join('\n');

          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="system_logs_${new Date().toISOString().split('T')[0]}.csv"`);
          res.send(csvHeader + csvData);
        } else {
          res.json(logs);
        }
      } catch (error) {
        console.error('Error exporting logs:', error);
        res.status(500).json({ error: 'Failed to export logs' });
      }
    }
  );
}