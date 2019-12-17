import EventEmitter from 'eventemitter3';

declare namespace utils {
  const RECORD_FILE: RegExp;
  function parseUrl(url: string): {
    uid: string;
    cid: string;
    timestamp: number;
    chunk: number;
    mixed: boolean;
    type: IRecordFileType;
  };
  const getID: () => number;
}

declare interface IRecordFileParam {
  account: string;
  url: string;
  uid: string;
  cid: string;
  timestamp: number;
  chunk: number;
  mixed: boolean;
  type: IRecordFileType;
}
declare type IRecordFileType = 'mp4' | 'flv' | 'aac' | 'gz';
declare type IFileType = 'img' | 'h5' | 'clear';
interface IFileActionOption {
  docId: string;
  currentPage?: number;
  pageCount?: number;
  type: IFileType;
  url?: string;
  urlStr?: string;
  h5Cmd?: string;
}


declare type IIdentity = 'owner' | 'normal';


declare interface IDrawWorkerOptions {
  account: string | number;
  width?: number;
  height?: number;
  ownerAccount: string
  identity: IIdentity;
  nim?: any;
  // isP2P?: boolean;
  backgroundUrl?: string;
  color?: string;
  // mode?: string;// 这个是用户设置的模式
  // zIndex?: number;
  whiteboard: any,
  handleFile?: (type: IFileType, file: IFileActionOption) => Promise<IFileActionOption>
}
declare interface IRecallOptions extends IDrawWorkerOptions {
  files: IRecordFileParam[];
  withCredentials?: boolean;
  isCompatible: boolean;
}
declare interface IRecallEvent {
  ready: [];
  visibleChange: ['show' | 'hide', IRecordFileParam, (dom?: HTMLElement) => void]
  tick: [number];
  pause: [];
  finish: [];
  play: [];
  finished: [];
}

declare class TickTick {
  currentTime: number;
  state: 'stop' | 'play';
}
declare class Timeline {
  ticker: TickTick
  duration: number;
}

declare class Recall extends EventEmitter<IRecallEvent> {
  opt: IRecallOptions;
  timeline?: Timeline
  static utils: typeof utils;
  constructor(opt: IRecallOptions);
  init(): void;
  play(): boolean;
  pause(): boolean;
  seekTo(time: number): void;
}
export = Recall; 