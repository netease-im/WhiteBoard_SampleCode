
import React, { Component, render } from 'preact'
import styles from './toolbarUI.less'
import Icon from '../assets/icon'
import { IToolbarStates } from './toolbarUI';
import Hammer from 'hammerjs'
interface IconProps {
  type: (keyof typeof Icon) | 'customSVG' | 'customIMG' | 'customTXT';
  state: IToolbarStates,
  disable?: boolean
  label?: string
  onClick: (e: MouseEvent | TouchEvent | HammerInput) => void;
}

interface IconState {

}

function changeFillColor(svg: string, color: string) {
  return svg.replace(/fill(="[^"]*")?/, 'fill="' + color + '"')
}
function changeStrokeColor(svg: string, color: string) {
  return svg.replace(/stroke="[^"]*"/, 'stroke="' + color + '"')
}


const isPhone = /iphone|android/.test(navigator.userAgent.toLowerCase())
export default class ToolbarIcon extends Component<IconProps, IconState> {
  el?: Element;
  hammerIns?: HammerManager;
  componentDidMount() {
    console.log('mount icon');
    if (this.el) {
      this.hammerIns = new Hammer(this.el as HTMLElement, { domEvents: true, enable: true })
      this.hammerIns.on('tap', (e) => {
        console.warn('icon tap', e);
        if (!!this.props.disable) {
          // do nothing
        } else {
          this.props.onClick(e);
        }
      })
    }
  }
  componentWillUnmount() {
    console.log('unmount icon', this.props.label);
    if (this.hammerIns) {
      this.hammerIns.stop(true)
      this.hammerIns.off('tap');
      this.hammerIns.destroy();
    }
  }
  render(props: IconProps) {
    let { type: iconType, state, onClick, label, disable } = props;
    let { color, tool } = state;

    let svgText: string;
    if (iconType === 'customIMG') {
      svgText = '<img src="' + label! + '" />'
    } else if (iconType === 'customSVG') {
      svgText = label!
    } else if (iconType === 'customTXT') {
      svgText = '';// 什么也不用
    }
    else {
      svgText = Icon[iconType]
    }


    let title: string = ''
    switch (iconType) {
      case 'laserPen': {
        svgText = changeFillColor(svgText, '#f00')
        title = '激光笔'
        break;
      }
      case 'pen': {
        svgText = changeFillColor(svgText, color)
        title = '自由画笔'
        break;
      }
      case 'text': {
        svgText = changeFillColor(svgText, color)
        title = '文字工具'
        break
      }
      case 'paint': {
        svgText = changeFillColor(svgText, color)
        title = '填充工具'
        break
      }
      case 'rect': {
        svgText = changeStrokeColor(svgText, color)
        title = '方形'
        break
      }
      case 'roundRect': {
        svgText = changeStrokeColor(svgText, color)
        title = '圆角方形'
        break
      }
      case 'circle': {
        svgText = changeFillColor(svgText, color)
        title = '圆形'
        break
      }
      case 'ellipse': {
        svgText = changeFillColor(svgText, color)
        title = '椭圆工具'
        break;
      }
      case 'line': {
        svgText = changeFillColor(svgText, color)
        title = '直线工具'
        break
      }
      case 'shape': {
        title = '选择形状';
        svgText = changeFillColor(svgText, '#424242')
        break
      }
      case 'formats': {
        title = '修改格式'
        svgText = changeFillColor(svgText, '#424242')
        break
      }
      case 'erase': {
        title = '橡皮擦'
        if (disable) {
          svgText = changeFillColor(svgText, '#e0e0e0')
        } else {
          svgText = changeFillColor(svgText, '#424242')
        }
        break
      }
      case 'undo': {
        if (disable) {
          svgText = changeFillColor(svgText, '#e0e0e0')
        } else {
          svgText = changeFillColor(svgText, '#424242')
        }
        title = '撤销'
        break
      }
      case 'redo': {
        if (disable) {
          svgText = changeFillColor(svgText, '#e0e0e0')
        } else {
          svgText = changeFillColor(svgText, '#424242')
        }
        title = '重做'
        break
      }
      case 'clear': {
        if (disable) {
          svgText = changeFillColor(svgText, '#e0e0e0')
        } else {
          svgText = changeFillColor(svgText, '#424242')
        }
        title = '清除全部'
        break
      }
      case 'customIMG': {

      }
    }
    if (iconType === 'customTXT') {
      return (
        <div className={styles.toolbarItem}
          ref={dom => this.el = dom}
        >
          <span className={styles.textItem}
            title={label}
          >
            {label}
          </span>
        </div >
      )
    }
    return (
      <div title={title}
        ref={dom => this.el = dom}
        // onClick={disable || isPhone ? void 0 : onClick}
        // onTouchStart={disable ? void 0 : onClick}
        className={styles.toolbarIcon}
        dangerouslySetInnerHTML={{ __html: svgText }}
      />
    )
  }
}