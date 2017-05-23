import cuid from 'cuid';
import { Record, List } from 'immutable';
import classNames from 'classnames';
import ChoiceDefinition from './ChoiceDefinition';
import * as ItemVisibility from '../../../../../constants/ItemVisibility';

export const ItemRecord = Record({
  _id: null,                    // ID
  index: -1,                    // 定義順
  label: '',                    // HTMLとして評価されるラベル
  plainLabel: '',               // TEXTとして評価されるラベル
  value: '',                    // 値を指定したい場合に指定する
  additionalInput: false,       // 選択肢にテキスト入力を追加する場合true
  additionalInputType: 'text',  // 選択肢にテキスト入力する際の入力タイプ: textまたはnumber
  unit: '',                     // 単位
  randomFixed: false,           // 表示順ランダムで、この項目の配置を固定する場合にtrue
  exclusive: false,             // 排他の項目の場合true
  visibilityCondition: null,       // 表示条件

  totalEqualTo: '',             // 合計値のバリデーション
});

export default class ItemDefinition extends ItemRecord {
  static create(index, value = '', label = '名称未設定') {
    return new ItemDefinition({ _id: cuid(), index, value, label, plainLabel: label });
  }

  getId() {
    return this.get('_id');
  }

  getIndex() {
    return this.get('index');
  }

  getLabel() {
    return this.get('label');
  }

  getPlainLabel() {
    return this.get('plainLabel');
  }

  getValue() {
    return this.get('value');
  }

  hasAdditionalInput() {
    return this.get('additionalInput');
  }

  isRandomFixed() {
    return this.get('randomFixed');
  }

  isExclusive() {
    return this.get('exclusive');
  }

  getVisibilityCondition() {
    return this.get('visibilityCondition');
  }

  getAdditionalInputType() {
    return this.get('additionalInputType');
  }

  getUnit() {
    return this.get('unit');
  }

  getMinCheckCount() {
    return this.get('minCheckCount');
  }

  getMaxCheckCount() {
    return this.get('maxCheckCount');
  }

  getChoiceDefinition() {
    return new ChoiceDefinition({
      _id: this.getId(),
      label: this.getPlainLabel(),
      value: `${this.getIndex() + 1}`,
    });
  }

  getTotalEqualTo() {
    return this.get('totalEqualTo');
  }

  /** visibilityConditionを評価した結果を返す */
  isVisibilityConditionMatch(survey, answers) {
    const visibilityCondition = this.getVisibilityCondition();
    if (!visibilityCondition) return true; // 設定されていない場合は無条件で表示

    const outputDefinition = survey.findOutputDefinition(visibilityCondition.getOutputDefinitionId());
    if (!outputDefinition) return true; // すでに削除されているoutputDefinitionの場合。設定されていないとみなしtrueを返す
    const op = visibilityCondition.getOperator();

    const answerValue = answers.get(outputDefinition.getName());
    survey.refreshReplacer(answers.toJS());
    const replacer = survey.getReplacer();
    const value = replacer.id2Value(visibilityCondition.getValue());

    switch (op) {
      case '!!': // trueまたはfalseか。false, undefined, null, 0, '0', ''の場合にはfalseになる。回答データは文字列で扱うため、文字列の'0'もfalse扱いとする。
        return (
          !!answerValue &&
          answerValue !== '0'
        ).toString() === 'true';
      case '!': // trueまたはfalseか。false, undefined, null, 0, '0', ''の場合にはfalseになる。回答データは文字列で扱うため、文字列の'0'もfalse扱いとする。
        return (
          !!answerValue &&
          answerValue !== '0'
        ).toString() === 'false';
      case '==':
        return answerValue === value;
      case '!=':
        return answerValue !== value;
      case '>=':
        return parseFloat(answerValue) >= parseFloat(value);
      case '<=':
        return parseFloat(answerValue) <= parseFloat(value);
      case '>':
        return parseFloat(answerValue) > parseFloat(value);
      case '<':
        return parseFloat(answerValue) < parseFloat(value);
      case null:
        return true; // まだ定義されていない状態。edit時に発生する
      default:
        throw new Error(`未定義のoperatorです。operator: ${op}`);
    }
  }

  /** isVisibilityConditionMatchの結果をもとに設定するclassを返す */
  calcVisibilityClassName(survey, answers) {
    const visibilityCondition = this.getVisibilityCondition();
    // 設定されていない場合はshow
    if (!visibilityCondition) {
      return 'show';
    }
    const visibilityType = visibilityCondition.getVisibilityType();
    if (this.isVisibilityConditionMatch(survey, answers)) {
      switch (visibilityType) {
        case ItemVisibility.HIDE:
          return 'hidden';
        case ItemVisibility.SHOW:
          return 'show';
        default:
          return 'show';
      }
    } else {
      switch (visibilityType) {
        case ItemVisibility.HIDE:
          return 'show';
        case ItemVisibility.SHOW:
          return 'hidden';
        default:
          return 'show';
      }
    }
  }

  validate(survey, node, page, question) {
    if (this.getVisibilityCondition() === null) return List();
    return this.getVisibilityCondition().validate(survey, node, page, question, this);
  }
}
