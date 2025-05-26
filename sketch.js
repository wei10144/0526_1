let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];
let circlePosition = { x: 0, y: 0 }; // 藍色圓圈的位置
let currentGesture = ""; // 當前手勢

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // 初始化 FaceMesh
  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  // 初始化 Handpose
  handpose = ml5.handpose(video, modelReady);
  handpose.on('predict', results => {
    handPredictions = results;
    detectGesture();
  });
}

function modelReady() {
  console.log("模型載入完成");
}

function draw() {
  image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    

    // 根據手勢改變藍色圓圈的位置
    if (currentGesture === "scissors") {
      // 移動到額頭（索引10）
      const [xForehead, yForehead] = keypoints[10];
      circlePosition = { x: xForehead, y: yForehead };
    } else if (currentGesture === "rock") {
      // 移動到左臉頰（索引234）
      const [xCheek, yCheek] = keypoints[234];
      circlePosition = { x: xCheek, y: yCheek };
    } else if (currentGesture === "paper") {
      // 移動到右眼（索引33）
      const [xEye, yEye] = keypoints[33];
      circlePosition = { x: xEye, y: yEye };
    } else {
      // 默認移動到鼻子（索引168）
      const [xNose, yNose] = keypoints[168];
      circlePosition = { x: xNose, y: yNose };
    }

    // 繪製藍色圓圈
    noFill();
    stroke(0, 0, 255);
    strokeWeight(2);
    ellipse(circlePosition.x, circlePosition.y, 50, 50);
  }
}

// 手勢辨識函數
function detectGesture() {
  if (handPredictions.length > 0) {
    const hand = handPredictions[0];
    const annotations = hand.annotations;

    // 根據手指的開合判斷手勢
    const thumbTip = annotations.thumb[3];
    const indexTip = annotations.indexFinger[3];
    const middleTip = annotations.middleFinger[3];
    const ringTip = annotations.ringFinger[3];
    const pinkyTip = annotations.pinky[3];

    // 判斷剪刀手（食指和中指張開，其餘手指閉合）
    if (
      dist(indexTip[0], indexTip[1], middleTip[0], middleTip[1]) > 50 &&
      dist(thumbTip[0], thumbTip[1], indexTip[0], indexTip[1]) < 50 &&
      dist(ringTip[0], ringTip[1], pinkyTip[0], pinkyTip[1]) < 50
    ) {
      currentGesture = "scissors";
    }
    // 判斷石頭（所有手指閉合）
    else if (
      dist(thumbTip[0], thumbTip[1], indexTip[0], indexTip[1]) < 50 &&
      dist(indexTip[0], indexTip[1], middleTip[0], middleTip[1]) < 50 &&
      dist(middleTip[0], middleTip[1], ringTip[0], ringTip[1]) < 50 &&
      dist(ringTip[0], ringTip[1], pinkyTip[0], pinkyTip[1]) < 50
    ) {
      currentGesture = "rock";
    }
    // 判斷布（所有手指張開）
    else if (
      dist(thumbTip[0], thumbTip[1], indexTip[0], indexTip[1]) > 50 &&
      dist(indexTip[0], indexTip[1], middleTip[0], middleTip[1]) > 50 &&
      dist(middleTip[0], middleTip[1], ringTip[0], ringTip[1]) > 50 &&
      dist(ringTip[0], ringTip[1], pinkyTip[0], pinkyTip[1]) > 50
    ) {
      currentGesture = "paper";
    } else {
      currentGesture = ""; // 未識別手勢
    }
  }
}
