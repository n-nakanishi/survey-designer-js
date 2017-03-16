import React, { Component } from 'react';
import S from 'string';
import TransformQuestion from './TransformQuestion';

/** CheckboxQuestion, RadioQuestionの基底クラス */
export default class ChoiceQuestionBase extends TransformQuestion {
  /** itemのcheckedが変更されたときのハンドラ */
  handleItemCheckedChange(e) {
    const { model } = this.state;
    const itemIndex = parseInt(e.target.dataset.responseItemIndex, 10);
    this.setState({ model: model.setItemState(itemIndex, e.target.checked) });
  }

  /** itemを描画する */
  createItems(containerId) {
    const { replaceUtil, question } = this.props;
    const { model } = this.state;
    const items = model.getTransformedItems();
    if (items.size === 0) {
      throw new Error('items attribute is not defined');
    }
    return items.map(item => (
      <Item
        key={`${question.getId()}_${item.getIndex()}`}
        containerId={containerId}
        question={question}
        inputType={this.inputType}
        item={item} // itemDefitionのインスタンス
        itemState={model.getItemStateByItemIndex(item.getIndex())}
        handleItemCheckedChange={e => this.handleItemCheckedChange(e)}
        replaceUtil={replaceUtil}
      />
    ));
  }

  /** 描画 */
  render() {
    const { replaceUtil, question } = this.props;
    const title = question.getTitle();
    const description = question.getDescription();
    const containerId = `${question.getId()}-list-container`;
    return (
      <div ref={(el) => { this.rootEl = el; }} className={this.constructor.name}>
        {S(title).isEmpty() ? null : <h2 className="question-title" dangerouslySetInnerHTML={{ __html: replaceUtil.name2Value(title) }} />}
        {S(description).isEmpty() ?
          null : <h3 className="question-description" dangerouslySetInnerHTML={{ __html: replaceUtil.name2Value(description) }} />}
        <div className="question">
          <ul id={containerId} className="checkbox validation-hover-target">
            {this.createItems(containerId)}
          </ul>
        </div>
      </div>
    );
  }
}

/**
 * itemに対応するコンポーネント
 * RadioかCheckboxのいずれかが対応する
 */
class Item extends Component {
  /** addtionalInputを描画する */
  static renderAdditionalInput(itemState, item, question) {
    if (!item.hasAdditionalInput()) return null;
    const type = item.getAdditionalInputType();
    const disabled = !itemState.get('checked');
    return (
      <input
        type={type}
        name={question.getOutputName(item.getIndex(), true)}
        data-parsley-required
        data-parsley-type={type === 'number' ? 'digits' : null}
        data-parsley-type-message="半角数字のみで入力してください"
        disabled={disabled}
        className={disabled ? 'disabled' : ''}
        onClick={e => e.preventDefault()}
      />
    );
  }

  render() {
    const { replaceUtil, containerId, itemState, item, question, inputType, handleItemCheckedChange } = this.props;
    const label = item.getLabel();
    const unit = item.getUnit();
    const disabled = !!itemState.get('disabled');
    const className = `question-form-list ${disabled ? 'disabled' : ''}`;
    const value = item.getValue();
    const dataType = question.getDataType();
    return (
      <li className={className}>
        <label className="question-form-list-label">
          <input
            className="question-form-list-input"
            type={inputType}
            name={question.getOutputName(item.getIndex(), false)}
            value={value}
            checked={itemState.get('checked')}
            onChange={handleItemCheckedChange}
            disabled={disabled}
            data-response-key="checked"
            data-response-multiple={inputType === 'checkbox'}
            data-response-item-index={item.getIndex()}
            data-parsley-class-handler={`#${containerId}`}
            data-parsley-required={question.getMinCheckCount() > 0}
            data-parsley-mincheck={dataType === 'Checkbox' && question.getMinCheckCount() !== 0 ? question.getMinCheckCount() : null}
            data-parsley-maxcheck={dataType === 'Checkbox' && question.getMaxCheckCount() !== 0 ? question.getMaxCheckCount() : null}
            data-parsley-multiple={question.getId()}
          />
          <span dangerouslySetInnerHTML={{ __html: replaceUtil.name2Value(label) }} />
          {Item.renderAdditionalInput(itemState, item, question)}
          <span dangerouslySetInnerHTML={{ __html: replaceUtil.name2Value(unit) }} />
        </label>
      </li>
    );
  }
}