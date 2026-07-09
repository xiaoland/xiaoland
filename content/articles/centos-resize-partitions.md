---
title: '「教程」Centos修改分区大小'
description: '教程 Centos修改分区大小 仅在centos上进行过测试 linux最亮的点就在于其LVM这一层的设计，实在是妙得不能再妙了 LVM层可以做什么呢？ 它统一了各种不同的文件系统，让他们能够一起使用 让你在调整分区容量时，不用看分区首尾相接的情况 天啦撸！怎么会有这么棒的设计，'
createdAt: '2021-06-20T03:10:00Z'
oldId: 85
oldUrl: 'https://blog.hadream.ltd/index.php/archives/85/'
categories: ['tutorial-server', 'tutorial']
tags: ['LVM', '磁盘管理']
---
- linux最亮的点就在于其LVM这一层的设计，实在是妙得不能再妙了
- LVM层可以做什么呢？
  - 它统一了各种不同的文件系统，让他们能够一起使用
  - 让你在调整分区容量时，不用看分区首尾相接的情况
- 天啦撸！怎么会有这么棒的设计，我们来对比一下：
  - Windows的：
    ![Windows分区表图][1]
  - Linux的：
    ![Linux分区表图][2]
  - 举个例子，假设我要扩大windows的C盘，那我就必须要格式化E盘并使其变为空闲，这样才可以扩展C
    如果要扩展F盘，倒是可以压缩E盘容量出一些空闲空间，接在F盘上
  - 但是Linux就NB了，假设我/var空间不足，我只需要简单地，从同一块硬盘上的任何分区分一点空间出来，不用管位置的问题，直接加给/var
    就问你给不给力？今天我就来说说怎么做

## 正文
- 其实本教程是针对centos的
  在别的发行版上，我不敢作保证，但一般是通用的，只是文件系统名称多少有些改变，请自己根据实际情况进行调整

### 初步工作
- 首先要了解你的主机上有什么分区，空间情况如何，挂载到了哪里
- 所以执行`df -h`就可以查看到如上图的输出
- 然后确定两个分区：一个是要缩减容量的；一个是要增加容量的
- 接下来，我们要解挂你要减少容量的分区
  - 解挂类似 /home 的分区，我们用`umount /home`  (我觉得 / 分区是不可以解挂的，不然估计要死）
  - 解挂/swap分区，则`swapoff /dev/mapper/cl_hadream--server-swap`
    - 解挂swap分区，可以用`free -g`查看swap的情况

### 压缩分区
- 我们这里假设压缩/home的容量
- 则`lvreduce -L -10G /dev/mapper/cl_hadream--server-home`  单位的选择就是 G M
  - 当然也可以`resize2fs -p /dev/mapper/cl_hadream--server-home 50G` 不过这是直接修改容量，而不是增加或减少
- 这样就可以了，记得挂载回来
  - `mount /home`
  - `mkswap /dev/mapper/cl_hadream--server-swap`
    `swapon /dev/mapper/cl_hadream--server-swap`

### 分配空闲空间
- 压缩分区之后，就会多出来一些空闲空间，这个时候就可以将空闲空间分配到同一块硬盘上的别的分区
- 先看看有多少空闲空间`vgdisplay`  查看Free PE/Size项
- 现在假设我要分配5G到/var上，那么我们就这样操作
  - `lvresize -L +5G  /dev/mapper/cl_hadream--server-var`
- 当然你也可以这样：
  - `lvextend -L +5G /dev/mapper/cl_hadream--server-var`  增加5G到文件系统上
    `resize2fs -p /dev/mapper/cl_hadream--server-var`

### 最后
- 到此为止就完成啦！你可以`vgdisplay`查看情况

### 参考资料
- [centos7 压缩回收swap分区，增加/home分区](https://blog.csdn.net/shilukun/article/details/92767565)
- [Centos/Linux下调整分区大小（以home和根分区为例）](https://blog.csdn.net/qq_33233768/article/details/65437609)





  [1]: https://oss.lanzhijiang.dev/xiaoland/images/articles/centos-resize-partitions/4f59e6b115b0c32b42c40f7d63e0-05b2e1eb.png
  [2]: https://oss.lanzhijiang.dev/xiaoland/images/articles/centos-resize-partitions/4e4e6c63fddab9099696197de12b-e9577b88.png
