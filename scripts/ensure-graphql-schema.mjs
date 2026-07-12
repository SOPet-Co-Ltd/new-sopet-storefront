import { access, mkdir, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname } from 'node:path';

const LOCAL_SCHEMA_CANDIDATES = [
  '../sopet-backend/src/schema.gql',
  'sopet-backend/src/schema.gql',
];

const FETCHED_SCHEMA_PATH = 'sopet-backend/src/schema.gql';

async function pathExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function resolveGitHubOwner() {
  return (
    process.env.GRAPHQL_SCHEMA_GITHUB_OWNER ??
    process.env.VERCEL_GIT_REPO_OWNER ??
    process.env.GITHUB_REPOSITORY_OWNER ??
    'BlackBoxBanner'
  );
}

function resolveGitHubRepo() {
  return process.env.GRAPHQL_SCHEMA_GITHUB_REPO ?? 'new-sopet-backend';
}

function resolveGitHubRef() {
  if (process.env.GRAPHQL_SCHEMA_GITHUB_REF) {
    return process.env.GRAPHQL_SCHEMA_GITHUB_REF;
  }

  const vercelRef = process.env.VERCEL_GIT_COMMIT_REF;
  if (vercelRef?.startsWith('deploy/')) {
    return vercelRef;
  }

  return 'main';
}

async function main() {
  if (process.env.GRAPHQL_SCHEMA_PATH && (await pathExists(process.env.GRAPHQL_SCHEMA_PATH))) {
    console.log(`GraphQL schema found: ${process.env.GRAPHQL_SCHEMA_PATH}`);
    return;
  }

  for (const candidate of LOCAL_SCHEMA_CANDIDATES) {
    if (await pathExists(candidate)) {
      console.log(`GraphQL schema found: ${candidate}`);
      return;
    }
  }

  const owner = resolveGitHubOwner();
  const repo = resolveGitHubRepo();
  const ref = resolveGitHubRef();
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/src/schema.gql`;

  console.log(`Fetching GraphQL schema from ${url}...`);

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Failed to fetch GraphQL schema: ${response.status} ${response.statusText}`);
    console.error(
      'Set GRAPHQL_SCHEMA_GITHUB_OWNER, GRAPHQL_SCHEMA_GITHUB_REPO, or GRAPHQL_SCHEMA_GITHUB_REF to override.',
    );
    process.exit(1);
  }

  const schema = await response.text();
  await mkdir(dirname(FETCHED_SCHEMA_PATH), { recursive: true });
  await writeFile(FETCHED_SCHEMA_PATH, schema);

  console.log(`GraphQL schema saved to ${FETCHED_SCHEMA_PATH} (${schema.length} bytes)`);
}

main();
