import * as THREE from "three";

export class World {
  constructor(container) {
    this.container = container;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    this.castle = null;
    this.sea = null;
    this.ships = [];
    this.stars = [];

    this.cameraShake = 0;
    this.time = 0;
  }

  async init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();

    this.createLights();
    this.createEnvironment();
    this.createCastle();
    this.createSea();
    this.createShips();
    this.createMoon();
    this.createStars();

    this.resize();

    window.addEventListener(
      "resize",
      () => this.resize()
    );
  }

  // =========================================================
  // SCENE
  // =========================================================

  createScene() {
    this.scene =
      new THREE.Scene();

    this.scene.background =
      new THREE.Color(0x050914);

    this.scene.fog =
      new THREE.FogExp2(
        0x07101d,
        0.018
      );
  }

  // =========================================================
  // CAMERA
  // =========================================================

  createCamera() {
    this.camera =
      new THREE.PerspectiveCamera(
        55,
        window.innerWidth /
          window.innerHeight,
        0.1,
        500
      );

    this.camera.position.set(
      0,
      9,
      28
    );

    this.camera.lookAt(
      0,
      5,
      0
    );
  }

  // =========================================================
  // RENDERER
  // =========================================================

  createRenderer() {
    this.renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      });

    this.renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    this.renderer.shadowMap.enabled =
      true;

    this.renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;

    this.renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    this.renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    this.renderer.toneMappingExposure =
      1.15;

    this.container.innerHTML = "";

    this.container.appendChild(
      this.renderer.domElement
    );
  }

  // =========================================================
  // LIGHTING
  // =========================================================

  createLights() {
    const moonLight =
      new THREE.DirectionalLight(
        0x9bb8ff,
        2.2
      );

    moonLight.position.set(
      -25,
      35,
      20
    );

    moonLight.castShadow = true;

    moonLight.shadow.mapSize.width =
      2048;

    moonLight.shadow.mapSize.height =
      2048;

    moonLight.shadow.camera.left =
      -35;

    moonLight.shadow.camera.right =
      35;

    moonLight.shadow.camera.top =
      35;

    moonLight.shadow.camera.bottom =
      -35;

    this.scene.add(
      moonLight
    );

    const ambient =
      new THREE.HemisphereLight(
        0x6680b5,
        0x17100b,
        1.5
      );

    this.scene.add(
      ambient
    );

    const cityLight =
      new THREE.PointLight(
        0xff8c42,
        35,
        45
      );

    cityLight.position.set(
      0,
      7,
      2
    );

    this.scene.add(
      cityLight
    );

    const fireLight =
      new THREE.PointLight(
        0xff5a1f,
        18,
        22
      );

    fireLight.position.set(
      -5,
      4,
      7
    );

    this.scene.add(
      fireLight
    );

    this.fireLight =
      fireLight;
  }

  // =========================================================
  // ENVIRONMENT
  // =========================================================

  createEnvironment() {
    const ground =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          120,
          120
        ),
        new THREE.MeshStandardMaterial({
          color: 0x15130f,
          roughness: 1
        })
      );

    ground.rotation.x =
      -Math.PI / 2;

    ground.receiveShadow = true;

    this.scene.add(
      ground
    );

    // Battlefield
    const battlefield =
      new THREE.Mesh(
        new THREE.CircleGeometry(
          18,
          64
        ),
        new THREE.MeshStandardMaterial({
          color: 0x30271c,
          roughness: 1
        })
      );

    battlefield.rotation.x =
      -Math.PI / 2;

    battlefield.position.y =
      0.012;

    battlefield.receiveShadow = true;

    this.scene.add(
      battlefield
    );

    // Defensive trench
    const trench =
      new THREE.Mesh(
        new THREE.RingGeometry(
          15,
          17,
          64
        ),
        new THREE.MeshStandardMaterial({
          color: 0x090806,
          roughness: 1
        })
      );

    trench.rotation.x =
      -Math.PI / 2;

    trench.position.y =
      0.025;

    this.scene.add(
      trench
    );
  }

  // =========================================================
  // CASTLE
  // =========================================================

  createCastle() {
    this.castle =
      new THREE.Group();

    this.createMainWall();
    this.createWallDetails();

    this.createTower(
      -11
    );

    this.createTower(
      11
    );

    this.createGate();

    this.createTorch(
      -7
    );

    this.createTorch(
      7
    );

    this.scene.add(
      this.castle
    );
  }

  createMainWall() {
    const wallMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x555b62,
        roughness: 0.9
      });

    const wall =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          24,
          7,
          2
        ),
        wallMaterial
      );

    wall.position.set(
      0,
      4,
      0
    );

    wall.castShadow = true;
    wall.receiveShadow = true;

    this.castle.add(
      wall
    );

    // Battlements
    for (
      let x = -11;
      x <= 11;
      x += 2
    ) {
      const block =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            1.25,
            1.2,
            2.2
          ),
          wallMaterial
        );

      block.position.set(
        x,
        8.1,
        0
      );

      block.castShadow = true;

      this.castle.add(
        block
      );
    }
  }

  createWallDetails() {
    const brickMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x3e444a,
        roughness: 1
      });

    for (
      let row = 0;
      row < 5;
      row++
    ) {
      for (
        let col = 0;
        col < 14;
        col++
      ) {
        const brick =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              1.45,
              0.72,
              0.12
            ),
            brickMaterial
          );

        const offset =
          row % 2
            ? 0.7
            : 0;

        brick.position.set(
          -10.1 +
            col * 1.5 +
            offset,
          1.2 +
            row * 1.05,
          -1.03
        );

        this.castle.add(
          brick
        );
      }
    }
  }

  // =========================================================
  // TOWERS
  // =========================================================

  createTower(x) {
    const tower =
      new THREE.Group();

    const stone =
      new THREE.MeshStandardMaterial({
        color: 0x626970,
        roughness: 0.9
      });

    const body =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          2.8,
          3.1,
          9,
          16
        ),
        stone
      );

    body.position.y =
      4.5;

    body.castShadow = true;
    body.receiveShadow = true;

    tower.add(
      body
    );

    // Tower top
    const roof =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          3.3,
          3.3,
          0.8,
          16
        ),
        stone
      );

    roof.position.y =
      9;

    tower.add(
      roof
    );

    // Battlements
    for (
      let i = 0;
      i < 10;
      i++
    ) {
      const angle =
        (i / 10) *
        Math.PI *
        2;

      const block =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.65,
            1,
            0.75
          ),
          stone
        );

      block.position.set(
        Math.cos(angle) * 2.75,
        9.8,
        Math.sin(angle) * 2.75
      );

      block.castShadow = true;

      tower.add(
        block
      );
    }

    // Windows
    for (
      let y = 3;
      y <= 7;
      y += 2
    ) {
      const window =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.35,
            0.75,
            0.08
          ),
          new THREE.MeshBasicMaterial({
            color: 0x090b10
          })
        );

      window.position.set(
        0,
        y,
        -2.82
      );

      tower.add(
        window
      );
    }

    tower.position.x =
      x;

    this.castle.add(
      tower
    );
  }

  // =========================================================
  // GATE
  // =========================================================

  createGate() {
    const gateGroup =
      new THREE.Group();

    const frameMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x35393d,
        roughness: 0.8
      });

    const wood =
      new THREE.MeshStandardMaterial({
        color: 0x321b10,
        roughness: 0.95
      });

    // Gate frame
    const left =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.2,
          7,
          2.4
        ),
        frameMaterial
      );

    left.position.set(
      -4,
      3.5,
      -0.05
    );

    const right =
      left.clone();

    right.position.x =
      4;

    gateGroup.add(
      left,
      right
    );

    // Gate door
    const door =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          7,
          5.5,
          0.7
        ),
        wood
      );

    door.position.set(
      0,
      2.75,
      -1.05
    );

    door.castShadow = true;

    gateGroup.add(
      door
    );

    // Gate bars
    for (
      let x = -3;
      x <= 3;
      x += 1
    ) {
      const bar =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.15,
            5.3,
            0.15
          ),
          frameMaterial
        );

      bar.position.set(
        x,
        2.75,
        -1.45
      );

      gateGroup.add(
        bar
      );
    }

    this.castle.add(
      gateGroup
    );

    this.gate =
      gateGroup;
  }

  // =========================================================
  // TORCHES
  // =========================================================

  createTorch(x) {
    const torch =
      new THREE.Group();

    const stick =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.08,
          0.1,
          1.2,
          8
        ),
        new THREE.MeshStandardMaterial({
          color: 0x4a2915
        })
      );

    stick.position.y =
      4.2;

    torch.add(
      stick
    );

    const flame =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.28,
          8,
          8
        ),
        new THREE.MeshBasicMaterial({
          color: 0xff7b22
        })
      );

    flame.position.y =
      4.9;

    torch.add(
      flame
    );

    const light =
      new THREE.PointLight(
        0xff6325,
        4,
        8
      );

    light.position.y =
      4.8;

    torch.add(
      light
    );

    torch.position.set(
      x,
      0,
      -1.5
    );

    this.castle.add(
      torch
    );
  }

  // =========================================================
  // SEA
  // =========================================================

  createSea() {
    this.sea =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          100,
          45,
          40,
          20
        ),
        new THREE.MeshStandardMaterial({
          color: 0x081a2a,
          roughness: 0.25,
          metalness: 0.15
        })
      );

    this.sea.rotation.x =
      -Math.PI / 2;

    this.sea.position.set(
      0,
      -0.08,
      -27
    );

    this.scene.add(
      this.sea
    );
  }

  // =========================================================
  // SHIPS
  // =========================================================

  createShips() {
    const positions = [
      [-15, -23, 0.15],
      [-7, -31, -0.2],
      [5, -28, 0.1],
      [15, -24, -0.15]
    ];

    for (
      const [x, z, rot]
      of positions
    ) {
      const ship =
        this.createShip();

      ship.position.set(
        x,
        0,
        z
      );

      ship.rotation.y =
        rot;

      this.scene.add(
        ship
      );

      this.ships.push({
        mesh: ship,
        baseY: 0,
        offset: Math.random() * 10
      });
    }
  }

  createShip() {
    const ship =
      new THREE.Group();

    const hull =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          5,
          1,
          1.6
        ),
        new THREE.MeshStandardMaterial({
          color: 0x24170e,
          roughness: 0.9
        })
      );

    hull.position.y =
      0.4;

    hull.castShadow = true;

    ship.add(
      hull
    );

    const mast =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.09,
          0.12,
          5,
          8
        ),
        new THREE.MeshStandardMaterial({
          color: 0x4b2b17
        })
      );

    mast.position.y =
      3;

    ship.add(
      mast
    );

    const sail =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          2.8,
          2.5
        ),
        new THREE.MeshStandardMaterial({
          color: 0xddd2b9,
          side: THREE.DoubleSide,
          roughness: 0.9
        })
      );

    sail.position.set(
      0,
      3,
      0
    );

    sail.rotation.y =
      Math.PI / 2;

    ship.add(
      sail
    );

    return ship;
  }

  // =========================================================
  // MOON
  // =========================================================

  createMoon() {
    const moon =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          3.2,
          32,
          32
        ),
        new THREE.MeshBasicMaterial({
          color: 0xdbe7ff
        })
      );

    moon.position.set(
      -22,
      27,
      -40
    );

    this.scene.add(
      moon
    );

    const glow =
      new THREE.PointLight(
        0x8caeff,
        3,
        70
      );

    glow.position.copy(
      moon.position
    );

    this.scene.add(
      glow
    );
  }

  // =========================================================
  // STARS
  // =========================================================

  createStars() {
    const geometry =
      new THREE.BufferGeometry();

    const positions = [];

    for (
      let i = 0;
      i < 900;
      i++
    ) {
      positions.push(
        (Math.random() - 0.5) * 160,
        20 + Math.random() * 70,
        -80 + Math.random() * 100
      );
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        positions,
        3
      )
    );

    const material =
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.13,
        transparent: true,
        opacity: 0.85
      });

    const stars =
      new THREE.Points(
        geometry,
        material
      );

    this.scene.add(
      stars
    );

    this.stars =
      stars;
  }

  // =========================================================
  // CAMERA SHAKE
  // =========================================================

  shake(amount = 0.2) {
    this.cameraShake =
      Math.max(
        this.cameraShake,
        amount
      );
  }

  // =========================================================
  // UPDATE
  // =========================================================

  update(delta) {
    this.time += delta;

    // Camera shake
    if (
      this.cameraShake > 0
    ) {
      this.cameraShake -=
        delta * 1.8;

      this.camera.position.x =
        Math.sin(
          this.time * 45
        ) *
        this.cameraShake;

      this.camera.position.y =
        9 +
        Math.cos(
          this.time * 38
        ) *
        this.cameraShake;
    } else {
      this.camera.position.x *=
        0.9;

      this.camera.position.y +=
        (9 -
          this.camera.position.y) *
        0.08;
    }

    this.camera.lookAt(
      0,
      5,
      0
    );

    // Ships bobbing
    for (
      const ship
      of this.ships
    ) {
      ship.mesh.position.y =
        ship.baseY +
        Math.sin(
          this.time * 1.5 +
          ship.offset
        ) *
        0.18;

      ship.mesh.rotation.z =
        Math.sin(
          this.time * 1.1 +
          ship.offset
        ) *
        0.025;
    }

    // Firelight flicker
    if (this.fireLight) {
      this.fireLight.intensity =
        15 +
        Math.sin(
          this.time * 12
        ) *
        4;
    }

    // Stars slowly move
    if (this.stars) {
      this.stars.rotation.y +=
        delta * 0.002;
    }

    this.renderer.render(
      this.scene,
      this.camera
    );
  }

  // =========================================================
  // RESIZE
  // =========================================================

  resize() {
    if (
      !this.camera ||
      !this.renderer
    ) {
      return;
    }

    this.camera.aspect =
      window.innerWidth /
      window.innerHeight;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }

  // =========================================================
  // GETTERS
  // =========================================================

  getScene() {
    return this.scene;
  }

  getCamera() {
    return this.camera;
  }

  getRenderer() {
    return this.renderer;
  }
}
