import { storage } from './storage';
import type { 
  InsertLogMaster, 
  InsertPOActivityLog, 
  InsertSystemPerformanceLog 
} from '@shared/schema';

export interface LogContext {
  user_id?: number;
  username?: string;
  user_role?: string;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  request_id?: string;
}

export class LoggingService {
  private static instance: LoggingService;
  
  private constructor() {}
  
  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  /**
   * Log general system activities
   */
  async logActivity({
    action,
    module,
    sub_module,
    table_name,
    record_id,
    field_name,
    old_value,
    new_value,
    description,
    severity = 'INFO',
    additional_data,
    context
  }: {
    action: string;
    module: string;
    sub_module?: string;
    table_name: string;
    record_id: number;
    field_name?: string;
    old_value?: string;
    new_value?: string;
    description?: string;
    severity?: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
    additional_data?: any;
    context: LogContext;
  }) {
    try {
      const logData: InsertLogMaster = {
        user_id: context.user_id,
        username: context.username || 'system',
        user_role: context.user_role,
        action,
        module,
        sub_module,
        table_name,
        record_id,
        field_name,
        old_value,
        new_value,
        description,
        severity,
        ip_address: context.ip_address,
        user_agent: context.user_agent,
        session_id: context.session_id,
        request_id: context.request_id,
        additional_data: additional_data ? JSON.stringify(additional_data) : null,
        timestamp: new Date()
      };

      await storage.createLogEntry(logData);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  /**
   * Log Platform/Distributor PO specific activities
   */
  async logPOActivity({
    po_id,
    po_type,
    po_number,
    platform_name,
    activity_type,
    field_changed,
    old_value,
    new_value,
    description,
    context
  }: {
    po_id: number;
    po_type: 'PLATFORM' | 'DISTRIBUTOR';
    po_number: string;
    platform_name?: string;
    activity_type: string;
    field_changed?: string;
    old_value?: string;
    new_value?: string;
    description: string;
    context: LogContext;
  }) {
    try {
      const logData: InsertPOActivityLog = {
        po_id,
        po_type,
        po_number,
        platform_name,
        activity_type,
        field_changed,
        old_value,
        new_value,
        user_id: context.user_id,
        username: context.username || 'system',
        user_role: context.user_role,
        description,
        ip_address: context.ip_address,
        timestamp: new Date()
      };

      await storage.createPOActivityLog(logData);
    } catch (error) {
      console.error('Failed to log PO activity:', error);
    }
  }

  /**
   * Log system performance metrics
   */
  async logPerformance({
    endpoint,
    method,
    response_time_ms,
    status_code,
    user_id,
    error_message,
    request_size,
    response_size
  }: {
    endpoint: string;
    method: string;
    response_time_ms: number;
    status_code: number;
    user_id?: number;
    error_message?: string;
    request_size?: number;
    response_size?: number;
  }) {
    try {
      const logData: InsertSystemPerformanceLog = {
        endpoint,
        method,
        response_time_ms,
        status_code,
        user_id,
        error_message,
        request_size,
        response_size,
        timestamp: new Date()
      };

      await storage.createPerformanceLog(logData);
    } catch (error) {
      console.error('Failed to log performance:', error);
    }
  }

  /**
   * Predefined logging methods for common PO operations
   */
  async logPOCreated(po_id: number, po_type: 'PLATFORM' | 'DISTRIBUTOR', po_number: string, platform_name: string, context: LogContext) {
    await this.logPOActivity({
      po_id,
      po_type,
      po_number,
      platform_name,
      activity_type: 'CREATED',
      description: `${po_type} PO ${po_number} created for ${platform_name}`,
      context
    });
  }

  async logPOUpdated(po_id: number, po_type: 'PLATFORM' | 'DISTRIBUTOR', po_number: string, field_changed: string, old_value: string, new_value: string, context: LogContext) {
    await this.logPOActivity({
      po_id,
      po_type,
      po_number,
      activity_type: 'UPDATED',
      field_changed,
      old_value,
      new_value,
      description: `${po_type} PO ${po_number} field '${field_changed}' updated from '${old_value}' to '${new_value}'`,
      context
    });
  }

  async logPOStatusChanged(po_id: number, po_type: 'PLATFORM' | 'DISTRIBUTOR', po_number: string, old_status: string, new_status: string, context: LogContext) {
    await this.logPOActivity({
      po_id,
      po_type,
      po_number,
      activity_type: 'STATUS_CHANGED',
      field_changed: 'status',
      old_value: old_status,
      new_value: new_status,
      description: `${po_type} PO ${po_number} status changed from '${old_status}' to '${new_status}'`,
      context
    });
  }

  async logPOItemAdded(po_id: number, po_type: 'PLATFORM' | 'DISTRIBUTOR', po_number: string, item_name: string, quantity: number, context: LogContext) {
    await this.logPOActivity({
      po_id,
      po_type,
      po_number,
      activity_type: 'ITEM_ADDED',
      description: `Item '${item_name}' (Qty: ${quantity}) added to ${po_type} PO ${po_number}`,
      context
    });
  }

  async logPOItemRemoved(po_id: number, po_type: 'PLATFORM' | 'DISTRIBUTOR', po_number: string, item_name: string, context: LogContext) {
    await this.logPOActivity({
      po_id,
      po_type,
      po_number,
      activity_type: 'ITEM_REMOVED',
      description: `Item '${item_name}' removed from ${po_type} PO ${po_number}`,
      context
    });
  }

  async logPOAttachmentUploaded(po_id: number, po_type: 'PLATFORM' | 'DISTRIBUTOR', po_number: string, filename: string, context: LogContext) {
    await this.logPOActivity({
      po_id,
      po_type,
      po_number,
      activity_type: 'ATTACHMENT_UPLOADED',
      description: `Attachment '${filename}' uploaded to ${po_type} PO ${po_number}`,
      context
    });
  }

  async logPOViewed(po_id: number, po_type: 'PLATFORM' | 'DISTRIBUTOR', po_number: string, context: LogContext) {
    await this.logPOActivity({
      po_id,
      po_type,
      po_number,
      activity_type: 'VIEWED',
      description: `${po_type} PO ${po_number} viewed by ${context.username}`,
      context
    });
  }

  async logPOExported(po_id: number, po_type: 'PLATFORM' | 'DISTRIBUTOR', po_number: string, export_format: string, context: LogContext) {
    await this.logPOActivity({
      po_id,
      po_type,
      po_number,
      activity_type: 'EXPORTED',
      description: `${po_type} PO ${po_number} exported as ${export_format}`,
      context
    });
  }

  /**
   * Get logs with filtering and pagination
   */
  async getLogs({
    module,
    action,
    user_id,
    table_name,
    start_date,
    end_date,
    severity,
    limit = 100,
    offset = 0
  }: {
    module?: string;
    action?: string;
    user_id?: number;
    table_name?: string;
    start_date?: Date;
    end_date?: Date;
    severity?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    return await storage.getLogs({
      module,
      action,
      user_id,
      table_name,
      start_date,
      end_date,
      severity,
      limit,
      offset
    });
  }

  /**
   * Get PO activity logs
   */
  async getPOLogs({
    po_id,
    po_type,
    activity_type,
    user_id,
    start_date,
    end_date,
    limit = 100,
    offset = 0
  }: {
    po_id?: number;
    po_type?: string;
    activity_type?: string;
    user_id?: number;
    start_date?: Date;
    end_date?: Date;
    limit?: number;
    offset?: number;
  } = {}) {
    return await storage.getPOLogs({
      po_id,
      po_type,
      activity_type,
      user_id,
      start_date,
      end_date,
      limit,
      offset
    });
  }
}

// Export singleton instance
export const logger = LoggingService.getInstance();