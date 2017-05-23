import { Record, List } from 'immutable';
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
  static create(survey, outputDefinitions, value) {
    return new VisibilityConditionDefinition({ _id: cuid() }).updateProperties(survey, outputDefinitions, value);
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
  updateProperties(survey, outputDefinitions, valueObj) {
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

    // fixedValueとanswerValueしか設定できない
    if (!S(comparisonType).isEmpty() && !['fixedValue', 'answerValue'].includes(comparisonType)) {
      comparisonType = null;
      newState = newState.set('comparisonType', comparisonType);
    }

    // outputTypeがradioではなくcomparisonTypeが空の場合はvalueもからにする
    let value = newState.getValue();
    if (outputType !== 'radio' && S(comparisonType).isEmpty()) {
      value = null;
      newState = newState.set('value', value);
    }

    // comparisonTypeがfixedValueの場合、数値以外の値がvalueに設定されていたら空にする
    if (comparisonType === 'fixedValue' && !S(value).isNumeric()) {
      value = null;
      newState = newState.set('value', value);
    }

    // comparisonTypeがanswerValueかつvalueに存在しない参照値が入力された場合入力値が空にする
    if (outputType === 'radio' || comparisonType === 'answerValue') {
      const replacer = survey.getReplacer();
      const id = Replacer.extractIdFrom(value);
      if (S(id).isEmpty() || !replacer.validate(value, outputDefinitions)) {
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

  validate(survey, node, page, question, item) {
    let errors = List();
    const location = '表示条件で';
    const outputDefinitionId = this.getOutputDefinitionId();
    const outputDefinitions = survey.findPrecedingOutputDefinition(node.getId());
    const outputDefinition = outputDefinitions.find(od => od.getId() === outputDefinitionId);
    if (!outputDefinition) {
      errors = errors.push(`${location}設問の値が不正です`);
      return errors;
    }

    const outputType = outputDefinition.getOutputType();
    const comparisonType = this.getComparisonType();
    const value = this.getValue();
    if (outputType === 'number' && S(comparisonType).isEmpty()) errors = errors.push(`${location}比較タイプが不正です`);
    if (comparisonType === 'fixedValue' && !S(value).isNumeric()) {
      errors = errors.push(`${location}比較値が不正です`);
    } else if ((outputType === 'number' && comparisonType === 'answerValue') || outputType === 'radio') {
      const replacer = survey.getReplacer();
      const id = Replacer.extractIdFrom(value);
      if (S(id).isEmpty() || !replacer.validate(value, outputDefinitions)) {
        errors = errors.push(`${location}比較値が不正です`);
      }
    }
    if (S(this.getOperator()).isEmpty()) errors = errors.push(`${location}比較方法が不正です`);
    if (S(this.getVisibilityType()).isEmpty()) errors = errors.push(`${location}条件種別が不正です`);
    return errors;
  }
}
