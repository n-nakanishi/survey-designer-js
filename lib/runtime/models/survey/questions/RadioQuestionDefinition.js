import cuid from 'cuid';
import { List } from 'immutable';
import BaseQuestionDefinition from './internal/BaseQuestionDefinition';
import OutputDefinition from './internal/OutputDefinition';
import ItemDefinition from './internal/ItemDefinition';
import CheckboxQuestionDefinition from './CheckboxQuestionDefinition';

/** 設問定義：単一選択肢 */
export default class RadioQuestionDefinition extends BaseQuestionDefinition {
  static create() {
    return new RadioQuestionDefinition({
      _id: cuid(),
      dataType: 'Radio',
      items: List().push(ItemDefinition.create(0, '1')),
    });
  }

  /** 出力に使用する名前を取得する */
  getOutputName(index, additionalInput) {
    const id = this.getId();
    if (additionalInput) return `${id}__value${index + 1}`;
    return id;
  }

  /** Radioの選択肢の参照値を返す */
  getChoiceReference(choice) {
    return `{{${choice.getId()}.choice_value}}`;
  }

  /** 設問が出力する項目の一覧を返す */
  getOutputDefinitions(pageNo, questionNo) {
    const outputDefinitionArray = [];
    const outputName = this.getOutputName(null, false);
    outputDefinitionArray.push(new OutputDefinition({
      _id: outputName,
      name: outputName,
      label: `${this.getPlainTitle()}`,
      dlLabel: `${this.getPlainTitle()}`,
      question: this,
      outputType: 'radio',
      outputNo: BaseQuestionDefinition.createOutputNo(pageNo, questionNo),
      choices: this.getItems().map(i => i.getChoiceDefinition()),
    }));
    // 追加入力分
    this.getItems().forEach((item) => {
      if (!item.hasAdditionalInput()) return;
      const additionInputId = this.getOutputName(item.getIndex(), true);
      outputDefinitionArray.push(new OutputDefinition({
        _id: item.getId(),
        name: additionInputId,
        label: `${item.getPlainLabel()}-入力欄`,
        dlLabel: `${this.getPlainTitle()}-${item.getPlainLabel()}-入力欄`,
        question: this,
        outputType: item.getAdditionalInputType(),
        outputNo: BaseQuestionDefinition.createOutputNo(pageNo, questionNo, item.getIndex() + 1, 'text'),
        choices: this.getItems().map(i => i.getChoiceDefinition()),
      }));
    });
    return List(outputDefinitionArray);
  }

  /** 正しく設定されているかチェックする */
  validate(survey) {
    return CheckboxQuestionDefinition.prototype.validate.call(this, survey);
  }
}
