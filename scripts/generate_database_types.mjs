import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase URL or Service Role Key!");
  process.exit(1);
}

function mapOpenApiTypeToTs(prop) {
  if (!prop) return 'any';
  
  if (prop.format === 'uuid' || prop.type === 'string') {
    if (prop.format === 'timestamp with time zone' || prop.format === 'date') return 'string';
    return 'string';
  }
  if (prop.type === 'integer' || prop.type === 'number') return 'number';
  if (prop.type === 'boolean') return 'boolean';
  if (prop.type === 'array') {
    if (prop.items) {
      return `${mapOpenApiTypeToTs(prop.items)}[]`;
    }
    return 'any[]';
  }
  if (prop.type === 'object') {
    return 'Json';
  }
  return 'any';
}

async function generateDatabaseTypes() {
  console.log("Fetching live OpenAPI schema from Supabase...");
  const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${serviceKey}`);
  const openApi = await res.json();
  const definitions = openApi.definitions || {};

  let tsContent = `// ============================================================================
// AUTOMATICALLY GENERATED SUPABASE DATABASE SCHEMA TYPES
// Single Source of Truth for PostgreSQL Tables & PostgREST API
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
`;

  const tableNames = Object.keys(definitions).sort();
  console.log(`Generating types for ${tableNames.length} tables...`);

  for (const tableName of tableNames) {
    const tableDef = definitions[tableName];
    const properties = tableDef.properties || {};
    const required = tableDef.required || [];

    // ROW type (everything returned on SELECT)
    let rowFields = '';
    // INSERT type (required fields without default are required, others optional)
    let insertFields = '';
    // UPDATE type (all fields optional)
    let updateFields = '';

    for (const [colName, prop] of Object.entries(properties)) {
      const tsType = mapOpenApiTypeToTs(prop);
      const isNullable = !required.includes(colName);
      const hasDefault = prop.default !== undefined;

      // Row: if nullable, type is T | null
      rowFields += `          ${colName}: ${tsType}${isNullable ? ' | null' : ''};\n`;

      // Insert: required if NOT nullable AND no default
      const isInsertRequired = required.includes(colName) && !hasDefault;
      insertFields += `          ${colName}${isInsertRequired ? '' : '?'}: ${tsType}${isNullable ? ' | null' : ''};\n`;

      // Update: always optional
      updateFields += `          ${colName}?: ${tsType}${isNullable ? ' | null' : ''};\n`;
    }

    tsContent += `      ${tableName}: {
        Row: {
${rowFields}        };
        Insert: {
${insertFields}        };
        Update: {
${updateFields}        };
        Relationships: [];
      };
`;
  }

  tsContent += `    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
`;

  const targetPath = path.resolve('./src/types/database.types.ts');
  fs.writeFileSync(targetPath, tsContent, 'utf8');
  console.log(`✅ Successfully generated ${targetPath} (${tableNames.length} tables).`);
}

generateDatabaseTypes().catch(err => {
  console.error("Error generating database types:", err);
  process.exit(1);
});
