# Pica App 复刻记录

本文档用于跨会话记录项目目标、当前进度和下一步方向。原则：只保留能帮助继续开发的关键信息，避免流水账。

## 目标

从 0 复刻一个 Tauri 桌面漫画下载器：

- React/TypeScript：界面、交互、状态展示
- Rust/Tauri：配置、登录、Pica API、下载任务、文件系统、事件通知
- 当前策略：先用假数据跑通架构，再逐步替换真实 Pica API 和真实图片下载

## 阶段路线

1. 基础壳：React + Tauri 能运行，前后端 command 调用成功。
2. 基础业务：配置、登录、用户信息、搜索、收藏、排行、漫画详情。
3. 下载系统：创建任务、进度事件、任务控制、落盘元数据、本地库存。
4. 真实 API：建立 `PicaClient`，逐步替换搜索、收藏、排行、章节、图片源。
5. 完整体验：日志、导出、任务恢复、UI 打磨、错误处理和性能优化。

## 当前进度

项目已经跑通一个可用的假数据下载闭环：

- 配置：Rust `Config` 读写 `config.json`，支持 `token`、`downloadDir`、并发数、`useRealApi`
- 用户：假登录、假用户信息，token 可持久化
- 页面：`AppShell`、`TopBar`、主 Tabs、`Search/Favorite/Rank/Library/ChapterPane`、`DownloadPanel`
- 状态：Zustand `store.ts` 按 Config/User/Navigation/Download 分区
- 内容：搜索、收藏、排行、漫画详情当前默认走 `fake_pica.rs`
- 本地库存：扫描下载目录，统计已完成章节，支持 `2/3` 这种部分下载状态
- 下载：`download.rs` 创建任务、发进度事件、写漫画/章节元数据、写占位图片文件
- 下载元数据：`metadata.json` 记录漫画信息；`chapter.json` 记录章节状态、进度、`files/images`
- 图片结构：`images` 含 `index/url/fileName/state`，当前 URL 是 fake URL
- 任务 UI：下载列表显示状态、进度条、目录、并发数、错误信息，完成后可打开章节目录
- 日志：Rust 发 `download_log_event`，前端监听后在下载面板显示最近日志
- API 架构：已拆出 `fake_pica.rs`，`pica_client.rs` 已实现签名、统一请求和真实搜索
- 开关：`useRealApi=false` 走假数据；`true` 时搜索走真实 Pica API，其余收藏/排行/章节接口仍待接入

核心链路：

```text
React UI -> src/api/* -> Tauri command -> Rust
Rust event -> hooks -> Zustand store -> React UI
```

## 关键文件

前端：

- `src/types.ts`：共享类型
- `src/store.ts`：Zustand 全局状态
- `src/api/*`：Tauri command 封装
- `src/hooks/useDownloadTaskEvents.ts`：下载任务事件
- `src/hooks/useDownloadLogEvents.ts`：下载日志事件
- `src/components/*`：外壳、顶部栏、下载面板、设置弹窗等
- `src/panes/*`：搜索、收藏、排行、本地库存、章节详情

后端：

- `src-tauri/src/config.rs`：配置读写和默认下载目录
- `src-tauri/src/user.rs`：假登录和用户信息
- `src-tauri/src/comic.rs`：内容 commands、本地库存扫描、真假 API 切换
- `src-tauri/src/fake_pica.rs`：假搜索/收藏/排行/章节数据源
- `src-tauri/src/pica_client.rs`：真实 Pica API 客户端，已接请求基础层和真实搜索
- `src-tauri/src/download.rs`：下载任务、进度事件、日志事件、元数据落盘、打开目录
- `src-tauri/src/lib.rs`：注册 Tauri commands

## 真实 Pica API 请求要点

原项目核心文件：

```text
D:\Desktop\Apps\picacomic-downloader\src-tauri\src\pica_client.rs
```

请求基础：

- Base URL：`https://picaapi.picacomic.com/`
- HTTP 客户端：原项目使用 `reqwest`，另有 retry、proxy；本项目可先只用 `reqwest::Client`
- token：放在请求头 `authorization`
- 图片质量：请求头 `image-quality: original`

固定请求头核心：

```text
api-key
accept: application/vnd.picacomic.com.v1+json
app-channel: 2
time
nonce
app-version: 2.2.1.2.3.3
app-uuid: defaultUuid
app-platform: android
app-build-version: 44
Content-Type: application/json; charset=UTF-8
User-Agent: okhttp/3.8.1
authorization
image-quality: original
signature
```

签名核心：

```rust
data = format!("{path}{time}{NONCE}{method}{API_KEY}").to_lowercase()
signature = hmac_sha256_hex(DIGEST_KEY, data)
```

其中：

- `time`：当前秒级时间戳
- `method`：`GET` 或 `POST`
- `NONCE`、`API_KEY`、`DIGEST_KEY` 来自原项目常量

主要接口路径：

```text
POST auth/sign-in
GET  users/profile
POST comics/advanced-search?page={page}
GET  users/favourite?s={sort}&page={page}
GET  comics/leaderboard?tt={rankType}&ct=VC
GET  comics/{comic_id}
GET  comics/{comic_id}/eps?page={page}
GET  comics/{comic_id}/order/{chapter_order}/pages?page={page}
```

返回结构：

- 外层统一为 `PicaResp { code, message, data, error, detail }`
- `code == 200` 才算业务成功
- `401` 表示 Authorization 无效或过期
- 分页结构为 `Pagination<T> { total, limit, page, pages, docs }`

迁移建议：

- 当前 `pica_client.rs` 已实现请求基础层：`pica_request`、`pica_get`、`pica_post`、`create_signature`
- 第一真实接口 `search_comics` 已接入
- 跑通真实搜索后，再接收藏、排行、漫画详情、章节列表、章节图片源
- 不要一开始照搬原项目 proxy/retry/logger，先保证最小真实请求闭环

## 下一步

直接进入真实 API：

1. 打开 `useRealApi` 后，用真实 Authorization 在搜索页验证真实搜索结果
2. 根据运行结果修正 header、签名或响应字段解析
3. 接入真实收藏、排行、漫画详情、章节列表
4. 将 `download.rs` 的 fake 图片源替换为真实章节图片源

完成章节图片源后，再推进真实图片下载、导出和任务恢复。
