---
title: 为什么你的 swap 不生效？
description: 如何在 Debian / RHEL 系统中开启 Swap 并确保其生效
publishTo: []
createdAt: '2025-11-25T12:03:53.558Z'
---

## 启用 Swap

1. 在开始之前，先检查系统是否已经启用了 Swap。

    ```bash
    sudo swapon --show
    ```

    如果没有任何输出，说明当前没有启用 Swap。你也可以用 `free -h` 查看内存使用情况。

2. 创建 Swap 文件

    我们需要创建一个用于作为 Swap 的文件。这里以创建一个 2GB 的 Swap 文件为例（你可以根据需要将 `2G` 改为 `1G` 或 `4G`）。

    使用 `fallocate` 命令快速创建文件：

    ```bash
    sudo fallocate -l 2G /swapfile
    ```

    > **注意：** 如果你的文件系统不支持 `fallocate`（较为罕见），你会收到错误提示。此时可以使用以下 `dd` 命令替代：
    > `sudo dd if=/dev/zero of=/swapfile bs=1M count=2048`

3. 设置权限

    出于安全考虑，Swap 文件应该只能由 root 用户读写。

    ```bash
    sudo chmod 600 /swapfile
    ```

    验证权限是否设置正确：

    ```bash
    ls -lh /swapfile
    ```

    你应该看到类似 `-rw-------` 的输出。

4. 将文件标记为 Swap

    使用 `mkswap` 命令将刚才创建的文件格式化为 Swap 空间：

    ```bash
    sudo mkswap /swapfile
    ```

    系统会提示类似 `Setting up swapspace version 1, size = 2 GiB...` 的信息。

5. 启用 Swap 文件

    现在，临时启用这个 Swap 文件：

    ```bash
    sudo swapon /swapfile
    ```

    再次检查状态，你应该能看到它已经挂载了：

    ```bash
    sudo swapon --show
    ```

6. 设置开机自动挂载（永久生效）

    为了防止重启后失效，需要将配置写入 `/etc/fstab` 文件。

    直接运行以下命令将配置追加到文件末尾：

    ```bash
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    ```

    或者使用编辑器打开文件 `/etc/fstab` 在末尾手动添加 `/swapfile none swap sw 0 0` 并保存。


7. 检查/优化 Swappiness

    `swappiness` 参数决定了系统使用 Swap 的积极程度（0-100）。
    Debian 默认是 `60`，这意味着系统会比较积极地使用 Swap。
    对于服务器或桌面，通常建议将其调低，以优先使用物理内存。
    但有部分云服务厂商可能会将该值设置为 **0** ！这也就是为什么你设置了 Swap 但没有发现系统因内存造成的卡顿情况有明显的改善！（设置为0意味着只有在物理内存完全耗尽的时候才使用 swap ）

    查看当前值：

    ```bash
    cat /proc/sys/vm/swappiness
    ```

    临时修改（立即生效）为 10（推荐值）：

    ```bash
    sudo sysctl vm.swappiness=10
    ```

    永久修改：编辑 sysctl 配置文件：

    ```bash
    sudo nano /etc/sysctl.conf
    ```

    在文件末尾添加：
    `vm.swappiness=10`
    保存退出即可。

-----

## 删除 Swap

如果你以后不再需要它，可以按以下步骤安全删除：

1. 关闭 Swap: `sudo swapoff -v /swapfile`
2. 删除配置: 编辑 `/etc/fstab` 删除添加的那一行。
3. 删除文件: `sudo rm /swapfile`

你需要我帮你确认一下应该设置多大的 Swap 空间才合适吗？（这通常取决于你的物理内存大小和应用场景）。
