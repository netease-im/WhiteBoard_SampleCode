# WhiteBoard_SampleCode

互动白板示例代码以及 UI 的源码，开发者可以使用此仓库自定义 UI 组件，更适应自己的业务，也可以参考 UI 组件里的逻辑，使用其他框架来实现，此仓库的 UI 使用 Preact 开发。

## 如何运行

1. 安装 npm 依赖
2. 运行`npm run dev`, 将会输出打包的开发文件到 dist 目录
3. 运行`npm run build`，将会构建压缩版本

## 本地可以起一个简单的 http server 来预览 demo

在仓库根目录下执行

```bash
npx serve .
```

需要开发者替换 html 文件里的 appkey。可以将 demo 里引入的 js 修改为 dist 目录下的文件，预览自己修改的组件。
