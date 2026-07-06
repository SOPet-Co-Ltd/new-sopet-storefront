import { readFileSync, writeFileSync } from 'node:fs';

const filePath = process.argv[2];
if (!filePath?.endsWith('graphql.ts')) {
  process.exit(0);
}

const duplicateBlock =
  '\nexport type RefreshTokenInput = {\n  refreshToken: string;\n};\n';
const schemaBlock =
  "export type RefreshTokenInput = {\n  refreshToken: Scalars['String']['input'];\n};";

let content = readFileSync(filePath, 'utf8');

if (content.includes(schemaBlock) && content.includes(duplicateBlock)) {
  content = content.replace(duplicateBlock, '\n');
  writeFileSync(filePath, content);
}
