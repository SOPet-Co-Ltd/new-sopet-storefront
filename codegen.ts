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

const config: CodegenConfig = {
  schema,
  documents: ['src/lib/graphql/operations/**/*.graphql'],
  generates: {
    'src/lib/graphql/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        scalars: {
          DateTime: 'string',
        },
        preResolveTypes: false,
        dedupeFragments: true,
      },
    },
  },
};

export default config;
