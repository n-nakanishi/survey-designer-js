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
  visible: '表示',
  invisible: '非表示',
};

const OPERATOR_OPTIONS = {
  '!!': 'を選択している',
  '!': 'を選択していない',
  '==': 'と等しい',
  '!=': 'と等しくない',
  '>': 'より大きい',
  '<': 'より小さい',
  '>=': '以上',
  '<=': '以下',
};

class ItemVisibilityEditorPart extends Component {
  handleChangeValue(changes, source) {
    const { question, changeItemVisibilityCondition } = this.props;
    // loadDataのときは何もしない
    if (source === 'loadData') return;

    const items = question.getItems();

    changes.forEach((change) => {
      const row = change[0];
      const prop = change[1];
      const oldVal = change[2];
      const newVal = change[3];
      const item = items.get(row);
      if (oldVal === newVal) return;
      changeItemVisibilityCondition(question.getId(), item.getId(), prop, newVal);
    });
  }

  cells(row, col, prop) {
    const { survey, question } = this.props;
    const cellProperties = {};
    const visiblityCondition = question.getItems().get(row).getVisibilityCondition();
    if (visiblityCondition === null) return cellProperties;

    const outputDefinitionId = visiblityCondition.getOutputDefinitionId();
    if (prop === 'comparisonType') {
      if (S(outputDefinitionId).isEmpty()) return cellProperties;
      cellProperties.readOnly = false;
    } else if (prop === 'value') {
      const comparisonType = visiblityCondition.getComparisonType();
      if (comparisonType === 'answerValue') {
        cellProperties.readOnly = false;
        cellProperties.editor = 'select';
        cellProperties.selectOptions = this.referenceSelectOptions();
        cellProperties.renderer = this.referenceRenderer.bind(this);
      } else if (comparisonType === 'fixedValue') {
        cellProperties.readOnly = false;
        cellProperties.editor = 'text';
      }
    } else if (prop === 'operator') {
      if (S(outputDefinitionId).isEmpty()) return cellProperties;
      cellProperties.readOnly = false;
      const od = survey.findOutputDefinition(outputDefinitionId);
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
    td.textContent = targetOutputDefinition.getLabelForCondition(true);
    return td;
  }

  operatorSelectOptions(row, col) {
    const { question } = this.props;
    const items = question.getItems();
    const item = items.get(row);
    const visibilityCondition = item.getVisibilityCondition();
    console.log(visibilityCondition);
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

  comparisonTypeRenderer(instance, td, row, col, prop, value) {
    td.textContent = COMPARISON_TYPE_OPTIONS[value] || '';
    return td;
  }

  valueRenderer(instance, td, row, col, prop, value) {
    td.textContent = value;
    return td;
  }

  operatorRenderer(instance, td, row, col, prop, value) {
    td.textContent = OPERATOR_OPTIONS[value] || '';
    return td;
  }

  visiblityTypeRenderer(instance, td, row, col, prop, value) {
    td.textContent = VISIBLITY_TYPE_OPTIONS[value] || '';
    return td;
  }

  outputDefinitionIdValidator(value, callback) {
    const { page, survey } = this.props;
    const node = survey.findNodeFromRefId(page.getId());
    const outputDefinitions = survey.findPrecedingOutputDefinition(node.getId(), true);
    const isExists = !!outputDefinitions.find(od => od.getId() === value);
    callback(isExists);
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
        data={visibilityConditions}
        columns={[
          { data: 'label', readOnly: true },
          {
            data: 'outputDefinitionId',
            editor: 'select',
            selectOptions: this.outputDefinitionIdSelectOptions.bind(this),
            renderer: this.outputDefinitionIdRenderer.bind(this),
            allowInvalid: false,
            validator: this.outputDefinitionIdValidator.bind(this),
          },
          {
            data: 'comparisonType',
            editor: 'select',
            readOnly: true,
            selectOptions: COMPARISON_TYPE_OPTIONS,
            renderer: this.comparisonTypeRenderer.bind(this),
            allowInvalid: false,
          },
          {
            data: 'value',
            readOnly: true,
            renderer: this.valueRenderer.bind(this),
            allowInvalid: false,
          },
          {
            data: 'operator',
            editor: 'select',
            readOnly: true,
            selectOptions: this.operatorSelectOptions.bind(this),
            renderer: this.operatorRenderer.bind(this),
            allowInvalid: false,
          },
          {
            data: 'visibilityType',
            editor: 'select',
            selectOptions: VISIBLITY_TYPE_OPTIONS,
            renderer: this.visiblityTypeRenderer.bind(this),
            allowInvalid: false,
          },
        ]}
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
  changeItemVisibilityCondition: (questionId, itemId, attributeName, value) =>
    dispatch(EditorActions.changeItemVisibilityCondition(questionId, itemId, attributeName, value)),
});

export default connect(
  stateToProps,
  actionsToProps,
)(ItemVisibilityEditorPart);
