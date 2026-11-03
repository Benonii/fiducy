import { createTableStatements, resolveTableName } from './sqlSchema.ts';

import type { GenerateSchemaOptions, GeneratedSchemaFile } from './types.ts';

export function generateSchema(options: GenerateSchemaOptions): GeneratedSchemaFile {
  const tableName = resolveTableName(options.tableName);
  const statements = createTableStatements(options.dialect, tableName);
  return {
    language: 'sql',
    suggestedPath: `fiducy_migrations/create_${tableName}.sql`,
    contents: `${statements.join(';\n\n')};\n`
  };
}
