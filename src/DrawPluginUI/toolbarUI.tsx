import React, { Component, render } from 'preact'
import styles from './toolbarUI.less'
import util from '../common/util'
import ToolbarIcon from './toolbarIcon'
import Select from './toolbarSelect'
import { WB_TOOL_NAME, IFileActionOption, IFileType } from '../common/Common';
import { getInstance } from '../../sdk/DrawPlugin.2.0.0'

type DrawPluginInstance = ReturnType<typeof getInstance>;
const { toolbarItem } = styles;

interface IProps {
  user: { account: string, identity: 'owner' | 'normal' };
  adapter: DrawPluginInstance;
  options?: UIControlDefaultOptions
}


const TOOL_ITEMS = [
  'flag',
  'free',
  'text',
  'fill',
  'fill',
  'line',
  'rect',
  'roundRect',
  'circle',
  'ellipse',
  'erase',
  'undo',
  'redo',
  'clear',
]

const CUSTOM_TOOL_ITEM = [
  'customTXT', 'customSVG', 'customIMG'
]
export type stringToolItem = 'flag' |
  'free' |
  'text' |
  'fill' |
  'fill' |
  'line' |
  'rect' |
  'roundRect' |
  'circle' |
  'ellipse' |
  'erase' |
  'undo' |
  'redo' |
  'clear';


type PAGE_BUTTON_TYPE = 'leftEnd' | 'left' | 'up' | 'page' | 'down' | 'right' | 'rightEnd';

export interface IToolbarStates {
  show: boolean;

  color: string;
  tool: WB_TOOL_NAME;
  size: number;
  fontsize: number;

  morePanel: '' | 'shape' | 'formats',
  globalShapes: number,
  visible: number,
  recycle: number;
  file?: IFileActionOption

  offsetX: number;// 偏移量
}



const isPhone = /iphone|android/.test(navigator.userAgent.toLowerCase())

class Toolbar extends Component<IProps, IToolbarStates>{

  activeIndicator: JSX.Element
  static defaultColors = ['#ff5050', '#ff8906', '#fef005', '#05fe1d', '#2f87ff', '#7505fe', '#000000', '#888888'] // 红蓝黄绿紫
  static defaultSize = [4, 6, 8, 12]
  static defaultFontsize = [20, 24, 28, 32]

  touchMove: boolean = false;
  lastTouchMoveTime: number = 0;
  panel?: Element;
  lastTouchOffset: number = 0;
  lastEventX: number = 0;
  offsetLimit: number = 0;

  user: {
    account: string;
    identity: 'owner' | 'normal';
  }
  options: UIControlDefaultOptions;
  hammerIns?: HammerManager;
  constructor(props: IProps) {
    super(props)

    const { adapter, user: userProps, options } = props;
    this.options = options!;
    const { account } = userProps;
    console.log(userProps);
    this.user = userProps;
    let user = adapter.userMap[account];

    const { tool, color, size, fontsize, visible, recycle } = user || {
      color: '#000000',
      tool: 'flag',
      fontsize: 24,
      size: 4,
      visible: 0,
      recycle: 0,
    }

    this.state = {
      show: adapter.isEnable,
      morePanel: '',
      globalShapes: adapter.totalShapes,
      tool, color, size, fontsize, visible, recycle,
      file: adapter.file,
      offsetX: 0,
    }



    adapter.on('canDraw', (canDraw) => {
      this.setState({ show: canDraw })
    })
    adapter.on('globalFile', (file) => {
      this.setState({ file })
    })

    adapter.on('globalShapes', (count) => {
      this.setState({
        globalShapes: count
      })
    })

    adapter.on('userShapes', (userAccount, visible, recycle) => {
      if (userAccount === account) {
        this.setState({ visible, recycle })
      }
    })

    adapter.on('userUpdate', (userAccount, opt) => {
      if (userAccount === account) {
        const gather = ['color', 'tool', 'fontsize', 'size'].reduce((obj, key) => {
          let val = (opt as any)[key];
          if (typeof val !== 'undefined') {
            obj[key] = val
          }
          return obj
        }, {} as any) as IToolbarStates

        if (Object.keys(gather).length > 0) {
          this.setState(gather)
        }
      }
    })

    if (!isPhone) {
      document.body.addEventListener('click', this.bodyEventHanlder, true)
    }
    document.body.addEventListener('touchstart', this.bodyEventHanlder, true)
    this.activeIndicator = <span className={styles.activeIndicator}></span>

  }
  componentWillUnmount() {

    const { adapter } = this.props;

    adapter.off('globalFile')
    adapter.off('globalShapes')
    adapter.off('userShapes')
    adapter.off('userUpdate')

    document.body.removeEventListener('click', this.bodyEventHanlder)
    document.body.removeEventListener('touchstart', this.bodyEventHanlder)
  }

