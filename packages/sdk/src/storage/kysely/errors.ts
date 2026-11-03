const MISSING_TABLE_CODES = new Set(['42P01', 'ER_NO_SUCH_TABLE']);

function isMissingTableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const { code } = error as Error & { code?: unknown };
  if (typeof code === 'string' && MISSING_TABLE_CODES.has(code)) return true;
  return /no such table/i.test(error.message);
}

export function explainMissingTable(tableName: string) {
  return (error: unknown): never => {
    if (!isMissingTableError(error)) throw error;
    throw new Error(
      `The Fiducy table "${tableName}" does not exist yet. Create it with getMigrations() from @fiducy/sdk/storage/kysely, or run the SQL from generateSchema()`,
      { cause: error }
    );
  };
}
