import { readFileSync, writeFileSync } from 'node:fs';

const filePath = process.argv[2];
if (!filePath?.endsWith('graphql.ts')) {
  process.exit(0);
}

const duplicateBlocks = [
  '\nexport type RefreshTokenInput = {\n  refreshToken: string;\n};\n',
  '\nexport type ReactivateAccountInput = {\n  reactivationToken: string;\n};\n',
  '\nexport type SendCustomerOtpInput = {\n  phone: string;\n};\n',
  '\nexport type VerifyCustomerOtpInput = {\n  code: string;\n  phone: string;\n  sessionId?: string | null | undefined;\n};\n',
  '\nexport type AddToCartInput = {\n  quantity: number;\n  sessionId?: string | null | undefined;\n  variantId: string;\n};\n',
  '\nexport type RemoveCartItemInput = {\n  itemId: string;\n  sessionId?: string | null | undefined;\n};\n',
  '\nexport type UpdateCartItemInput = {\n  itemId: string;\n  quantity: number;\n  sessionId?: string | null | undefined;\n};\n',
];

const schemaBlocks = [
  "export type RefreshTokenInput = {\n  refreshToken: Scalars['String']['input'];\n};",
  "export type ReactivateAccountInput = {\n  reactivationToken: Scalars['String']['input'];\n};",
  "export type SendCustomerOtpInput = {\n  phone: Scalars['String']['input'];\n};",
  "export type VerifyCustomerOtpInput = {\n  code: Scalars['String']['input'];\n  phone: Scalars['String']['input'];\n  sessionId?: InputMaybe<Scalars['String']['input']>;\n};",
  "export type AddToCartInput = {\n  quantity: Scalars['Int']['input'];\n  sessionId?: InputMaybe<Scalars['String']['input']>;\n  variantId: Scalars['String']['input'];\n};",
  "export type RemoveCartItemInput = {\n  itemId: Scalars['String']['input'];\n  sessionId?: InputMaybe<Scalars['String']['input']>;\n};",
  "export type UpdateCartItemInput = {\n  itemId: Scalars['String']['input'];\n  quantity: Scalars['Int']['input'];\n  sessionId?: InputMaybe<Scalars['String']['input']>;\n};",
];

let content = readFileSync(filePath, 'utf8');

for (let index = 0; index < duplicateBlocks.length; index += 1) {
  const duplicateBlock = duplicateBlocks[index];
  const schemaBlock = schemaBlocks[index];

  if (content.includes(schemaBlock) && content.includes(duplicateBlock)) {
    content = content.replace(duplicateBlock, '\n');
  }
}

writeFileSync(filePath, content);
