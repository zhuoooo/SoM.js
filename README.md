# SoM.js

用于实现各种场景的网页视觉效果标记的功能。
GPT4V 并不能有效的识别 Web 的元素，所以在使用 GPT4V 之前进行图像标记，图像标记现在有两种方式：

 1. 通过 `AI` 识别图片进行标记，这种主要利用在对静态图片图像的识别。例如： [微软开源 SoM](https://github.com/microsoft/SoM)
 2. 采用注入 `JS` 修改页面元素的方式来标记。

对于网页，通过在浏览器中注入 `text/index.js`，执行 `markPage` 函数来完成页面的标记，该 `JS` 能够完成标准的 `COCO Annotation` 的标注。

### 标记文字

text/index.js

#### 效果

![](./assets/text.png)


### 标记可点击的内容

clickable/index.js

#### 效果

![](./assets/clickable.png)
