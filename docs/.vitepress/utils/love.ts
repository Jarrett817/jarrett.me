import { sleep } from './sleep';

function random(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
function randomColor(): string {
  const minLightness = 80; // 最小亮度值
  const maxLightness = 95; // 最大亮度值
  const hueRange = 60; // 色调范围

  const randomHue = Math.floor(Math.random() * hueRange); // 随机色调
  const randomLightness = Math.floor(Math.random() * (maxLightness - minLightness) + minLightness); // 随机亮度

  return `hsl(${randomHue}, 100%, ${randomLightness}%)`;
}

function bezier(cp: Point[], t: number) {
  const p1 = cp[0].mul((1 - t) * (1 - t));
  const p2 = cp[1].mul(2 * t * (1 - t));
  const p3 = cp[2].mul(t * t);
  return p1.add(p2).add(p3);
}

function inHeart(x: number, y: number, r: number) {
  // x^2+(y-(x^2)^(1/3))^2 = 1
  // http://www.wolframalpha.com/input/?i=x%5E2%2B%28y-%28x%5E2%29%5E%281%2F3%29%29%5E2+%3D+1
  const z =
    ((x / r) * (x / r) + (y / r) * (y / r) - 1) *
      ((x / r) * (x / r) + (y / r) * (y / r) - 1) *
      ((x / r) * (x / r) + (y / r) * (y / r) - 1) -
    (x / r) * (x / r) * (y / r) * (y / r) * (y / r);
  return z < 0;
}

class Point {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone(): Point {
    return new Point(this.x, this.y);
  }

  add(o: Point): Point {
    const p = this.clone();
    p.x += o.x;
    p.y += o.y;
    return p;
  }

  sub(o: Point): Point {
    const p = this.clone();
    p.x -= o.x;
    p.y -= o.y;
    return p;
  }

  div(n: number): Point {
    const p = this.clone();
    p.x /= n;
    p.y /= n;
    return p;
  }

  mul(n: number): Point {
    const p = this.clone();
    p.x *= n;
    p.y *= n;
    return p;
  }
}

class Heart {
  points: Point[];
  length: number;

  constructor() {
    const points: Point[] = [];
    let x: number, y: number, t: number;
    for (let i = 10; i < 30; i += 0.2) {
      t = i / Math.PI;
      x = 16 * Math.sin(t) ** 3;
      y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      points.push(new Point(x, y));
    }
    this.points = points;
    this.length = points.length;
  }

  get(i: number, scale?: number): Point {
    return this.points[i].mul(scale || 1);
  }
}

type Branches = [number, number, number, number, number, number, number, number, Branches[]];

class Tree {
  ctx: CanvasRenderingContext2D;
  record: {
    [key: string]: {
      image: ImageData;
      point: Point;
      width: number;
      height: number;
      speed?: number;
    };
  } = {};

  branches: Branch[] = [];
  blooms: Bloom[] = [];
  bloomsCache: Bloom[] = [];

  constructor(
    public canvas: HTMLCanvasElement,
    public width: number,
    public height: number,
    public opt: {
      bloom: {
        num: number;
        width: number;
        height: number;
      };
      branch: Branches[];
    }
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.width = canvas.width = width;
    this.height = canvas.height = height;
    this.ctx.translate(width / 2, height);
    this.ctx.scale(1, -1); // 原点居中，x轴贴底
    this.opt = opt || {};

    this.initBranch();
    this.initBloom();
  }

  initBranch() {
    const branches = this.opt.branch || [];
    this.addBranches(branches);
  }

  initBloom() {
    const bloom = this.opt.bloom || {};
    const cache: Bloom[] = [];
    const num = bloom.num || 500;
    const width = bloom.width || this.width;
    const height = bloom.height || this.height;
    const r = 200;
    for (let i = 0; i < num; i++) cache.push(this.createBloom(width, height, r));

    this.bloomsCache = cache;
  }

  toDataURL(type: string) {
    return this.canvas.toDataURL(type);
  }

  draw(k: string) {
    const ctx = this.ctx;
    const rec = this.record[k];
    if (!rec) return;

    const point = rec.point;
    const image = rec.image;

    ctx.save();
    ctx.putImageData(image, point.x, point.y);
    ctx.restore();
  }

  addBranch(branch: Branch) {
    this.branches.push(branch);
  }

  addBranches(branches: Branches[]) {
    let b: Branches, p1: Point, p2: Point, p3: Point, r: number, l: number, c: Branches[];
    for (let i = 0; i < branches.length; i++) {
      b = branches[i];
      p1 = new Point(b[0], b[1]);
      p2 = new Point(b[2], b[3]);
      p3 = new Point(b[4], b[5]);
      r = b[6];
      l = b[7];
      c = b[8];
      this.addBranch(new Branch(this, p1, p2, p3, r, l, c));
    }
  }

  removeBranch(branch: Branch) {
    const branches = this.branches;
    for (let i = 0; i < branches.length; i++) {
      if (branches[i] === branch) branches.splice(i, 1);
    }
  }

  canGrow() {
    return !!this.branches.length;
  }

  grow() {
    const branches = this.branches;
    for (let i = 0; i < branches.length; i++) {
      const branch: Branch = branches[i];
      if (branch) branch.grow();
    }
  }

  addBloom(bloom: Bloom) {
    this.blooms.push(bloom);
  }

  removeBloom(bloom: Bloom) {
    const blooms = this.blooms;
    for (let i = 0; i < blooms.length; i++) {
      if (blooms[i] === bloom) blooms.splice(i, 1);
    }
  }

  createBloom(
    width: number,
    height: number,
    radius: number,
    color?: string,
    alpha?: number,
    angle?: number,
    scale?: number,
    place?: Point,
    speed?: number
  ) {
    let x, y;
    while (true) {
      x = random(-width / 2 + 5, width / 2 - 5);
      y = random(20, height - 50);
      if (inHeart(x, y - (height - 50) / 2, radius))
        return new Bloom(this, new Point(x, y), color, alpha, angle, scale, place, speed);
    }
  }

  canFlower() {
    return !!this.blooms.length;
  }

  flower(num: number) {
    let blooms = this.bloomsCache.splice(0, num);
    for (let i = 0; i < blooms.length; i++) this.addBloom(blooms[i]);
    blooms = this.blooms;
    for (let j = 0; j < blooms.length; j++) blooms[j].flower();
  }

  snapshot(k: string, x: number, y: number, width: number, height: number) {
    const ctx = this.ctx;
    const image = ctx.getImageData(x, y, width, height);
    this.record[k] = {
      image,
      point: new Point(x, y),
      width,
      height
    };
  }

  setSpeed(k: string, speed: number) {
    this.record[k || 'move'].speed = speed;
  }

  move(k: string, x: number, y: number) {
    const ctx = this.ctx;
    const rec = this.record[k || 'move'];
    const point = rec.point;
    const image = rec.image;
    const speed = rec.speed || 10;
    const width = rec.width;
    const height = rec.height;

    const i = point.x + speed < x ? point.x + speed : x;
    const j = point.y + speed < y ? point.y + speed : y;

    ctx.save();
    ctx.clearRect(point.x, point.y, width, height);
    ctx.putImageData(image, i, j);
    ctx.restore();

    rec.point = new Point(i, j);
    rec.speed = speed * 0.95;

    if (rec.speed < 2) rec.speed = 2;

    return i < x || j < y;
  }

  jump() {
    const blooms = this.blooms;
    if (blooms.length) {
      for (let i = 0; i < blooms.length; i++) blooms[i].jump();
    }
    if ((blooms.length && blooms.length < 3) || !blooms.length) {
      const { width = this.width, height = this.height } = this.opt.bloom || {};
      const r = 240;
      for (let i = 0; i < random(1, 2); i++)
        blooms.push(
          this.createBloom(
            width / 2 + width,
            height,
            r,
            '',
            1,
            0,
            1,
            new Point(random(-this.width / 2, this.width / 2), -30),
            random(200, 300)
          )
        );
    }
  }

  async start() {
    const growAnimate = async () => {
      do {
        this.grow();
        await sleep(10);
      } while (this.canGrow());
    };

    const flowAnimate = async () => {
      do {
        this.flower(2);
        await sleep(10);
      } while (this.canFlower());
    };

    const keepAlive = async () => {
      if (this.canvas.parentElement)
        this.canvas.parentElement.style.backgroundImage = `url(${this.toDataURL('image/png')})`;
    };

    const jumpAnimate = async () => {
      setInterval(() => {
        this.ctx.clearRect(-this.width / 2, 0, this.width, this.height);
        this.jump();
      }, 35);
    };

    await growAnimate();
    await flowAnimate();
    keepAlive();

    await jumpAnimate();
  }
}

class Branch {
  len = 0;
  t: number;

  constructor(
    public tree: Tree,
    public point1: Point,
    public point2: Point,
    public point3: Point,
    public radius: number,
    public length: number,
    public branches: Branches[]
  ) {
    this.tree = tree;
    this.point1 = point1;
    this.point2 = point2;
    this.point3 = point3;
    this.radius = radius;
    this.length = length || 100;
    this.t = 1 / (this.length - 1);
    this.branches = branches || [];
  }

  grow() {
    let p;
    if (this.len <= this.length) {
      p = bezier([this.point1, this.point2, this.point3], this.len * this.t);
      this.draw(p);
      this.len += 1;
      this.radius *= 0.97;
    } else {
      this.tree.removeBranch(this);
      this.tree.addBranches(this.branches);
    }
  }

  draw(p: Point) {
    const ctx = this.tree.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'rgb(35, 31, 32)';
    ctx.shadowColor = 'rgb(35, 31, 32)';
    ctx.shadowBlur = 2;
    ctx.moveTo(p.x, p.y);
    ctx.arc(p.x, p.y, this.radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

class Bloom {
  color: string;
  alpha: number;
  scale: number;
  angle: number;

  constructor(
    public tree: Tree,
    public point: Point,
    color?: string,
    alpha?: number,
    angle?: number,
    scale?: number,
    public place?: Point,
    public speed?: number
  ) {
    this.tree = tree;
    this.point = point;
    this.color = color || randomColor();
    this.alpha = alpha || random(0.3, 1);
    this.angle = angle || random(0, 360);
    this.scale = scale || 0.1;
    this.place = place;
    this.speed = speed;
  }

  flower() {
    this.draw();
    this.scale += 0.1;
    if (this.scale > 1) this.tree.removeBloom(this);
  }

  draw() {
    const ctx = this.tree.ctx;

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.point.x, this.point.y);
    ctx.scale(this.scale, this.scale);
    ctx.rotate(this.angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const figure = new Heart();
    for (let i = 0; i < figure.length; i++) {
      const p = figure.get(i);
      ctx.lineTo(p.x, -p.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  jump() {
    if (this.point.x < -20 || this.point.y < -20) {
      this.tree.removeBloom(this);
    } else {
      this.draw();
      if (this.place) {
        this.point = this.place.sub(this.point).div(this.speed!).add(this.point);
        this.angle! += 0.05;
        this.speed! -= 1;
      }
    }
  }
}

export { Tree, Point, Bloom };
