import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { ERROR_CODES } from './errorCodes';
import { DEFAULT_ERROR_MESSAGE, ERROR_MESSAGES, type ErrorMessageCode } from './errorMessages';

const SCREAMING_SNAKE_CODE = /^[A-Z][A-Z0-9_]*$/;

/** Append a stable code so shoppers can reference /errors-message or support. */
export function formatFallbackErrorMessage(message: string, code: string): string {
  const trimmed = message.trim();
  const normalizedCode = code.trim() || ERROR_CODES.UNKNOWN_ERROR;
  if (!trimmed) return `(${normalizedCode})`;
  return `${trimmed} (${normalizedCode})`;
}

type GraphQLErrorLike = {
  message?: string;
  extensions?: { code?: unknown };
};

function codeFromGraphQLError(graphError: GraphQLErrorLike | undefined): string | null {
  const extensionCode = graphError?.extensions?.code;
  if (typeof extensionCode === 'string' && extensionCode.length > 0) {
    return extensionCode;
  }

  const message = graphError?.message?.trim();
  if (message && SCREAMING_SNAKE_CODE.test(message)) {
    return message;
  }

  return null;
}

function codeFromMessage(message: string | undefined): string | null {
  if (!message) return null;
  const trimmed = message.trim();
  if (SCREAMING_SNAKE_CODE.test(trimmed)) {
    return trimmed;
  }

  // Legacy human messages that embed a code, e.g. "Promotion not eligible: GUEST".
  const embedded = trimmed.match(/\b([A-Z][A-Z0-9_]{3,})\b/);
  return embedded?.[1] ?? null;
}

/**
 * Extract a stable error code from Apollo / Nest GraphQL / REST-shaped errors.
 * Prefers `extensions.code`, then treat SCREAMING_SNAKE `message` as the code.
 */
export function extractErrorCode(error: unknown): string | null {
  if (CombinedGraphQLErrors.is(error)) {
    for (const graphError of error.errors) {
      const code = codeFromGraphQLError(graphError);
      if (code) return code;
    }
  }

  if (error && typeof error === 'object') {
    const record = error as {
      graphQLErrors?: GraphQLErrorLike[];
      errors?: GraphQLErrorLike[];
      extensions?: { code?: unknown };
      code?: unknown;
      error?: { code?: unknown; message?: unknown };
      message?: string;
    };

    const nestedCode = record.error?.code;
    if (typeof nestedCode === 'string' && nestedCode.length > 0) {
      return nestedCode;
    }

    if (typeof record.code === 'string' && SCREAMING_SNAKE_CODE.test(record.code)) {
      return record.code;
    }

    const extensionCode = record.extensions?.code;
    if (typeof extensionCode === 'string' && extensionCode.length > 0) {
      return extensionCode;
    }

    for (const graphError of record.graphQLErrors ?? []) {
      const code = codeFromGraphQLError(graphError);
      if (code) return code;
    }

    for (const graphError of record.errors ?? []) {
      const code = codeFromGraphQLError(graphError);
      if (code) return code;
    }

    const fromMessage = codeFromMessage(record.message);
    if (fromMessage) return fromMessage;

    const nestedMessage =
      typeof record.error?.message === 'string' ? record.error.message : undefined;
    const fromNestedMessage = codeFromMessage(nestedMessage);
    if (fromNestedMessage) return fromNestedMessage;
  }

  if (error instanceof Error) {
    return codeFromMessage(error.message);
  }

  return null;
}

export function getErrorMessageByCode(
  code: string | null | undefined,
  fallback: string = DEFAULT_ERROR_MESSAGE,
): string {
  if (!code) {
    return formatFallbackErrorMessage(fallback, ERROR_CODES.UNKNOWN_ERROR);
  }

  const mapped = ERROR_MESSAGES[code as ErrorMessageCode];
  if (mapped) return mapped;

  return formatFallbackErrorMessage(fallback, code);
}

/**
 * Map any thrown / returned error to shopper-facing Thai copy.
 * Catalog hits return Thai only; fallbacks append `(CODE)` for support lookup.
 */
export function getErrorMessage(error: unknown, fallback: string = DEFAULT_ERROR_MESSAGE): string {
  return getErrorMessageByCode(extractErrorCode(error), fallback);
}
