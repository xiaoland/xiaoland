---
title: '开发并私有托管自己的Python包'
description: '本文章解决从开发到发布一个Python包，再到使用该Python包开发应用的一系列问题 背景 这篇文章的背景是我的项目越发得庞大，后端有至少4个分体软件，但是他们都遵循基本的模式：数据模型定义 + 业务逻辑 + 通用的依赖库（数据库操作、日志、配置），为了避免重复开发与多处修改，'
createdAt: '2024-11-04T15:37:00Z'
oldId: 440
oldUrl: 'https://blog.hadream.ltd/index.php/archives/440/'
categories: ['summary-coding']
tags: ['poetry', 'pypi', 'python']
---
> 本文章解决从开发到发布一个Python包，再到使用该Python包开发应用的一系列问题

## 背景

这篇文章的背景是我的项目越发得庞大，后端有至少4个分体软件，但是他们都遵循基本的模式：数据模型定义 + 业务逻辑 + 通用的依赖库（数据库操作、日志、配置），为了避免重复开发与多处修改，我将这些通用的内容抽象成为一个库 —— 也就是包。

而我后端使用的是Python，所以就被Python包管理上的各种坑狠狠地折腾了一遍。（其实并不复杂，主要是自托管问题）

阅读本文你将得到：
- 开发Python包的最佳实践
- 基于Poetry与Gitlab Registry发布、托管PyPI包
- 基于Poetry与Gitlab Registry安装PyPI包

环境：
- Windows10
- Python3.10

## 怎样开发一个Python包

Python包的开发和脚本与应用不同，其诞生就是为了将代码交给别人使用，所以它没有入口文件。
平时我们的脚本和各种应用不写测试也行，只要启动跑通就行了 —— 但包是没有所谓的入口的，需要基于实际的应用场景才能启动。
所以我们就得写测试：在根目录下创建`tests`文件夹

本包的所有核心代码，都存储在`<package_name>`文件夹中（如你的包叫做`my-package`，那么这个文件夹就是`my_package`）

接着执行`poetry init`初始化这个项目：
- 配置这个包的各种基本信息
- 可以交互式地指定依赖包以及版本等（还可以指定开发环境的依赖，比如`pytest`）

初始化之后，根目录下面就会有`pyproject.toml`文件，和npm的`packages.json`是类似的，你可以在里面定义脚本和源等等。

现在，确保你的项目中至少有这些目录和文件
```md
- dist/
- tests/
- my_package/
  - ...
- pyproject.toml
- .gitignore
```

在`.gitignore`中，忽略这些文件：
- `dist/*`：包编译后的结果，就是`.whl`文件

### 版本命名
很简单，就是 `<primary_version>.<secondary_version>.<patch_version>`

我们推荐从`0.1.0`开始，但绝对不可以从`0.0.1`开始

### 开发
在开发一个包的过程中，肯定会有很多模块，这个时候**注意！**

不要使用绝对引入，使用相对引入：
如你要从`libs.a`引入`utils.c`，不要写`from utils import c`，而是`from ..utils import c`

使用`.`表示当前目录，`..`表示上一目录

### 测试
写测试我就不再这里多赘述，但总之请放到`tests`文件夹中，你可以使用pytest或者unittest来完成测试

但总有人不喜欢写测试，喜欢上应用里去调试...  @(huaji_pc) （我就是其一）
那难道每次做一点修改就要编译又卸载重装？——那还得了！

你只需要这样在你的应用中安装你要开发的包就可以啦：`pip install -e path/to/your/package/folder`
这是pip的editable模式，它会创建一个映射到你的开发文件夹中

### 使用poetry
使用poerty管理依赖：

- `poetry add`安装依赖并自动更新到`pyproject.toml`中
  - 注意按照下面的方法配置源，poetry不会使用`~/pip.ini`的配置，也没有全局配置
- `poetry config --list`检查配置正确性

## 发布到托管
> 现在你完成了包的开发，需要发布到包托管（如PyPI的地方），并给你的其它项目使用

本处是基于poetry + gitlab，但其它的都是大同小异，变通一下就好。

首先，如果你的Gitlab Registry是私密的，那就需要先获得访问凭证：
1. 在个人设置的Access Token里面创建具有api权限的token
2. 执行`poetry config http-basic.<repo-name> <token-name> <token>`
    - 这里`repo-name`可以理解为源的名称，你稍后可以自定义其名称还有地址，源可以是任何一个符合PyPI标准的Registry，如清华大学的PyPI镜像、GitLab的PyPI Registry
    - 别担心，这个凭证不会保存到你的项目中；它会在你的`~/pypoetry/auth.toml`中保存该凭证信息（不知道为什么我这里保存不成功，于是我手动修改了这个文件，你也最好在poetry resovling dependencies不成功的时候检查有没有password字段）

接下来，编译出`whl`文件用于发布：`poetry build`

配置源，用于发布时指定发布源（比如你的 Gitlab Regisrty）：
`poetry config repositories.<repo-name> https://gitlab.yourself-hosted.com/api/v4/projects/<project-id>/packages/pypi`

> 注意：
> - `repo-name`与上面一致
> - `project-id`在你的Gitlab Project的General中查看

`poetry publish -r <repo-name>`
 
> 如果这时候认证失败，建议加上`-u <token-name> -p <token>`

如果发布有问题，就按照报错排查就好

## 使用这个包
> 关键只在于要指定你的包的索引源，因为你的包没有被托管在PyPI.org上面，而是私有托管

### pip
使用pip或者requirements.txt安装，就使用`--extra-index-url`指定即可

### poetry
在`pyproject.toml`中，添加源：

```toml
[[tool.poetry.source]]
name = "repo-name"
url = "上面上传的地址"
```

如果有多个源，你可以使用前后顺序或者`priority`选项指定索引的顺序。

注意：
- 确保你所有的源都可以被正常访问：URL没错、凭证正确（特别注意我上面说的config无效的情况）
- 确保没有漏源：比如你发布了A和B包，B包依赖于A包，但是你只配置了B包的源

要求使用特定源安装依赖项：

```toml
<dependence-name> = { version = "", source = "<repo-name>" }
```
