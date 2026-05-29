import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/// Helper for Firestore Error formatting
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  // Simple console output in this environment since it'll crash otherwise
  console.error(`Firestore Error [${operationType}] at ${path}:`, error);
  throw error;
}
