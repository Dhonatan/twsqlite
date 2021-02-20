import hasIn from '../../fp/hasIn';

const hasCreatedAt = hasIn('createdAt');
export const hasUpdatedAt = hasIn('updatedAt');

export const createTimestampsFor = model => {
  const date = Date.now();
  const timestamps = {};

  if (!hasCreatedAt(model)) {
    timestamps.created_at = date;
  }

  if (!hasUpdatedAt(model)) {
    timestamps.updated_at = date;
  }

  return timestamps;
};
