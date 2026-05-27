# Pica App 复刻大纲

本文档用于记录从 0 复刻 `picacomic-downloader` 的总体路线。现阶段只保留粗略阶段划分，后续可以针对每个阶段再展开具体技术细节、文件结构和实现步骤。

## 目标

复刻一个基于 Tauri 的桌面漫画下载器：

- React 负责界面、交互和状态展示
- Rust 负责登录、请求、下载、导出、文件系统和日志
- Tauri 负责连接前端与后端
- 先跑通核心功能，再逐步补齐完整体验

## 阶段一：理解原项目

先阅读原项目的 README、架构总结和关键代码，明确它不是普通网页壳，而是一个桌面下载任务系统。

重点理解：

- 前端页面有哪些
- Rust 后端有哪些命令
- 前后端通过哪些事件通信
- 下载任务如何创建、更新、暂停、恢复、取消
- 本地配置、下载目录、日志目录如何管理

阶段目标：知道原项目“有哪些模块”和“每个模块负责什么”。

## 阶段二：搭建 React + Tauri 基础壳

从空项目开始，先搭建一个能正常运行的 React + Tauri 桌面应用。

重点完成：

- 清理默认示例代码
- 建立基础页面布局
- 建立前端目录结构
- 确认 Rust 命令能被 React 调用
- 确认开发、构建流程能跑通

阶段目标：得到一个干净、可运行、可继续扩展的应用壳。

## 阶段三：建立前后端协议

先不要急着做下载器，优先把前端和 Rust 后端的通信方式固定下来。

重点完成：

- 引入 `tauri-specta`
- 用 Rust 定义 commands 和 events
- 生成 TypeScript bindings
- 前端通过 bindings 调用后端
- 建立统一错误返回格式

阶段目标：让前后端类型同步，避免后面大量手写 `invoke` 带来的维护成本。

## 阶段四：实现基础业务能力

先实现只读和轻量操作，打通完整业务链路。

建议顺序：

- 配置读取与保存
- 登录与 token 保存
- 获取用户信息
- 搜索漫画
- 收藏夹列表
- 排行榜列表
- 漫画详情与章节列表

阶段目标：用户可以登录、浏览内容、选中漫画和章节，但暂时不处理复杂下载。

## 阶段五：实现下载任务系统

这是整个 App 的核心阶段。Rust 后端负责实际下载，React 只负责展示任务状态和发出操作指令。

重点完成：

- 创建下载任务
- 章节并发和图片并发
- 下载进度事件
- 暂停、恢复、取消
- 下载速度统计
- 下载完成后的本地元数据保存
- 程序重启后识别已下载内容

阶段目标：能够稳定下载章节，并在前端实时看到进度。

## 阶段六：完善本地库存、导出和日志

在下载能力稳定后，再补齐桌面工具需要的完整体验。

重点完成：

- 本地已下载漫画列表
- 搜索、收藏、排行榜与本地下载状态同步
- CBZ 导出
- PDF 导出
- 日志记录
- 日志弹窗
- 打开下载目录、导出目录、日志目录

阶段目标：从“能下载”升级为“可长期使用的桌面工具”。

## 阶段七：重构 UI 与体验打磨

最后再做视觉和交互优化，避免一开始就陷入界面细节。

重点完成：

- 统一视觉风格
- 优化搜索、收藏、排行榜、章节详情布局
- 优化下载任务中心
- 优化设置页分组
- 增加加载、空状态、错误状态
- 减少高频事件导致的 React 重渲染

阶段目标：让应用不仅功能完整，而且好用、清晰、稳定。

## 推荐推进方式

不要一次性复刻所有功能。建议每个阶段都做到“能运行、能验证、能继续扩展”。

最小闭环顺序：

1. Tauri 命令调用成功
2. 配置保存成功
3. 登录成功
4. 搜索成功
5. 漫画详情成功
6. 单章节下载成功
7. 多章节下载成功
8. 本地库存和导出完成

后续学习和实现时，优先围绕这个闭环逐步展开。

## 当前进度

当前项目是 React + Tauri + Rust 的复刻练习版，先用假数据跑通架构，再逐步替换为真实 Pica API 和真实下载逻辑。

已完成：

- 配置闭环：Rust `Config`、`get_config`、`save_config`，token 持久化到 Tauri app data 的 `config.json`
- 用户闭环：假 `login`、依赖 token 的假 `get_user_profile`、前端 `TopBar` 和 `LoginDialog`
- 搜索闭环：Rust 假 `search_comic`、前端 `SearchPane`、搜索结果进入章节详情
- 收藏/排行闭环：Rust 假 `get_favorite`、`get_rank`，前端收藏夹和排行榜可进入章节详情
- 页面骨架：`AppShell`、主 Tabs、右侧 `DownloadPanel`
- 章节闭环：假章节列表、勾选章节、创建下载任务
- 下载闭环：Rust `create_download_task` command 创建任务，Rust 通过 `download_task_event` 发送进度事件，前端监听并更新 Zustand，下载列表显示状态、百分比和进度条
- 下载任务控制：已实现任务去重、取消、暂停/恢复状态雏形、清除非活跃任务记录
- 状态整理：`store.ts` 已按 Config/User/Navigation/Download slice 分区整理

关键前端结构：

- `src/store.ts`：Zustand 全局状态，按 Config/User/Navigation/Download 分区
- `src/api/*`：封装 Tauri commands
- `src/hooks/useDownloadTaskEvents.ts`：监听 Rust 下载任务事件
- `src/components/*`：应用壳、顶部栏、Tabs、下载面板、登录弹窗
- `src/panes/*`：搜索、收藏夹、排行榜、章节详情、库存占位页

关键后端结构：

- `src-tauri/src/config.rs`：配置读写
- `src-tauri/src/user.rs`：假登录和假用户信息
- `src-tauri/src/comic.rs`：假搜索
- `src-tauri/src/download.rs`：假下载任务和事件进度
- `src-tauri/src/lib.rs`：注册 Tauri commands

当前已跑通的核心链路：

```text
React UI → src/api/* → Tauri command → Rust
Rust event → useDownloadTaskEvents → Zustand store → React UI
```

下一步建议：

- 抽取“选择漫画并进入章节详情”的重复逻辑
- 完成本地库存页雏形
- 再逐步把假搜索/收藏/排行/章节替换为真实 PicaClient 数据
