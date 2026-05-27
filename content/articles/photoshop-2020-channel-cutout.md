---
title: '「教程」通道抠图法PS2020'
description: 'PS教程系列 通道抠图法PS2020 前言 通道抠图法是一种抠图的办法，原理我不是很懂，只是大概会运用这种办法 开始 通道抠图法可以说是一种较为自动的抠图方法 而我所知道的，我所认识的，自动抠图的方法最好要让你想抠的内容和背景的分离程度高起来 而将背景与抠图对象的色彩对比增大方法'
createdAt: '2021-11-07T05:07:00Z'
oldId: 183
oldUrl: 'https://blog.hadream.ltd/index.php/archives/183/'
categories: ['tutorial']
tags: ['ps', '抠图']
---
# PS教程系列-通道抠图法PS2020

## 前言
- 通道抠图法是一种抠图的办法，原理我不是很懂，只是大概会运用这种办法

## 开始
- 通道抠图法可以说是一种较为自动的抠图方法
  而我所知道的，我所认识的，自动抠图的方法最好要让你想抠的内容和背景的分离程度高起来
- 而将背景与抠图对象的色彩对比增大方法有很多，通道抠图法就是其一
- 所以我们就要运用RGB三个通道中的B通道，将其图像进行反色，然后调整色阶，让你要抠下来的元素与背景的分离程度变高

### 实例
- 我想把气字抠出来
  ![微信图片_20211106202313.jpg][1]
- 就要打开通道板块，然后就要复制一份"蓝"通道->"蓝 拷贝"
  ![屏幕截图 2021-11-07 131311.png][2]
- 接下来将其它通道都不可视，只有备份的那份可视
- 然后编辑备份的蓝色通道，在图像选项卡-调整中执行反色（这一步看情况执行，我是推荐的）
- 同样是调整中，再选择色阶。打开色阶面板，将背景与要扣除的对象的颜色对比开来，方便自动选中
- 在调整完毕之后，请按住Ctrl，然后选中"蓝 拷贝"通道，就会自动选中了
  这时候复制到别的图层即可
- 实操gif
  ![ps通道抠图法.gif][3]


  [1]: https://oss.lanzhijiang.dev/xiaoland/images/articles/photoshop-2020-channel-cutout/3256013641-6d8bffd4.jpg
  [2]: https://oss.lanzhijiang.dev/xiaoland/images/articles/photoshop-2020-channel-cutout/607491426-7e804be8.png
  [3]: https://oss.lanzhijiang.dev/xiaoland/images/articles/photoshop-2020-channel-cutout/2526307792-440e80ff.gif
