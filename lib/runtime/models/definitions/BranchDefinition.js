import { Record, List } from 'immutable';
import uuid from 'node-uuid';
import ConditionDefinition from './ConditionDefinition';

export const BranchDefinitionRecord = Record({
  id: null,
  type: null,
  conditions: List(),
});

export default class BranchDefinition extends BranchDefinitionRecord {
  static create() {
    const id = uuid.v4();
    const conditions = List().push(ConditionDefinition.create());
    return new BranchDefinition({ id, conditions });
  }

  getId() {
    return this.get('id');
  }

  getType() {
    return this.get('type');
  }

  getConditions() {
    return this.get('conditions');
  }

  findConditionIndex(conditionId) {
    return this.get('conditions').findIndex(condition => condition.getId() === conditionId);
  }
}