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

            return item.element.contains(element) && tarCursor === srcCursor;
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
        const clickableEl = ['BUTTON', 'SELECT', /*'TEXTAREA', 'INPUT', */ 'A', 'VIDEO', 'IFRAME'].includes(tagName) ||
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
    function appendStyle(el, style) {
        Object.entries(style).forEach(([key, value]) => {
            el.style[key] = value;
        })
    }

    // Lets create a floating border on top of these elements that will always be visible
    elItems.forEach(function (item, index) {
        item.rects.forEach((bbox) => {
            newElement = document.createElement("div");
            let borderColor = getRandomColor();
            const elementStyle = {
                outline: `2px dashed ${borderColor}`,
                position: 'fixed',
                top: bbox.top + 'px',
                left: bbox.left + 'px',
                width: bbox.width + 'px',
                height: bbox.height + 'px',
                pointerEvents: 'none',
                boxSizing: 'border-box',
                zIndex: 2147483647,
                // background: `${borderColor}80`
            }
            appendStyle(newElement, elementStyle);

            // Add floating label at the corner
            if (bbox.width > 20 || bbox.height > 40) {
                let label = document.createElement('span');
                let labelStyle = {
                    position: 'absolute',
                    background: borderColor,
                    color: 'white',
                    padding: '2px 4px',
                    fontSize: '12px',
                    borderRadius: '2px',
                    whiteSpace: 'nowrap',
                    // left: '50%',
                    // top: '0',
                    // transform: 'translate(-50%, 0)',
                    transform: `${bbox.top > 20 ? 'translate(-2px, -100%)' : 'translate(-100%, -2px)'}`,
                }
                appendStyle(label, labelStyle);
                label.textContent = index;
                newElement.appendChild(label);
            }

            document.body.appendChild(newElement);
            labels.push(newElement);

        });
    })
}
