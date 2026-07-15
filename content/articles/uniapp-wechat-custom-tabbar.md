---
title: '问题解决：uniapp在微信小程序自定义TabBar'
description: '先简单记录一下，解决的是新的微信小程序基础库或者uniapp更新导致的，在this.$mp里面获取不到页面实例了 通过getCurrentPages 0 获取到当前页面实例，里面有getTabBar，可以获取到当前页面的TabBar组件实例。'
status: 'draft'
createdAt: '2024-11-20T10:22:32Z'
oldId: 444
oldUrl: 'https://blog.hadream.ltd/index.php/archives/444/'
categories: ['review']
tags: ['uniapp', '微信小程序']
---
> 先简单记录一下，解决的是新的微信小程序基础库或者uniapp更新导致的，在`this.$mp`里面获取不到页面实例了

通过`getCurrentPages()[0]`获取到当前页面实例，里面有`getTabBar`，可以获取到当前页面的TabBar组件实例。
