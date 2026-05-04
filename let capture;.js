let capture;

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  // 隱藏預設產生的 HTML5 video 元件，我們只要在畫布上繪製
  capture.hide();
}

function draw() {
  // 設定背景顏色為 e7c6ff
  background('#e7c6ff');
  
  // 計算影像顯示的大小（全螢幕的 50%）
  let videoW = width * 0.5;
  let videoH = height * 0.5;
  
  // 計算影像居中顯示的位置
  let x = (width - videoW) / 2;
  let y = (height - videoH) / 2;
  
  push();
  // 實現左右顛倒（鏡像製作）
  // 1. 先將座標系移動到影像顯示區域的右側邊界
  translate(x + videoW, y);
  // 2. 將水平軸縮放改為 -1 (達成鏡像)
  scale(-1, 1);
  // 3. 繪製影像，由於 scale(-1, 1)，影像會從基準點往反方向繪製
  image(capture, 0, 0, videoW, videoH);
  pop();
}

// 當視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
