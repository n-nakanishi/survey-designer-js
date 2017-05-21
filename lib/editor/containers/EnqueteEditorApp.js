/* eslint-env browser */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import SplitPane from 'react-split-pane';
import Frame from 'react-frame-component';
import classNames from 'classnames';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import runtimeCss from '!css-loader!sass-loader!../../runtime/css/runtime.scss';
import detailCss from '!css-loader!sass-loader!../../preview/css/detail.scss';
import EnqueteRuntimeApp from '../../runtime/containers/EnqueteRuntimeApp';
import SurveyDesignerState from '../../runtime/models/SurveyDesignerState';
import Menu from '../components/Menu';
import Flow from '../components/Flow';
import Editor from '../components/Editor';
import * as Actions from '../actions';
import { isDevelopment } from '../../utils';
import '../css/bootstrap.less';

/** エディタアプリのコンテナ */
class EnqueteEditorApp extends Component {
  constructor(props) {
    super(props);
    this.state = { dragging: false };
  }

  componentDidMount() {
    this.root.addEventListener('dragenter', this.handleEventCancel.bind(this), false);
    this.root.addEventListener('dragover', this.handleEventCancel.bind(this), false);
    this.root.addEventListener('drop', this.handleFileDrop.bind(this), false);
  }

  /**
   * EnqueteEditorAppの中でiframeを利用しており、iframeの上で
   * はmousemoveが受け取ることができず、SplitPaneのdragが正しく動作しない。
   * この問題を回避するため、drag開始時にiframeをhiddenにする
   */
  handleDragStarted() {
    this.setState({ dragging: true });
  }

  /** dragが終わったタイミングでiframeを表示する */
  handleDragFinished() {
    this.setState({ dragging: false });
  }

  /** イベントをキャンセルする */
  handleEventCancel(e) {
    //e.preventDefault();
    //e.stopPropagation();
  }

  /** ファイルをDropできるようにする */
  handleFileDrop(e) {
    const { survey } = this.props;
    this.handleEventCancel(e);

    if (!isDevelopment()) return;
    const file = e.dataTransfer.files[0];
    if (!file) return; // fileのdropでなければ何もしない
    // ファイルの内容は FileReader で読み込みます.
    const m = file.name.match(/^.*\.json$/i);
    if (!m) return;

    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      const json = JSON.parse(event.target.result);
      json._id = survey.getId(); // surveyのidは更新しない
      const surveyDesignerState = SurveyDesignerState.createFromJson({ survey: json });
      this.props.loadSurvey(surveyDesignerState.getSurvey());
    };
    fileReader.readAsText(file);
  }

  /** プレビューペインを描画する */
  createPreviewPane() {
    // ランタイム時に使用するcssを環境変数(.env)から取得する。
    // カンマ区切りでURLを指定すると、URLのlinkタグがプレビューアプリに注入される
    const cssLinks = ENV.RUNTIME_CSS_URL.split(/,/).map(url => `<link type="text/css" rel="stylesheet" href="${url}" />`).join('');
    return (
      <div key="previewPane" className={classNames('preview-pane', { hidden: this.state.dragging })}>
        <Frame
          initialContent={`
            <!DOCTYPE html>
            <html>
            <head>
              ${cssLinks}
              <style>${runtimeCss}</style>
              <style>${detailCss}</style>
            </head>
            <body class="m3-enquete__user-agent-group--PC">
              <div id="runtime-container"></div>
            </body>
          </html>`}
          mountTarget="#runtime-container"
        >
          <EnqueteRuntimeApp doNotPostAnswers doNotTransition doNotExecuteJavaScript doNotValidate />
        </Frame>
      </div>
    );
  }


  /** 表示の設定によって1,2,3ペインでの表示を切り替える */
  render() {
    const { view } = this.props;
    const splitPaneSize = {
      defaultSize: 300,
    };
    const rightSplitPaneSize = {
      defaultSize: '50%',
    };

    let panes;
    const children = [];
    if (view.getFlowPane()) {
      children.push(<Flow key="flowPane" />);
    }
    if (view.getEditorPane()) {
      children.push(<Editor key="editorPane" />);
    }
    if (view.getPreviewPane()) {
      children.push(this.createPreviewPane());
    }
    if (children.length === 3) {
      // すべて表示する場合3ペイン
      panes = (
        <SplitPane
          split="vertical"
          {...splitPaneSize}
          onDragFinished={() => this.handleDragFinished()}
          onDragStarted={() => this.handleDragStarted()}
        >
          {children[0]}
          <SplitPane
            split="vertical"
            {...rightSplitPaneSize}
            onDragFinished={() => this.handleDragFinished()}
            onDragStarted={() => this.handleDragStarted()}
          >
            {children[1]}
            {children[2]}
          </SplitPane>
        </SplitPane>
      );
    } else if (children.length === 2) {
      panes = (
        <SplitPane
          split="vertical"
          {...splitPaneSize}
          onDragFinished={() => this.handleDragFinished()}
          onDragStarted={() => this.handleDragStarted()}
        >
          {children}
        </SplitPane>
      );
    } else if (children.length === 1) {
      panes = (
        <div>
          {children}
        </div>
      );
    }

    return (
      <div ref={el => this.root = el}>
        <Menu />
        <div className="main">
          {panes}
        </div>
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
  loadSurvey: survey => dispatch(Actions.loadSurvey(survey)),
});
// HTML5BackendのDragDropContextのHOC
export default DragDropContext(HTML5Backend)(
  connect(
    stateToProps,
    actionsToProps,
  )(EnqueteEditorApp),
);