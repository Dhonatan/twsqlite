import {Collection, Model} from '../index';
import {Condition} from '../QueryDescription';

export default class Query<Record extends Model> {
  public collection: Collection<Record>;

  public constructor(collection: Collection, conditions: Condition);

  public query(query: string, values: []): Promise<{}>;
}
