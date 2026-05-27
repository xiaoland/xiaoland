---
title: '「教程」配置开发Rust调试Debug环境'
description: '教程 配置开发Rust调试Debug环境 rust作为一门大热的语言，我觉得还是有必要学一学的 rust一般按照官方教程来即可 你将学到什么 如何安装rust开发基本工具链 如何在vscode上开发rust 安装c++环境 在不同的平台上，安装的区别比较大，主要是windows和'
createdAt: '2023-08-14T15:22:00Z'
oldId: 286
oldUrl: 'https://blog.hadream.ltd/index.php/archives/286/'
categories: ['tutorial-it', 'tutorial']
tags: ['rust', 'vscode']
---
# 教程-配置开发Rust调试Debug环境
- rust作为一门大热的语言，我觉得还是有必要学一学的
- rust一般按照[官方教程](https://www.rust-lang.org/zh-CN/learn/get-started)来即可

### 你将学到什么
- 如何安装rust开发基本工具链
- 如何在vscode上开发rust

### 安装c++环境
- 在不同的平台上，安装的区别比较大，主要是windows和linux不一样
- 对于windows，你需要去安装MSVC或者MINGW
  - MSVC是微软推出的C++环境
    安装MSVC，你需要运行[这个](https://aka.ms/vs/17/release/vc_redist.x64.exe)
  - MINGW是GCC在windows上的版本
    不推荐在windows上使用MINGW
- 对于linux，安装好gcc，或者运行官方教程里的一键安装脚本就行

### 安装rust工具链
- 包括rustup与cargo，如果使用安装脚本安装，就已经安装好了
- 可以通过`cargo --version`与`rustup -V`来看看有没有安装好、环境变量PATH有没有配置好

### 在vscode上开发rust
- 安装扩展rust-analyer、CodeLLDB、crates
- 然后配置一个launch项，这样才能进行debug
#### 配置launch项
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "lldb",
            "request": "launch",
            "preLaunchTask": "build",
            "name": "Debug",
            "program": "${workspaceFolder}/target/debug/${fileBasenameNoExtension}.exe", 
            "args": [],
            "cwd": "${workspaceFolder}"
        }
    ]
}
```
- 这其中的program项，是可执行程序的位置，不同的系统不同，上面是windows的
  linux改成${fileBasename}
#### 配置task
- 而在运行可执行程序之前，需要使用cargo进行编译，为了方便，我们创建一个task
- 只需要创建.vscode/tasks.json，然后输入以下内容即可
```json
{ 
    "version": "2.0.0", 
    "tasks": [
      {
        "label": "build",
        "type": "shell",
        "command": "cargo build",
        "args": [],
        "group": {
          "kind": "build",
          "isDefault": true
        }
      }
    ]
}
```
#### 配置Cargo.toml
- Cargo.toml用于给`cargo build`提供指示
- 一般，这样配置bin项，就可以指定编译哪个rs文件为可执行文件
```toml
[[bin]]
name = "your script name"
path = "path/to/your/entry.rs"
```

### 使用
- 如此配置之后，你就可以愉快地在vscode的调试项中进行Debug啦！
