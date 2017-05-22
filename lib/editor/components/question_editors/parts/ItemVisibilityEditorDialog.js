import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';
import ItemVisibilityEditorPart from './ItemVisibilityEditorPart';
import * as EditorActions from '../../../actions';

class ItemVisibilityEditorDialog extends Component {
  render() {
    return (
      <div>
        <Modal show={this.props.show} onHide={() => this.props.onHide()} keyboard={false}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ItemVisibilityEditorPart {...this.props} />
          </Modal.Body>
        </Modal>
      </div>
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
)(ItemVisibilityEditorDialog);
