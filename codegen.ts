import { existsSync } from 'node:fs';
import type { CodegenConfig } from '@graphql-codegen/cli';

function resolveSchemaPath(): string {
  if (process.env.GRAPHQL_SCHEMA_PATH) {
    return process.env.GRAPHQL_SCHEMA_PATH;
  }

  const candidates = ['../sopet-backend/src/schema.gql', 'sopet-backend/src/schema.gql'];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return '../sopet-backend/src/schema.gql';
}

const schema = resolveSchemaPath();

/**
 * Split schema types from operation documents.
 *
 * @graphql-codegen/typescript-operations v6 re-emits Input types when combined
 * with the `typescript` plugin in the same output file (duplicate identifiers).
 * See: https://github.com/dotansimha/graphql-code-generator/issues/10782
 */
const config: CodegenConfig = {
  schema,
  documents: ['src/lib/graphql/operations/**/*.graphql'],
  generates: {
    'src/lib/graphql/generated/schema.ts': {
      plugins: ['typescript'],
      config: {
        scalars: {
          DateTime: 'string',
        },
      },
    },
    'src/lib/graphql/generated/operations.ts': {
      plugins: ['typescript-operations', 'typed-document-node'],
      config: {
        scalars: {
          DateTime: 'string',
        },
        // Path is relative to the Codegen config file location (project root).
        importSchemaTypesFrom: 'src/lib/graphql/generated/schema',
      },
    },
  },
};

export default config;
