---
title: '「总结」tar指令使用方法总结'
description: '总结 tar指令使用方法总结 tar指令用于解压/生成tar.gz/bz/.bz2等等的压缩包 需要注意的是zip/rar不可使用tar指令操作，只可以用unzip/unrar或zip/rar来进行压缩或解压缩 本文是整理常见的压缩包格式的配置选项，而不是详解这个指令 示例 ta'
createdAt: '2022-02-04T12:08:00Z'
oldId: 211
oldUrl: 'https://blog.hadream.ltd/index.php/archives/211/'
categories: ['summary']
tags: ['linux', 'tar', '指令', '详解']
---
- tar指令用于解压/生成tar.gz/bz/.bz2等等的压缩包
- 需要注意的是zip/rar不可使用tar指令操作，只可以用unzip/unrar或zip/rar来进行压缩或解压缩
- 本文是整理常见的压缩包格式的配置选项，而不是详解这个指令

## 示例

    tar -xzvf test.tar.gz

## 解压缩
- 比较常用的是解压缩
- 解压缩要加上-x
  参数后面跟着文件名加-f
| 文件类型  | 参数  |
| :-------- | ----- |
| *.tar     | -xvf  |
| *.tar.gz  | -xzvf |
| *.tar.bz2 | -xjf  |
| *.tar.xz  | -zJf  |
| *.tar.Z   | -xZf  |
| *.bz2   | bunzip2/bzip2-d  |
| *.xz   | xz -d  |

- 前三个常用，要记好：-xvf -xzvf -xjf

## 压缩
- 压缩的参数则是-c
  参数后面跟着文件名加-f
- 示例
  - `tar -czf jpg.tar.gz *.jpg`
    `tar -czf pi.tar.gz /home/pi`
| 文件类型  | 参数  |
| :-------- | ----- |
| *.tar     | -cvf  |
| *.tar.gz  | -czf |
| *.tar.bz2 | -cjf  |
| *.tar.Z  | -zZf  |


## 参考
- https://www.cnblogs.com/luozeng/p/8674529.html
