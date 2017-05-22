import { connect } from 'react-redux';
import React, { Component } from 'react';
import S from 'string';
import classNames from 'classnames';
import QuestionDetail from '../parts/QuestionDetail';

/** 設問：日程 */
class ScheduleQuestion extends Component {
  render() {
    const { replacer, question, options } = this.props;
    const title = question.getTitle();
    const description = question.getDescription();
    const otherName = question.getOutputName(true);

    return (
      <div ref={(el) => { this.rootEl = el; }} className={this.constructor.name}>
        {S(title).isEmpty() ? null : <h2 className="question-title" dangerouslySetInnerHTML={{ __html: replacer.id2Value(title) }} />}
        {S(description).isEmpty() ?
          null : <h3 className="question-description" dangerouslySetInnerHTML={{ __html: replacer.id2Value(description) }} />}
        <div className="question">
          <table id={question.getId()} className="sdj-schedule schedulecheck group schedule errPosRight">
            <tbody>
              <tr id="grid_th" className="color02 ">
                <td><b>日程</b></td>
                <td><b>A.<br />午前<br />9:00～12:00</b></td>
                <td><b>B.<br />午後<br />12:00～16:00</b></td>
                <td><b>C.<br />夜間<br />16:00 以降</b></td>
              </tr>
              {
                question.getItems().map((item, itemIndex) =>
                  <ScheduleRow
                    key={item.getId()}
                    item={item}
                    itemIndex={itemIndex}
                    {...this.props}
                  />,
                )
              }
              <tr className="color01 exclusion">
                <td>上記のいずれも都合がつかない</td>
                <td colSpan="3">
                  <input
                    type="checkbox"
                    className="exclusion"
                    data-parsley-class-handler={`#${question.getId()}`}
                    data-parsley-required
                    data-parsley-required-message="日時枠を一つ以上選択してください"
                    data-parsley-multiple={question.getId()}
                  />&nbsp;
                  <input
                    type="text"
                    disabled
                    className="schedule-text disabled"
                    id={otherName}
                    name={otherName}
                    data-parsley-required
                    data-parsley-required-message="具体的な時間帯を記入してください"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        { options.isShowDetail() ? <QuestionDetail question={question} random min max totalEqualTo={question.isShowTotal()} /> : null }
      </div>
    );
  }
}

/** 日程の1行に対応するコンポーネント */
class ScheduleRow extends Component {
  render() {
    const { survey, runtime, options, question, item, itemIndex } = this.props;
    const label = item.getLabel();
    const className = classNames('color01', {
      [item.calcVisibilityClassName(survey, runtime.getAnswers(true))]: !options.isVisibilityConditionDisabled(),
    });
    const replacer = survey.getReplacer();
    return (
      <tr className={className}>
        <td className="left" dangerouslySetInnerHTML={{ __html: replacer.id2Value(label) }} />
        {[1, 2, 3].map((periodNo) => {
          const id = question.getOutputName(false, itemIndex, periodNo);
          return (
            <td key={`${id}-td${periodNo}`}>
              <input
                type="checkbox"
                data-parsley-class-handler={`#${question.getId()}`}
                data-parsley-required
                data-parsley-required-message="日時枠を一つ以上選択してください"
                data-parsley-multiple={question.getId()}
              />&nbsp;
              <input
                type="text"
                id={`${id}`}
                name={`${id}`}
                disabled
                className="schedule-text disabled"
                data-parsley-required
                data-parsley-required-message="具体的な時間帯を記入してください"
              />
            </td>
          );
        })}
      </tr>
    );
  }
}

const stateToProps = state => ({
  survey: state.getSurvey(),
  runtime: state.getRuntime(),
  view: state.getViewSetting(),
  options: state.getOptions(),
});

export default connect(
  stateToProps,
)(ScheduleQuestion);



