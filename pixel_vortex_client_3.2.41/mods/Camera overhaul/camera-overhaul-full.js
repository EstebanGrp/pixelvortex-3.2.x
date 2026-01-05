(function(global){
  if (typeof THREE === 'undefined') {
    console.warn('[CameraOverhaulFull] THREE no encontrado. Asegúrate de que three.js esté cargado antes.');
  }

  const MathUtils = {
    clamp(value, min, max) { return value < min ? min : (value > max ? max : value); },
    clamp01(value) { return value < 0 ? 0 : (value > 1 ? 1 : value); },
    lerp(a,b,t){ t = MathUtils.clamp01(t); return a + (b-a) * t; },
    damp(source, destination, smoothing, dt){
      const t = 1.0 - Math.pow(smoothing * smoothing, dt);
      return MathUtils.lerp(source, destination, t);
    },
    stepTowards(current, target, step){
      if (current < target) return Math.min(current + step, target);
      if (current > target) return Math.max(current - step, target);
      return current;
    }
  };

  const SimplexNoise = (function(){
    const grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
    const p = new Uint8Array(256);
    for (let i=0;i<256;i++) p[i]=i;
    for (let i=255;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=p[i]; p[i]=p[j]; p[j]=t; }
    const perm = new Uint8Array(512); for(let i=0;i<512;i++) perm[i]=p[i & 255];
    function dot(g,x,y){ return g[0]*x + g[1]*y; }
    function noise2(x,y){
      const F2 = 0.5*(Math.sqrt(3)-1);
      const s = (x+y)*F2;
      const i = Math.floor(x+s), j = Math.floor(y+s);
      const G2 = (3-Math.sqrt(3))/6;
      const t = (i + j) * G2;
      const X0 = i - t, Y0 = j - t;
      const x0 = x - X0, y0 = y - Y0;
      let i1=0,j1=0;
      if (x0 > y0) { i1=1; j1=0; } else { i1=0; j1=1; }
      const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
      const x2 = x0 - 1 + 2*G2, y2 = y0 - 1 + 2*G2;
      const ii = i & 255, jj = j & 255;
      const gi0 = perm[ii+perm[jj]] % 12;
      const gi1 = perm[ii+i1+perm[jj+j1]] % 12;
      const gi2 = perm[ii+1+perm[jj+1]] % 12;
      let n0=0,n1=0,n2=0;
      let t0 = 0.5 - x0*x0 - y0*y0; if (t0>=0) { t0*=t0; n0 = t0*t0 * dot(grad3[gi0], x0, y0); }
      let t1 = 0.5 - x1*x1 - y1*y1; if (t1>=0) { t1*=t1; n1 = t1*t1 * dot(grad3[gi1], x1, y1); }
      let t2 = 0.5 - x2*x2 - y2*y2; if (t2>=0) { t2*=t2; n2 = t2*t2 * dot(grad3[gi2], x2, y2); }
      return 70.0 * (n0 + n1 + n2);
    }
    return { noise: noise2 };
  })();

  function v3(x=0,y=0,z=0){ return new THREE.Vector3(x,y,z); }
  function degToRad(d){ return d * Math.PI / 180; }
  function radToDeg(r){ return r * 180 / Math.PI; }

  class Transform {
    constructor(position, eulerRot){
      this.position = position ? position.clone() : v3(0,0,0);
      this.eulerRot = eulerRot ? eulerRot.clone() : v3(0,0,0); // degrees
    }
  }

  const VectorUtils = {
    rotate(vec2, degrees){
      const rad = degrees * Math.PI / 180;
      const s = Math.sin(rad), c = Math.cos(rad);
      return { x: c * vec2.x - s * vec2.y, y: s * vec2.x + c * vec2.y };
    },
    length(x,y){ return Math.sqrt(x*x + y*y); },
    lerp(srcX,srcY,dstX,dstY,step){ return { x: srcX + (dstX-srcX)*step, y: srcY + (dstY-srcY)*step }; },
    multiply(vec, v) { return { x: vec.x * v, y: vec.y * v }; }
  };

  const TimeSystem = {
    previous: 0,
    current: 0,
    deltaTime: 0,
    accumulatedTime: 0,
    update(){
      const now = performance.now();
      if (this.previous === 0) this.previous = now;
      this.deltaTime = Math.min((now - this.previous) / 1000, 0.1); // Cap delta time to 100ms
      this.previous = now;
      this.accumulatedTime += this.deltaTime;
    },
    getTime(){ return this.accumulatedTime; },
    getDeltaTime(){ return this.deltaTime; }
  };

  function defaultConfig(){
    const cfg = {
      general: {
        enabled: true,
        enableInThirdPerson: true,
        turningRollAccumulation: 1.0,
        turningRollIntensity: 1.25,
        turningRollSmoothing: 1.0,
        cameraSwayIntensity: 0.6,
        cameraSwayFrequency: 0.16,
        cameraSwayFadeInDelay: 0.15,
        cameraSwayFadeInLength: 5.0,
        cameraSwayFadeOutLength: 0.75,
        screenShakesMaxIntensity: 2.5,
        screenShakesMaxFrequency: 6.0,
        explosionTrauma: 1.0,
        thunderTrauma: 0.05,
        handSwingTrauma: 0.03
      },
      walking: { strafingRollFactor: 10.0, forwardVelocityPitchFactor:7.0, verticalVelocityPitchFactor:2.5, horizontalVelocitySmoothingFactor:1, verticalVelocitySmoothingFactor:1 },
      swimming: { strafingRollFactor: 10.0 * -3.0, forwardVelocityPitchFactor: 7.0 * 3.0, verticalVelocityPitchFactor: 2.5 * 3.0, horizontalVelocitySmoothingFactor:1, verticalVelocitySmoothingFactor:1 },
      flying: { strafingRollFactor: 10.0 * -1.0, forwardVelocityPitchFactor:7.0, verticalVelocityPitchFactor:2.5, horizontalVelocitySmoothingFactor:1, verticalVelocitySmoothingFactor:1 },
      mounts: { strafingRollFactor: 10.0 * 2.0, forwardVelocityPitchFactor:7.0, verticalVelocityPitchFactor:2.5, horizontalVelocitySmoothingFactor:1, verticalVelocitySmoothingFactor:1 },
      vehicles: { strafingRollFactor: 10.0 * 0.5, forwardVelocityPitchFactor: 7.0 * 0.5 * 0.5, verticalVelocityPitchFactor: 2.5 * 2.0, horizontalVelocitySmoothingFactor:1, verticalVelocitySmoothingFactor:1 }
    };
    return cfg;
  }

  const ScreenShakes = (function(){
    const MAX = 64;
    const instances = new Array(MAX).fill(null);
    let instanceMask = 0n;
    const calculatedOffset = v3();
    const tempVec = v3();
    function createSlot(){
      return { version:1, trauma:0, startTime:0, lengthInSeconds:0, frequency:1, radius:1, position:v3(), hasPosition(){ return this.lengthInSeconds>0 && this.radius>0; }, setDefaults(){ this.trauma=0; this.startTime=TimeSystem.getTime(); this.lengthInSeconds=0; this.frequency=1; this.radius=1; this.position.set(0,0,0); } };
    }
    function create(){
      const idx = instances.findIndex((x,i)=> ((instanceMask >> BigInt(i)) & 1n) === 0n );
      if (idx < 0) return 0n;
      if (!instances[idx]) instances[idx] = createSlot();
      const ver = instances[idx].version;
      instances[idx].setDefaults();
      instanceMask |= (1n << BigInt(idx));
      return (BigInt(ver) << 32n) | BigInt(idx);
    }
    function getNoiseAtPosition(position, out){
      const cfg = defaultConfig();
      let mask = instanceMask;
      const time = TimeSystem.getTime();
      const sampleBase = time * cfg.general.screenShakesMaxFrequency;
      let total = 0;
      out.set(0,0,0);
      if (mask === 0n) return;
      for (let i=0;i<instances.length;i++){
        if (((instanceMask >> BigInt(i)) & 1n) === 0n) continue;
        const ss = instances[i];
        const progress = (ss.lengthInSeconds > 0) ? MathUtils.clamp((time - ss.startTime) / ss.lengthInSeconds, 0, 1) : 1.0;
        if (progress >= 1.0) {
          instanceMask &= ~(1n << BigInt(i));
          ss.version++;
          continue;
        }
        const decay = 1.0 - progress;
        let intensity = MathUtils.clamp(ss.trauma, 0, 1) * decay * decay;
        if (ss.hasPosition()){
          const distance = position.distanceTo(ss.position);
          const distanceFactor = 1.0 - Math.min(1.0, distance / ss.radius);
          intensity *= distanceFactor * distanceFactor;
        }
        if (!(intensity <= 0) && Number.isFinite(intensity)){
          const sampleStep = sampleBase * ss.frequency;
          const nx = SimplexNoise.noise(sampleStep, -69.0);
          const ny = SimplexNoise.noise(sampleStep, -420.0);
          const nz = SimplexNoise.noise(sampleStep, -1337.0);
          out.x += nx * intensity; out.y += ny * intensity; out.z += nz * intensity;
          total += intensity;
        }
      }
      if (total > 1.0) out.divideScalar(total);
    }
    function onCameraUpdate(context, dt){
      getNoiseAtPosition(context.transform.position, calculatedOffset);
      calculatedOffset.multiplyScalar(defaultConfig().general.screenShakesMaxIntensity || 1.0);
    }
    function modifyCameraTransform(transform){
      transform.eulerRot.x += calculatedOffset.x;
      transform.eulerRot.y += calculatedOffset.y;
      transform.eulerRot.z += calculatedOffset.z;
    }
    return { create, onCameraUpdate, modifyCameraTransform };
  })();

  class CameraSystem {
    constructor(cfg){
      this.cfg = cfg || defaultConfig();
      this.ctxCfg = this.cfg.walking;
      this.prevCameraEulerRot = v3();
      this.prevEntityVelocity = v3();
      this.lastActionTime = 0;
      this.prevCameraPerspective = null;
      this.offsetTransform = new Transform();
      this.prevVerticalVelocityPitchOffset = 0;
      this.prevForwardVelocityPitchOffset = 0;
      this.turningRollTargetOffset = 0;
      this.prevStrafingRollOffset = 0;
      this.cameraSwayFactor = 0;
      this.cameraSwayFactorTarget = 1;
      
      // Temporary vector for distance calculations
      this._tempDistVec = v3();
    }

    notifyOfPlayerAction(){ this.lastActionTime = TimeSystem.getTime(); }

    onCameraUpdate(context, deltaTime){
      const time = TimeSystem.getTime();
      this.cfg = this.cfg || defaultConfig();
      
      // Detect game mode / player state more reliably
      const player = window.player || window.localPlayer || window.__player || null;
      const isSpectator = player && (player.gamemode === 'SPECTATOR' || player.isSpectator);
      
      if (isSpectator) {
        this.offsetTransform.position.set(0,0,0);
        this.offsetTransform.eulerRot.set(0,0,0);
        return;
      }

      if (context.isRidingVehicle) this.ctxCfg = this.cfg.vehicles;
      else if (context.isRidingMount) this.ctxCfg = this.cfg.mounts;
      else if (context.isSwimming) this.ctxCfg = this.cfg.swimming;
      else if (context.isFlying) this.ctxCfg = this.cfg.flying;
      else this.ctxCfg = this.cfg.walking;

      this.offsetTransform.position.set(0,0,0);
      this.offsetTransform.eulerRot.set(0,0,0);

      if (this.cfg.general.enabled && (this.cfg.general.enableInThirdPerson || context.perspective === 'FIRST_PERSON')) {
        ScreenShakes.onCameraUpdate(context, deltaTime);
        
        // Use squared distance for faster comparison
        const velocityChanged = this._tempDistVec.copy(context.velocity).sub(this.prevEntityVelocity).lengthSq() > 0.0001;
        const rotationChanged = this._tempDistVec.copy(context.transform.eulerRot).sub(this.prevCameraEulerRot).lengthSq() > 0.0001;

        if (velocityChanged || rotationChanged) {
          this.notifyOfPlayerAction();
        }
        
        this.verticalVelocityPitchOffset(context, this.offsetTransform, deltaTime);
        this.forwardVelocityPitchOffset(context, this.offsetTransform, deltaTime);
        this.turningRollOffset(context, this.offsetTransform, deltaTime);
        this.strafingRollOffset(context, this.offsetTransform, deltaTime);
        this.noiseOffset(context, this.offsetTransform, deltaTime);
        
        this.prevEntityVelocity.copy(context.velocity);
        this.prevCameraEulerRot.copy(context.transform.eulerRot);
        this.prevCameraPerspective = context.perspective;
      }
    }

    modifyCameraTransform(transform){
      transform.position.add(this.offsetTransform.position);
      transform.eulerRot.add(this.offsetTransform.eulerRot);
      ScreenShakes.modifyCameraTransform(transform);
    }

    verticalVelocityPitchOffset(context, outputTransform, deltaTime){
      const multiplier = this.ctxCfg.verticalVelocityPitchFactor;
      const smoothing = 4e-5 * this.ctxCfg.verticalVelocitySmoothingFactor;
      const targetOffset = context.velocity.y * multiplier;
      const currentOffset = MathUtils.damp(this.prevVerticalVelocityPitchOffset, targetOffset, smoothing, deltaTime);
      outputTransform.eulerRot.x += currentOffset;
      this.prevVerticalVelocityPitchOffset = currentOffset;
    }

    forwardVelocityPitchOffset(context, outputTransform, deltaTime){
      const multiplier = this.ctxCfg.forwardVelocityPitchFactor;
      const smoothing = 0.008 * this.ctxCfg.horizontalVelocitySmoothingFactor;
      const fr = context.getForwardRelativeVelocity();
      const targetOffset = fr.z * multiplier;
      const currentOffset = MathUtils.damp(this.prevForwardVelocityPitchOffset, targetOffset, smoothing, deltaTime);
      outputTransform.eulerRot.x += currentOffset;
      this.prevForwardVelocityPitchOffset = currentOffset;
    }

    turningRollOffset(context, outputTransform, deltaTime){
      const decaySmoothing = 0.0825 * this.cfg.general.turningRollSmoothing;
      const intensity = 1.25 * this.cfg.general.turningRollIntensity;
      const accumulation = 0.0048 * this.cfg.general.turningRollAccumulation;
      let yawDelta = this.prevCameraEulerRot.y - context.transform.eulerRot.y;
      if (context.perspective !== this.prevCameraPerspective) yawDelta = 0;
      this.turningRollTargetOffset = MathUtils.damp(this.turningRollTargetOffset, 0.0, decaySmoothing, deltaTime);
      this.turningRollTargetOffset = MathUtils.clamp(this.turningRollTargetOffset + yawDelta * accumulation, -1.0, 1.0);
      const turningRollOffset = MathUtils.clamp01(turningEasing(Math.abs(this.turningRollTargetOffset))) * intensity * Math.sign(this.turningRollTargetOffset);
      outputTransform.eulerRot.z += turningRollOffset;
    }

    strafingRollOffset(context, outputTransform, deltaTime){
      const multiplier = this.ctxCfg.strafingRollFactor;
      const smoothing = 0.008 * this.ctxCfg.horizontalVelocitySmoothingFactor;
      const target = -context.getForwardRelativeVelocity().x * multiplier;
      const offset = MathUtils.damp(this.prevStrafingRollOffset, target, smoothing, deltaTime);
      outputTransform.eulerRot.z += offset;
      this.prevStrafingRollOffset = offset;
    }

    noiseOffset(context, outputTransform, deltaTime){
      const time = TimeSystem.getTime();
      const noiseX = time * this.cfg.general.cameraSwayFrequency;
      if (time - this.lastActionTime < this.cfg.general.cameraSwayFadeInDelay) {
        this.cameraSwayFactorTarget = 0.0;
      } else if (this.cameraSwayFactor === this.cameraSwayFactorTarget) {
        this.cameraSwayFactorTarget = 1.0;
      }
      const cameraSwayFactorFadeLength = this.cameraSwayFactorTarget > 0 ? this.cfg.general.cameraSwayFadeInLength : this.cfg.general.cameraSwayFadeOutLength;
      const cameraSwayFactorFadeStep = cameraSwayFactorFadeLength > 0 ? deltaTime / cameraSwayFactorFadeLength : 1.0;
      this.cameraSwayFactor = MathUtils.stepTowards(this.cameraSwayFactor, this.cameraSwayFactorTarget, cameraSwayFactorFadeStep);
      const scaledIntensity = this.cfg.general.cameraSwayIntensity * Math.pow(this.cameraSwayFactor, 3.0);
      const nx = SimplexNoise.noise(noiseX, 420.0);
      const ny = SimplexNoise.noise(noiseX, 1337.0);
      const nz = SimplexNoise.noise(noiseX, 6969.0);
      outputTransform.eulerRot.x += nx * scaledIntensity;
      outputTransform.eulerRot.y += ny * scaledIntensity;
    }
  }

  function turningEasing(x){ return x < 0.5 ? 4.0 * x * x * x : 1.0 - Math.pow(-2.0 * x + 2.0, 3.0) / 2.0; }

  const CameraOverhaulFull = {
    camera: null,
    controls: null,
    system: null,
    cfg: defaultConfig(),
    enabled: true,
    rafId: null,
    inited: false,

    // Pre-allocated objects for reuse
    _cachedPos: v3(),
    _cachedRot: v3(),
    _cachedVelocity: v3(),
    _cachedForwardRel: v3(),
    _cachedTransform: new Transform(),

    init({ camera, controls, autoInject = true, config } = {}){
      this.camera = camera || window.camera || (window.__MBX && window.__MBX.camera) || null;
      this.controls = controls || window.controls || (window.PointerLockControls && window.PointerLockControls.instance) || null;
      if (config) this.cfg = config;
      this.system = new CameraSystem(this.cfg);
      this.inited = true;
      if (this.controls) this.hookControls();
      if (autoInject) this._startRAF();
      console.log('[CameraOverhaulFull] iniciado', { camera: !!this.camera, controls: !!this.controls });
      return this;
    },

    _startRAF(){
      const self = this;
      if (this.rafId) return;
      function loop(){
        if (!self.enabled) {
            self.rafId = requestAnimationFrame(loop);
            return;
        }

        TimeSystem.update();
        const ctx = self._buildContext();
        const dt = TimeSystem.getDeltaTime();
        self.system.onCameraUpdate(ctx, dt);
        
        // Use pre-allocated objects
        const t = self._cachedTransform;
        if (self.camera) {
            t.position.copy(self.camera.position);
            t.eulerRot.set(radToDeg(self.camera.rotation.x||0), radToDeg(self.camera.rotation.y||0), radToDeg(self.camera.rotation.z||0));
        } else {
            t.position.set(0,0,0);
            t.eulerRot.set(0,0,0);
        }

        self.system.modifyCameraTransform(t);

        if (self.camera){
          // Prevent unnecessary updates if values are almost identical
          if (Math.abs(self.camera.rotation.x - degToRad(t.eulerRot.x)) > 0.0001) self.camera.rotation.x = degToRad(t.eulerRot.x);
          if (Math.abs(self.camera.rotation.y - degToRad(t.eulerRot.y)) > 0.0001) self.camera.rotation.y = degToRad(t.eulerRot.y);
          if (Math.abs(self.camera.rotation.z - degToRad(t.eulerRot.z)) > 0.0001) self.camera.rotation.z = degToRad(t.eulerRot.z);
          
          if (self.camera.position.distanceToSquared(t.position) > 0.00001) {
            self.camera.position.copy(t.position);
          }
        }
        self.rafId = requestAnimationFrame(loop);
      }
      loop();
    },

    hookControls(){
      const ctrl = this.controls;
      const self = this;
      if (!ctrl) return;
      if (!ctrl._origUpdate && typeof ctrl.update === 'function'){
        ctrl._origUpdate = ctrl.update.bind(ctrl);
        ctrl.update = function(...args){
          ctrl._origUpdate(...args);
          self.system.notifyOfPlayerAction();
        };
      }
      if (!ctrl._origOnMouse && typeof ctrl.onMouseMove === 'function'){
        ctrl._origOnMouse = ctrl.onMouseMove.bind(ctrl);
        ctrl.onMouseMove = function(ev){
          ctrl._origOnMouse(ev);
          self.system.notifyOfPlayerAction();
        };
      }
    },

    _buildContext(){
      const cam = this.camera || new THREE.Object3D();
      const pos = this._cachedPos.copy(cam.position);
      const rotDeg = this._cachedRot.set(radToDeg(cam.rotation.x||0), radToDeg(cam.rotation.y||0), radToDeg(cam.rotation.z||0));
      const velocity = this._cachedVelocity.set(0,0,0);
      
      try {
        const player = window.player || window.localPlayer || window.__player || null;
        if (player && player.velocity) {
          velocity.set(player.velocity.x || 0, player.velocity.y || 0, player.velocity.z || 0);
        }
      } catch(e){}

      const self = this;
      const getForwardRelativeVelocity = function(){
        const yaw = rotDeg.y;
        const deg = 360 - yaw;
        const rad = deg * Math.PI/180;
        const s = Math.sin(rad), c = Math.cos(rad);
        const x = c * velocity.x - s * velocity.z;
        const z = s * velocity.x + c * velocity.z;
        return self._cachedForwardRel.set(x, velocity.y, z);
      };

      return {
        isSwimming: false, isFlying: false, isSprinting: false, isRiding: false, isRidingMount:false, isRidingVehicle:false,
        velocity, perspective: 'FIRST_PERSON',
        transform: { position: pos, eulerRot: rotDeg },
        getForwardRelativeVelocity
      };
    },

    notifyOfPlayerAction(){ this.system && this.system.notifyOfPlayerAction(); },
    setConfig(cfg){ this.cfg = cfg; if (this.system) this.system.cfg = cfg; },
    enable(){ this.enabled = true; },
    disable(){ this.enabled = false; },
    stop(){ if (this.rafId) cancelAnimationFrame(this.rafId); this.rafId = null; }
  };

  global.CameraOverhaulFull = CameraOverhaulFull;
  global.TimeSystem = TimeSystem;
  global.MathUtils = MathUtils;
  global.SimplexNoise = SimplexNoise;
  global.ScreenShakes = ScreenShakes;

  console.log('[CameraOverhaulFull] cargado. Ejecuta CameraOverhaulFull.init({camera: YOUR_CAMERA, controls: YOUR_CONTROLS})');

})(window);
