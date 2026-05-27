---
title: '「攻略」Java程序语言设计'
description: '攻略 Java程序语言设计 说明：本文用于广外Java程序语言与设计的学生使用，可以在下方下载pdf后打印出来使用 基础能力要求 读题 自己看书看概念 各种变量类型 选择 if switch 循环 for while do while 继承 多态 解题 理解题目之后，讲题目的输入'
createdAt: '2023-12-19T06:40:00Z'
oldId: 340
oldUrl: 'https://blog.hadream.ltd/index.php/archives/340/'
categories: ['tutorial-college', 'tutorial']
tags: ['java', '大学', '攻略']
---
# 攻略-Java程序语言设计

> 说明：本文用于广外Java程序语言与设计的学生使用，可以在下方下载pdf后打印出来使用

## 基础能力要求
### 读题
自己看书看概念
- 各种变量类型
- 选择
  - if
  - switch
- 循环
  - for
  - while
  - do while
- 继承
- 多态
### 解题
- 理解题目之后，讲题目的输入，输出要求列清楚
- 根据自己的知识，给一个大致的思路，分块
- 拿一个特定例子，用笔先在纸上模拟计算机演练一遍
- 根据自己的知识，将代码组织好
  - 注意缩进
  - 不同的区块要空行，方便自己阅读
- 调试运行
  - 如果出现不及预期的结果，一定要使用小虫子调试
  - 问题往往出在循环和选择的条件写错了，这些很隐形，不会报错，很难定位
- 尽可能覆盖多样的用例
## 基础知识
- 所有的区间都是左闭右开
- 所有下标、序号从0开始
### 变量类型
## 常用语句
### 各类循环
#### For
什么时候使用：与数组操作相关时
#### 经典用例：与数组有关
```java
int[] nums = new int[10];

for (int i = start; i < nums.length; i++) {
    // i是下标
}

for (int i:num) {
    // i是值
}
```
这样理解for循环：
```java
for (循环开始前执行的语句; 循环结束条件; 每次循环结束执行) {
}
```

#### 注意
`i < nums.length`下标不能大于等于数组长度

#### 打开思路
`i--`；

#### While
什么时候使用：你喜欢，只要逻辑说得通

### 键盘输入
```java
// 导入类
import java.util.Scanner;

// 实例化类
Scanner scanner = new Scanner(System.in);

// 读入
String a = scanner.nextLine(); // 读入整一个下一行
int a = scanner.nextInt(); // 同理，有nextDouble等
```

### 字符串操作
#### 截取子串
```java
String a = "123456";

String b = a.substring(int start, int end); // 截取a从start到end的部分
// 如start=2 end=5 则 b为345 
```

#### 转化
```java
int a = 123;

// 整型转字符串
String b = String.valueOf(a);

// 字符串转整型
int b = Integet.parseInt(b);
```

#### 比较
```java
String b = "123";
String a = "123";
Char d = '1'
String e = "1"
String f = "Y"
String g = "y"

Boolean c = a.equals(b); // 使用==是比较引用地址，特别比较
Boolean c = e.equals(d); // 同样，字符与字符串的比较也可以用equals
Boolean c = f.equalsIgnoreCase(g); // 忽略大小写的比较
```

#### 抽取一个字符
```java
String a = "abcde"
Char b = a.charAt(1) // 'b'
```

#### 字符串格式化
用途：
- 插入变量

```java
String name = "YYH";
int age = 18;
System.out.println(String.format("My name is %s, age: %s", name, age));
// out: My name is YYH, age: 18
// same as: 
System.out.println("My name is " + name + ", age: " + age);
```

- 保留小数
```java
double a = 1.2356;
System.out.println(String.format("Area: %.2f", a));
// Area: 1.24
// %.xf 即保留x位 f是浮点数，也就是double
System.out.printf("Area: %.2f", a);
// 效果同上
```

#### 特殊字符
| 符号 | 含义                  |
| ---- | --------------------- |
| \\t   | 制表符，相当于4个空格 |
| \\n   | 空格                  |

### 随机数
```java
import java.util.Random;

int x = 100;

Random random = new Random();
int a = random.nextInt(x);
// 生成一个0-x之间的整数，左闭右开

int a = random.nextInt(x) + y;
// 生成一个y-x之间的整数，左闭右开
```

### 数学类
```java
// 直接使用，无需引入
Math.PI // π
Math.pow(底数, 指数) // 幂运算
```

### 排序算法
在W14用到了，我就不多写了... :smile:

- 选择排序
- 交叉排序

## 易错
### 比较，类型不匹配
- 有些人容易打成这样`x == 1`以为自己在比较字符x是否为'1'这个字符，但容易漏打引号，结果把字符与数字比较，永远不可能成立

### [下载PDF](https://wx.mail.qq.com/ftn/download?func=3&key=c9cd6e654be47d3cfbbe1f6560663264adc8336562663264131d49115b000455030a1c5656575649060604034f505351021f5253005604570f0a000053043c647c53470484f28983a3971f15060026ae65da3243648df8e09436d56f8bde328c2c073b&code=621ebf2d&k=c9cd6e654be47d3cfbbe1f6560663264adc8336562663264131d49115b000455030a1c5656575649060604034f505351021f5253005604570f0a000053043c647c53470484f28983a3971f15060026ae65da3243648df8e09436d56f8bde328c2c073b&fweb=1&cl=1)
为什么下载不了？
- 点击下载后进入QQ邮箱文件中转站，此时就应该在浏览器中打开，而不是点击下载后跳转到浏览器
