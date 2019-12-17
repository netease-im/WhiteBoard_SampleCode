import util from '../common/util'
// document.domain = '127.0.0.1'
const { NIM, WhiteBoard } = window

// 可以将DrawPlugin剥离
import * as DrawPlugin from '../../sdk/DrawPlugin.2.0.0.js';

import * as DrawPluginUI from '../DrawPluginUI/toolbarUI';

console.log(DrawPlugin);
import RecordPlayer from '../../sdk/RecordPlayer.2.0.0.js';
import * as RecordPlayerUI from '../RecordPlayer/UserInterfaces';
import { IFileActionOption } from '../common/Common';

NIM.use(WhiteBoard)

declare global {
  interface JSBridge {
    (msg: string): void;
  }
  interface Window {
    NIM: any,
    WhiteBoard: any,
    DrawPlugin: any;
    DrawPluginUI: any
    WebJSBridge: any;
    jsBridge: {
      nativeFunction: JSBridge,
      NativeFunction: JSBridge
    };
    NativeFunction: JSBridge,
    nativeFunction: JSBridge

  }

}
// im 实例，白板实例，白板插件实例，初始化参数
var im: any, whiteboard: any, toolbar: any, initParam: any, recall: RecordPlayer;

// web 加载好后通知 native
window.addEventListener('load', function () {
  onNativeFunction('webPageLoaded')
})

// web 在 window 全局对象中注册 WebJSBridge 方法供 native 使用
window.WebJSBridge = function (msg: any) {
  console.log('WebJSBridge received msg:', msg)
  try {
    msg = JSON.parse(msg)
  } catch (err) {
    console.error('WebJSBridge received msg is not json.', msg)
  } finally {
    if (typeof msg !== 'object') {
      console.error('WebJSBridge received msg is not object.', msg)

      // eslint-disable-next-line no-unsafe-finally
      return // 这里需要中断一下
    }
  }
  onWebJSBridge(msg)
}

// native 在 web 的 window 全局对象中注册 NativeFunction 供 web 使用, 参数为 json 字符串（无再次嵌套 json 字符串）
function onNativeFunction(action = '', param = {}) {
  console.warn('onNativeFunction', action, param)
  const msg = JSON.stringify({
    action,
    param
  })
  // aos 需要调用二级对象
  if (window.jsBridge) {
    if (window.jsBridge.nativeFunction) {
      window.jsBridge.nativeFunction(msg)
    } else if (window.jsBridge.NativeFunction) {
      window.jsBridge.NativeFunction(msg)
    }
  } else if (window.NativeFunction) {
    window.NativeFunction(msg)
  } else if (window.nativeFunction) {
    window.nativeFunction(msg)
  } else {
    console.error('NativeFunction has not found.', msg)
  }
}

