/* eslint-env jest */
import SurveyDesignerState from '../../../../lib/runtime/models/SurveyDesignerState';
import sample1 from '../sample1.json';

describe('PageDefinition', () => {
  let state;
  beforeAll(() => {
    state = SurveyDesignerState.createFromJson(sample1);
  });

  describe('removeItem', () => {
    it('指定したitemを削除でき、indexが更新されること', () => {
      const result1 = state.getSurvey().findPage('P001').removeItem('1', 'I002');
      expect(result1.getIn(['questions', 0, 'items']).size).toBe(2);
      expect(result1.getIn(['questions', 0, 'items', 0, '_id'])).toBe('I001');
      expect(result1.getIn(['questions', 0, 'items', 1, '_id'])).toBe('I003');
      expect(result1.getIn(['questions', 0, 'items', 0, 'index'])).toBe(0);
      expect(result1.getIn(['questions', 0, 'items', 1, 'index'])).toBe(1);
    });
  });

  describe('addItem', () => {
    it('指定したindexにitemを追加でき、indexが更新されること', () => {
      const result1 = state.getSurvey().findPage('P001').addItem('1', 1);
      expect(result1.getIn(['questions', 0, 'items']).size).toBe(4);
      expect(result1.getIn(['questions', 0, 'items', 0, '_id'])).toBe('I001');
      expect(result1.getIn(['questions', 0, 'items', 2, '_id'])).toBe('I002');
      expect(result1.getIn(['questions', 0, 'items', 3, '_id'])).toBe('I003');
      expect(result1.getIn(['questions', 0, 'items', 0, 'index'])).toBe(0);
      expect(result1.getIn(['questions', 0, 'items', 1, 'index'])).toBe(1);
      expect(result1.getIn(['questions', 0, 'items', 2, 'index'])).toBe(2);
      expect(result1.getIn(['questions', 0, 'items', 3, 'index'])).toBe(3);
    });
  });

  describe('swapQuestion', () => {
    it('同じページ内で0番目と1番目のquestionの入れ替えができること', () => {
      const result = state.getSurvey().findPage('P001').swapQuestion('1', '2');
      expect(result.getIn(['questions', 0, '_id'])).toBe('2');
      expect(result.getIn(['questions', 1, '_id'])).toBe('1');
    });
  });

  describe('updateItemAttribute', () => {
    it('itemの属性を更新できる', () => {
      const survey = state.getSurvey();
      const replacer = survey.refreshReplacer();
      const result = state.getSurvey().findPage('P001').updateItemAttribute('1', 'I001', 'label', 'ABC', replacer);
      expect(result.getIn(['questions', 0, 'items', 0, 'label'])).toBe('ABC');
    });
  });

  describe('swapItem', () => {
    it('指定したitemを入れ替えることができる', () => {
      const result = state.getSurvey().findPage('P001').swapItem('1', 'I001', 'I003');
      expect(result.getIn(['questions', 0, 'items', 0, '_id'])).toBe('I003');
      expect(result.getIn(['questions', 0, 'items', 1, '_id'])).toBe('I002');
      expect(result.getIn(['questions', 0, 'items', 2, '_id'])).toBe('I001');
      expect(result.getIn(['questions', 0, 'items', 0, 'index'])).toBe(0);
      expect(result.getIn(['questions', 0, 'items', 1, 'index'])).toBe(1);
      expect(result.getIn(['questions', 0, 'items', 2, 'index'])).toBe(2);
    });
  });

  describe('validateLogicalVariable', () => {
    it('オペレータが選択されていない箇所があるときエラーが返る', () => {
      const survey = state.getSurvey().setIn(['pages', 0, 'logicalVariables', 0, 'operators', 0], '');
      survey.refreshReplacer();
      const result = survey.findPage('P001').validate(survey);
      expect(result.size).toBe(1);
      expect(result.get(0)).toBe('1-L-000で選択されていない演算子があります');
    });
    it('参照する回答が存在しないときエラーが返る', () => {
      const survey = state.getSurvey().setIn(['pages', 0, 'logicalVariables', 0, 'operands', 0], '');
      survey.refreshReplacer();
      const result = survey.findPage('P001').validate(survey);
      expect(result.size).toBe(1);
      expect(result.get(0)).toBe('1-L-000で選択されていない設問があります');
    });
  });

  describe('validateQuestion', () => {
    it('再掲で参照している値が存在していない場合にエラーが返る', () => {
      const survey = state.getSurvey().setIn(['pages', 0, 'questions', 0, 'title'], '{{1.answer}}');
      survey.refreshReplacer();
      const result = survey.findPage('P001').validate(survey);
      expect(result.size).toBe(1);
      expect(result.get(0)).toBe('設問 1-1 タイトルで存在しない参照があります');
    });
  });
});
