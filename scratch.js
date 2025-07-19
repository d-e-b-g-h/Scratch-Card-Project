// Prize selection (50%:1200, 30%:1400, 20%:1600)
const prizes = [
  { amount: 1200, probability: 0.5 },
  { amount: 1400, probability: 0.3 },
  { amount: 1600, probability: 0.2 }
];
function selectPrize() {
  let r = Math.random(), acc = 0;
  for (const p of prizes) {
    acc += p.probability;
    if (r <= acc) return p.amount;
  }
  return prizes[0].amount;
}
const amount = selectPrize();
const prizeMessage = document.getElementById('prizeMessage');
prizeMessage.textContent = `You won \u20B9${amount}! 🎉`;

// Canvas setup
const canvas = document.getElementById('scratchCanvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  drawCover();
}
function drawCover() {
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0,0,canvas.width,canvas.height);
  let grad = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  grad.addColorStop(0, "#ffe148");
  grad.addColorStop(1, "#ff2d2d");
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  // GPay-style shine
  let rad = Math.min(canvas.width,canvas.height)/1.2;
  let shine = ctx.createRadialGradient(
    canvas.width*0.7, canvas.height*0.23,0,
    canvas.width*0.7, canvas.height*0.23,rad
  );
  shine.addColorStop(0, "#FFFCEEB0");
  shine.addColorStop(1, "#ffe14800");
  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.arc(canvas.width*.7,canvas.height*.23,rad,0,2*Math.PI);
  ctx.fill();
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Interactive scratch logic (covers 100% of visible overlay)
let isDrawing = false, revealed = false;
function pointer(e) {
  const rect = canvas.getBoundingClientRect();
  if (e.touches) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  }
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}
function scratch(e) {
  if (!isDrawing || revealed) return;
  e.preventDefault();
  const {x, y} = pointer(e);
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x, y, canvas.width*.12, 0, 2*Math.PI);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  if (getRevealRatio() > .47) showPrize();
}
canvas.addEventListener('mousedown', e=>{ isDrawing=true; scratch(e);});
canvas.addEventListener('mousemove', scratch);
canvas.addEventListener('mouseup', ()=>isDrawing=false);
canvas.addEventListener('mouseleave', ()=>isDrawing=false);
canvas.addEventListener('touchstart', e=>{ isDrawing=true; scratch(e);});
canvas.addEventListener('touchmove', scratch);
canvas.addEventListener('touchend', ()=>isDrawing=false);
canvas.addEventListener('touchcancel', ()=>isDrawing=false);

function getRevealRatio() {
  const data = ctx.getImageData(0,0,canvas.width,canvas.height).data;
  let cleared = 0, total = data.length/4;
  for (let i=3; i<data.length; i+=4) if (data[i]===0) cleared++;
  return cleared/total;
}

function showPrize() {
  if (revealed) return;
  revealed = true;
  canvas.style.pointerEvents = 'none';
  prizeMessage.classList.add('visible');
}

