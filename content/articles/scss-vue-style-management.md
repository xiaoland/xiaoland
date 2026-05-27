---
title: '经验：基于SCSS与Vue的样式管理二三事'
description: '本文是在我经历了三个月的uniapp开发，结合material3、wot design uni等得出的样式管理经验总结。 代号化 参考文档： Material3 Design Tokens 每一个样式都用代号表示： scope：该代号的作用域 ref：引用，这类代号一定引用到一个'
createdAt: '2024-11-22T03:23:00Z'
oldId: 445
oldUrl: 'https://blog.hadream.ltd/index.php/archives/445/'
categories: ['summary-coding']
tags: ['uniapp', 'vue', '样式管理']
---
> 本文是在我经历了三个月的uniapp开发，结合material3、wot-design-uni等得出的样式管理经验总结。

## 代号化

参考文档：

- [Material3 Design Tokens](https://m3.material.io/foundations/design-tokens/overview)

每一个样式都用代号表示：

- scope：该代号的作用域
  - ref：引用，这类代号一定引用到一个具体的值，如`#E8DEF8`
  - sys：全局，基于全局语境指向不同的引用代号（这是实现亮暗色切换的关键）
  - comp：组件级别
- type：样式的类型
  - color：色彩，[参考](Color)
  - shape：形状，[参考](Shape)
- role：样式角色
  - 参考类型，每个类型都定义了基本的角色

在SCSS中的实现示例：
```scss
/* 声明 */
$-scope-type-role-attr: value;

// attr是CSS属性的名称，一个role可能影响多个CSS属性，如：
$-sys-font-title-large-size: 22px;  // 其中，title-large是role, size是attr
$-sys-font-title-large-spacing: 0.5px; // 其中，spacing是attr

// 一般来说，sys,comp都会引用另一个变量，只有ref才会实际保存一个值

/* 集成 */
@mixin type-role {
    attr1: $-scope-type-role-attr1;
    attr2: $-scope-type-role-attr2;
}
```
可以[参考](https://github.com/material-foundation/material-tokens)

但是为了方便外部覆盖，推荐这么做：
```scss
$-scope-type-role-attr: var(--namespace-scope-type-role-attr, 实际值) !default;

// 如：
$-sys-color-primary: var(--pd-color-primary, #96d945) !default;

// 这么做时，组件的调用者可以在其样式部分覆盖该css变量从而达到覆盖该颜色的效果
```

### 模块化
> 样式有很多类型，我们按照类型将这些样式代号封装到不同的模块中，方便维护

- shape：存储与形状、尺寸相关的样式标准
- elevation：存储与“海拔”有关的样式标准
- font：存储与排印相关的样式标准
- space：存储与边距相关的样式标准
- color：存储与颜色相关的样式标准

在需要使用的时候，按需引入（全部引入也行，SCSS预处理器会按需导入的）即可

下面这些是非样式代码的全局SCSS模块：
- mixin：全局宏封装
- config：全局配置变量
- function：全局函数

## BEM
> [什么是BEM？](https://juejin.cn/post/6844903672162304013)

简单来说，BEM提供了一种简单强大的类命名方式，方便我们组织样式代码结构 
- 其中B是Block，一般是一个根节点、容器 
- E是Element，是Block中的子节点 
- M是Element的不同状态、类型，被称为Modifier

命名格式：`block__element--modifier`

### 与SCSS
> 在SCSS里面编写BEM已经比在CSS中简单很多，可以这样：

```scss
.block {
  .__element {
    .--modifier {}
  }
}
```
不必：
```css
.block {}

.block__element {}

.block__element--modifier {}
```

> 但是通过mixin，我们进一步简化（需要先导入`_mixin.scss`）

- `@include b(block_name)`可以创建一个Block块
- `@include e(element_name)`，嵌套在block选择器中，可以创建一个元素，而不必写`__`
- `@include m(modifier_name)`，可以创建一个修改器，而不必写`--`
  - 但是一般情况下，建议使用`@include when(case)`来封装不同状态的样式，这会创建一个`is-<case>`类选择器

> 使用这些mixin，你还需要进一步掌握SCSS的`include`相关知识

## SCSS
> 所有样式文件，除非必要，建议都使用SCSS编写。因为SCSS提供了更强大的功能与复用特性

> SCSS是怎么工作的？

- 简单来说，SCSS会在项目运行之前，被预处理器（相当于编译器）处理为CSS代码
- 但是SCSS提供了相当多好用的工具和语法特性，省略了我们在CSS中反复写这些重复代码的部分
- 所以SCSS与CSS的工作原理无异，你需要先了解CSS的工作原理才能更好地使用SCSS，否则有时候感觉就像是魔术

### 基本语法
- 可以嵌套，你不需要重复冗余地写类选择器：
```scss
.container {
  .box {
    width: 100px;
    height: 100px;
  }
}
```
相当于：
```css
.container .box {
  width: 100px;
  height: 100px;
}
```

- 简化嵌套选择器，将下面的代码
```scss
.container {
  .item:hover {
    background-color: #f0f0f0;
  }
  
  .item {
    ...some styles;
  }

}
```
简化为：
```scss
.container {
  .item {
    &:hover {
      background-color: #f0f0f0;
    }

    ...some styles;
  }
}
```
通过`&`，可以选中当前选择器的父选择器，编译后就是：
```css
.container .item:hover {
  background-color: #f0f0f0;
}
.container .item {
  ...some styles;
}
```

- 变量，通过`$`开头声明变量，而且有作用域

- 继承

- 模块化，通过`@use`或`@import`导入模块

### Mixin
> mixin相当于宏，将一段样式代码进行封装以备复用；而最关键的是SCSS提供了很多逻辑语句，可以进行复杂的处理

通过`@mixin <mixin_name>`声明，通过`@include <mixin_name>`使用

`@include`会将mixin中的样式直接覆盖（可以理解为复制）到当前选择器中

> 注意！必须在当前选择器的样式代码后面使用`@include`

### 常用函数
> 这里列出在编写样式时，会经常用到的SCSS提供了内置函数

- rgba：调整颜色的alpha通道值（就是不透明度 / 亮度）
  - `rgba(RGB / HEX / HSL, 0-1)`

## Vue
> Vue的样式处理很有意思，我们来看看，这对覆盖样式至关重要

### 样式隔离与穿透
我们都知道Vue SFC的样式代码可以开启`scoped`选项，这样就会给当前组件的所有样式附加一个属性选择器（`data=组件的hash值`），避免其污染全局中同名的选择器。

但是如果有时候我们就需要去_污染_呢？——如覆盖子组件样式时。

那么我们就可以通过`:deep(.selector)`的方式，套住在子组件中会出现的选择器（确保同名），此时Vue就不会将该选择器附加组件的属性选择器。

而由于该样式特异性更高，就会覆盖子组件同名的样式。

> 在uniapp上，需要父子组件都开启`styleIsolation: 'shared'`选项才行


### customClass与customStyle
这是两个子组件的prop，这样可以允许父组件修改子组件的样式

`customStyle`不必多说，设置内联样式，是优先级最高的（不说`!important`）

`customClass`则是将一个类名附加到子组件中的元素上（自己实现），然后基于`deep`的穿透原理，在不需要父组件知道子组件有哪些类选择器的情况下，由父组件自由定义一个类选择器覆盖样式。

### 变量覆盖
如果只是需要修改如颜色、字体这些子组件中使用变量控制（参考[代号化](#代号化)）的样式，那么就可以在父组件的`style`块中：
```scss
:root {
  --sub-comp-var: new-value;
}
```
将同名变量的值重新赋值（其实默认就是没有赋值，上面代号化利用了CSS变量的默认值特性）

> 此处`:root`伪类选择器选择的不是html文档，而是当前组件，因为这在一个`scoped`的vue `style`块 \
> 如果希望选中html文档，可以用`:global`

## 参考资料
> https://devv.ai/search?threadId=e4o91ehm3gg0
