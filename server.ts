/**
 * Express + Next.js Custom Server
 * 
 * Bootstraps Express with Next.js and performs tenant validation on startup.
 * Tenant validation must succeed before the server starts accepting requests.
 */

import express, { Express, Request, Response } from 'express'
import next from 'next'
import { validateTenantOnStartup } from './lib/startup/tenant-validation'
import { createLogger } from './lib/config/logging'
import sessionMiddleware from './server/middleware/session'
import httpLoggingMiddleware from './server/middleware/http-logging'
import authRoutes from './server/routes/auth'
import graphqlRoutes from './server/routes/graphql'

const logger = createLogger('Server')

const port = parseInt(process.env.PORT || '4000', 10)
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()

/**
 * Main bootstrap function
 */
async function bootstrap() {
  try {
    logger.info('🚀 Starting Next.js preparation...')
    await nextApp.prepare()
    logger.info('✅ Next.js prepared')

    const server: Express = express()

    // Middleware
    server.use(express.json())
    server.use(express.urlencoded({ extended: true }))

    // ====================================================================
    // TENANT VALIDATION ON STARTUP
    // ====================================================================
    
    logger.info('🔐 Validating tenant configuration...')
    const tenantResult = await validateTenantOnStartup()

    if (!tenantResult.success) {
      logger.error(
        { error: tenantResult.error },
        '❌ Tenant validation failed'
      )
      logger.error('Cannot start server without valid tenant configuration')
      process.exit(1)
    }

    logger.info(
      {
        tenantId: tenantResult.tenantId,
        tenantName: tenantResult.tenantName,
        tenantSlug: tenantResult.tenantSlug,
      },
      '✅ Tenant validation successful'
    )

    // ====================================================================
    // MIDDLEWARE
    // ====================================================================

    // HTTP request logging middleware (logs all requests/responses)
    server.use(httpLoggingMiddleware)

    // Body parser middleware
    server.use(express.json())
    server.use(express.urlencoded({ extended: true }))

    // Session validation middleware
    server.use(sessionMiddleware)

    // ====================================================================
    // API ROUTES
    // ====================================================================

    // Health check endpoint
    server.get('/health', (_req: Request, res: Response) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: dev ? 'development' : 'production',
        tenantId: tenantResult.tenantId,
      })
    })

    // Authentication routes
    server.use('/api/auth', authRoutes)

    // GraphQL route
    server.use('/api/graphql', graphqlRoutes)

    // ====================================================================
    // NEXT.JS HANDLER
    // ====================================================================

    // All other routes are handled by Next.js
    server.all(/.*/, (_req: Request, res: Response) => {
      return handle(_req, res)
    })

    // ====================================================================
    // START SERVER
    // ====================================================================

    server.listen(port, () => {
      logger.info(
        {
          port,
          url: `http://localhost:${port}`,
          environment: dev ? 'development' : 'production',
        },
        '✅ Server ready'
      )
    })

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully')
      process.exit(0)
    })

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully')
      process.exit(0)
    })
  } catch (error: any) {
    logger.error('❌ Failed to bootstrap server')
    logger.error({ 
      message: error?.message || 'Unknown error',
      originalPath: error?.originalPath,
      name: error?.name,
      stack: error?.stack
    })
    process.exit(1)
  }
}

// Run bootstrap
bootstrap()

