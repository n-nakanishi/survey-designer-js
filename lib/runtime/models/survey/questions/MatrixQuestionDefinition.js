import cuid from 'cuid';
import { List } from 'immutable';
import BaseQuestionDefinition from './internal/BaseQuestionDefinition';
import ItemDefinition from './internal/ItemDefinition';

/** 設問定義：複数選択肢 */
export default class MatrixQuestionDefinition extends BaseQuestionDefinition {
  static create() {
    return new MatrixQuestionDefinition({
      _id: cuid(),
      dataType: 'Matrix',
      matrixType: 'radio',
      matrixDirection: 'horizontal',
      items: List().push(ItemDefinition.create(0)),
    });
  }

  /** 出力に使用する追加エレメントの名前を取得する */
  getAdditionalOutputName(item, subItem) {
    return `${this.getId()}_value${item.getIndex() + 1}_${subItem.getIndex() + 1}__text`;
  }

  /** 出力に使用する名前を取得する */
  getOutputName(item, subItem) {
    const matrixType = this.getMatrixType();
    switch (matrixType) {
      case 'radio':
        return `${this.getId()}_value${item.getIndex() + 1}`;
      case 'checkbox':
      case 'text':
      case 'number':
        return `${this.getId()}_value${item.getIndex() + 1}_${subItem.getIndex() + 1}`;
      default:
        throw new Error(`不明なmatrixTypeです: ${matrixType}`);
    }
  }

  /** 出力に使用する行合計値の名前を取得する */
  getOutputTotalRowName(item) {
    return `${this.getId()}_row${item.getIndex() + 1}_total`;
  }

  /** 出力に使用する列合計値の名前を取得する */
  getOutputTotalColName(item) {
    return `${this.getId()}_colum${item.getIndex() + 1}_total`;
  }

  /** 出力に使用する名前を取得する */
  getOutputValue(subItem) {
    const matrixType = this.getMatrixType();
    switch (matrixType) {
      case 'radio':
        return `value${subItem.getIndex() + 1}`;
      case 'checkbox':
        return 'on';
      case 'text':
      case 'number':
        return '';
      default:
        throw new Error(`不明なmatrixTypeです: ${matrixType}`);
    }
  }

  /** 設問が出力する項目の一覧を返す */
  getOutputDefinitions(pageNo, questionNo) {
    return List();
  }

  /** indexの値を更新する */
  fixItemIndex() {
    return this.set('items', this.getItems().map((item, i) =>
      item
        .set('index', i)
        .set('value', 'on'),
    ).toList());
  }

  /** indexの値を更新する */
  fixSubItemIndex() {
    return this.set('subItems', this.getSubItems().map((item, i) =>
      item
        .set('index', i)
        .set('value', 'on'),
    ).toList());
  }
}