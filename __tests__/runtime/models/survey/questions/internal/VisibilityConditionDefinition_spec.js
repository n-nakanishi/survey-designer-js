/* eslint-env jest */
import { List } from 'immutable';
import SurveyDesignerState from '../../../../../../lib/runtime/models/SurveyDesignerState';
import OutputDefinition from '../../../../../../lib/runtime/models/survey/questions/internal/OutputDefinition';
import VisibilityConditionDefinition from '../../../../../../lib/runtime/models/survey/questions/internal/VisibilityConditionDefinition';
import allOutputTypeJson from './ItemDefinition_allOutputType.json';

describe('VisibilityConditionDefinition', () => {
  describe('update', () => {
    it('すべての項目が更新されること', () => {
      const vcd = new VisibilityConditionDefinition({
        _id: 'id1',
        outputDefinitionId: 'od1',
        comparisonType: 'fixedValue',
        value: '10',
        operator: '==',
        visibilityType: 'show',
      });

      const outputDefinitions = List([
        new OutputDefinition({ _id: 'od1', outputType: 'number' }),
        new OutputDefinition({ _id: 'od2', outputType: 'number' }),
      ]);

      const result = vcd.updateProperties(outputDefinitions, {
        outputDefinitionId: 'od2',
        comparisonType: 'answerValue',
        value: '{{od1.answer_value}}',
        operator: '!=',
        visibilityType: 'hide',
      });
      expect(result.getId()).toBe('id1');
      expect(result.getOutputDefinitionId()).toBe('od2');
      expect(result.getComparisonType()).toBe('answerValue');
      expect(result.getValue()).toBe('{{od1.answer_value}}');
      expect(result.getOperator()).toBe('!=');
      expect(result.getVisibilityType()).toBe('hide');
    });

    it('設問がemptyならVisibilityConditionDefinition自体がnullになる', () => {
      const vcd = new VisibilityConditionDefinition({
        _id: 'id1',
        outputDefinitionId: 'outputDefinitionId1',
        comparisonType: 'fixedValue',
        value: '10',
        operator: '==',
        visibilityType: 'show',
      });
      const outputDefinitions = List();
      const result = vcd.updateProperties(outputDefinitions, {
        outputDefinitionId: '',
      });
      expect(result).toBe(null);
    });

    it('存在しないoutputDefinitionIdを指定した場合はVisibilityConditionDefinition自体がnullになる', () => {
      const vcd = new VisibilityConditionDefinition({
        _id: 'id1',
        outputDefinitionId: 'outputDefinitionId1',
        comparisonType: 'fixedValue',
        value: '10',
        operator: '==',
        visibilityType: 'show',
      });
      const outputDefinitions = List();
      const result = vcd.updateProperties(outputDefinitions, {
        outputDefinitionId: 'abce',
      });
      expect(result).toBe(null);
    });

    it('設問が変更され指定できない比較タイプが設定されていた場合は比較タイプ,value,operatorが空になる', () => {
      const vcd = new VisibilityConditionDefinition({
        _id: 'id1',
        outputDefinitionId: 'od1',
        comparisonType: 'fixedValue',
        value: '10',
        operator: '==',
        visibilityType: 'show',
      });
      const outputDefinitions = List([
        new OutputDefinition({ _id: 'od1', outputType: 'number' }),
        new OutputDefinition({ _id: 'od2', outputType: 'checkbox' }),
      ]);
      const result = vcd.updateProperties(outputDefinitions, {
        outputDefinitionId: 'od2',
      });
      expect(result.getId()).toBe('id1');
      expect(result.getOutputDefinitionId()).toBe('od2');
      expect(result.getComparisonType()).toBe(null);
      expect(result.getValue()).toBe(null);
      expect(result.getOperator()).toBe(null);
      expect(result.getVisibilityType()).toBe('show');
    });

    it('comparisonTypeがfixedValueかつvalueに数値以外が入力された場合valueが空になる', () => {
      const vcd = new VisibilityConditionDefinition({
        _id: 'id1',
        outputDefinitionId: 'od1',
        comparisonType: 'fixedValue',
        value: '10',
        operator: '==',
        visibilityType: 'show',
      });
      const outputDefinitions = List([
        new OutputDefinition({ _id: 'od1', outputType: 'number' }),
        new OutputDefinition({ _id: 'od2', outputType: 'checkbox' }),
      ]);
      const result = vcd.updateProperties(outputDefinitions, {
        value: 'a',
      });
      expect(result.getId()).toBe('id1');
      expect(result.getOutputDefinitionId()).toBe('od1');
      expect(result.getComparisonType()).toBe('fixedValue');
      expect(result.getValue()).toBe(null);
      expect(result.getOperator()).toBe('==');
      expect(result.getVisibilityType()).toBe('show');
    });

    it('comparisonTypeがanswerValueかつvalueに存在する参照値が入力された場合入力値が設定される', () => {
      const vcd = new VisibilityConditionDefinition({
        _id: 'id1',
        outputDefinitionId: 'od1',
        comparisonType: 'fixedValue',
        value: '10',
        operator: '==',
        visibilityType: 'show',
      });
      const outputDefinitions = List([
        new OutputDefinition({ _id: 'od1', outputType: 'number' }),
        new OutputDefinition({ _id: 'od2', outputType: 'checkbox' }),
      ]);
      const result = vcd.updateProperties(outputDefinitions, {
        comparisonType: 'answerValue',
        value: '{{od1.answer_value}}',
      });
      expect(result.getId()).toBe('id1');
      expect(result.getOutputDefinitionId()).toBe('od1');
      expect(result.getComparisonType()).toBe('answerValue');
      expect(result.getValue()).toBe('{{od1.answer_value}}');
      expect(result.getOperator()).toBe('==');
      expect(result.getVisibilityType()).toBe('show');
    });

    it('comparisonTypeがanswerValueかつvalueに存在しない参照値が入力された場合valueが空になる', () => {
      const vcd = new VisibilityConditionDefinition({
        _id: 'id1',
        outputDefinitionId: 'od1',
        comparisonType: 'fixedValue',
        value: '10',
        operator: '==',
        visibilityType: 'show',
      });
      const outputDefinitions = List([
        new OutputDefinition({ _id: 'od1', outputType: 'number' }),
        new OutputDefinition({ _id: 'od2', outputType: 'checkbox' }),
      ]);
      const result = vcd.updateProperties(outputDefinitions, {
        comparisonType: 'answerValue',
      });
      expect(result.getId()).toBe('id1');
      expect(result.getOutputDefinitionId()).toBe('od1');
      expect(result.getComparisonType()).toBe('answerValue');
      expect(result.getValue()).toBe(null);
      expect(result.getOperator()).toBe('==');
      expect(result.getVisibilityType()).toBe('show');
    });
  });

  describe('validate', () => {
    it('設問が存在しない場合', () => {
      const survey = SurveyDesignerState.createFromJson({ survey: allOutputTypeJson }).getSurvey()
        .updateIn(['pages', 0, 'questions', 0, 'items', 0], item => item.set('visibilityCondition', new VisibilityConditionDefinition({
          outputDefinitionId: 'dummy',
        })));
      survey.refreshReplacer();
      const errors = survey.validate();
      expect(errors.size).toBe(2);
      expect(errors.get(0)).toBe('パネルが選択されていません');
      expect(errors.get(1)).toBe('設問 1-1 1つ目の選択肢の表示条件で設問の値が不正です');
    });
    it('比較方法が選択されていない場合', () => {
    });
    it('条件種別が選択されていない場合', () => {
    });
    describe('outputTypeがcheckboxの場合', () => {
    });
  });
});

