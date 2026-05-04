let capture;
let facemesh;
let predictions = [];
let stars = []; // 儲存星星資料
const rightEyeInner = [246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7, 33];
const rightEyeOuter = [247, 30, 29, 28, 27, 26, 25, 110, 24, 23, 22, 21, 162, 127, 226];
const leftEyeInner = [466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249, 263];
const leftEyeOuter = [467, 260, 259, 258, 257, 256, 255, 339, 254, 253, 252, 251, 389, 356, 446];
const faceSilhouette = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 指定開啟前置鏡頭 (facingMode: 'user')
  let constraints = {
    video: {
      facingMode: 'user'
    },
    audio: false
  };
  
  capture = createCapture(constraints, function(stream) {
    console.log("攝影機串流已啟動");
    // 關鍵修補：確保在 iOS 上能自動播放
    let videoElt = capture.elt;
    videoElt.setAttribute('playsinline', '');
    videoElt.setAttribute('autoplay', '');
  });
  
  // 隱藏預設產生的 HTML5 video 元件，我們只要在畫布上繪製
  capture.hide();

  // 初始化 FaceMesh 模型
  facemesh = ml5.facemesh(capture, modelReady);
  
  // 當偵測到臉部資料時，存入 predictions 變數
  facemesh.on('predict', results => {
    predictions = results;
  });

  // 預先產生 200 顆星星
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: random(-width, width * 2), // 考量到鏡像與位移，範圍設定廣一點
      y: random(-height, height * 2),
      size: random(1, 4),
      brightness: random(150, 255)
    });
  }
}

let isModelReady = false;
function modelReady() {
  console.log("臉部偵測模型已準備就緒！");
  isModelReady = true;
}

function draw() {
  // 設定背景顏色為黑色（外太空）
  background(0);
  
  // 設定影像為全螢幕大小
  let videoW = width;
  let videoH = height;
  
  // 影像佔滿全螢幕，起始座標設為 0
  let x = 0;
  let y = 0;
  
  // 檢查攝影機是否已就緒
  if (capture.width === 0) {
    fill(255);
    textAlign(CENTER, CENTER);
    text("正在啟動攝影機並加載模型...", width / 2, height / 2);
    return; // 攝影機未就緒前先不執行後續繪圖
  }

  push();
  // 實現左右顛倒（鏡像製作）
  // 1. 先將座標系移動到影像顯示區域的右側邊界
  translate(x + videoW, y);
  // 2. 將水平軸縮放改為 -1 (達成鏡像)
  scale(-1, 1);
  // 3. 繪製影像，由於 scale(-1, 1)，影像會從基準點往反方向繪製
  image(capture, 0, 0, videoW, videoH);

  // 繪製臉部辨識線條
  if (predictions.length > 0) {
    let face = predictions[0].scaledMesh;

    // --- 繪製黑色遮罩（隱藏臉部以外的部分） ---
    fill(0); // 黑色填充
    noStroke();
    beginShape();
    // 1. 外部大矩形：逆時針定義一個足以覆蓋畫布的範圍
    vertex(-width, -height);
    vertex(-width, height * 2);
    vertex(width * 2, height * 2);
    vertex(width * 2, -height);

    // 2. 內部孔洞：順時針定義臉部輪廓，實現「挖洞」效果
    beginContour();
    for (let i = 0; i < faceSilhouette.length; i++) {
      let p = face[faceSilhouette[i]];
      let vx = map(p[0], 0, capture.width, 0, videoW);
      let vy = map(p[1], 0, capture.height, 0, videoH);
      vertex(vx, vy);
    }
    endContour();
    endShape(CLOSE);

    // --- 繪製星星 ---
    noStroke();
    for (let star of stars) {
      fill(255, star.brightness); // 白色帶隨機亮度
      circle(star.x, star.y, star.size);
    }

    // --- 繪製原本的紅線特徵 ---
    stroke(255, 0, 0);
    strokeWeight(1);
    noFill();

    // 設定霓虹燈發光效果 (利用 Canvas 原生 shadow 屬性)
    drawingContext.shadowBlur = 20;          // 光暈的模糊程度
    drawingContext.shadowColor = color(255, 0, 0); // 光暈的顏色

    // 定義繪製閉合輪廓的函式
    const drawContour = (indices) => {
      for (let i = 0; i < indices.length; i++) {
        let p1 = face[indices[i]];
        let p2 = face[indices[(i + 1) % indices.length]]; // 取餘數以連結首尾，形成一圈

        let x1 = map(p1[0], 0, capture.width, 0, videoW);
        let y1 = map(p1[1], 0, capture.height, 0, videoH);
        let x2 = map(p2[0], 0, capture.width, 0, videoW);
        let y2 = map(p2[1], 0, capture.height, 0, videoH);

        if (capture.width > 0) line(x1, y1, x2, y2);
      }
    };

    // 繪製內圈與外圈
    drawContour(rightEyeInner);
    drawContour(rightEyeOuter);
    // 繪製左眼內圈與外圈
    drawContour(leftEyeInner);
    drawContour(leftEyeOuter);
    // 繪製臉部最外層輪廓
    drawContour(faceSilhouette);

    // 繪製完畢後重設光暈，避免影響效能或其他繪圖元素
    drawingContext.shadowBlur = 0;
  }
  pop();
}

// 當視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
