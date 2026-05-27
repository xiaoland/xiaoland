---
title: '「问题解决」libcareso.2无法加载'
description: '问题解决 libcare.so.2无法加载 这个是在宝塔安装完php56的时候出现的bug 报错为：error while loading shared libraries: libcares.so.2 原因 就是很简单的找不到了一些共享库 so lib, 可以参考其查找顺序来看'
createdAt: '2021-07-28T12:56:00Z'
oldId: 113
oldUrl: 'https://blog.hadream.ltd/index.php/archives/113/'
categories: ['tutorial-it', 'tutorial']
tags: ['共享库']
---
# 问题解决-libcare.so.2无法加载
- 这个是在宝塔安装完php56的时候出现的bug
- 报错为：error while loading shared libraries: libcares.so.2

### 原因
- 就是很简单的找不到了一些共享库(so lib, 可以参考其查找顺序来看看是否真的不存在)

### 解决方法
- 就是找到这个库并加载入环境变量(或者加载目标文件夹)中

#### centos
- 系统下，有一篇[文章](https://blog.csdn.net/larance001/article/details/112143191)可以参考
- 实际上，libcare.so.2也有专门的[RPM包](https://pkgs.org/download/libcares.so.2()(64bit))

#### ubuntu/debian
- 在ubuntu/debian下，应该可以如此解决（在ubuntu18.04测试成功）（但一般都是这个套路）
- 先找找本机有没有该库：`find / -name libcares.so.2`
- 有的话：
  - 找到在哪里，用ln -s建立软链接到/usr/lib64/
  - 然后加入这个软链接到环境变量中
- 没有的话：
  - `apt search cares` 找找有没有相关包——没有：`apt search c-ares`
  - 找到相关包，然后安装：`apt install 包名称（匹配架构）`

### 参考：
- https://blog.csdn.net/larance001/article/details/112143191
