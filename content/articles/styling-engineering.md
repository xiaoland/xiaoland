---
title: 样式工程
description: '本文介绍一个工作流，将 Figma 设计稿作为 SSoT，自动生成多平台（Web、Flutter、UniApp）的 Design Tokens，从而实现跨端视觉一致、多尺寸、布局、模式适配。'
createdAt: '2025-11-25T12:03:53.562Z'
---

## TL;DR

1. 打开你的 Figma 设计稿，搜索 Plugin `Design Tokens` (by lukasoppermann) 并保存
2. 使用 Figma Variables 定义色彩、尺寸、圆角，用 Figma Styles 定义字体、阴影等
3. Ctrl + K 运行 `Design Tokens > Send Design Token To Url`
    - Server Url 指向你代码托管平台接受 Webhook 的地址，比如 Github 是 `https://github.com/:username/:repo/disptaches`
    - Auth Type 根据你的代码托管平台的机制来选择
    - Access Token 这里以 Github 为例，打开 Setting 页面，在底部可以找到 Developer Setting，在其中找到 Personal Access Token 并创建 （fine-grained 注意配置好授权的 repo 以及权限）