# SnapTranslate AI

一个强大的批量图片翻译工具，可以自动识别图片中的文字并翻译成目标语言，同时保持原图的视觉效果。

## ✨ 功能特性

- 📸 **批量处理**：支持同时上传多张图片进行翻译
- 🌍 **多语言支持**：支持翻译成多种目标语言
- 🎨 **保持原图风格**：翻译后的图片保持原有的字体、颜色和布局
- ⚡ **实时预览**：实时查看翻译前后的对比效果
- 📥 **批量导出**：一键下载所有翻译完成的图片

## 🚀 在线体验

无需安装，直接在浏览器中体验：

**👉 [https://susiewang0720.github.io/snaptranslate-ai/](https://susiewang0720.github.io/snaptranslate-ai/)**

## 💻 本地部署

### 前置要求

- Node.js 18+ 
- npm 或 yarn

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/SusieWang0720/snaptranslate-ai.git
   cd snaptranslate-ai
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   
   在项目根目录创建 `.env.local` 文件：
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   
   > 注意：获取 API Key 请访问 [Google AI Studio](https://aistudio.google.com/app/apikey)

4. **启动开发服务器**
   ```bash
   npm run dev
   ```
   
   应用将在 `http://localhost:3000` 启动

5. **构建生产版本**
   ```bash
   npm run build
   ```
   
   构建产物将输出到 `dist` 目录

6. **预览生产构建**
   ```bash
   npm run preview
   ```

## 📖 使用说明

1. **上传图片**：点击上传区域或拖拽图片文件到上传框
2. **选择目标语言**：在顶部选择要翻译的目标语言
3. **开始翻译**：点击 "Translate All" 按钮开始批量翻译
4. **查看结果**：在对比视图中查看原图和翻译后的图片
5. **导出图片**：翻译完成后，点击 "Export" 按钮批量下载

## 🛠️ 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库

## 📝 开发

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 预览构建
npm run preview
```

## 📄 许可证

本项目采用 MIT 许可证。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**享受翻译的乐趣！** 🎉