function onWebJSBridge(msg: any) {
  const param = msg.param || {}
  console.log('WebJSBridge received action and param:', msg.action, param)
  switch (msg.action) {
    case 'webLoginIM': // native 通知 web 登录
      if (!util.isValidObject(param)) {
        onNativeFunction('webLoginIMFailed', { code: 414, msg: '初始化参数不能为空' })
        return
      }
      try {
        util.checkParams(param, util.loginParamRule)
      } catch (err) {
        onNativeFunction('webLoginIMFailed', { code: 414, msg: '初始化参数错误' })
        return
      }
      loginIM(param)
      break
    case 'webReplayInit': {
      if (!util.isValidObject(param)) {
        onNativeFunction('webReplayInitFailed', { code: 414, msg: '初始化参数不能为空' })
        return
      }
      if (param.isCompatible === true) {
        if (typeof param.imConfig === 'undefined') {
          onNativeFunction('webReplayInitFailed', { code: 414, msg: '当 isCompatible 设置为 true 时，imConfig不能为空' })
          return
        }
      }

      if (!util.isValidArray(param.files)) {
        onNativeFunction('webReplayInitFailed', { code: 414, msg: '初始化参数 files 不能为空' })
        return
      }
      initReplay(param)
      break
    }
    case 'webLogout': // native 通知 web 退出
      toolbar = null
      whiteboard.leaveChannel()
      im.destroy()
      break

    case 'enableDraw': // native 设置绘画权限
      toolbar.enableDraw(param.enable || false)
      break
    case 'webCreateNewWB': // native 初始化创建加入房间失败后，再次尝试创建加入
      if (initParam.identity === 'owner') {
        try {
          util.checkParams(param, { // 频道名规则
            channelName: {
              type: 'string',
              isRequire: true
            }
          })
        } catch (err) {
          onNativeFunction('webLoginIMFailed', { code: 414, msg: '参数"channelName"错误' })
          return
        }
        initParam.channelName = param.channelName
        createChannel()
      } else {
        onNativeFunction('webJoinWBFailed', { code: 414, msg: 'action="webCreateNewWB"仅限制"owner"身份调用' })
      }
      break
    case 'webJoinNewWB': // native 初始化加入房间失败后，再次尝试加入
      if (initParam.identity === 'normal') {
        try {
          // @ts-ignore
          util.checkParams(param, channelNameRule ||
          { // 频道名规则
            channelName: {
              type: 'string',
              isRequire: true
            }
          })
        } catch (err) {
          onNativeFunction('webLoginIMFailed', { code: 414, msg: '参数"channelName"错误' })
          return
        }
        initParam.channelName = param.channelName
        joinChannel()
      } else {
        onNativeFunction('webJoinWBFailed', { code: 414, msg: 'action="webJoinNewWB"仅限制"normal"身份调用' })
      }
      break

    case 'setFontsize': {
      toolbar.setFontsize(param.fontsize)
      break
    }
    case 'setSize': {
      toolbar.setSize(param.size);
      break;
    }
    case 'setColor': {
      toolbar.setColor(param.color)
      break
    }
    case 'setTool': {
      toolbar.setColor(param.color)
      break;
    }
    case 'setFileObj': {
      toolbar.setFileObj(param)
      break
    }
    case 'clearFile': {
      toolbar.clearFile();
      break;
    }
    case 'changeToolbar':
      toolbar.changeToolbar(param)
      break
    case 'clearCanvas':
      toolbar.clear()
    case 'webReplayDoPlay':
      recall && recall.play()
    default:
  }
}

function loginIM(param: any) {
  im = NIM.getInstance({
    db: false,
    debug: true, //param.debug,
    appKey: param.appKey,
    account: param.account,
    token: param.token,
    onconnect: function (event: any) {
      console.log('wb login ', event);
      if (param.identity === 'owner' && param.ownerAccount !== param.account) { // 修正数据
        console.warn(`the param.identity is owner but param.ownerAccount is ${param.ownerAccount}, now auto fix it`)
        param.ownerAccount = param.account
      }
      initParam = param // 记录初始化参数
      onNativeFunction('webLoginSucceed', event) // 通知 native 登录成功
      initWB() // 初始化白板
    },
    onerror: function (event: any) {
      console.error('im onerror:', event)
      onNativeFunction('webError', {
        code: 400,
        msg: event.message || 'im onerror 网络状态异常'
      })
    },
    onwillreconnect: function (event: any) {
      console.log('im onwillreconnect:', event)
      onNativeFunction('webReconnect')
    },
    ondisconnect: function (error: any) {
      let msg = ''
      switch (error.code) {
        case 302:
          msg = '帐号或密码错误'
          break
        case 'kicked':
          const map = {
            PC: '电脑版',
            Web: '网页版',
            Android: '手机版',
            iOS: '手机版',
            WindowsPhone: '手机版'
          }
          msg = `您的帐号被${map[error.from as 'PC' | 'Web' | 'iOS' | 'Android'] || '其他端'}踢出下线`
          break
        default:
      }
      onNativeFunction('webLoginIMFailed', {
        code: error.code,
        msg: msg || error.message || '连接断开'
      })
      im.destroy()
    }
  })
}

