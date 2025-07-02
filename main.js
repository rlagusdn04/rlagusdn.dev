
const canvas = document.getElementById('mouseCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

const image = new Image();
// 중요: ditto.png 파일이 mydev/assets 폴더 안에 있어야 합니다.
image.src = "assets/ditto.png"; 

let isMouseDown = false;
class Animation {
  constructor(frames, speed) {
    this.frames = frames;
    this.speed = speed;
    this.current = 0;
    this.timer = 0;
  }

  update(dt) {
    this.timer += dt;
    if (this.timer > this.speed) {
      this.timer = 0;
      this.current = (this.current + 1) % this.frames.length;
    }
  }

  getFrame() {
    return this.frames[this.current];
  }

  reset() {
    this.current = 0;
    this.timer = 0;
  }
}

let idleAnim, levelUpAnim, currentAnim;
let lastTime = 0;
const SCALE = 0.25; 
let isFlipped = false;

image.onload = () => {
  const idleFrames = [
    { sx: 0, sy: 0, sw: 128, sh: 128 },
    { sx: 128, sy: 0, sw: 128, sh: 128 },
    { sx: 256, sy: 0, sw: 128, sh: 128 }
  ];

  const levelUpFrames = [
    { sx: 0, sy: 128*8, sw: 128, sh: 128 },
    { sx: 128, sy: 128*8, sw: 128, sh: 128 },
    { sx: 256, sy: 128*8, sw: 128, sh: 128 },
    { sx: 128*3, sy: 128*8, sw: 128, sh: 128 },
    { sx: 128*4, sy: 128*8, sw: 128, sh: 128 },
    { sx: 128*5, sy: 128*8, sw: 128, sh: 128 },
    { sx: 128*6, sy: 128*8, sw: 128, sh: 128 }
  ];

  idleAnim = new Animation(idleFrames, 200);
  levelUpAnim = new Animation(levelUpFrames, 100);
  currentAnim = idleAnim;

  requestAnimationFrame(loop);
};

document.addEventListener('mousedown', () => {
  levelUpAnim.reset();
  currentAnim = levelUpAnim;
  isMouseDown = true;
  isFlipped = !isFlipped;
});

document.addEventListener('mouseup', () => {
  idleAnim.reset();
  currentAnim = idleAnim;
  isMouseDown = false;
});

function loop(timestamp) {
  const dt = timestamp - lastTime;
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  currentAnim.update(dt);
  const frame = currentAnim.getFrame();

  const w = frame.sw * SCALE;
  const h = frame.sh * SCALE;
  let x = mouseX - w / 2;
  let y = mouseY - h / 2;

  ctx.save();
  if (isFlipped) {
    ctx.translate(mouseX, mouseY);
    ctx.scale(-1, 1);
    ctx.drawImage(
      image,
      frame.sx, frame.sy, frame.sw, frame.sh,
      -w / 2, -h / 2, w, h
    );
  } else {
    ctx.drawImage(
      image,
      frame.sx, frame.sy, frame.sw, frame.sh,
      x, y, w, h
    );
  }
  ctx.restore();

  requestAnimationFrame(loop);
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    currentAnim.reset();
  } else {
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }
});
