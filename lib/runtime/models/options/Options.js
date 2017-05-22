import { Record, Map } from 'immutable';

export const OptionsRecord = Record({
  saveSurveyUrl: null,                     // surveyを保存するURL
  previewUrl: null,                        // プレビューURL
  showDetailUrl: null,                     // 詳細プレビューURL
  showDetail: false,                       // 制御情報を表示するかどうか
  postAnswerUrl: null,                     // 回答を登録するURL
  confirmSurveyUrl: null,                  // 配信確認ページのURL
  previewDownloadUrl: null,                // プレビュー時に回答データをDLするたのURL
  sentryInitFn: null,                      // Sentryを初期化するコールバック関数
  extraPostParameters: Map(),              // post時に追加したいパラメタ名
  visibilityConditionDisabled: false,      // itemのvisibleConditionの評価行うか行わないか
  panelSelectFn: null,                     // パネル選択をクリックしたときに呼ばれる関数
  answerRegisteredFn: null,                // 回答を登録したときに実行するコールバック関数
  pageLoadedFn: null,                      // ページ遷移したときに呼ばれるコールバック関数
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

  isVisibilityConditionDisabled() {
    return this.get('visibilityConditionDisabled');
  }
}
