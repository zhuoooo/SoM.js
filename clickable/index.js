// DOM Labeler
let labels = [];

// 清除
function unmarkPage() {
    for (const label of labels) {
        document.body.removeChild(label);
    }

    labels = [];
}

function markPage() {
    unmarkPage();

    // var bodyRect = document.body.getBoundingClientRect();
    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    let elItems = [];

    Array.prototype.slice.call(
        document.querySelectorAll('body *')
    ).map(function (element) {
        // 判断添加了 cursor 事件的嵌套场景
        const isSame = elItems.some(item => {
            const tarCursor = window.getComputedStyle(element).cursor;
            const srcCursor = window.getComputedStyle(item.element).cursor;

            return item.element.contains(element) &&  tarCursor === srcCursor;
        })
        if (isSame) {
            return;
        }

        // 获取元素的所有客户端矩形区域，过滤并转换成自定义的rect对象
        let rects = [...element.getClientRects()].filter(bb => {
            // 计算矩形中心点
            let center_x = bb.left + bb.width / 2;
            let center_y = bb.top + bb.height / 2;
            // 获取中心点处的元素
            let elAtCenter = document.elementFromPoint(center_x, center_y);

            // 确保中心点处的元素是当前元素或当前元素包含中心点处的元素
            return elAtCenter === element || element.contains(elAtCenter)
        }).map(bb => {
            // 定义并返回矩形对象，包含调整后的边界、宽度和高度
            const rect = {
                left: Math.max(0, bb.left),
                top: Math.max(0, bb.top),
                right: Math.min(vw, bb.right),
                bottom: Math.min(vh, bb.bottom)
            };
            return {
                ...rect,
                width: rect.right - rect.left,
                height: rect.bottom - rect.top
            }
        });

        let area = rects.reduce((acc, rect) => acc + rect.width * rect.height, 0);
        const tagName = element.tagName.toUpperCase();
        const clickableEl = ['BUTTON', 'SELECT', 'TEXTAREA', 'INPUT', 'A', 'VIDEO', 'IFRAME'].includes(tagName) ||
            (element.onclick != null) || window.getComputedStyle(element).cursor == 'pointer';

        if (area >= 20 && clickableEl) {
            elItems.push({
                element: element,
                area,
                rects,
                text: element.textContent.trim().replace(/\s{2,}/g, ' ')
            })
        }
    });

    // Only keep inner clickable elItems
    elItems = elItems.filter(x => !elItems.some(y => x.element.contains(y.element) && !(x == y)))

    // Function to generate random colors
    function getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Lets create a floating border on top of these elements that will always be visible
    elItems.forEach(function (item, index) {
        item.rects.forEach((bbox) => {
            newElement = document.createElement("div");
            var borderColor = getRandomColor();
            newElement.style.outline = `2px dashed ${borderColor}`;
            newElement.style.position = "fixed";
            newElement.style.left = bbox.left + "px";
            newElement.style.top = bbox.top + "px";
            newElement.style.width = bbox.width + "px";
            newElement.style.height = bbox.height + "px";
            newElement.style.pointerEvents = "none";
            newElement.style.boxSizing = "border-box";
            newElement.style.zIndex = 2147483647;
            // newElement.style.background = `${borderColor}80`;
            // Add floating label at the corner
            var label = document.createElement("span");
            label.textContent = index;
            label.style.position = "absolute";
            label.style.top = "-19px";
            label.style.left = "0px";
            label.style.background = borderColor;
            label.style.color = "white";
            label.style.padding = "2px 4px";
            label.style.fontSize = "12px";
            label.style.borderRadius = "2px";
            newElement.appendChild(label);

            document.body.appendChild(newElement);
            labels.push(newElement);

        });
    })
}
