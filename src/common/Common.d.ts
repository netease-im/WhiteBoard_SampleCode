
export enum WB_TOOL {
  flag = -1, // 激光笔工具
  free = 1, // 自由画笔工具
  line = 2, // 直线工具
  rect = 3, // 矩形工具
  solidRect = 4, // 实心矩形工具
  roundRect = 5,  //  圆角矩形工具
  solidRoundRect = 6, // 实心圆角矩形工具
  circle = 7, // 圆形工具
  solidCircle = 8, // 实心圆工具
  ellipse = 9, // 椭圆工具
  solidEllipse = 10, // 实心椭圆工具
  fill = 11,  // 油漆桶工具
  text = 12,  // 文本工具
  erase = 13, //  橡皮擦工具

}


export type WB_TOOL_NAME = keyof typeof WB_TOOL;
type IFileType = 'img' | 'h5' | 'clear';
export interface IFileActionOption {
  docId: string,
  currentPage?: number,
  pageCount?: number,
  type: IFileType,//TODO 去掉‘’
  url?: string,
  urlStr?: string,
  h5Cmd?: string
}
