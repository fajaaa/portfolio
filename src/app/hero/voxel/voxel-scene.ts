import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  NearestFilter,
  OrthographicCamera,
  PlaneGeometry,
  Raycaster,
  SRGBColorSpace,
  Scene,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

import { CodeScreen } from './code-screen';
import {
  BIRDS,
  BIRD_FRAMES,
  CHARACTER,
  CLOUDS,
  ISLAND_CENTER,
  PALETTE,
  SCENERY,
  STEAM_ORIGIN,
  Vec3,
  VoxelPart,
  WATERFALL,
} from './island-model';
import { LIGHT, VIEW, Voxel, exposedVoxels, layerVoxels, partVoxels } from './voxels';

export interface VoxelSceneOptions {
  /** CSS pixels per rendered pixel (default 3); the low-res frame is upscaled with pixelated CSS. */
  readonly pixelScale?: number;
  /** Render single still frames only: no loop, no pointer rotation. */
  readonly reducedMotion?: boolean;
  readonly onFirstFrame?: () => void;
  /** After every rendered frame, e.g. to move an overlay along with `headPosition()`. */
  readonly onFrame?: () => void;
  readonly onCharacterClick?: () => void;
  /** The WebGL context is gone (GPU reset, too many contexts); nothing renders after this. */
  readonly onContextLost?: () => void;
}

const DEG = Math.PI / 180;
const MAX_SPIN = 20 * DEG;
const MAX_TILT = 8 * DEG;
const HOP_SECONDS = 0.45;
const CELEBRATE_SECONDS = 8;
const WATERFALL_SPEED = 5;
const STEAM_PUFFS = 3;
/** Clouds wrap once they are this far (grid units) left or right of the view centre. */
const CLOUD_RANGE = 28;

interface Bird {
  readonly group: Group;
  readonly frames: readonly InstancedMesh[];
  readonly radius: number;
  readonly speed: number;
  readonly phase: number;
}

interface HueMesh {
  readonly mesh: InstancedMesh;
  readonly base: readonly { h: number; s: number; l: number }[];
}

/**
 * The hero's voxel island (see island-model.ts), rendered small with three.js and upscaled
 * pixelated by CSS. The canvas must fill its parent element; `resize()` sizes it from there.
 * Framework-free: the owner calls start()/stop() (e.g. when off-screen) and dispose().
 */
export class VoxelScene {
  private canvas!: HTMLCanvasElement;
  private options: VoxelSceneOptions = {};
  private renderer: WebGLRenderer | undefined;
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera();
  private readonly cameraRight = new Vector3();
  /** Pointer tilt (around the camera's horizontal axis) → spin (around y) → bob (float). */
  private readonly tilt = new Group();
  private readonly spin = new Group();
  private readonly bob = new Group();
  private readonly character = new Group();
  private readonly characterMeshes: InstancedMesh[] = [];
  private readonly clouds: { group: Group; speed: number }[] = [];
  private readonly birds: Bird[] = [];
  private readonly steam: Mesh<BoxGeometry, MeshBasicMaterial>[] = [];
  private readonly hueMeshes: HueMesh[] = [];
  private readonly disposables: { dispose(): void }[] = [];
  private head!: Group;
  private headTop = new Vector3();
  private leftArm!: Group;
  private rightArm!: Group;
  private waterfall!: InstancedMesh;
  private shadow!: Mesh;
  private code!: CodeScreen;
  private codeTexture!: CanvasTexture;

  private reducedMotion = false;
  private pixelScale = 3;
  private running = false;
  private frame = 0;
  private lastTick = 0;
  /** Scene clock in seconds; only advances while the loop runs. */
  private time = 0;
  private codeTimer = 0;
  private hopStart = -Infinity;
  private hopHeight = 1.5;
  private celebrateStart = -Infinity;
  private hueStep = -1;
  private renderedOnce = false;
  private lastHoverCheck = 0;
  private readonly pointer = new Vector2();
  private readonly pointerTarget = new Vector2();
  private readonly raycaster = new Raycaster();
  private readonly ndc = new Vector2();
  private readonly projected = new Vector3();
  private readonly matrix = new Matrix4();

  private readonly onClick = (event: MouseEvent) => {
    if (this.hitsCharacter(event.clientX, event.clientY)) {
      this.hop(1.6);
      this.options.onCharacterClick?.();
    }
  };

