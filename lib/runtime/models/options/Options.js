import { Record, Map } from 'immutable';
import { parseInteger } from '../../../utils';

export const OptionsRecord = Record({
  saveSurveyUrl: null,                     // surveyを保存するURL
  previewUrl: null,                        // プレビューURL
  showDetailUrl: null,                     // 詳細プレビューURL
  showDetail: false,                       // 制御情報を表示するかどうか
  showOutputNo: false,                     // 設問番号を表示するかどうか
  showPageNo: false,                       // ページ番号・分岐番号・終了ページ番号を表示するかどうか
  disableTransformQuestion: false,         // TransformedQuestionを無効にする(ランダム配置を無効にする)
  postAnswerUrl: null,                     // 回答を登録するURL
  confirmSurveyUrl: null,                  // 配信確認ページのURL
  previewDownloadUrl: null,                // プレビュー時に回答データをDLするたのURL
  sentryInitFn: null,                      // Sentryを初期化するコールバック関数
  startTime: new Date(),                   // 開始時間 TODO: アンケート中断・再開機能を実装した場合には見直し必要
  extraPostParameters: Map(),              // post時に追加したいパラメタ名
  visibilityConditionDisabled: false,      // itemの表示/非表示評価を行うかどうか
  panelSelectFn: null,                     // パネル選択をクリックしたときに呼ばれる関数
  answerRegisteredFn: null,                // 回答を登録したときに実行するコールバック関数
  pageLoadedFn: null,                      // ページ遷移したときに呼ばれるコールバック関数
  exposeSurveyJS: false,                   // SurveyJSをwindowに紐つけるかどうか。trueの場合はSurveyJSという名前で設定する。文字列の場合は指定した文字列の名前で設定する。
});

export default class Options extends OptionsRecord {
  getSaveSurveyUrl() {
    return this.get('saveSurveyUrl');
  }

  getPreviewUrl() {
    return this.get('previewUrl');
  }

  getShowDetailUrl() {
    return this.get('showDetailUrl');
  }

  getPostAnswerUrl() {
    return this.get('postAnswerUrl');
  }

  getConfirmSurveyUrl() {
    return this.get('confirmSurveyUrl');
  }

  getPreviewDownloadUrl() {
    return this.get('previewDownloadUrl');
  }

  getSentryInitFn() {
    return this.get('sentryInitFn');
  }

  getStartTime() {
    return this.get('startTime');
  }

  getPanelSelectFn() {
    return this.get('panelSelectFn');
  }

  getAnswerRegisteredFn() {
    return this.get('answerRegisteredFn');
  }

  getExtraPostParameters() {
    return this.get('extraPostParameters');
  }

  getPageLoadedFn() {
    return this.get('pageLoadedFn');
  }

  isShowDetail() {
    return this.get('showDetail');
  }

  isShowOutputNo() {
    return this.get('showOutputNo');
  }

  isShowPageNo() {
    return this.get('showPageNo');
  }

  isDisableTransformQuestion() {
    return this.get('disableTransformQuestion');
  }

  // 回答時間を計算し、秒で返す
  calcTimeForAnswer() {
    return parseInteger((new Date().getTime() - this.getStartTime().getTime()) / 1000);
  }

  isVisibilityConditionDisabled() {
    return this.get('visibilityConditionDisabled');
  }

  isExposeSurveyJS() {
    return this.get('exposeSurveyJS');
  }
}
