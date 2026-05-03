import { Request, Response, NextFunction } from 'express';
import * as systemService from '../modules/system/system.service';

export const auditLog = (action: string, tableName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    
    // Override res.json to capture the response and log the action
    res.json = function (body: any) {
      const user = (req as any).user;
      
      // We only log if the request was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        systemService.addAuditLog({
          user_id: user ? user.id : null,
          action: action,
          table_name: tableName,
          record_id: body.id || body.insertId || (req.params.id ? Number(req.params.id) : null),
          details: JSON.stringify({
            method: req.method,
            url: req.originalUrl,
            params: req.params,
            body: req.body
          })
        }).catch(err => console.error('Audit Log Error:', err));
      }
      
      return originalJson.call(this, body);
    };
    
    next();
  };
};