  private readonly onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || event.timeStamp - this.lastHoverCheck < 60) {
      return;
    }

    this.lastHoverCheck = event.timeStamp;
    this.canvas.classList.toggle('is-over-character', this.hitsCharacter(event.clientX, event.clientY));
  };

  private readonly onContextLost = () => {
    this.stop();
    this.options.onContextLost?.();
  };

  private readonly tick = (now: number) => {
    const delta = Math.min((now - this.lastTick) / 1000, 0.1);
    this.lastTick = now;
    this.time += delta;
    this.update(delta);
    this.render();
    this.frame = requestAnimationFrame(this.tick);
  };

  /** Builds the scene. Throws when WebGL isn't available; show a fallback then. */
  init(canvas: HTMLCanvasElement, options: VoxelSceneOptions = {}): void {
    this.canvas = canvas;
    this.options = options;
    this.reducedMotion = options.reducedMotion ?? false;
    this.pixelScale = options.pixelScale ?? 3;

    this.renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'low-power',
    });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);

    this.buildScene();
    this.resize();

    canvas.addEventListener('click', this.onClick);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('webglcontextlost', this.onContextLost);
  }

  /** Runs the render loop (under reduced motion: renders one still frame). */
  start(): void {
    if (!this.renderer || this.running) {
      return;
    }

    if (this.reducedMotion) {
      this.render();
      return;
    }

    this.running = true;
    this.lastTick = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  get isRunning(): boolean {
    return this.running;
  }

  /** Pointer position, normalised to −1..1 (x: left → right, y: top → bottom). */
  setPointer(x: number, y: number): void {
    this.pointerTarget.set(clamp(x), clamp(y));
  }

  setReducedMotion(reduced: boolean): void {
    if (reduced === this.reducedMotion) {
      return;
    }

    this.reducedMotion = reduced;

    if (reduced) {
      this.stop();
      this.pointer.set(0, 0);
      this.pointerTarget.set(0, 0);
      this.hopStart = this.celebrateStart = -Infinity;
      this.update(0);
      this.render();
    }
  }

  /** Easter egg: Kenan jumps, then the island cycles through colours for a few seconds. */
  celebrate(): void {
    if (this.reducedMotion) {
      return;
    }

    this.hop(3.2);
    this.celebrateStart = this.time;
  }

  /** Matches the render size to the canvas parent (one rendered pixel ≈ `pixelScale` CSS px). */
  resize(): void {
    const parent = this.canvas.parentElement;

    if (!this.renderer || !parent) {
      return;
    }

    // Whole device pixels per rendered pixel, so the upscale stays even on fractional DPRs.
    const dpr = window.devicePixelRatio || 1;
    const scale = Math.max(Math.round(this.pixelScale * dpr), 1) / dpr;
    const width = Math.max(Math.floor(parent.clientWidth / scale), 1);
    const height = Math.max(Math.floor(parent.clientHeight / scale), 1);

    this.renderer.setSize(width, height, false);
    this.canvas.style.width = `${width * scale}px`;
    this.canvas.style.height = `${height * scale}px`;

    const aspect = width / height;
    const half = VIEW.size / 2;
    const halfWidth = aspect >= 1 ? half * aspect : half;
    const halfHeight = aspect >= 1 ? half : half / aspect;

    Object.assign(this.camera, {
      left: -halfWidth,
      right: halfWidth,
      top: halfHeight,
      bottom: -halfHeight,
    });
    this.camera.updateProjectionMatrix();

    if (!this.running) {
      this.render();
    }
  }

  /** Top of Kenan's head as fractions (0–1) of the canvas size, for the speech bubble. */
  headPosition(): { x: number; y: number } {
    this.projected.copy(this.headTop).applyMatrix4(this.head.matrixWorld).project(this.camera);

    return { x: (this.projected.x + 1) / 2, y: (1 - this.projected.y) / 2 };
  }

  dispose(): void {
    this.stop();
    this.canvas?.removeEventListener('click', this.onClick);
    this.canvas?.removeEventListener('pointermove', this.onPointerMove);
    this.canvas?.removeEventListener('webglcontextlost', this.onContextLost);

    this.disposables.forEach((item) => item.dispose());
    this.disposables.length = 0;
    this.scene.clear();

    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
    this.renderer = undefined;
  }

  private render(): void {
    if (!this.renderer) {
      return;
    }

    this.renderer.render(this.scene, this.camera);

    if (!this.renderedOnce) {
      this.renderedOnce = true;
      this.options.onFirstFrame?.();
    }

    this.options.onFrame?.();
  }

  private update(delta: number): void {
    const t = this.time;

    if (!this.reducedMotion) {
      const ease = 1 - Math.exp(-delta * 5);
      this.pointer.lerp(this.pointerTarget, ease);
    }

    this.spin.rotation.y = this.pointer.x * MAX_SPIN;
    this.tilt.quaternion.setFromAxisAngle(this.cameraRight, this.pointer.y * MAX_TILT);

    const float = Math.sin(t * 0.9) * 0.35;
    this.bob.position.y = float;
    this.shadow.scale.setScalar(1 - float * 0.08);

    // Two-frame typing: the hands take turns.
    const typing = Math.floor(t * 9) % 2 === 0;
    this.leftArm.rotation.x = typing ? 0.14 : 0;
    this.rightArm.rotation.x = typing ? 0 : 0.14;

    const hop = (t - this.hopStart) / HOP_SECONDS;
    this.character.position.y = hop >= 0 && hop < 1 ? this.hopHeight * 4 * hop * (1 - hop) : 0;

    this.codeTimer += delta;
    if (this.codeTimer > 0.14) {
      this.codeTimer = 0;
      this.code.step();
      this.codeTexture.needsUpdate = true;
    }

    // Along the camera's right axis, so clouds glide straight across the screen.
    const [tx, , tz] = VIEW.target;
    for (const { group, speed } of this.clouds) {
      group.position.addScaledVector(this.cameraRight, speed * delta);
      const across = (group.position.x - tx) * this.cameraRight.x + (group.position.z - tz) * this.cameraRight.z;

      if (across > CLOUD_RANGE) {
        group.position.addScaledVector(this.cameraRight, -CLOUD_RANGE * 2);
      }
    }

    for (const bird of this.birds) {
      const angle = bird.phase + t * bird.speed;
      const direction = Math.sign(bird.speed) || 1;

      bird.group.position.x = ISLAND_CENTER[0] + Math.cos(angle) * bird.radius;
      bird.group.position.z = ISLAND_CENTER[2] + Math.sin(angle) * bird.radius;
      // Local +x (the beak) points along the circle.
      bird.group.rotation.y = Math.atan2(-Math.cos(angle) * direction, -Math.sin(angle) * direction);

      const flap = Math.floor(t * 5 + bird.phase) % 2;
      bird.frames[0].visible = flap === 0;
      bird.frames[1].visible = flap === 1;
    }

    this.updateSteam(t);
    this.updateWaterfall(t);
    this.updateHue(t);
  }

  private updateSteam(t: number): void {
    const [x, y, z] = STEAM_ORIGIN;

    this.steam.forEach((puff, i) => {
      const progress = (t * 0.45 + i / STEAM_PUFFS) % 1;

      puff.position.set(x + Math.sin(progress * 7 + i) * 0.35, y + progress * 3.2, z);
      puff.scale.setScalar(0.3 + progress * 0.25);
      puff.material.opacity = 0.85 * (1 - progress);
    });
  }

  private updateWaterfall(t: number): void {
    const { at, width, depth, length } = WATERFALL;
    const span = length + 1;
    let index = 0;

    for (let slot = 0; slot < span; slot++) {
      const travel = (slot + t * WATERFALL_SPEED) % span;
      // The last voxel shrinks away as it falls out of the column.
      const size = Math.min(span - travel, 1);

      for (let x = 0; x < width; x++) {
        for (let z = 0; z < depth; z++) {
          this.matrix.makeScale(size, size, size);
          this.matrix.setPosition(at[0] + x + 0.5, at[1] - travel + 0.5, at[2] + z + 0.5);
          this.waterfall.setMatrixAt(index++, this.matrix);
        }
      }
    }

    this.waterfall.instanceMatrix.needsUpdate = true;
  }

  /** During a celebration, shifts every scenery colour round the hue wheel in pixel-ish steps. */
  private updateHue(t: number): void {
    const elapsed = t - this.celebrateStart;
    const active = elapsed >= 0 && elapsed < CELEBRATE_SECONDS;
    const step = active ? Math.floor(elapsed * 6) : -1;

    if (step === this.hueStep) {
      return;
    }

    this.hueStep = step;
    const shift = active ? (step / 24) % 1 : 0;
    const color = new Color();

    for (const { mesh, base } of this.hueMeshes) {
      base.forEach(({ h, s, l }, i) => mesh.setColorAt(i, color.setHSL((h + shift) % 1, s, l)));
      mesh.instanceColor!.needsUpdate = true;
    }
  }

  private hop(height: number): void {
    if (this.reducedMotion) {
      return;
    }

    this.hopHeight = height;
    this.hopStart = this.time;
  }

  private hitsCharacter(clientX: number, clientY: number): boolean {
    const rect = this.canvas.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return false;
    }

    this.ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.camera);

    return this.raycaster.intersectObjects(this.characterMeshes, false).length > 0;
  }

  // ---------------------------------------------------------------------------------------------
  // Building
  // ---------------------------------------------------------------------------------------------

  private buildScene(): void {
    const [cx, , cz] = ISLAND_CENTER;
    const [tx, ty, tz] = VIEW.target;
    const box = this.track(new BoxGeometry(1, 1, 1));
    const material = this.track(new MeshLambertMaterial({ flatShading: true }));

    // Camera on the VIEW angles around the target; everything below is in island grid units,
    // shifted so the target sits at the pivot of the tilt and spin groups.
    const back = new Vector3(
      Math.cos(VIEW.pitch) * Math.sin(VIEW.yaw),
      Math.sin(VIEW.pitch),
      Math.cos(VIEW.pitch) * Math.cos(VIEW.yaw),
    );
    this.tilt.position.set(tx - cx, ty, tz - cz);
    this.camera.position.copy(this.tilt.position).addScaledVector(back, 100);
    this.camera.near = 1;
    this.camera.far = 220;
    this.camera.lookAt(this.tilt.position);
    this.cameraRight.set(Math.cos(VIEW.yaw), 0, -Math.sin(VIEW.yaw));

    const world = new Group();
    world.position.set(-tx, -ty, -tz);
    this.scene.add(this.tilt);
    this.tilt.add(this.spin);
    this.spin.add(world);
    world.add(this.bob);

    const [sx, sy, sz] = LIGHT.sunDirection;
    const sun = new DirectionalLight(0xffffff, LIGHT.sun);
    sun.position.set(sx * 50, sy * 50, sz * 50);
    this.scene.add(new HemisphereLight(LIGHT.sky, LIGHT.ground, LIGHT.hemisphere), sun);

    for (const part of Object.values(SCENERY)) {
      const { group, mesh } = this.voxelMesh(exposedVoxels(partVoxels(part)), box, material);
      this.bob.add(group);
      this.hueMeshes.push({ mesh, base: baseHsl(mesh) });
    }

    this.buildCharacter(box, material);
    this.buildScreen();
    this.buildSteam(box);
    this.buildWaterfall(box, material);

    for (const cloud of CLOUDS) {
      const { group } = this.voxelMesh(layerVoxels(cloud.layers), box, material);
      group.position.set(...cloud.at);
      world.add(group);
      this.clouds.push({ group, speed: cloud.speed });
    }

    for (const bird of BIRDS) {
      const group = new Group();
      const frames = BIRD_FRAMES.map((frame) => {
        // Centred on the body so the bird turns around itself.
        const { group: frameGroup, mesh } = this.voxelMesh(layerVoxels(frame, [-2, 0, -2.5]), box, material);
        group.add(frameGroup);
        return mesh;
      });

      group.position.y = bird.y;
      group.scale.setScalar(0.6);
      world.add(group);
      this.birds.push({ group, frames, ...bird });
    }

    // Fake blob shadow under the island; a few segments keep it blocky once pixelated.
    const shadowGeometry = this.track(new CircleGeometry(1, 12));
    const shadowMaterial = this.track(
      new MeshBasicMaterial({ color: 0x0b0b14, transparent: true, opacity: 0.13, depthWrite: false }),
    );
    this.shadow = new Mesh(shadowGeometry, shadowMaterial);
    this.shadow.rotation.x = -Math.PI / 2;
    const shadowHolder = new Group();
    shadowHolder.position.set(cx, -7, cz);
    shadowHolder.scale.set(6, 1, 5);
    shadowHolder.add(this.shadow);
    world.add(shadowHolder);

    this.update(0);
  }

  private buildCharacter(box: BoxGeometry, material: Material): void {
    const add = (part: VoxelPart) => {
      const { group, mesh } = this.voxelMesh(partVoxels(part), box, material, part.pivot);
      this.character.add(group);
      this.characterMeshes.push(mesh);
      return group;
    };

    add(CHARACTER.torso);
    this.head = add(CHARACTER.head);
    this.leftArm = add(CHARACTER.leftArm);
    this.rightArm = add(CHARACTER.rightArm);

    const [hx, hy, hz] = CHARACTER.head.at;
    const rows = CHARACTER.head.layers[0];
    this.headTop.set(hx + rows[0].length / 2, hy + CHARACTER.head.layers.length, hz + rows.length / 2);
    this.bob.add(this.character);
  }

  /** The scrolling code texture on the front of the monitor's 'X' voxels. */
  private buildScreen(): void {
    const screen = partVoxels(SCENERY.monitor).filter(({ char }) => char === 'X');

    if (!screen.length) {
      return;
    }

    const minX = Math.min(...screen.map(({ x }) => x));
    const maxX = Math.max(...screen.map(({ x }) => x)) + 1;
    const minY = Math.min(...screen.map(({ y }) => y));
    const maxY = Math.max(...screen.map(({ y }) => y)) + 1;
    const front = Math.max(...screen.map(({ z }) => z)) + 1;

    this.code = new CodeScreen(5 * (maxX - minX), 5 * (maxY - minY));
    this.codeTexture = this.track(new CanvasTexture(this.code.canvas));
    this.codeTexture.colorSpace = SRGBColorSpace;
    this.codeTexture.magFilter = NearestFilter;
    this.codeTexture.minFilter = NearestFilter;
    this.codeTexture.generateMipmaps = false;

    const plane = new Mesh(
      this.track(new PlaneGeometry(maxX - minX, maxY - minY)),
      this.track(new MeshBasicMaterial({ map: this.codeTexture })),
    );
    plane.position.set((minX + maxX) / 2, (minY + maxY) / 2, front + 0.01);
    this.bob.add(plane);
  }

  private buildSteam(box: BoxGeometry): void {
    for (let i = 0; i < STEAM_PUFFS; i++) {
      const puff = new Mesh(
        box,
        this.track(new MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false })),
      );
      this.steam.push(puff);
      this.bob.add(puff);
    }
  }

  private buildWaterfall(box: BoxGeometry, material: Material): void {
    const { width, depth, length, colors } = WATERFALL;
    const count = width * depth * (length + 1);
    const color = new Color();

    this.waterfall = this.track(new InstancedMesh(box, material, count));
    // Instances move every frame, so the precomputed bounds would be stale.
    this.waterfall.frustumCulled = false;

    for (let i = 0; i < count; i++) {
      const slot = Math.floor(i / (width * depth));
      this.waterfall.setColorAt(i, color.set(PALETTE[colors[slot % colors.length]]));
    }

    this.bob.add(this.waterfall);
  }

  /** One instanced mesh per part, inside a group placed on the part's pivot (if any). */
  private voxelMesh(voxels: readonly Voxel[], box: BufferGeometry, material: Material, pivot?: Vec3) {
    const [px, py, pz] = pivot ?? [0, 0, 0];
    const group = new Group();
    const mesh = this.track(new InstancedMesh(box, material, voxels.length));
    const color = new Color();

    group.position.set(px, py, pz);
    voxels.forEach(({ x, y, z, char }, i) => {
      this.matrix.makeTranslation(x + 0.5 - px, y + 0.5 - py, z + 0.5 - pz);
      mesh.setMatrixAt(i, this.matrix);
      mesh.setColorAt(i, color.set(PALETTE[char]));
    });
    mesh.computeBoundingSphere();
    group.add(mesh);

    return { group, mesh };
  }

  private track<T extends BufferGeometry | Material | Texture | InstancedMesh>(item: T): T {
    this.disposables.push(item);
    return item;
  }
}

function baseHsl(mesh: InstancedMesh): HueMesh['base'] {
  const color = new Color();

  return Array.from({ length: mesh.count }, (_, i) => {
    mesh.getColorAt(i, color);
    return color.getHSL({ h: 0, s: 0, l: 0 });
  });
}

function clamp(value: number): number {
  return Math.min(Math.max(value, -1), 1);
}
