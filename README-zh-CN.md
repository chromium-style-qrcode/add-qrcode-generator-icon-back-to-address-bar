# 二维码生成器图标重新回归地址栏

一款 Chrome 扩展程序，将二维码生成器功能重新带回到浏览器地址栏，支持生成 Chromium 风格的二维码，并在中心位置显示标志性的 Chrome 恐龙图标。

## 🌟 功能特色

- **Chromium 风格二维码**：生成与 Chrome 原生实现完全相同样式的二维码
- **Chrome 恐龙中心图案**：在二维码中心显示深受喜爱的 Chrome 恐龙图标
- **即时生成**：自动为当前页面 URL 生成二维码
- **自定义文本支持**：为任何文本或 URL 创建二维码
- **一键复制**：将二维码作为高质量 PNG 图像复制到剪贴板
- **便捷下载**：智能文件名生成，轻松下载二维码
- **完美尺寸**：匹配 Chrome 精确的二维码尺寸和样式
- **深色模式支持**：与浏览器主题无缝集成

## 🚀 安装方法

### 从 Chrome 网上应用店安装

您可以直接从 [Chrome 网上应用店](https://chromewebstore.google.com/detail/add-qr-code-generator-ico/kacblhilkacgfnkjfodalohcnllcgmjd) 安装扩展。

### 手动安装（开发版本）

1. **克隆仓库**

   ```bash
   git clone https://github.com/chromium-style-qrcode/add-qrcode-generator-icon-back-to-address-bar.git
   cd add-qrcode-generator-icon-back-to-address-bar
   ```

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **构建扩展**

   ```bash
   pnpm build
   ```

4. **在 Chrome 中加载**
   - 打开 Chrome 并导航到 `chrome://extensions/`
   - 在右上角启用"开发者模式"
   - 点击"加载已解压的扩展程序"并选择 `.output/chrome-mv3` 文件夹

## 🎯 使用方法

1. **访问扩展**：点击浏览器工具栏中的二维码图标
2. **自动填充当前 URL**：扩展程序自动加载当前页面的 URL
3. **自定义文本**：将 URL 替换为您想要转换为二维码的任何文本
4. **复制到剪贴板**：点击"复制"按钮将二维码作为图像复制
5. **下载**：点击"下载"将二维码保存为 PNG 文件

## 🛠️ 技术栈

- **框架**：[WXT](https://wxt.dev/) - 现代 Web 扩展框架
- **前端**：React 19 + TypeScript
- **样式**：Tailwind CSS 4.0 + Radix UI 组件
- **二维码生成**：WebAssembly (WASM) 模块，实现 Chromium 精确的二维码生成
- **构建系统**：Vite + Rollup
- **包管理器**：pnpm

## 🔧 开发指南

### 环境要求

- Node.js ≥ 22.18.0
- pnpm ≥ 10.12.4

### 开发命令

```bash
# 启动开发服务器
pnpm dev

# 生产环境构建
pnpm build

# 创建分发压缩包
pnpm zip

# 类型检查
pnpm compile

# 代码格式化
pnpm format

# 依据 Conventional Commits 生成/更新 CHANGELOG.md（最近变更）
pnpm changelog

# 初次生成（覆盖式，包含所有历史）
pnpm changelog:init
```

### 项目结构

```tree
src/
├── components/
│   └── ui/           # 可复用UI组件
├── hooks/
│   ├── use-qrcode.ts # 二维码生成逻辑
│   └── use-dark-mode.ts
├── lib/
│   ├── wasm-loader.ts    # WASM模块加载器
│   └── utils.ts
├── popup/
│   ├── App.tsx       # 主弹窗组件
│   └── main.tsx      # 入口点
├── providers/
│   └── theme.tsx     # 主题提供者
├── styles/
│   └── base.css      # 全局样式
└── types/            # TypeScript类型定义
```

## 🎨 功能详解

### Chromium 精确二维码生成

扩展使用 WebAssembly 模块复制 Chrome 的原生二维码生成算法，确保：

- 与 Chrome 内置二维码完全相同的视觉外观
- 相同的模块样式（圆形 vs 方形）
- 圆角定位图案
- 精确的尺寸和边距

### 智能文件名生成

下载的二维码自动获得有意义的文件名：

- 域名：`qrcode_example.com.png`
- 其他内容：`qrcode_chrome.png`

### 无障碍支持

- 完整的键盘导航支持
- 屏幕阅读器兼容
- 高对比度模式支持
- 正确的 ARIA 标签和描述

## 🚀 发布

这个项目使用 GitHub Actions 自动化发布。

### 创建一个发布

```bash
# 稳定版本（发布到商店）
pnpm version 1.0.0
git push origin main
git push origin 1.0.0

# 预发布版本（仅 GitHub）
pnpm version prerelease --preid='[alpha｜beta|rc]'
git push origin main
git push origin 1.0.0-alpha.0
```

### 版本类型

- **稳定版本**（1.0.0）：用于发布到 Chrome 扩展商店
- **预发布版本**（1.0.0-alpha.0）：仅用于 GitHub，适合测试和开发

## 🤝 贡献指南

欢迎贡献！请随时提交 Pull Request。对于重大更改，请先打开 issue 讨论您想要更改的内容。

### 开发指南

1. 遵循现有代码风格
2. 为新功能添加 TypeScript 类型
3. 在 Chrome 上进行测试
4. 根据需要更新文档

## 📄 许可证

本项目基于 MIT 许可证 - 详情请参见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- Chrome 团队提供原始二维码实现
- [WXT](https://wxt.dev/) 提供优秀的扩展框架
- [Radix UI](https://www.radix-ui.com/) 提供无障碍组件
- [Tailwind CSS](https://tailwindcss.com/) 提供样式工具

## 📞 支持

如果您遇到任何问题或有疑问：

- 在 [GitHub](https://github.com/chromium-style-qrcode/add-qrcode-generator-icon-back-to-address-bar/issues) 上开启 issue
