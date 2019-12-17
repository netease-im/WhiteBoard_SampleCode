import { WB_TOOL_NAME, IFileActionOption } from '../src/common/Common'
import EventEmitter from 'eventemitter3';

interface IExtKeyInfo {
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  which: number;
}
type IUserUpdateOption = {
  // mode: WB_MODE_NAME;
  tool: WB_TOOL_NAME;
  flagPos: string;
  size: number;
  color: string;
  fontsize: number;
  isMouseDown: boolean;
  keyDown: IExtKeyInfo
}


export interface globalHubEvents {
  update: ['user' | 'shape', any],
  userUpdate: [string, Partial<IUserUpdateOption>]
  userShapes: [string, number, number]
  globalShapes: [number]
  globalFile: [IFileActionOption | undefined];
  canDraw: [boolean]
}

interface HookEvent extends Pick<globalHubEvents,
  'globalFile' | 'globalShapes' | 'userShapes' | 'userUpdate' | 'canDraw'> {
  inited: [],
  customEvent: [string]
}


type IIdentity = 'owner' | 'normal';
interface InitOptions {
  debug?: boolean;
  nim: any;
  account: string;
  appKey: string,
  ownerAccount: string,
  identity: IIdentity
  whiteboard: any;
  whiteboardContainer: HTMLElement;
}

declare class WorkerHook extends EventEmitter<HookEvent> {
  // shadow copy，映射当前的worker状态
  userMap: { [uid: string]: any };
  file?: IFileActionOption
  // fileType?: IFileType;
  totalShapes: number;

  // 是否允许绘制
  isEnable: boolean;
  readyToSyncData(): void;
  setFileObj(value: any): void;
  setFileObjRaw(value: any): void;
  clearImage(): void;
  clearHtmlFile(): void;
  clearFile(): void;
  setTool(tool: WB_TOOL_NAME): void;
  setFontSize(size: number): void;
  setContainer(element: HTMLElement): void;
  setColor(color: string): void;
  setSize(size: number): void;
  enableDraw(value: boolean): void;
  changeRoleToPlayer(): void;
  changeRoleToAudience(): void;
  undo(): void;
  redo(): void;
  clear(): void;
  resetState(): void;
  page(type: 'leftEnd' | 'left' | 'up' | 'down' | 'right' | 'rightEnd'): void;
  getImageBlob(callback: BlobCallback, mime?: any, quality?: any): void;
  getImageURL(mime?: any, quality?: any): string;
  destroy(): void;
}

export function getInstance(opt: InitOptions): WorkerHook