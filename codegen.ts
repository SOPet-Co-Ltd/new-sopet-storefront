import type { CodegenConfig } from '@graphql-codegen/cli';

const schema =
  process.env.GRAPHQL_SCHEMA_PATH ?? '../sopet-backend/src/schema.gql';

const config: CodegenConfig = {
  schema,
  documents: ['src/lib/graphql/operations/**/*.graphql'],
  generates: {
    'src/lib/graphql/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typed-document-node',
      ],
      config: {
        scalars: {
          DateTime: 'string',
        },
      },
    },
  },
};

export default config;
