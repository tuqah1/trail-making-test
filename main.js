const canvas = document.getElementById('drawArea');
const ctx = canvas.getContext('2d');
let drawing = false;
let dataPoints = [];
let startTime = null;
const img = new Image();
img.src = 'moca.png'; // background img

img.onload = function() {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
};

function getXY(e) {
  const rect = canvas.getBoundingClientRect();
  let clientX, clientY;
  if (e.touches) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function startDraw(e) {
  drawing = true;
  if (!startTime) startTime = Date.now();
  const {x, y} = getXY(e);
  ctx.beginPath();
  ctx.moveTo(x, y);
  dataPoints.push({x, y, t: Date.now() - startTime});
  e.preventDefault();
}

function draw(e) {
  if (!drawing) return;
  const {x, y} = getXY(e);
  ctx.lineTo(x, y);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.stroke();
  dataPoints.push({x, y, t: Date.now() - startTime});
  e.preventDefault();
}

function endDraw() {
  drawing = false;
}

document.getElementById('startBtn').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  dataPoints = [];
  startTime = null;
});

document.getElementById('saveBtn').addEventListener('click', () => {
  //Save coordinates 
  const blob = new Blob([JSON.stringify(dataPoints)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'trajectory.json';
  a.click();

  // save line insted of background
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.lineWidth = 2;
  tempCtx.strokeStyle = 'black';
  tempCtx.beginPath();
  for (let i = 0; i < dataPoints.length; i++) {
    const p = dataPoints[i];
    if (i === 0) {
      tempCtx.moveTo(p.x, p.y);
    } else {
      tempCtx.lineTo(p.x, p.y);
    }
  }
  tempCtx.stroke();

  const imgURL = tempCanvas.toDataURL('image/png');
  const a2 = document.createElement('a');
  a2.href = imgURL;
  a2.download = 'drawing_only.png';
  a2.click();
});

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchstart', startDraw);
canvas.addEventListener('touchend', endDraw);
canvas.addEventListener('touchmove', draw);