/* eslint-env jest */
import { List } from 'immutable';
import OutputDefinition from '../../../../../../lib/runtime/models/survey/questions/internal/OutputDefinition';
import VisibilityConditionDefinition from '../../../../../../lib/runtime/models/survey/questions/internal/VisibilityConditionDefinition';

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
        value: '{{aaaaa.answer_value}}',
        operator: '!=',
        visibilityType: 'hide',
      });
      expect(result.getId()).toBe('id1');
      expect(result.getOutputDefinitionId()).toBe('od2');
      expect(result.getComparisonType()).toBe('answerValue');
      expect(result.getValue()).toBe('{{aaaaa.answer_value}}');
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
  });
});