function initReplay(param: any) {
  let handleFileHook: any = undefined;

  let elApp = document.getElementById('app')
  let elWb = document.getElementById('wb')
  let elTb = document.getElementById('tb')



  let height = elApp!.scrollHeight;
  let width = elApp!.scrollWidth

  // 在这里定位，设置各种容器
  let videoHeight = Math.floor(height * 0.2) + 'px';
  elWb!.style.bottom = videoHeight;
  elWb!.style.height = 'calc( 100% - ' + videoHeight + ')'
  elTb!.style.bottom = videoHeight;
  elTb!.style.pointerEvents = 'all';

  elApp!.insertAdjacentHTML('beforeend', `
  <div id='js-video' style="height:${videoHeight};"></div>
  `)

  if (
    (param.width !== undefined && typeof param.width !== 'number') ||
    (param.height !== undefined && typeof param.height !== 'number')
  ) {
    onNativeFunction('webReplayError', {
      code: 1001,
      message: '高度和宽度需要设置为数字类型'
    })
    return
  }

  function configRecallPlayer() {
    recall = new RecordPlayer({
      ownerAccount: param.ownerAccount,
      identity: 'normal',
      whiteboard: { on() { }, sendData() { }, destroy() { } },

      width: param.width,
      height: param.height,
      withCredentials: param.withCredentials,
      account: param.account, // 这个是以谁的角度来看录制
      isCompatible: !!param.isCompatible, // 是否是兼容模式，对于老版本的录制文件，需要做不同的解析
      handleFile: handleFileHook, // 如果isCompatible为 false， 则不用传入这个函数，
      // 无论有多少个录制文件，都按照上面的格式放入到这个数组中，顺序不影响，可播放多人的录制
      files: param.files,// 多个视频或者白板，都会有visibaleChange事件告诉开发者处理对应的dom
    });

    recall.on("play", () => {
      tickState = 'play'
      onNativeFunction('webReplayEvent', { eventName: 'play', })
    })
    recall.on("pause", () => {
      tickState = 'pause'
      onNativeFunction('webReplayEvent', { eventName: 'pause', })
    })
    let tickState = 'pause'
    let tickTime = 0
    setInterval(() => {
      if (tickState === 'play') {
        doFire(tickTime)
      }
    }, 3000);
    const doFire = (time: number) => onNativeFunction('webReplayEvent', { eventName: 'tick', time: time })
    recall.on("tick", (time) => {
      tickTime = time;
    })
    recall.on('finished', () => {
      onNativeFunction('webReplayEvent', { eventName: 'finished', })
    })

    recall.on('visibleChange', function (type, option, callback) {
      switch (option.type) {
        case 'gz': {
          if (type === 'show') {
            // 展示白板
            let dom = document.getElementById('wb')
            // 开发者可以在这个时候展示白板容器区域，完成后，将dom传入callback
            callback(dom!)
          } else {
            // 开发者可以在这个时候隐藏白板容器区域，完成后，调用callback回调
            callback()
          }
          break;
        }
        case 'aac':
        case 'flv':
        case 'mp4': {
          var jsVideo = document.getElementById('js-video')
          var videoDom = jsVideo!.querySelector(`[data-wv-vid="${option.account}"]`)
          if (type === 'show') {
            if (!videoDom) {
              videoDom = document.createElement('div')
              videoDom.setAttribute('data-wv-vid', option.account)
              videoDom.classList.add('user-video-item')
              jsVideo!.appendChild(videoDom)
            }
            callback(videoDom as HTMLElement)
          } else {
            // 开发者自己控制视频区域的隐藏以及布局，完成后，调用callback回调
            videoDom && videoDom.remove()
            callback()
          }

          break
        }
      }

    })


    recall.on('ready', () => {
      onNativeFunction('webReplayEvent', {
        eventName: 'ready',
        duration: recall.timeline!.duration
      })
      const unmountFunc = RecordPlayerUI.mount(document.getElementById('tb')!, recall, {})
      console.log('ready', recall, unmountFunc);
    })
  }
  if (param.isCompatible) {
    im = NIM.getInstance({
      db: false,
      debug: false, //param.debug,
      appKey: param.imConfig.appKey,
      account: param.imConfig.account,
      token: param.imConfig.token,
      onconnect: function (event: any) {
        if (param.identity === 'owner' && param.ownerAccount !== param.account) { // 修正数据
          console.warn(`the param.identity is owner but param.ownerAccount is ${param.ownerAccount}, now auto fix it`)
          param.ownerAccount = param.account
        }
        initParam = param // 记录初始化参数
        onNativeFunction('webLoginSucceed') // 通知 native 登录成功
        configRecallPlayer() // 初始化白板
      },
      onerror: function (event: any) {
        console.error('im onerror:', event)
        onNativeFunction('webError', {
          code: 400,
          msg: event.message || 'im onerror 网络状态异常'
        })
      },
      onwillreconnect: function (event: any) {
        console.log('im onwillreconnect:', event)
        onNativeFunction('webReconnect')
      },
      ondisconnect: function (error: any) {
        let msg = ''
        switch (error.code) {
          case 302:
            msg = '帐号或密码错误'
            break
          case 'kicked':
            const map = {
              PC: '电脑版',
              Web: '网页版',
              Android: '手机版',
              iOS: '手机版',
              WindowsPhone: '手机版'
            }
            msg = `您的帐号被${map[error.from as 'PC' | 'Web' | 'iOS' | 'Android'] || '其他端'}踢出下线`
            break
          default:
        }
        onNativeFunction('webLoginIMFailed', {
          code: error.code,
          msg: msg || error.message || '连接断开'
        })

        im.destroy()
      }
    })

    handleFileHook = function (type: "img" | 'h5' | 'clear', file: IFileActionOption) {
      console.log(type, file);
      if (type === 'img') {
        let docId = file.docId;
        if (!file.urlStr && docId !== '0' && docId !== '') {
          // 这里需要调用nim去获取文件
          let currentPage = file.currentPage;
          return new Promise((resolve, reject) => {
            im.getFile({
              docId,
              success: function (cloudFile: any) {
                console.log('getFile success', cloudFile)
                const fileTypeMap = {
                  '10': 'jpg',
                  '11': 'png',
                  '0': 'unknown'
                }
                let urlStr = `${cloudFile.prefix}_${cloudFile.type}_{index}.${fileTypeMap[cloudFile.transType as keyof typeof fileTypeMap]}`
                let url = urlStr.replace('{index}', '' + (currentPage || '1'))

                // 修改file
                file.pageCount = parseInt(cloudFile.pageCount);
                file.url = url;
                file.urlStr = urlStr;
                resolve(file)
              },
              error: function (error: any) {
                console.error('getFile error', error)
                reject(error)
              }
            })
          })
        }
      }
      return Promise.resolve(file)
    }

  } else {
    configRecallPlayer()
  }
}
function initWB() {
  if (whiteboard) {
    return
  }
  whiteboard = WhiteBoard.getInstance({
    nim: im,
    debug: initParam.debug
  })
  whiteboard.on('connected', () => {
    console.log('connected')
  })
  if (initParam.debug) {
    // @ts-ignore
    window.whiteboard = whiteboard
  }
  joinChannel()
}

