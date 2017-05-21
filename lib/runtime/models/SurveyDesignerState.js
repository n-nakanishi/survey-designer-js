import { Map, Record, fromJS } from 'immutable';
import PageDefinition from './survey/PageDefinition';
import BranchDefinition from './survey/BranchDefinition';
import FinisherDefinition from './survey/FinisherDefinition';
import ConditionDefinition from './survey/ConditionDefinition';
import ChildConditionDefinition from './survey/ChildConditionDefinition';
import NodeDefinition from './survey/NodeDefinition';
import ItemDefinition from './survey/questions/internal/ItemDefinition';
import VisibilityConditionDefinition from './survey/questions/internal/VisibilityConditionDefinition';
import LogicalVariableDefinition from './survey/LogicalVariableDefinition';
import SurveyDefinition from './survey/SurveyDefinition';
import RuntimeValue from './runtime/RuntimeValue';
import ViewSetting from './view/ViewSetting';
import Options from './options/Options';
import { findQuestionDefinitionClass } from './survey/questions/QuestionDefinitions';

export const SurveyDesignerStateRecord = Record({
  runtime: new RuntimeValue(),   // ランタイム時に使用する値
  survey: null,                  // アンケートの定義
  view: new ViewSetting(),       // エディタの設定
  options: new Options(),        // 外部から指定可能なオプション
});

/** editor, runtimeなどで動作するときにReduxが持つstateのトップレベル定義 */
export default class SurveyDesignerState extends SurveyDesignerStateRecord {
  /**
   * JSONを解析し、stateで扱える方に変換する
   *
   * forTestにtrueを渡すとテストで使用しやすいように値を返す
   */
  static createFromJson(json, forTest) {
    const parsedObj = fromJS(json, (key, value) => {
      switch (key) {
        case 'answers':
          return new Map(value);
        case 'view':
          return new ViewSetting(value);
        case 'runtime':
          return new RuntimeValue(value);
        case 'options':
          return new Options(value);
        case 'survey':
          return new SurveyDefinition(value);
        case 'pages':
          return value.map(v => new PageDefinition(v)).toList();
        case 'questions':
          return value.map((v) => {
            const dataType = v.get('dataType');
            const Model = findQuestionDefinitionClass(dataType);
            if (!Model) throw new Error(`question dataType="${dataType}"に対応するクラスが見つかりません。`);
            return new Model(v);
          }).toList();
        case 'items':
          return value.map(v => new ItemDefinition(v)).toList();
        case 'subItems':
          return value.map(v => new ItemDefinition(v)).toList();
        case 'visibilityCondition':
          return new VisibilityConditionDefinition(value);
        case 'operators':
          return value.toList();
        case 'operands':
          return value.toList();
        case 'branches':
          return value.map(v => new BranchDefinition(v)).toList();
        case 'finishers':
          return value.map(v => new FinisherDefinition(v)).toList();
        case 'conditions':
          return value.map(v => new ConditionDefinition(v)).toList();
        case 'childConditions':
          return value.map(v => new ChildConditionDefinition(v)).toList();
        case 'nodes':
          return value.map(v => new NodeDefinition(v)).toList();
        case 'logicalVariables':
          return value.map(v => new LogicalVariableDefinition(v)).toList();
        default:
          return value;
      }
    });
    if (forTest) {
      // testのときは部分的に取り出すことも考えて SurveyDesignerState で包まずに返す
      return parsedObj;
    }
    return new SurveyDesignerState(parsedObj);
  }

  // for runtime
  getRuntime() {
    return this.get('runtime');
  }

  // for view
  getViewSetting() {
    return this.get('view');
  }

  // for definitions
  getOptions() {
    return this.get('options');
  }

  getSurvey() {
    return this.get('survey');
  }
}
