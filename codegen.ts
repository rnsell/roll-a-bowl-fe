import type { CodegenConfig } from '@graphql-codegen/cli'

/**
 * GraphQL Code Generation Configuration
 *
 * This BFF app proxies GraphQL requests to a backend API.
 * The schema URL should point to the actual backend GraphQL server.
 *
 * Configure via environment variables:
 * - GRAPHQL_SCHEMA_URL: The backend GraphQL endpoint (required for codegen)
 *   Example: http://localhost:3000/graphql
 *   Example: https://api.example.com/graphql
 */

const schemaUrl = process.env.GRAPHQL_SCHEMA_URL
if (!schemaUrl) {
  console.warn(
    'Warning: GRAPHQL_SCHEMA_URL environment variable not set. ' +
    'Set it to your backend GraphQL endpoint for code generation. ' +
    'Example: GRAPHQL_SCHEMA_URL=http://localhost:3000/graphql npm run generate'
  )
}

const config: CodegenConfig = {
  schema: schemaUrl || 'http://localhost:3000/graphql',

  documents: [
    'lib/graphql/operations.ts',
    'src/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.generated.ts',
  ],

  generates: {
    './lib/graphql/generated/': {
      preset: 'client',
      plugins: [],
      config: {
        scalars: {
          DateTime: 'string',
          Date: 'string',
          JSON: 'Record<string, any>',
        },
        useTypeImports: true,
        enumsAsTypes: true,
      },
    },
  },

  ignoreNoDocuments: true,
  watch: process.env.NODE_ENV === 'development',
}

export default config
