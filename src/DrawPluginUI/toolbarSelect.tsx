
import React, { Component, render } from 'preact'
import styles from './toolbarUI.less'

interface SelectProps {
  options: (string | number)[];
  value: string | number;
  onSelect: (fontsize: number | string) => void
}


interface SelectState {
  show: boolean
}

const { select, selectPanel, selectItem } = styles;

export default class Select extends Component<SelectProps, SelectState>{
  wapper?: Element;
  constructor(props: SelectProps) {
    super(props)
    this.state = {
      show: false
    }
    document.body.addEventListener('click', this.bodyEventHanlder)
    document.body.addEventListener('touchend', this.bodyEventHanlder)
  }

  bodyEventHanlder = (e: MouseEvent | TouchEvent) => {
    console.log('select body evnet handler', e);
    if (this.state.show) {

      let target = e.target as HTMLElement | null;
      let body = document.body;
      let hidePanel = true;
      while (target !== body && target !== null) {
        let { className } = target
        console.log(className, select, selectPanel);
        if (
          typeof className === 'string' && (
            className.search(select) > -1 ||
            className.search(selectPanel) > -1
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
        console.log('hidePanel bodyListenr');
        this.setState({
          show: false
        })
      }
    }

  }
  componentWillUnmount() {
    document.body.removeEventListener('click', this.bodyEventHanlder, true)
    document.body.removeEventListener('touchend', this.bodyEventHanlder, true)
  }
  showPanel = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('showPanel');
    this.setState({ show: true })
  }
  handleSelect = (val: string | number, e: MouseEvent | TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    console.log('handleSelect');
    this.setState({
      show: false
    }, () => {
      this.props.onSelect(val)
    })
  }
  render(props: SelectProps, state: SelectState) {
    const { value, options, onSelect } = props;
    const { show } = state
    console.log(show, 'render');
    return (
      <div className={select}
        onTouchStart={this.showPanel}
        onClick={this.showPanel}>
        {value}
        {show && (
          <div className={selectPanel}>
            {options.map(val => (
              <div
                className={selectItem + ' ' + (val == value ? styles.active : '')}
                key={'' + val}
                onClick={(e) => this.handleSelect(val, e)}
                onTouchStart={(e) => this.handleSelect(val, e)}
              >{val}</div>
            ))}
          </div>
        )}
      </div>
    )
  }
}