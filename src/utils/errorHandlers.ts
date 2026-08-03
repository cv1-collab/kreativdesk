import { supabase } from '../lib/supabase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleDatabaseError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  console.error(`[Database Error - ${operationType} at ${path}]:`, errMessage);
  throw new Error(errMessage);
}

export const handleFirestoreError = handleDatabaseError;