  bodyEventHanlder = (e: MouseEvent | TouchEvent) => {
    console.warn('body evnet', e);
    if (!!this.state.morePanel) {

      let target = e.target as HTMLElement | null;
      let body = document.body;
      let hidePanel = true;
      while (target !== body && target !== null) {
        let { className } = target
        console.log(className, styles.formatsPanel);
        if (
          typeof className === 'string' && (
            className.search(styles.formatsPanel) > -1
            || className.search(styles.morePanel) > -1
            || className.search('doNotHide') > -1
            // 如果事件上有这三个类，就不关闭panel
          )
        ) {
          hidePanel = false
          break;
        }
        target = target.parentElement
      }
      if (hidePanel) {
        // e.preventDefault()
        // e.stopPropagation()
        console.warn('  event hidePanel', e);
        this.hideMorePanel()
      } else {
        return true
      }
    }

  }
  togglePanel(panel: 'shape' | 'formats') {
    console.warn('toggle pane');
    const { morePanel } = this.state
    if (morePanel === '' || morePanel !== panel) {
      this.showMorePanel(panel)
    } else if (morePanel === panel) {
      this.hideMorePanel()
    }
  }


  showMorePanel(panel: 'shape' | 'formats') {
    console.log('show more panel');
    this.setState({ morePanel: panel })
  }
  hideMorePanel() {
    console.log('hdie more panel');
    this.setState({ morePanel: '' })
  }


  changeColor(color: string) {
    this.props.adapter.setColor(color);
  }
  changeSize(size: number) {
    this.props.adapter.setSize(size);
  }
  changeFontSize(size: number | string) {
    this.props.adapter.setFontSize(parseInt('' + size))
  }

  handleCustomEvent(eventName: string) {
    this.props.adapter.emit('customEvent', eventName)
  }
  getFormatsPanel(item: formatsOption) {

    let {
      color: defaultColors,
      size: defaultSizzzzzzzze,
      fontsize: defaultFontsize
    } = item


    const { fontsize: currentFontSize, size: currentSize } = this.state;
    return (
      <div className={styles.formatsPanel}>
        <div className={styles.colors}>
          {defaultColors.map(color => {
            return (
              <span title={color} key={color}
                className={styles.color}
                style={{ backgroundColor: color }}
                onClick={() => this.changeColor(color)}
                onTouchEnd={() => this.changeColor(color)}
              />
            )
          })}

        </div>
        <p className={styles.tip}>线条宽度</p>
        <div className={styles.lineSizeWrap}>
          {defaultSizzzzzzzze.map(size => {
            let handler = (e: Event) => {
              this.changeSize(size)
              e.stopPropagation()
            }
            return (
              <div
                onTouchEnd={handler}
                onClick={handler}
                className={styles.lineSize + ' ' + (size === currentSize ? styles.active : "")}>
                <span title={'' + size} key={'' + size}
                  style={{ width: size, height: size }}

                />
              </div>
            )
          })}
        </div>
        <p className={styles.tip}>字体大小<Select value={currentFontSize} onSelect={(fontsize) => {
          this.changeFontSize(fontsize)
        }} options={defaultFontsize} /></p>

      </div>
    )
  }

