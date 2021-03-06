/* eslint-env jest */
import { List, Map } from 'immutable';
import LogicalVariableDefinition from '../../../../lib/runtime/models/survey/LogicalVariableDefinition';
import OutputDefinition from '../../../../lib/runtime/models/survey/questions/internal/OutputDefinition';

describe('LogicalVariableDefinition', () => {
  describe('createFunction', () => {
    it('関数を生成する', () => {
      const lv = new LogicalVariableDefinition({
        _id: '000',
        variableName: 'name1',
        operators: List(['+']),
        operands: List(['od1', 'od2']),
      });
      const odList = Map().set('od1', new OutputDefinition({
        _id: 'od1',
        name: 'od1-name',
        label: 'label',
        outputType: 'number',
        outputNo: '1-1-1',
      })).set('od2', new OutputDefinition({
        _id: 'od2',
        name: 'od2-name',
        label: 'label',
        outputType: 'number',
        outputNo: '1-1-2',
      }));
      expect(lv.createFunctionCode(odList)).toBe(`return parseInt(answers[\'od1-name\'], 10)+parseInt(answers[\'od2-name\'], 10)`);
    });
  });
});
