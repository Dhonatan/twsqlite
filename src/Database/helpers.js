import {CollectionChangeTypes} from '../Collection/common';

export const operationTypeToCollectionChangeType = input => {
  switch (input) {
    case 'create':
      return CollectionChangeTypes.created;
    case 'update':
      return CollectionChangeTypes.updated;
    case 'show':
      return CollectionChangeTypes.show;
    case 'delete':
      return CollectionChangeTypes.destroyed;
    default:
      throw new Error(`${input} is invalid operation type`);
  }
};
