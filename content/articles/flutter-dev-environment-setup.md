---
title: '「教程」flutter开发环境搭建'
description: '教程 flutter开发环境搭建 这里就不对flutter作介绍了，就是一个google开发的，便于开发ui应用（web/mobile）的SDK flutter使用Dart语言 在官网和中文官网上，都有交你如何搭建flutter开发环境的教程 但是我搭建过程中，依然遇到很多坑，所'
createdAt: '2021-09-21T06:14:00Z'
oldId: 157
oldUrl: 'https://blog.hadream.ltd/index.php/archives/157/'
categories: ['tutorial-it', 'tutorial']
tags: ['flutter']
---
# 教程-flutter开发环境搭建
- 这里就不对flutter作介绍了，就是一个google开发的，便于开发ui应用（web/mobile）的SDK
  flutter使用Dart语言
- 在官网和中文官网上，都有交你如何搭建flutter开发环境的教程
  但是我搭建过程中，依然遇到很多坑，所以就有了这篇文章
- 注意本文章是windows上的搭建的教程

### flutterSDK
- 首先是flutter的sdk，我们只要从[官网下载][1]即可
- 安装步骤很简单：
  - 解压到除了C:\\Program Files等需要管理员权限的文件夹以外的位置
  - 然后win+s搜索env，打开环境变量
  - 系统变量中的Path添加<flutter安装根目录>/bin: 如：E:\\Program\\flutter\\bin
- 效验：
  - 在cmd中执行flutter doctor，若成功执行就代表安装成功
    第一次运行flutter doctor会比较久，请耐心等待，且这个命令会检查现有的环境是否齐全

### 调试环境
- 这个部分是为了flutter进行安卓的应用程序编译和调试而存在的
  也是最难弄的部分
- 简单地说，该部分需要安装java-openjdk8和adb，最后才是android-sdk
- 不论你使用AndroidStudio还是VsCode，我都建议你认真地执行这一步

#### JAVA-OPENJDK8
- 注意必须安装Java8版本，别的版本运行会存在问题
  而且得是JDK，而不是JRE，我这里提供一份jdk-8u301-x64的[下载][2]
- 运行安装，不建议安装在C盘
- 安装完毕后打开环境变量编辑
  - 添加系统变量 JAVA_HOME: <你的JDK安装目录(不到bin)>
  - 系统变量的Path变量中添加 %JAVA_HOME%/bin
- cmd测试java能否正常输出

#### Adb
- 不多介绍这是个什么了，但是为了你能够使用各种模拟器或者实机来调试你的程序，我建议你配置好这个
- 安装照旧：下载->解压->环境变量到可执行文件
- 最后cmd测试adb看看能否正常运行

#### AndroidSDK
- 通过这个SDK，你可以方便地管理各种包(SDK Manager)以及安卓模拟设备(AVD Manager)
- 在国内有专门的[下载网站][3]，访问后找到AndroidSDK工具的SDK Tools点击即可下载对应版本
- 全自动安装文件，自己操作就好

### 踩坑
- 如果你遇到gradle问题，请先修改android/gradle.properties中的distributionUrl：
  - 将gradle-x.x.x-all.zip改为gradle-6.3-all.zip或者更高版本


  [1]: https://storage.flutter-io.cn/flutter_infra_release/releases/stable/windows/flutter_windows_2.5.1-stable.zip
  [2]: http://share.hadream.ltd/software/sharing/jdk-8u301-windows-x64.exe
  [3]: https://www.androiddevtools.cn/