function createChannel() {
  whiteboard.createChannel({
    channelName: initParam.channelName
  }).then((obj: any) => {
    console.log('whiteboard::createChannel success', obj)
    joinChannel()
  }).catch((err: any) => {
    console.error('whiteboard::createChannel failed', err)
    if (err && err.event && err.event.code === 417) { // 已创建房间
      joinChannel()
    } else {
      // 通知 native 加入房间失败
      onNativeFunction('webJoinWBFailed', {
        code: err.code,
        msg: err.message
      })
      whiteboard.leaveChannel()
    }
  })
}

function joinChannel() {
  whiteboard.joinChannel({
    channelName: initParam.channelName,
    sessionConfig: {
      record: initParam.record // background 。。。
    }
  }).then((obj: any) => {
    console.log('whiteboard::joinChannel success', obj)
    whiteboard.startSession().then(function () {
      onNativeFunction('webJoinWBSucceed', obj) // 通知 native 加入房间成功
      onWBInited()
    })
  }).catch((err: any) => {
    console.error('whiteboard::joinChannel failed', err)
    if (err && err.event && err.event.code === 404 && initParam.identity === 'owner') { // 已创建房间
      createChannel()
      return
    }
    // 通知 native 加入房间失败
    onNativeFunction('webJoinWBFailed', {
      code: err.code,
      msg: err.message
    })
    whiteboard.leaveChannel()
  })
}

