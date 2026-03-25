# DesignFlow - 排期日历

DesignFlow 是一个基于 React 和 Tailwind CSS 开发的排期日历应用，旨在帮助团队更高效地管理设计需求和人员排期。

## 主要功能

- **多视图切换**：支持 14 天、60 天、半年（180 天）和一年（365 天）的排期视图。
- **人员管理**：支持添加和编辑团队成员。
- **任务管理**：支持创建、编辑和删除排期任务。
- **多语言支持**：支持中英文切换。
- **搜索功能**：支持按需求名称或人员姓名进行搜索。

## 技术栈

- **前端框架**：React 19
- **构建工具**：Vite 6
- **样式**：Tailwind CSS 4
- **动画**：Motion
- **UI 组件库**：shadcn/ui
- **日期处理**：date-fns

## 快速开始

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 环境变量

在项目根目录创建 `.env` 文件，并添加以下变量：

```env
GEMINI_API_KEY=your_gemini_api_key
```

## 许可证

MIT
