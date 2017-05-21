import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import numbro from 'numbro';
import pikaday from 'pikaday';
import Zeroclipboard from 'zeroclipboard';
import Handsontable from 'handsontable';
import HotTable from 'react-handsontable';
import S from 'string';
import 'handsontable/dist/handsontable.full.css';
import * as EditorActions from '../../../actions';

const COMPARISON_TYPE_OPTIONS = {
  fixedValue: '固定値',
  answerValue: '回答値',
};

const VISIBLITY_TYPE_OPTIONS = {
  show: '表示',
  hide: '非表示',
};

const OPERATOR_OPTIONS = {
  '!!': 'を選択している場合',
  '!': 'を選択していない場合',
  '==': 'と等しい場合',
  '!=': 'と等しくない場合',
  '>': 'より大きい場合',
  '<': 'より小さい場合',
  '>=': '以上の場合',
  '<=': '以下の場合',
};

class ItemVisibilityEditorPart extends Component {
  constructor(props) {
    super(props);

    // HotTableのColumn
    this.hotColumns = [
      { data: 'label', readOnly: true },
      {
        data: 'outputDefinitionId',
        editor: 'select',
        selectOptions: this.outputDefinitionIdSelectOptions.bind(this),
        renderer: this.outputDefinitionIdRenderer.bind(this),
      },
      {
        data: 'comparisonType',
        editor: 'select',
        selectOptions: {},
        renderer: this.comparisonTypeRenderer.bind(this),
      },
      {
        data: 'value',
        renderer: this.valueRenderer.bind(this),
      },
      {
        data: 'operator',
        editor: 'select',
        selectOptions: this.operatorSelectOptions.bind(this),
        renderer: this.operatorRenderer.bind(this),
      },
      {
        data: 'visibilityType',
        editor: 'select',
        selectOptions: this.visibilityTypeSelectOptions.bind(this),
        renderer: this.visiblityTypeRenderer.bind(this),
      },
    ];
  }

  handleChangeValue(changes, source) {
    const { question, changeItemVisibilityCondition } = this.props;
    // loadDataのときは何もしない
    if (source === 'loadData') return;

    const items = question.getItems();

    const valueObj = {};
    const declaredDatKeys = this.hotColumns.map(column => column.data);

    changes.forEach((change) => {
      const row = change[0];
      const prop = change[1];
      const oldVal = change[2];
      const newVal = change[3];
      const item = items.get(row);
      if (oldVal === newVal) return;
      if (!declaredDatKeys.includes(prop)) return;
      valueObj[item.getId()] = valueObj[item.getId()] || {};
      valueObj[item.getId()][prop] = newVal;
    });

    Object.keys(valueObj).forEach(itemId => changeItemVisibilityCondition(question.getId(), itemId, valueObj[itemId]));
    this.forceUpdate();
  }

  cells(row, col, prop) {
    const { survey, question } = this.props;
    const cellProperties = {};
    const visibilityCondition = question.getItems().get(row).getVisibilityCondition();
    if (visibilityCondition === null) return cellProperties; // 設定されていない場合

    const outputDefinitionId = visibilityCondition.getOutputDefinitionId();
    const od = survey.findOutputDefinition(outputDefinitionId);
    if (!od) return cellProperties; // 設問が削除されている場合

    if (prop === 'comparisonType') {
      if (S(outputDefinitionId).isEmpty()) {
        cellProperties.selectOptions = {};
        return cellProperties;
      }
      switch (od.getOutputType()) {
        case 'number':
          cellProperties.selectOptions = COMPARISON_TYPE_OPTIONS;
          return cellProperties;
        default:
          cellProperties.selectOptions = {};
          return cellProperties;
      }
    } else if (prop === 'value') {
      const comparisonType = visibilityCondition.getComparisonType();
      if (comparisonType === 'answerValue') {
        cellProperties.editor = 'select';
        cellProperties.selectOptions = this.referenceSelectOptions();
        cellProperties.renderer = this.referenceRenderer.bind(this);
      } else if (comparisonType === 'fixedValue') {
        cellProperties.type = 'numeric';
      }
    } else if (prop === 'operator') {
      if (S(outputDefinitionId).isEmpty()) return cellProperties;
      switch (od.getOutputType()) {
        case 'checkbox':
          cellProperties.selectOptions = {
            '!!': 'を選択している',
            '!': 'を選択していない',
          };
          break;
        case 'radio':
          cellProperties.selectOptions = {
            '!!': 'を選択している',
            '!': 'を選択していない',
          };
          break;
        default:
          cellProperties.selectOptions = {
            '==': 'と等しい場合',
            '!=': 'と等しくない場合',
            '>': 'より大きい場合',
            '<': 'より小さい場合',
            '>=': '以上の場合',
            '<=': '以下の場合',
          };
      }
    }
    return cellProperties;
  }

  referenceRenderer(instance, td, row, col, prop, value) {
    const { survey } = this.props;
    const replacer = survey.getReplacer();
    if (!value) {
      td.textContent = '';
      return td;
    }
    const outputDefinitionId = replacer.extractIdFrom(value);
    const od = survey.findOutputDefinition(outputDefinitionId);
    if (od) {
      td.textContent = od.getLabelForCondition();
      return td;
    }
    td.textContent = '';
    return td;
  }