function onWBInited() {

  if (toolbar) return
  let isReconnecting = false;



  toolbar = DrawPlugin.getInstance(Object.assign({
    nim: im,
    whiteboard: whiteboard,
    whiteboardContainer: document.getElementById('wb'),

  }, initParam))
  if (initParam.debug) {
    console.log(toolbar)
    //@ts-ignore
    window.toolbar = toolbar;
  }
  DrawPluginUI.mount(
    document.getElementById('tb')!,
    {
      account: initParam.account,
      identity: initParam.identity
    },
    toolbar,
    initParam.tools
  )

  toolbar.on('inited', () => {
    toolbar.readyToSyncData()
    onNativeFunction('webWBWorkerInited')
    // toolbar.enableDraw(true)
    // toolbar.setSize(6)
  })

  toolbar.on('customEvent', (event: any) => {
    console.log('toolbar customEvent', event);
    onNativeFunction('webToolbarCustomEvent', { eventName: event })
    // if (event === 'selectDoc') {
    //   toolbar.setFileObj({
    //     currentPage: 1,
    //     docId: "c83e6ff4-297e-4fc3-b0c0-a0294776cb12",
    //     // type: "img",
    //     // pageCount: "13",
    //     // url: "http://nim.nosdn.127.net/60a9143c-146d-42f0-b55e-d8009dadc9e4_2_1.jpg",
    //     // urlStr: "http://nim.nosdn.127.net/60a9143c-146d-42f0-b55e-d8009dadc9e4_2_{index}.jpg"
    //     type: "h5",
    //     pageCount: "22",
    //     url: 'http://' + location.host + '/public/ppt/ff1537e0d343821fc509f3165224ab41/index.html',
    //     // url: 'https://app.yunxin.163.com/webdemo/ppt/ff1537e0d343821fc509f3165224ab41/index.html'
    //   })
    // } else if (event === 'closeDoc') {
    //   toolbar.clearFile()
    // }
  })
  whiteboard.on('connected', () => {
    console.log('whiteboard connected event fired');
    console.log('current isReconnecting:', isReconnecting);
    if (isReconnecting) {
      if (toolbar) {
        isReconnecting = false
        toolbar.clear()
        toolbar.clearFile()
        toolbar.resetState()
        toolbar.readyToSyncData()
      }
    }
  })
  whiteboard.on('willReconnect', () => {
    isReconnecting = true
    console.log('set isReconnecting flag to true')
  })
  whiteboard.on('error', function (err: Error) { // 非正常情况处理
    console.error('whiteboard onError:', err)
    onNativeFunction('webError', {
      code: 400,
      msg: err.message || 'whiteboard onerror 网络状态异常'
    })
  })

  whiteboard.on('signalClosed', function (obj: any) {
    console.error('whiteboard signalClosed:', obj)
    onNativeFunction('webError', {
      code: 400,
      msg: 'whiteboard signal closed 网络状态异常'
    })
  })
}
