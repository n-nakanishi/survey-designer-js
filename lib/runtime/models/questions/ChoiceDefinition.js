import { Record } from 'immutable';

export const ChoiceRecord = Record({
  index: -1,           // 定義順
  label: '',           // HTMLとして評価されるラベル
  plainLabel: '',      // TEXTとして評価されるラベル
  value: null,         // 値を指定したい場合に指定する
  randomFixed: false,  // 表示順ランダムで、この項目の配置を固定する場合にtrue
  exclusive: false,    // 排他の項目の場合true
  textInput: false,    // ラベルの値に{$TEXT_INPUT}がある場合に、parseLabelを実行するとtrueとなる
  numberInput: false,  // ラベルの値に{$NUMBER_INPUT}がある場合に、parseLabelを実行するとtrueとなる
  unit: '',            // ラベルの値に${TEXT_INPUT}または${NUMBER_INPUT}がある場合に、parseLabelを実行したとき生成される
});

export default class ChoiceDefinition extends ChoiceRecord {
  /** 自由入力の値を変換する */
  parseLabel() {
    const label = this.getLabel();
    const match = label.match(/(.*)\{\$((?:TEXT|NUMBER)_INPUT)\}(.*)/);
    if (match) {
      return this
        .set('label', match[1])
        .set('textInput', match[2] === 'TEXT_INPUT')
        .set('numberInput', match[2] === 'NUMBER_INPUT')
        .set('unit', match[3]);
    }
    return this;
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

  isRandomFixed() {
    return this.get('randomFixed');
  }

  isExclusive() {
    return this.get('exclusive');
  }

  hasTextInput() {
    return this.get('textInput');
  }

  hasNumberInput() {
    return this.get('numberInput');
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
}