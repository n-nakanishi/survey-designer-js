import TransformedQuestionStateBase from './TransformedQuestionStateBase';

export default class CheckboxQuestionState extends TransformedQuestionStateBase {
  /** indexのcheckboxの値を更新する */
  setItemState(index, checked) {
    const choice = this.getTransformedChoices().sort((a, b) => {
      if (a.getIndex() < b.getIndex()) return -1;
      if (a.getIndex() === b.getIndex()) return 0;
      return 1;
    }).get(index);
    if (choice.isExclusive()) {
      // disabledも合わせて設定することに注意
      if (checked) {
        return this
          .updateIn(['itemState'], state =>
            state.map((v, i) =>
              v
                .set('disabled', i !== index)
                .set('checked', i === index),
            ),
          );
      }
      return this
        .updateIn(['itemState'], state =>
          state.map(v =>
            v
              .set('disabled', false)
              .set('checked', false),
          ),
        );
    }
    return this.setIn(['itemState', index, 'checked'], checked);
  }
}