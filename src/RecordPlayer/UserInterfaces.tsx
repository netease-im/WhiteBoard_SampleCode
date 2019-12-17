import React, { render, } from 'preact';
// Tell Babel to transform JSX into preact.h() calls:
/** @jsx preact.h */
import Recall from '../../sdk/RecordPlayer.2.0.0';



const PAUSE_BASE_64 = 'data:image/png;base64,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'


const PLAY_BASE_64 = 'data:image/png;base64,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'
const isPhone = /iphone|android/i.test(navigator.userAgent);
const style = function (arr: TemplateStringsArray, ...rest: any[]) {
  let len = arr.length;
  let ret = []
  for (let i = 0; i < len; i++) {
    ret.push(arr[i])
    if (i !== len - 1) {
      ret.push(rest[i])
    }
  }
  let str = ret.join('').replace(/[\r\n]*/gm, '')
  return str
}
const p0 = (n: number) => n < 10 ? '0' + n : '' + n
const getTime = (n: number, showHour: boolean = false): [string, number] => {
  n = ~~(n / 1000)
  let second = n % 60;
  n -= second;
  n = ~~(n / 60) // 有多少分钟
  let minute = (n % 60)// 
  let hour = ~~(n / 60)

  if (hour === 0 && showHour === false) {
    return [`${p0(minute)}:${p0(second)}`, hour]
  }
  return [`${hour}:${p0(minute)}:${p0(second)}`, hour]
}


interface IProps {
  player: Recall
}
interface IStates {
  time: number;// 当前时间
  duration: number;// 起止时间

  showLabel: boolean;
  labelLeft: number;
  labelText: string;
  drag: boolean;

  paused: boolean
}

export default class UI extends React.Component<IProps, IStates> {
  timeline?: Element;
  constructor(props: IProps) {
    super(props)

    const { player } = props;
    this.state = {
      time: player.timeline!.ticker.currentTime,
      duration: player.timeline!.duration,
      showLabel: false,
      labelLeft: 0,
      labelText: '',
      paused: player.timeline!.ticker.state === 'stop',
      drag: false
    }
    player.on('tick', (time) => {
      this.updateTime(time)
    })
    player.on('play', () => {
      this.setState({ paused: false })
    })
    player.on('pause', () => {
      this.setState({ paused: true })
    })
  }
  updateTime(time: number) {
    this.setState({
      time: time
    })
  }


  onMouseMove = (e: MouseEvent | TouchEvent) => {
    // console.log(e, 'mouse move');
    let currentX = 0;
    let left = (this.timeline as HTMLElement).getBoundingClientRect().left;
    if (e.type.search('mouse') > -1) {
      currentX = (e as MouseEvent).clientX - left;
    } else {

      currentX = (e as TouchEvent).touches[0].clientX - left;
    }

    let fullWidth = (this.timeline as HTMLDivElement).offsetWidth;

    // 防止越界
    if (currentX < 0) {
      currentX = 0
    }
    if (currentX > fullWidth) {
      currentX = fullWidth;
    }

    let [labelText] = getTime(this.state.duration * (currentX / fullWidth))

    this.setState({
      labelLeft: currentX,
      labelText: labelText,
    })
  }
  pauseOrPlay = (e: MouseEvent | TouchEvent) => {
    const { paused } = this.state
    if (paused) {
      this.props.player.play()
    } else {
      this.props.player.pause()
    }
    this.setState({ paused: !paused })
  }

