import { Record } from 'immutable';
import cuid from 'cuid';

/** ItemのVisibilityを定義するクラス */
export const VisibilityConditionDefinitionRecord = Record({
  _id: null,                // 内部で使用するID
  outputDefinitionId: null, // 参照するOutputDefinitionのID
  comparisonType: null,     // 比較方法, fixedValueまたはanswerValue
  value: null,              // 比較する値
  operator: null,           // 対応する値
  visibilityType: null,     // 条件が真のときにどのような動作をするか。show, hide, disabled, enabledの4つがある
});

export default class VisibilityConditionDefinition extends VisibilityConditionDefinitionRecord {
  static create() {
    return new VisibilityConditionDefinition({ _id: cuid() });
  }

  getId() {
    return this.get('_id');
  }

  getOutputDefinitionId() {
    return this.get('outputDefinitionId');
  }

  getComparisonType() {
    return this.get('comparisonType');
  }

  getValue() {
    return this.get('value');
  }

  getOperator() {
    return this.get('operator');
  }

  getVisibilityType() {
    return this.get('visibilityType');
  }
}
