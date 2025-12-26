/**
 * Express HTTP Request Logging Middleware
 * 
 * Logs all incoming HTTP requests and their responses using Pino
 */

import { Request, Response, NextFunction } from 'express'
import { createLogger } from '@/lib/config/logging'

const logger = createLogger('HTTP')

/**
 * Middleware to log HTTP requests and responses
 */
export function httpLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now()
  const method = req.method
  const url = req.url
  const ip = req.ip

  // Log incoming request
  logger.debug({
    method,
    url,
    ip,
    userAgent: req.get('user-agent'),
  }, 'Incoming HTTP request')

  // Capture response
  const originalJson = res.json.bind(res)
  const originalSend = res.send.bind(res)

  let responseBody: any = null

  // Override json to capture response body
  res.json = function (body: any) {
    responseBody = body
    return originalJson(body)
  }

  // Override send to capture response body
  res.send = function (body: any) {
    responseBody = body
    return originalSend(body)
  }

  // Log response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime
    const statusCode = res.statusCode

    const logData = {
      method,
      url,
      statusCode,
      durationMs: duration,
      ip,
    }

    // Log based on status code
    if (statusCode >= 400) {
      logger.error(logData, `HTTP ${statusCode} - ${method} ${url}`)
    } else if (statusCode >= 300) {
      logger.warn(logData, `HTTP ${statusCode} - ${method} ${url}`)
    } else {
      logger.info(logData, `HTTP ${statusCode} - ${method} ${url}`)
    }
  })

  next()
}

export default httpLoggingMiddleware