  referenceSelectOptions() {
    const { page, survey } = this.props;
    const node = survey.findNodeFromRefId(page.getId());
    const options = {};
    const outputDefinitions = survey.findPrecedingOutputDefinition(node.getId(), true);
    outputDefinitions.forEach((od) => {
      options[`{{${od.getId()}.answer}}`] = od.getLabelForCondition();
    });
    return options;
  }

  outputDefinitionIdSelectOptions() {
    const { page, survey } = this.props;
    const node = survey.findNodeFromRefId(page.getId());
    const options = {};
    const outputDefinitions = survey.findPrecedingOutputDefinition(node.getId(), true);
    outputDefinitions.forEach((od) => {
      options[od.getId()] = od.getLabelForCondition();
    });
    return options;
  }

  outputDefinitionIdRenderer(instance, td, row, col, prop, value) {
    const { survey } = this.props;
    if (S(value).isEmpty()) {
      td.textContent = '';
      return td;
    }
    const targetOutputDefinition = survey.findOutputDefinition(value);
    // 見つからなかった場合削除されている
    if (!targetOutputDefinition) td.textContent = '不正な設問です';
    else td.textContent = targetOutputDefinition.getLabelForCondition(true);
    return td;
  }

  operatorSelectOptions(row, col) {
    const { question } = this.props;
    const items = question.getItems();
    const item = items.get(row);
    const visibilityCondition = item.getVisibilityCondition();
    return {};
    /*
    const outputDefinitionId = this.getData()[row][1];
    const targetOutputDefinition = survey.findOutputDefinition(outputDefinitionId);
    if (!targetOutputDefinition) {
      return {};
    }
    const outputType = targetOutputDefinition.getOutputType();
    switch (outputType) {
      case 'checkbox':
      case 'radio':
        return {
          '!!': 'を選択している',
          '!': 'を選択していない',
        };
      case 'number':
        return {
          '==': 'と等しい',
          '!=': 'と等しくない',
          '>': 'より大きい',
          '<': 'より小さい',
          '>=': '以上',
          '<=': '以下',
        };
      default:
        throw new Error(`Unexpected outputType: ${outputType}`);
    }
    */
  }

  visibilityTypeSelectOptions(row, col) {
    const visibilityCondition = this.getVisibilityConditionFromRow(row);
    if (!visibilityCondition) return {};
    return VISIBLITY_TYPE_OPTIONS;
  }

  comparisonTypeRenderer(instance, td, row, col, prop, value) {
    const { survey } = this.props;
    this.commonRenderer(td, row);

    const visibilityCondition = this.getVisibilityConditionFromRow(row);
    if (visibilityCondition) {
      const od = survey.findOutputDefinition(visibilityCondition.getOutputDefinitionId());
      if (!od || od.getOutputType() !== 'number') {
        td.classList.add('disabled');
      }
    }

    td.textContent = COMPARISON_TYPE_OPTIONS[value] || '';
    return td;
  }

  getVisibilityConditionFromRow(row) {
    const { question } = this.props;
    const items = question.getItems();
    const item = items.get(row);
    return item.getVisibilityCondition();
  }

  valueRenderer(instance, td, row, col, prop, value) {
    const { survey } = this.props;
    this.commonRenderer(td, row);

    const visibilityCondition = this.getVisibilityConditionFromRow(row);
    if (visibilityCondition) {
      const od = survey.findOutputDefinition(visibilityCondition.getOutputDefinitionId());
      if (!od || od.getOutputType() !== 'number') {
        td.classList.add('disabled');
      }
    }

    td.textContent = value;
    return td;
  }

  operatorRenderer(instance, td, row, col, prop, value) {
    this.commonRenderer(td, row);
    td.textContent = OPERATOR_OPTIONS[value] || '';
    return td;
  }

  visiblityTypeRenderer(instance, td, row, col, prop, value) {
    this.commonRenderer(td, row);
    td.textContent = VISIBLITY_TYPE_OPTIONS[value] || '';
    return td;
  }

  commonRenderer(td, row) {
    const visibilityCondition = this.getVisibilityConditionFromRow(row);

    if (!visibilityCondition) {
      td.classList.add('disabled');
    } else {
      td.classList.remove('disabled');
    }
  }

  render() {
    const { question } = this.props;
    const items = question.getItems();
    const visibilityConditions = items.map((item) => {
      const vc = item.getVisibilityCondition();
      return vc ? Object.assign(vc.toJS(), { label: item.getPlainLabel() }) : { label: item.getPlainLabel() };
    }).toJS();
    return (
      <HotTable
        className="item-visibility-editor"
        data={visibilityConditions}
        height={100}
        columns={this.hotColumns}
        colHeaders={['選択肢', '設問', '比較タイプ', '比較値', '比較方法', '条件種別']}
        afterChange={(changes, source) => this.handleChangeValue(changes, source)}
        cells={(row, col, prop) => this.cells(row, col, prop)}
      />
    );
  }
}

const stateToProps = state => ({
  survey: state.getSurvey(),
  runtime: state.getRuntime(),
  view: state.getViewSetting(),
  options: state.getOptions(),
});
const actionsToProps = dispatch => ({
  changeItemVisibilityCondition: (questionId, itemId, value) =>
    dispatch(EditorActions.changeItemVisibilityCondition(questionId, itemId, value)),
});

export default connect(
  stateToProps,
  actionsToProps,
)(ItemVisibilityEditorPart);
