# Pica App

一个用于学习复刻 `picacomic-downloader` 的 React + Tauri + Rust 桌面应用。

当前目标不是一次性完成真实下载器，而是先用假数据跑通架构，再逐步替换为真实 Pica API 和下载逻辑。

## 技术栈

- React + TypeScript
- Zustand
- Tauri 2
- Rust

## 已完成

- 配置读写：`get_config` / `save_config`
- token 持久化到 Tauri app data 的 `config.json`
- 假登录与假用户信息
- 假搜索结果
- 搜索结果进入章节详情
- 假章节列表与章节勾选
- Rust 创建下载任务
- Rust 通过 Tauri event 推送下载进度
- 前端下载列表显示状态、百分比和进度条

## 创建

```bash
pnpm create tauri-app pica-app --template react-ts
```

## 运行

```bash
pnpm install
pnpm tauri dev
```

## 构建

```bash
pnpm build
pnpm tauri build
```

## 项目记录

复刻路线和当前进度见：

```text
AGENT.md
```

## 下一步

- 下载任务去重
- 暂停 / 恢复 / 取消任务雏形
- 将假搜索与假章节替换为真实后端数据