  generateToolbarItem(item: stringToolItem | normalItem | CustomItem | shapesOption | formatsOption, index: number) {
    // key要求使用独立的id，这里使用数组索引不是很明智
    const { tool, morePanel } = this.state;
    const { adapter, options } = this.props;
    if (typeof item === 'string') {
      item = { type: item }
    }
    const { type } = item
    switch (type) {
      case 'flag':
        return (
          <div className={toolbarItem} key={index.toString()}>
            <ToolbarIcon
              onClick={() => adapter.setTool('flag')}
              type='laserPen'
              state={this.state} />
            {tool === 'flag' && this.activeIndicator}
          </div>
        )
      case 'free':

        return (
          <div className={toolbarItem}>
            <ToolbarIcon
              onClick={() => adapter.setTool('free')} type='pen'
              state={this.state} />
            {tool === 'free' && this.activeIndicator}
          </div>
        )
      case 'text':
        return (
          <div className={toolbarItem}>
            <ToolbarIcon
              onClick={(e) => {
                adapter.setTool('text');
                e.preventDefault()
              }}
              type='text'
              state={this.state} />
            {tool === 'text' && this.activeIndicator}
          </div>
        )
      case 'fill':
        return (
          <div className={toolbarItem}>
            <ToolbarIcon onClick={() => adapter.setTool('fill')}
              type='paint'
              state={this.state} />
            {tool === 'fill' && this.activeIndicator}
          </div>
        )
      case 'line':
        return (
          <div className={toolbarItem}>
            <ToolbarIcon onClick={() => adapter.setTool('line')}
              type='line'
              state={this.state} />
            {tool === 'line' && this.activeIndicator}
          </div>
        )
      case 'rect':
        return (
          <div className={toolbarItem}>
            <ToolbarIcon onClick={() => adapter.setTool('rect')}
              type='rect'
              state={this.state} />
            {tool === 'rect' && this.activeIndicator}
          </div>
        )
      case 'roundRect':
        return (
          <div className={toolbarItem}>
            <ToolbarIcon onClick={() => adapter.setTool('roundRect')}
              type='roundRect'
              state={this.state} />
            {tool === 'roundRect' && this.activeIndicator}
          </div>
        )
      case 'circle':
        return (
          <div className={toolbarItem}>
            <ToolbarIcon onClick={() => adapter.setTool('circle')}
              type='circle'
              state={this.state} />
            {tool === 'circle' && this.activeIndicator}
          </div>
        )
      case 'ellipse':
        return (
          <div className={toolbarItem}>
            <ToolbarIcon onClick={() => adapter.setTool('ellipse')}
              type='ellipse'
              state={this.state} />
            {tool === 'ellipse' && this.activeIndicator}
          </div>
        )
      case 'erase':
        return (
          <div className={toolbarItem}>
            <ToolbarIcon onClick={() => adapter.setTool('erase')}
              type='erase'
              disable={this.state.globalShapes == 0}
              state={this.state} />
            {tool === 'erase' && this.activeIndicator}
          </div>
        )
      case 'undo':
        return (
          <div className={toolbarItem}>
            <ToolbarIcon onClick={() => adapter.undo()}
              disable={this.state.visible == 0}
              type='undo' state={this.state} />
          </div>
        )
      case 'redo':
        return (
          <div className={toolbarItem}>
            <ToolbarIcon onClick={() => adapter.redo()}
              disable={this.state.recycle === 0}
              type='redo' state={this.state} />
          </div>
        )
      case 'clear':
        return (
          <div className={toolbarItem}>
            <ToolbarIcon onClick={() => {
              if (options && options.customClear) {
                adapter.emit('customEvent', 'clear')
              } else {
                adapter.clear()
              }
            }}
              disable={this.state.globalShapes === 0}
              type='clear' state={this.state} />
          </div>
        )
      case 'shapes': {
        let items = (item as shapesOption).items
        return (
          <div className={toolbarItem + ' doNotHide'}>
            <ToolbarIcon onClick={() => this.togglePanel('shape')}
              type='shape' state={this.state}
            />
            <div className={styles.morePanel + ' ' + styles.flexRow} style={`display:${morePanel === 'shape' ? 'flex' : 'none'}`}>
              {items.map((it, idx) => this.generateToolbarItem(it, idx))}
            </div>
          </div>
        )
      }
      case 'formats': {
        return (
          <div className={toolbarItem + ' doNotHide'}>
            <ToolbarIcon onClick={() => {
              console.log('click formats');
              this.togglePanel('formats')
            }}
              type='formats' state={this.state} />
            {morePanel === 'formats' && this.getFormatsPanel(item as formatsOption)}
          </div>
        )
      }
      case 'customTXT': {
        const { label, eventName } = item as CustomItem
        return (
          <ToolbarIcon
            onClick={() => this.handleCustomEvent(eventName)}
            type={type}
            label={label}
            state={this.state} />
        )
      }
      case 'customSVG':
      case 'customIMG': {
        const { label, eventName } = item as CustomItem
        return (
          <div className={toolbarItem}>
            <ToolbarIcon
              onClick={() => this.handleCustomEvent(eventName)}
              type={type}
              label={label}
              state={this.state} />
          </div>
        )
      }
      default:
        const fullCaseChecker: never = type;
    }
  }
  renderPageBtn(item: PAGE_BUTTON_TYPE, index: number, currentPage: number, pageCount: number) {
    if (item === 'page') {
      return (
        <div className={toolbarItem}>
          &nbsp;{currentPage} / {pageCount}&nbsp;
      </div>
      )
    }
    return (
      <div className={toolbarItem}>
        <ToolbarIcon
          onClick={(e) => { this.page(item, e) }}
          type={item}
          state={this.state} />
      </div>
    )
  }
  page(type: 'leftEnd' | 'left' | 'up' | 'down' | 'right' | 'rightEnd', e: Event | HammerInput) {
    e.preventDefault()
    console.log(type);
    this.props.adapter.page(type)
  }

