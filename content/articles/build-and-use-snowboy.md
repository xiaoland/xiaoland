---
title: '「教程」snowboy的构建编译使用'
description: '教程 snowboy的构建与使用 snowboy是kitt.ai chengguoguo 开发的一款热词检测式语音唤醒开源软件 许多项目如HadreamAssistant与wukong robot都用过它 要将snowboy加入到自己的项目的关键一步，就是编译出符合系统的swig'
createdAt: '2023-06-25T13:23:00Z'
oldId: 234
oldUrl: 'https://blog.hadream.ltd/index.php/archives/234/'
categories: ['tutorial-it', 'tutorial']
tags: ['snowboy', 'swig']
---
- snowboy是kitt.ai(chengguoguo)开发的一款热词检测式语音唤醒开源软件
- 许多项目如HadreamAssistant与wukong-robot都用过它
- 要将snowboy加入到自己的项目的关键一步，就是编译出符合系统的swig以及_snowboydetect.so，否则不论怎么调试，都不会好的
- 本文参考[官方教程](https://github.com/Kitt-AI/snowboy#dependencies)

### 依赖
- SoX
- PortAudio/PyAduio
- SWIG 3.0.10+
  - 安装swig看[这篇](https://blog.csdn.net/sinat_28442665/article/details/114412554)就行
  - 但官方也是有[教程](https://github.com/Kitt-AI/snowboy#ubunturaspberry-pipine64nvidia-jetson-tx1nvidia-jetson-tx2)的
- ATLAS/OpenBLAS

### 编译
- 我们需要获得_snowboydetect.so与snowboydetect.py这两个文件
  demo.py中有对于调用snowboydetect的示例，可以按照demo来调用
- `git clone https://github.com/Kitt-AI/snowboy`
- 然后进入snowboy-master的swig/Python（或者选择你自己想要的语言）
- `make`就可以得到这两个文件啦！
