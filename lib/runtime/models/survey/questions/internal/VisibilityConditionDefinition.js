import { Record } from 'immutable';
import cuid from 'cuid';
import S from 'string';
import * as ItemVisibility from '../../../../../constants/ItemVisibility';
import Replacer from '../../../../../Replacer';

/** ItemのVisibilityを定義するクラス */
export const VisibilityConditionDefinitionRecord = Record({
  _id: null,                // 内部で使用するID
  outputDefinitionId: null, // 参照するOutputDefinitionのID
  comparisonType: null,     // 比較方法, fixedValueまたはanswerValue
  value: null,              // 比較する値
  operator: null,           // 対応する値
  visibilityType: ItemVisibility.HIDE,     // 条件が真のときにどのような動作をするか。show, hide の2つがある
});

export default class VisibilityConditionDefinition extends VisibilityConditionDefinitionRecord {
  static create(outputDefinitions, value) {
    return new VisibilityConditionDefinition({ _id: cuid() }).updateProperties(outputDefinitions, value);
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

  /** valueを元に値を更新する */
  updateProperties(outputDefinitions, valueObj) {
    let newState = this;
    if (!valueObj) return null;
    Object.keys(valueObj).forEach((key) => {
      newState = newState.set(key, valueObj[key]);
    });
    if (S(newState.getOutputDefinitionId()).isEmpty()) {
      return null;
    }
    const outputDefinition = outputDefinitions.find(od => od.getId() === newState.getOutputDefinitionId());
    // 存在しないOutputDefinitionならクリアする
    if (!outputDefinition) return null;

    // 指定できない比較タイプが設定されていた場合は比較タイプが空になる
    const outputType = outputDefinition.getOutputType();
    let comparisonType = newState.getComparisonType();
    if ((['checkbox', 'radio'].includes(outputType)) && !S(comparisonType).isEmpty()) {
      comparisonType = null;
      newState = newState.set('comparisonType', comparisonType);
    }

    // comparisonTypeが空の場合はvalueもからにする
    let value = newState.getValue();
    if (S(comparisonType).isEmpty()) {
      value = null;
      newState = newState.set('value', value);
    }

    // comparisonTypeがfixedValueの場合、数値以外の値がvalueに設定されていたら空にする
    if (comparisonType === 'fixedValue' && !S(value).isNumeric()) {
      value = null;
      newState = newState.set('value', value);
    }

    // comparisonTypeがanswerValueかつvalueに存在しない参照値が入力された場合入力値が空にする
    if (comparisonType === 'answerValue') {
      const id = Replacer.extractIdFrom(value);
      if (!outputDefinitions.find(od => od.getId() === id)) {
        // もし存在しないidならvalueを空にする
        value = null;
        newState = newState.set('value', value);
      }
    }

    // 指定できないoperatorが設定されていた場合はoperatorが空になる
    let operator = newState.getOperator();
    if (
      ((['checkbox', 'radio'].includes(outputType)) && !['!!', '!'].includes(operator)) ||
      ((['number'].includes(outputType)) && !['==', '!=', '<', '<=', '>', '>='].includes(operator))
    ) {
      operator = null;
      newState = newState.set('operator', operator);
    }

    return newState;
  }
}