  resetTouchEvent = (e: TouchEvent) => {
    this.touchMove = false

  }
  componentDidMount() {
    console.warn('ui did mount', this.panel);
    if (this.panel) {

      let panelWidth = (this.panel as HTMLElement).offsetWidth;
      let parentWidth = this.panel.parentElement!.offsetWidth;
      let delta = panelWidth - parentWidth

      if (delta < 0 && parentWidth < 500) {
        let offsetX = Math.floor(-delta / 2)
        if (this.state.offsetX !== offsetX) {
          this.setState({ offsetX: offsetX })
        }
      }


    }
  }
  componentDidUpdate() {
    // 检查宽度是否已经足够了
    console.log('did update', JSON.stringify(this.state));
    if (this.panel) {

      if (!this.hammerIns) {
        console.error('bind pan evetn');
        this.hammerIns = new Hammer(this.panel as HTMLElement, { domEvents: true, })
        this.hammerIns.add(new Hammer.Pan({ direction: Hammer.DIRECTION_HORIZONTAL }))
        this.hammerIns.on('tap', (e) => {
          console.warn('tap panel');
        })
        this.hammerIns.on('panstart', this.handleTouchStart)
        this.hammerIns.on('panmove', this.handleTouchMove)
        this.hammerIns.on('panend', this.handleTouchEnd)

      }

      let panelWidth = (this.panel as HTMLElement).offsetWidth;
      let parentWidth = this.panel.parentElement!.offsetWidth;
      let delta = panelWidth - parentWidth
      console.log(delta, panelWidth, parentWidth);
      if (delta < 0) {
        if (parentWidth < 500) {
          let offsetX = Math.floor(-delta / 2)
          if (this.state.offsetX != offsetX) {
            this.setState({ offsetX: offsetX })
          }
        }
        return
      }
      let offsetX = this.state.offsetX;
      if (offsetX > 0) {
        offsetX = 0
      }
      if (offsetX < -delta) {
        offsetX = -delta
      }
      if (this.state.offsetX !== offsetX) {
        this.setState({ offsetX: offsetX })
      }
      this.offsetLimit = delta;
    }
  }
  handleTouchStart = (e: HammerInput) => {

    console.log(e);

    if (this.panel) {
      let panelWidth = (this.panel as HTMLElement).offsetWidth;
      let parentWidth = this.panel.parentElement!.offsetWidth;
      let delta = panelWidth - parentWidth
      if (delta < 0) {
        delta = 0
      }
      console.log(delta, panelWidth, parentWidth);
      this.offsetLimit = delta;
    }
    this.touchMove = true;
    this.lastTouchMoveTime = Date.now()
    let x: number = 0
    x = e.deltaX;
    this.lastTouchOffset = this.state.offsetX;
    this.lastEventX = x;
    console.log(x);
  }
  handleTouchMove = (e: HammerInput) => {
    console.log(e);
    if (this.touchMove) {
      let x: number = 0
      x = e.deltaX;
      let offsetX = x - this.lastEventX + this.lastTouchOffset;
      if (offsetX > 0) {
        offsetX = 0
      }

      if (offsetX < -this.offsetLimit) {
        offsetX = -this.offsetLimit;
      }
      this.setState({ offsetX: offsetX })
      console.log(this.lastEventX - x)
    }
  }
  handleTouchEnd = (e: HammerInput) => {
    console.log(e);
    let now = Date.now()
    if (now - this.lastTouchMoveTime > 1000) {
      this.touchMove = false;
    }
    this.touchMove = false;
    this.lastTouchOffset = this.state.offsetX;
  }

