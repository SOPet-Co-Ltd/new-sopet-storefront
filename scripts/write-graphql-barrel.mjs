import { writeFileSync } from 'node:fs';

const barrelPath = 'src/lib/graphql/generated/graphql.ts';
writeFileSync(barrelPath, "export * from './schema';\nexport * from './operations';\n");
