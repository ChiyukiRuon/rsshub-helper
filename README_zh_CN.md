<div align="center">

<div style="align-items: center; display: flex; justify-content: center;">
<img src="./assets/icon.png" alt="RSSHub Helper Logo" style="width: 80px; height: 80px;" />
<h1 style="color: #f5712c; margin: 0 0 19px 10px;">RSSHub Helper</h1>
</div>

<a href="https://github.com/ChiyukiRuon/rsshub-helper/blob/main/README.md">English</a> ｜
<a href="https://github.com/ChiyukiRuon/rsshub-helper/blob/main/README_zh_CN.md">简体中文</a>

</div>

RSSHub Helper 是一个基于 Plasmo 框架开发的 Chrome 浏览器扩展，用于快速检测当前网页是否匹配 RSSHub 路由规则，并生成对应的 RSS 订阅链接。通过自定义匹配规则，你可以轻松地将任意网页转换为 RSS 订阅源。

## 主要功能

- **自动检测 RSS** - 页面加载时自动分析当前 URL，匹配预设规则生成 RSS 链接
- **一键复制/打开** - 快速复制生成的 RSS 链接或直接打开预览
- **规则管理** - 支持规则编辑与导入导出
- **规则测试器** - 测试规则是否能正确匹配目标 URL
- **多语言支持** - 支持简体中文和英文界面
- **自动复制** - 可配置检测到规则时自动复制链接到剪贴板

## 使用方法

### 安装扩展

1. 从 [Release](https://github.com/ChiyukiRuon/rsshub-helper/releases) 下载压缩包
2. 手动安装：
   - 打开 Chrome，进入 `chrome://extensions/`
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"，选择解压缩后的文件夹

### 配置规则

1. **打开设置页面** - 点击 Popup 中的"设置"按钮，或右键扩展图标选择"选项"
2. **添加规则** - 在"规则管理"部分点击"+ 新增匹配规则"
3. **填写规则信息**：
   - **规则名称(name)**：自定义规则的描述名称
   - **匹配地址(rule)**：URL 匹配模式，支持：
     - `*` - 匹配单个路径段
     - `**` - 匹配任意内容
     - `${var}` - 提取变量供模板使用
   - **RSSHub 路径模板(template)**：RSS 链接模板，使用 `${var}` 引用提取的变量
4. **保存规则** - 点击"保存"按钮保存所有更改
5. **测试规则** - 在"规则测试器"中输入 URL 测试规则是否生效

### 规则示例

```json
{
   "name": "X Media",
   "rule": "https://x.com/${user}**",
   "template": "https://rsshub.app/twitter/media/${user}"
}
```

### 基本使用

1. **点击扩展图标** - 在当前页面点击 RSSHub Helper 扩展图标
2. **查看 RSS 链接** - 窗口会显示匹配到的 RSS 链接
3. **复制或打开** - 点击"复制"按钮复制链接，或点击"打开预览"在新标签页查看

### 偏好设置

- **自动检测 RSS** - 页面加载时自动分析 RSS 链接
- **自动复制** - 检测到规则时自动复制 RSS 链接到剪贴板
- **打开 Popup 自动复制** - 打开 Popup 窗口时自动复制链接

## 本地开发

### 环境要求

- Node.js 16+ 
- pnpm 8+

### 开发流程

1. **克隆项目**
   ```bash
   git clone https://github.com/ChiyukiRuon/rsshub-helper.git
   cd rsshub-helper
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **启动开发服务器**
   ```bash
   pnpm dev
   ```
   这会启动 Plasmo 开发服务器，并在 `build/chrome-mv3-dev` 目录生成扩展文件。

4. **加载扩展到 Chrome**
   - 打开 Chrome，进入 `chrome://extensions/`
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `build/chrome-mv3-dev` 目录
   - 开发模式下，代码修改会自动热重载

5. **生产构建**
   ```bash
   pnpm build
   ```
   构建结果在 `build/chrome-mv3-prod` 目录。

6. **打包扩展**
   ```bash
   pnpm package
   ```
   生成 `.zip` 文件用于发布。

### 项目结构

```
rsshub-helper/
├── src/                      # 源代码目录
│   ├── contents/            # Content Scripts
│   │   └── autoDetect.ts    # 自动检测逻辑
│   ├── lib/                 # 工具库
│   │   ├── domReady.ts      # DOM 加载工具
│   │   ├── rsshub.ts        # RSS 规则匹配核心
│   │   ├── storage.ts       # 存储配置
│   │   ├── storageCache.ts  # 存储缓存
│   │   └── throttle.ts      # 节流工具
│   ├── types/               # TypeScript 类型定义
│   │   └── assets.d.ts      # 资源类型声明
│   ├── background.ts        # Background Script
│   ├── options.tsx          # 选项页面
│   ├── popup.tsx            # Popup 弹窗
│   └── style.css            # 全局样式
├── locales/                  # 国际化文件
│   ├── en/                  # 英文翻译
│   └── zh_CN/               # 简体中文翻译
├── assets/                   # 静态资源
│   └── icon.png             # 扩展图标
├── build/                    # 构建输出目录
└── package.json             # 项目配置
```

### 核心逻辑

规则匹配引擎位于 [`src/lib/rsshub.ts`](src/lib/rsshub.ts)，主要功能：

- `compileRule()` - 编译规则字符串为正则表达式
- `extract()` - 从 URL 中提取规则定义的变量
- `render()` - 将提取的变量渲染到 RSS 模板
- `generateRSS()` - 遍历规则库，生成 RSS 链接

## 链接

- [RSSHub 官方文档](https://docs.rsshub.app/)

## 许可证

MIT License

---

**注意**：本扩展需要配合 RSSHub 服务使用。你可以使用公共的 RSSHub 实例（如 `https://rsshub.app`）或自建私有实例。
