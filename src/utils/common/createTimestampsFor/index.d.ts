import Model from '../../../Model';

export const createTimestampsFor: (
  model: Model,
) => {
  created_at: Date;
  updated_at: Date;
};
