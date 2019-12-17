export default {
  isUndefined(value: any) {
    return typeof value === 'undefined'
  },
  isDOM(value: any) {
    if (typeof HTMLElement === 'object') {
      return value instanceof HTMLElement
    }
    return value && typeof value === 'object' && value.nodeType === 1 && typeof value.nodeName === 'string'
  },
  isValidString(value: any) {
    return Object.prototype.toString.call(value) === '[object String]' && value
  },
  isBoolean(value: any) {
    return typeof value === 'boolean'
  },
  isFunction(value: any) {
    return typeof value === 'function'
  },
  isNumber(value: any) {
    return typeof value === 'number'
  },
  isValidArray(value: any) {
    return Object.prototype.toString.call(value) === '[object Array]' && value.length
  },
  isValidHexColor(value: any) {
    return /^#[0-9abcdef]{6}$/gi.test(value)
  },
  isObject(value: any) {
    return typeof value === 'object'
  },
  isValidObject(value: any) {
    if (typeof value !== 'object') {
      return false
    }
    value = Object.assign({}, value)
    if (Object.keys && Object.keys(value).length === 0) {
      return false
    }
    try {
      return JSON.stringify(value) !== '{}'
    } catch (e) {
      return false
    }
  },
  loginParamRule: { // 登录参数规则
    debug: { // 开启 debug 日志信息
      type: 'boolean',
      defaultValue: false
    },
    appKey: {
      type: 'string',
      isRequire: true
    },
    account: {
      type: 'string',
      isRequire: true
    },
    token: {
      type: 'string',
      isRequire: true
    },
    record: {
      type: 'boolean',
      defaultValue: false
    },
    mode: {
      type: 'string', // 字符串默认不允许为空
      value: [
        'interaction', // 互动模式
        'player' // 回放模式
      ],
      defaultValue: 'interaction'
    },
    identity: {
      type: 'string',
      value: [
        'owner', // 白板发起人：老师
        'normal' // 白板接收者：学生
      ],
      defaultValue: 'owner'
    },
    channelName: {
      type: 'string|number',
      isRequire: true
    },
    ownerAccount: {
      type: 'string',
      isRequire: true
    }
  },
  // 检查参数
  // data 检查的对象，rule 对象键值规则，skipKey 需要跳过的键，resObj 通过检查的赋值对象
  /* rule 例：
  {
    account: {
      type: 'string', // dom string boolean function number string|number
      isRequire: true
    },
    identity: {
      type: 'string',
      value: [ // 可选值数组，没有则不设置
        'owner',
        'normal'
      ],
      defaultValue: 'owner'
    }
   }
   */
  checkParams(data: any = {}, rule: any = {}, skipKey: string[] | undefined = [], resObj?: any) {
    let changeData = false
    if (this.isUndefined(resObj)) { // 没有传返回对象，默认改变原数据
      changeData = true
      resObj = {}
    }
    Object.keys(rule).map((key: string) => {
      if (~skipKey.indexOf(key)) {
        return
      }
      const ruleValue = rule[key]
      const ruleValueDefault = ruleValue.value
      let dataValue = data[key]
      let typeCheckPass = true
      // 未定义时，检查必要性，设置默认值
      if (this.isUndefined(dataValue)) {
        if (ruleValue.isRequire) {
          throw new Error(`param '${key}' is required`)
        }
        if (changeData) {
          data[key] = ruleValue.defaultValue
        }
        resObj[key] = ruleValue.defaultValue
        return
      }
      switch (ruleValue.type) {
        case 'dom':
          typeCheckPass = this.isDOM(dataValue)
          break
        case 'string':
          typeCheckPass = this.isValidString(dataValue)
          if (typeCheckPass && ruleValueDefault && !~ruleValueDefault.indexOf(dataValue)) {
            throw new Error(`param '${key}' should be ${ruleValueDefault.join(' or ')}`)
          }
          break
        case 'boolean':
          typeCheckPass = this.isBoolean(dataValue)
          break
        case 'function':
          typeCheckPass = this.isFunction(dataValue)
          break
        case 'number':
          typeCheckPass = this.isNumber(dataValue)
          break
        case 'string|number':
          typeCheckPass = this.isValidString(dataValue) || this.isNumber(dataValue)
          if (typeCheckPass) { // 最后统一转成字符串
            dataValue += ''
          }
          break
        default:
      }
      if (!typeCheckPass) {
        throw new Error(`param '${key}' should be a '${ruleValue.type}' type and not false value`)
      }
      resObj[key] = dataValue
    })
    return resObj
  }
}
