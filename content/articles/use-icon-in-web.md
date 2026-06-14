---
title: 如何在Web中使用图标
---

有好几种方式，下面分别做介绍。

## 基于 iconfont

你可以自己写

```css
@font-face {
  font-family: 'Material Symbols';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/materialsymbols/v75/d6kSkb-sS9m3-i1LgQNcsFOOuLQXvG559b5GLMxCWRtThFK5gn7xw7XblIl2peTfMb7ONaa2_wzcUHR1Ukiw2RYw2vadH3BFk0G4701x-cU0BaNVXEDuQLn3PTynOA.woff2) format('woff2');
}

.material-symbols {
  font-family: 'Material Symbols';
  line-height: 1;
  display: inline-block;
}
```

也可以用 `link` 引入：

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols" />
```

然后在你的 HTML body 中写：

```html
<span class="material-symbols">
  arrow_back
</span>
```

`arrow_back` 替换为你想要的图标名称，你可以在 <https://icones.js.org/collection/material-symbols> 上面查找到。

如果你希望设置图标的大小和文本对齐，我建议这样做：

```css
.material-symbols {
  font-size: inherit;  /* 因为 google-font CDN 引入的 CSS 里面写了 font size 24px */
}
```
```html
<a style="font-size: 16px">
    <span class="material-symbols">arrow_back</span>
    <span>返回</span>
</a>
```

也可以利用 `em`：

```css
.material-symbols {
    font-size: 1em;
}
```
```html
<a>
    <span class="material-symbols">arrow_back</span>
    <span style="font-size: 16px">返回</span>
</a>
```

而这样做并不能保证图标和文字垂直对齐，目前比较优雅的解决方案是给父元素使用 flex 布局。
