import * as fabric from "fabric";
import Editor from "../";
import { MAX_HISTORY_LENGTH } from "../config";

// https://github.com/alimozdemir/fabric-history/blob/master/src/index.js

// @TODO
// 对于 slider 类的配置，可以 onChangeEnd 触发历史记录，否则过于频繁

export default class FabricHistory {
  private historyUndo: string[];
  private historyRedo: string[];
  private saving: boolean; // if saving 2 history
  private doing: boolean; // if doing undo or redo
  private currentState: string;
  private canvas: fabric.Canvas;
  private editor: Editor;

  constructor(editor) {
    this.historyUndo = [];
    this.historyRedo = [];
    this.canvas = editor.canvas;
    this.editor = editor;

    this.saving = false;
    this.doing = false;

    this.currentState = this._getJSON();
    this.init();
  }

  private _checkHistoryUndoLength() {
    if (this.historyUndo.length > MAX_HISTORY_LENGTH) {
      this.historyUndo.shift();
    }
  }

  private _checkHistoryRedoLength() {
    if (this.historyRedo.length > MAX_HISTORY_LENGTH) {
      this.historyRedo.shift();
    }
  }

  private _isDoingOrSaving() {
    return this.doing || this.saving;
  }

  public _historySaveAction() {
    if (this._isDoingOrSaving()) return;
    this.saving = true;

    const json = this.currentState;
    this.historyUndo.push(json);
    this._checkHistoryUndoLength();
    // 新操作时清空重做栈
    this.historyRedo = [];
    this.currentState = this._getJSON();

    this.saving = false;
    // 触发状态更新事件
    // @ts-ignore
    this.canvas.fire("fabritor:history:changed");
  }

  private _getJSON() {
    return JSON.stringify(this.editor.canvas2Json());
  }

  private init() {
    // 直接在 init 中绑定箭头函数，确保 this 正确
    this.canvas.on("object:added", () => this._historySaveAction());
    this.canvas.on("object:removed", () => this._historySaveAction());
    this.canvas.on("object:modified", () => this._historySaveAction());
    this.canvas.on("object:skewing", () => this._historySaveAction());
    // @ts-ignore
    this.canvas.on("fabritor:object:modified", () => this._historySaveAction());
  }

  public dispose() {
    // 移除事件监听
    this.canvas.off("object:added");
    this.canvas.off("object:removed");
    this.canvas.off("object:modified");
    this.canvas.off("object:skewing");
    // @ts-ignore
    this.canvas.off("fabritor:object:modified");
  }

  public async undo() {
    const _history = this.historyUndo.pop();
    if (_history) {
      this.doing = true;

      this.historyRedo.push(this.currentState);
      this._checkHistoryRedoLength();
      this.currentState = _history;
      await this.editor.loadFromJSON(_history);

      this.doing = false;
      // @ts-ignore
      this.canvas.fire("fabritor:history:undo");
    }
  }

  public async redo() {
    const _history = this.historyRedo.pop();
    if (_history) {
      this.doing = true;

      this.historyUndo.push(this.currentState);
      this._checkHistoryUndoLength();
      this.currentState = _history;
      await this.editor.loadFromJSON(_history);

      this.doing = false;
      // @ts-ignore
      this.canvas.fire("fabritor:history:redo");
    }
  }

  public canUndo() {
    return this.historyUndo.length > 0;
  }

  public canRedo() {
    return this.historyRedo.length > 0;
  }

  public reset() {
    this.historyRedo = [];
    this.historyUndo = [];
    this.saving = false;
    this.doing = false;
    this.currentState = this._getJSON();
  }
}
