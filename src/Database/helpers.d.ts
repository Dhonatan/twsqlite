export type BatchOperationType = 'create' | 'update' | 'delete' | 'show';

export function operationTypeToCollectionChangeType(
  input: BatchOperationType,
): string;