  render(props: IProps, state: IToolbarStates) {
    const { show, tool, file, offsetX } = state;
    const { adapter, options } = props;
    if (!options) {
      throw new Error('options is not defined')
    }
    if (!show) {
      return null
    }

    console.log(file);
    let hasFile: boolean = typeof file === 'object' && file !== null;
    let fileType: IFileType | undefined;
    let pageBtnArr: PAGE_BUTTON_TYPE[] | undefined
    let currentPage: number | undefined;
    let pageCount: number | undefined;
    if (hasFile) {
      fileType = file!.type;
      if (fileType === 'h5') {
        pageBtnArr = ['leftEnd', 'left', 'up', 'page', 'down', 'right', 'rightEnd']
      } else if (fileType === 'img') {
        pageBtnArr = ['leftEnd', 'left', 'page', 'right', 'rightEnd']
      }
      pageCount = file!.pageCount!;
      currentPage = file!.currentPage!;
    }

    const iAmStudent = this.user.identity === 'normal';

    if (iAmStudent) {
      pageBtnArr = undefined;
    }

    const { toolbar } = options

    return (
      <div className={styles.toolbarContainer}>
        <div className={styles.toolbarPanel} style={`transform:translateX(${offsetX}px)`}
          ref={node => this.panel = node}
        // onTouchStart={this.handleTouchStart}
        // onTouchMove={this.handleTouchMove}
        // onTouchEnd={this.handleTouchEnd}
        >
          {toolbar.map((item, index) => this.generateToolbarItem(item, index))}
          {hasFile && !iAmStudent && pageBtnArr && pageBtnArr.map((btn, index) => this.renderPageBtn(btn, index, currentPage!, pageCount!))}
          {hasFile && !iAmStudent && this.generateToolbarItem({ type: 'customTXT', label: '关闭文档', eventName: 'closeDoc' }, 2000)}
        </div>
      </div>
    )
  }
}


interface normalItem {
  type: stringToolItem,
  labelType?: 'svg' | 'img'
  label?: string
}
interface shapesOption {
  type: 'shapes',
  items: (stringToolItem | normalItem)[]
}
interface formatsOption {
  type: 'formats',
  color: string[],
  size: number[],
  fontsize: number[]
}

type ToolbarArray = (stringToolItem | normalItem | CustomItem | shapesOption | formatsOption)[]
interface UIControlDefaultOptions {
  customClear?: boolean;
  toolbar: ToolbarArray
}
export interface CustomItem {
  type: 'customTXT' | 'customSVG' | 'customIMG',
  label: string,
  eventName: string,
  // params: any // 这个看上去没什么必要
}
const getDefaultToolbar = () => [
  'flag', 'free', 'text', 'fill',
  { type: 'shapes', items: ['line', 'rect', 'ellipse'] },
  { type: 'formats' },
  'erase', 'undo', 'redo', 'clear',
  { type: 'customTXT', label: '文档库', eventName: 'exploreDocument' }
] as ToolbarArray