  onMouseDown = (e: MouseEvent | TouchEvent) => {
    let role = (e.target! as HTMLDivElement).getAttribute('role');
    if (role === 'slider') {
      this.setState({
        showLabel: true,
        drag: true
      })

      this.onMouseMove(e);
    }
  }
  onMouseUp = (e: MouseEvent | TouchEvent) => {
    if (this.state.drag) {
      this.seekTo(e)
    }
    this.hidePosition(e)
  }
  showPosition = (e: MouseEvent | TouchEvent) => {
    console.log('show', new Date(), (e.target! as HTMLElement).getAttribute('role'), e);
    this.setState({
      showLabel: true
    })
    this.onMouseMove(e);
  }
  hidePosition = (e: MouseEvent | TouchEvent) => {
    console.log('hide', new Date(), (e.target! as HTMLElement).getAttribute('role'), e);

    this.setState({
      showLabel: false
    })
  }
  seekTo = (e: MouseEvent | TouchEvent) => {
    console.log('seek to', e);
    let currentX = 0;
    let left = (this.timeline as HTMLElement).getBoundingClientRect().left;
    if (e.type.search(/mouse|click/) > -1) {
      currentX = (e as MouseEvent).clientX - left;
    } else {
      console.log(left, currentX);
      currentX = (e as TouchEvent).changedTouches[0].clientX - left;// touchend 没有这个touches
    }

    let fullWidth = (this.timeline as HTMLDivElement).offsetWidth;
    if (currentX < 0) {
      currentX = 0
    }
    if (currentX > fullWidth) {
      currentX = fullWidth;
    }
    let seekTime = this.state.duration * (currentX / fullWidth)
    this.props.player.seekTo(seekTime)

    let updator: any = {
      labelLeft: currentX,
      time: seekTime,
      drag: false,
    };
    // 如果是鼠标事件，不隐藏光标

    if (isPhone) {
      updator.showLabel = false;
    }

    this.setState(updator)
  }
  render(props: IProps, state: IStates) {
    const { time, duration, showLabel, labelLeft, labelText, paused, drag } = state

    let widthPercent = 0;
    if (time >= duration) {
      widthPercent = 100
    } else if (time <= 0) {
      widthPercent = 0;
    } else {
      widthPercent = time / duration * 100
    }


    let timeDuration: string;
    if (time > duration) {
      let [durationStr] = getTime(duration);
      timeDuration = durationStr + '/' + durationStr
    } else {
      let [durationStr, durationHour] = getTime(duration);
      let [currentStr] = getTime(time, durationHour > 0)
      timeDuration = currentStr + '/' + durationStr
    }

    let paddingRight: number;
    if (timeDuration.length === 11) {
      paddingRight = 100
    } else if (timeDuration.length < 17) {
      paddingRight = 120
    } else {
      paddingRight = 140
    }


    let uiStyle = style` 
    display: block;
    position: relative;
    height: 30px;
    background: rgba(113, 113, 113, 0.23);
    user-select: none;
    `

    let playIconStyle = style`
    display:inline-block;
    height:inherit;
    width:inherit;
    background-size:cover;
    background-image:url(${(paused ? PLAY_BASE_64 : PAUSE_BASE_64)})`;

    let durationStyle = style`
    position:absolute;
    top:5px;
    right:10px;
    height:20px;
    font-size:14px;
    font-family:sans-serif;`;

    let currentLabelStyle = style`
      position: absolute;
      display: ${showLabel ? 'inline-block' : 'none'};
      height: 20px;
      left: ${labelLeft}px;
      background: white;
      borderRadius: 3px;
      bottom: 10px;
      padding: 4px 6px;
      transform: translateX(-50%);
    `

    let labelBGStyle = style`
      position: absolute;
      display: ${showLabel ? 'inline-block' : 'none'};
      height: 20px;
      left: ${labelLeft}px;
      background: 'white';
      width: 2px;
      bottom: -5px;
      pointerEvents: none;
    `

    let sliderStyle = style`
      position: absolute;
      left: ${drag ? labelLeft + 'px' : widthPercent + '%'};
      top: -5px;
      bottom: -5px;
      background: white;
      background-clip: ${drag ? 'border-box' : 'content-box'};
      box-sizing: content-box;
      padding:0 4px;
      width: 4px;
      transform:translateX(-6px);
    `

    let timelineStyle = style`
      position: absolute;
      left: 40px;
      right: ${paddingRight}px;
      top: 12px;
      bottom: 12px;
      height: 6px;
      cursor: pointer;
      background: rgba(0,0,0,0.12);
    `
    let blueLineStyle = style`
      position: absolute;
      background: rgba(24, 121, 226, 0.7);
      width: ${widthPercent + '%'};
      height: inherit;
      pointer-events: none;
    `

    return (
      <div
        id="__playerUI"
        style={uiStyle} >
        <div
          role="icon"
          onClick={this.pauseOrPlay}
          // onTouchEnd={this.pauseOrPlay}
          style="position:absolute;top:5px;left:10px;height:20px;width:20px;cursor:pointer">
          <span style={playIconStyle}></span>
        </div>
        <div role="duration" style={durationStyle}>
          {timeDuration}
        </div>
        <div
          ref={el => this.timeline = el}
          style={timelineStyle}
          onClick={this.seekTo}
          onMouseEnter={isPhone ? undefined : this.showPosition}
          onMouseLeave={isPhone ? undefined : this.hidePosition}
          onMouseDown={this.onMouseDown}
          onMouseMove={this.onMouseMove}
          onTouchStart={this.onMouseDown}
          onTouchMove={this.onMouseMove}
          onTouchEnd={this.onMouseUp}
          role="timeline"
        >
          <span role="currentLabel" style={currentLabelStyle}>{labelText}</span>
          <span role="label-background" style={labelBGStyle}></span>
          <div role="blue-line" style={blueLineStyle}> </div>
          <div role="slider" style={sliderStyle}> </div>
        </div>
      </div >
    )
  }
}

const Nothing = () => null;

export function mount(dom: HTMLElement, player: Recall, styles: any) {

  if (!dom) {
    throw new Error('容器不能为空');
  }
  if (!player) {
    throw new Error('请传入录制回放实例');
  }
  const root = render(<UI player={player} />, dom)
  console.log('mouse');


  function unmount() {
    console.log('unmount');
    render(<Nothing />, dom, root)
  }

  return unmount
}