const getNormalItem = (obj: any) => {
  if (typeof obj.labelType == 'undefined') {
    return obj as normalItem
  }
  if (['svg', 'img'].indexOf(obj.labelType) > -1) {
    if (typeof obj.label !== 'string' || obj.label.length === 0) {
      throw new Error('label should be no-empty string')
    } else {
      return obj as normalItem
    }
  } else {
    throw new Error('unknown labelType:' + obj.labelType)
  }
}
const getCustomItem = (obj: any) => {
  if (CUSTOM_TOOL_ITEM.indexOf(obj.type) > -1) {
    if (typeof obj.label !== 'string' || obj.label.length === 0) {
      console.error(obj);
      throw new Error('label should be no-empty string')
    } else {
      return obj as CustomItem
    }
  } else {
    throw new Error('unknown labelType:' + obj.labelType)
  }
}
const getShapesItem = (obj: any) => {
  if (!util.isValidArray(obj.items)) {
    console.error(obj);
    throw new Error('shapes.items should has element!')
  } else {
    let items = obj.items.slice()
    obj.items = items.map((item: any) => {
      if (typeof item === 'string') {
        return getObjectLikeItem(item)
      } else if (typeof item === 'object' && item !== null) {
        if (TOOL_ITEMS.indexOf(item.type) > -1) {
          return getNormalItem(item)
        } else {
          throw new Error('unknown type:' + item.type)
        }
      } else {
        let error = new Error('shapes.items should be string or normal item')
        console.error(error)
        throw error
      }
    })

    return obj as shapesOption
  }
}
const getFormatsItem = (obj: any) => {
  if (typeof obj.color === 'undefined') {
    obj.color = Toolbar.defaultColors;
  }
  if (!util.isValidArray(obj.color)) {
    throw new Error('formats.color should be array')
  }

  if (typeof obj.size === 'undefined') {
    obj.size = Toolbar.defaultSize;
  }
  if (!util.isValidArray(obj.size)) {
    throw new Error('formats.size should be array')
  }

  if (typeof obj.fontsize === 'undefined') {
    obj.fontsize = Toolbar.defaultFontsize;
  }
  if (!util.isValidArray(obj.fontsize)) {
    throw new Error('formats.size should be array')
  }

  return obj as formatsOption
}


const getObjectLikeItem = (type: string): normalItem => {
  if (TOOL_ITEMS.indexOf(type) > -1) {
    return { type: type as stringToolItem }
  } else {
    throw new Error('未知的toolbar参数：' + type)
  }
}

const getObjectItem = (obj: any) => {
  if (obj.type) {
    let type = obj.type;
    if (TOOL_ITEMS.indexOf(type) > -1) {
      // 是普通的直接工具,判断是否配置了自定义图标ß
      return getNormalItem(obj)
    } else if (CUSTOM_TOOL_ITEM.indexOf(type) > -1) {
      // 是自定义item
      return getCustomItem(obj)
    } else if (type === 'shapes') {
      // 是shapes
      return getShapesItem(obj)
    } else if (type === 'formats') {
      // 是formats
      return getFormatsItem(obj)
    } else {
      throw new Error('unknow toolbar item type:' + type)
    }
  } else {
    console.error(obj)
    throw new Error('object \'type\' property invalid')
  }
}

/*
* 只会选择需要使用的参数，其他参数会被丢弃
*/
function selectOptions(opt: any): [false] | [true, UIControlDefaultOptions] {

  let copy = {} as UIControlDefaultOptions
  if (!opt) {
    opt = {};
    copy = { toolbar: getDefaultToolbar() }
  } else {
    if (util.isValidArray(opt.toolbar)) {
      copy.toolbar = opt.toolbar.slice()
    } else {
      copy.toolbar = getDefaultToolbar()
    }
  }

  let toolbar = copy.toolbar;
  // 
  // @ts-ignore
  // toolbar.unshift({ type: 'formats' })
  for (let i = 0, len = toolbar.length; i < len; i++) {
    let item = toolbar[i];
    if (!item) {
      throw new Error('invalid item:' + item)
    }

    if (typeof item === 'string') {
      toolbar[i] = getObjectLikeItem(item)
    } else if (typeof item === 'object') {
      toolbar[i] = getObjectItem(item)
    }

  }

  // 自定义清除
  if (typeof opt.customClear === 'boolean') {
    copy.customClear = opt.customClear
  } else if (typeof opt.customClear !== 'undefined') {
    console.warn('未知的customClear参数')
    copy.customClear = false
  }


  return [true, copy]
}
export const mount = (
  root: HTMLElement,
  user: { account: string, identity: 'owner' | 'normal' },
  handler: DrawPluginInstance,
  options: UIControlDefaultOptions,
  compare?: Element
) => {




  /*
  * 只会选择需要使用的参数，其他参数会被丢弃
  */
  let [valid, opt] = selectOptions(options)

  if (!valid) {
    throw new Error('参数校验未通过')
  }

  const element = (
    <Toolbar
      user={user}
      adapter={handler}
      options={opt}
    />)


  let app = render(element, root, compare)
  return [element, app]
}
const Nothing = () => null
export const unmount = (root: Element, app: Element) => {
  render(<Nothing />, root, app)
}

