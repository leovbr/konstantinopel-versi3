// =========================================================
// SIEGE OF CONSTANTINOPLE V3
// WORLD ENGINE
// =========================================================

import * as THREE from "three";

export class World {

    constructor(container) {

        this.container = container;

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.clock = new THREE.Clock();

        this.objects = [];

        this.castle = null;
        this.sea = null;

        this.cameraTarget = new THREE.Vector3(
            0,
            7,
            0
        );

        this.cameraBasePosition =
            new THREE.Vector3(
                0,
                10,
                27
            );

        this.cameraShake = 0;

    }


    // =====================================================
    // INIT
    // =====================================================

    async init() {

        this.createScene();

        this.createCamera();

        this.createRenderer();

        this.createLights();

        this.createEnvironment();

        this.createSea();

        this.createCastle();

        this.createShips();

        this.createMoon();

        this.createStars();

        this.resize();

    }


    // =====================================================
    // SCENE
    // =====================================================

    createScene() {

        this.scene =
            new THREE.Scene();


        this.scene.background =
            new THREE.Color(
                0x050912
            );


        // Atmospheric fog

        this.scene.fog =
            new THREE.FogExp2(
                0x08101d,
                0.018
            );

    }


    // =====================================================
    // CAMERA
    // =====================================================

    createCamera() {

        const width =
            this.container.clientWidth ||
            window.innerWidth;

        const height =
            this.container.clientHeight ||
            window.innerHeight;


        this.camera =
            new THREE.PerspectiveCamera(
                48,
                width / height,
                0.1,
                1000
            );


        this.camera.position.copy(
            this.cameraBasePosition
        );


        this.camera.lookAt(
            this.cameraTarget
        );

    }


    // =====================================================
    // RENDERER
    // =====================================================

    createRenderer() {

        this.renderer =
            new THREE.WebGLRenderer({
                antialias: true,
                alpha: false,
                powerPreference: "high-performance"
            });


        this.renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                2
            )
        );


        this.renderer.setSize(
            this.container.clientWidth ||
            window.innerWidth,

            this.container.clientHeight ||
            window.innerHeight
        );


        this.renderer.shadowMap.enabled = true;

        this.renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;


        this.renderer.outputColorSpace =
            THREE.SRGBColorSpace;


        this.renderer.toneMapping =
            THREE.ACESFilmicToneMapping;


        this.renderer.toneMappingExposure =
            1.05;


        this.container.innerHTML = "";

        this.container.appendChild(
            this.renderer.domElement
        );

    }


    // =====================================================
    // LIGHTING
    // =====================================================

    createLights() {

        // Moon light

        const moonLight =
            new THREE.DirectionalLight(
                0x9fb9e8,
                2.2
            );


        moonLight.position.set(
            -25,
            40,
            15
        );


        moonLight.castShadow = true;


        moonLight.shadow.mapSize.width =
            2048;

        moonLight.shadow.mapSize.height =
            2048;


        moonLight.shadow.camera.left =
            -50;

        moonLight.shadow.camera.right =
            50;

        moonLight.shadow.camera.top =
            50;

        moonLight.shadow.camera.bottom =
            -50;


        this.scene.add(
            moonLight
        );


        // Soft ambient light

        const ambient =
            new THREE.HemisphereLight(
                0x7186aa,
                0x17100a,
                1.25
            );


        this.scene.add(
            ambient
        );


        // Warm city light

        const cityLight =
            new THREE.PointLight(
                0xffb35c,
                80,
                45
            );


        cityLight.position.set(
            0,
            8,
            5
        );


        this.scene.add(
            cityLight
        );


        // Firelight

        const fireLight =
            new THREE.PointLight(
                0xff6328,
                50,
                25
            );


        fireLight.position.set(
            -7,
            5,
            7
        );


        this.scene.add(
            fireLight
        );

    }


    // =====================================================
    // ENVIRONMENT
    // =====================================================

    createEnvironment() {

        // Ground

        const groundGeometry =
            new THREE.PlaneGeometry(
                120,
                120,
                40,
                40
            );


        const groundMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x151817,
                roughness: 0.95,
                metalness: 0
            });


        const ground =
            new THREE.Mesh(
                groundGeometry,
                groundMaterial
            );


        ground.rotation.x =
            -Math.PI / 2;


        ground.position.y =
            -0.15;


        ground.receiveShadow = true;


        this.scene.add(
            ground
        );


        this.objects.push(
            ground
        );


        // Battlefield dirt

        const battlefieldGeometry =
            new THREE.CircleGeometry(
                35,
                64
            );


        const battlefieldMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x29241c,
                roughness: 1
            });


        const battlefield =
            new THREE.Mesh(
                battlefieldGeometry,
                battlefieldMaterial
            );


        battlefield.rotation.x =
            -Math.PI / 2;


        battlefield.position.y =
            -0.08;


        battlefield.scale.set(
            1,
            0.55,
            1
        );


        battlefield.receiveShadow = true;


        this.scene.add(
            battlefield
        );

    }


    // =====================================================
    // SEA
    // =====================================================

    createSea() {

        const geometry =
            new THREE.PlaneGeometry(
                100,
                35,
                30,
                15
            );


        const material =
            new THREE.MeshStandardMaterial({
                color: 0x071b2b,
                roughness: 0.35,
                metalness: 0.35
            });


        this.sea =
            new THREE.Mesh(
                geometry,
                material
            );


        this.sea.rotation.x =
            -Math.PI / 2;


        this.sea.position.set(
            0,
            -0.1,
            -27
        );


        this.sea.receiveShadow = true;


        this.scene.add(
            this.sea
        );

    }


    // =====================================================
    // CASTLE
    // =====================================================

    createCastle() {

        this.castle =
            new THREE.Group();


        this.castle.position.z =
            -3;


        this.scene.add(
            this.castle
        );


        // -------------------------------------------------
        // MAIN WALL
        // -------------------------------------------------

        const wallGeometry =
            new THREE.BoxGeometry(
                34,
                7,
                2.2
            );


        const wallMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x72685a,
                roughness: 0.85
            });


        const wall =
            new THREE.Mesh(
                wallGeometry,
                wallMaterial
            );


        wall.position.set(
            0,
            3.5,
            0
        );


        wall.castShadow = true;
        wall.receiveShadow = true;


        this.castle.add(
            wall
        );


        // -------------------------------------------------
        // WALL BRICKS
        // -------------------------------------------------

        for (
            let row = 0;
            row < 7;
            row++
        ) {

            for (
                let col = -8;
                col <= 8;
                col++
            ) {

                const brickGeometry =
                    new THREE.BoxGeometry(
                        1.9,
                        0.85,
                        2.3
                    );


                const brickMaterial =
                    new THREE.MeshStandardMaterial({
                        color:
                            row % 2 === 0
                                ? 0x817667
                                : 0x70675b,
                        roughness: 0.9
                    });


                const brick =
                    new THREE.Mesh(
                        brickGeometry,
                        brickMaterial
                    );


                brick.position.set(
                    col * 2.05 +
                    (row % 2 ? 1 : 0),

                    0.55 +
                    row * 0.95,

                    0
                );


                brick.scale.x =
                    0.95;


                brick.castShadow = true;


                this.castle.add(
                    brick
                );

            }

        }


        // -------------------------------------------------
        // TOWERS
        // -------------------------------------------------

        this.createTower(
            -15,
            0,
            8
        );


        this.createTower(
            15,
            0,
            8
        );


        // -------------------------------------------------
        // CENTRAL GATE
        // -------------------------------------------------

        this.createGate();

    }


    // =====================================================
    // TOWER
    // =====================================================

    createTower(x, z, height) {

        const tower =
            new THREE.Group();


        tower.position.set(
            x,
            0,
            z
        );


        // Tower body

        const bodyGeometry =
            new THREE.CylinderGeometry(
                3.1,
                3.4,
                height,
                12
            );


        const bodyMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x655d52,
                roughness: 0.9
            });


        const body =
            new THREE.Mesh(
                bodyGeometry,
                bodyMaterial
            );


        body.position.y =
            height / 2;


        body.castShadow = true;
        body.receiveShadow = true;


        tower.add(
            body
        );


        // Roof

        const roofGeometry =
            new THREE.ConeGeometry(
                4.1,
                3.4,
                12
            );


        const roofMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x3c2930,
                roughness: 0.85
            });


        const roof =
            new THREE.Mesh(
                roofGeometry,
                roofMaterial
            );


        roof.position.y =
            height + 1.7;


        roof.castShadow = true;


        tower.add(
            roof
        );


        // Tower top platform

        const platformGeometry =
            new THREE.CylinderGeometry(
                3.5,
                3.5,
                0.45,
                12
            );


        const platform =
            new THREE.Mesh(
                platformGeometry,
                wallMaterialFallback()
            );


        platform.position.y =
            height;


        tower.add(
            platform
        );


        // Windows

        for (
            let i = 0;
            i < 3;
            i++
        ) {

            const windowGeometry =
                new THREE.BoxGeometry(
                    0.6,
                    1.2,
                    0.15
                );


            const windowMaterial =
                new THREE.MeshStandardMaterial({
                    color: 0x05070a,
                    emissive: 0xffa03c,
                    emissiveIntensity: 1.8
                });


            const win =
                new THREE.Mesh(
                    windowGeometry,
                    windowMaterial
                );


            win.position.set(
                0,
                2.2 + i * 1.5,
                -3.05
            );


            tower.add(
                win
            );

        }


        this.castle.add(
            tower
        );

    }


    // =====================================================
    // GATE
    // =====================================================

    createGate() {

        const gate =
            new THREE.Group();


        gate.position.set(
            0,
            0,
            1.25
        );


        // Gate frame

        const frameGeometry =
            new THREE.BoxGeometry(
                8,
                8,
                1.5
            );


        const frameMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x514a42,
                roughness: 0.9
            });


        const frame =
            new THREE.Mesh(
                frameGeometry,
                frameMaterial
            );


        frame.position.y =
            4;


        frame.castShadow = true;


        gate.add(
            frame
        );


        // Door

        const doorGeometry =
            new THREE.BoxGeometry(
                5,
                6.5,
                0.5
            );


        const doorMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x241814,
                roughness: 0.8
            });


        const door =
            new THREE.Mesh(
                doorGeometry,
                doorMaterial
            );


        door.position.set(
            0,
            3.25,
            0.85
        );


        door.castShadow = true;


        gate.add(
            door
        );


        // Gate arch

        const archGeometry =
            new THREE.TorusGeometry(
                2.5,
                0.25,
                8,
                32,
                Math.PI
            );


        const archMaterial =
            new THREE.MeshStandardMaterial({
                color: 0xb19763,
                metalness: 0.3,
                roughness: 0.55
            });


        const arch =
            new THREE.Mesh(
                archGeometry,
                archMaterial
            );


        arch.rotation.z =
            Math.PI;


        arch.position.set(
            0,
            6.5,
            1.15
        );


        gate.add(
            arch
        );


        this.castle.add(
            gate
        );

    }


    // =====================================================
    // SHIPS
    // =====================================================

    createShips() {

        this.createShip(
            -17,
            -24,
            0.9
        );


        this.createShip(
            11,
            -30,
            1.25
        );


        this.createShip(
            25,
            -21,
            0.75
        );

    }


    createShip(x, z, scale) {

        const ship =
            new THREE.Group();


        ship.position.set(
            x,
            0.4,
            z
        );


        ship.scale.setScalar(
            scale
        );


        // Hull

        const hullGeometry =
            new THREE.BoxGeometry(
                6,
                1.1,
                2
            );


        const hullMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x251b16,
                roughness: 0.9
            });


        const hull =
            new THREE.Mesh(
                hullGeometry,
                hullMaterial
            );


        hull.position.y =
            0;


        hull.castShadow = true;


        ship.add(
            hull
        );


        // Mast

        const mastGeometry =
            new THREE.CylinderGeometry(
                0.12,
                0.18,
                6,
                8
            );


        const mastMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x4a3526
            });


        const mast =
            new THREE.Mesh(
                mastGeometry,
                mastMaterial
            );


        mast.position.y =
            3;


        ship.add(
            mast
        );


        // Sail

        const sailGeometry =
            new THREE.PlaneGeometry(
                3,
                4
            );


        const sailMaterial =
            new THREE.MeshStandardMaterial({
                color: 0xddd4c1,
                side: THREE.DoubleSide
            });


        const sail =
            new THREE.Mesh(
                sailGeometry,
                sailMaterial
            );


        sail.position.set(
            0,
            3.2,
            0
        );


        ship.add(
            sail
        );


        this.scene.add(
            ship
        );


        ship.userData.baseX =
            x;

        ship.userData.baseZ =
            z;

        ship.userData.offset =
            Math.random() * 10;

    }


    // =====================================================
    // MOON
    // =====================================================

    createMoon() {

        const geometry =
            new THREE.SphereGeometry(
                5,
                32,
                32
            );


        const material =
            new THREE.MeshBasicMaterial({
                color: 0xdfe8ff
            });


        const moon =
            new THREE.Mesh(
                geometry,
                material
            );


        moon.position.set(
            -28,
            32,
            -35
        );


        this.scene.add(
            moon
        );


        // Moon glow

        const glow =
            new THREE.PointLight(
                0x9db8ff,
                20,
                70
            );


        glow.position.copy(
            moon.position
        );


        this.scene.add(
            glow
        );

    }


    // =====================================================
    // STARS
    // =====================================================

    createStars() {

        const starCount =
            700;


        const positions =
            new Float32Array(
                starCount * 3
            );


        for (
            let i = 0;
            i < starCount;
            i++
        ) {

            const i3 =
                i * 3;


            positions[i3] =
                (Math.random() - 0.5) *
                180;


            positions[i3 + 1] =
                Math.random() *
                80 +
                15;


            positions[i3 + 2] =
                -Math.random() *
                100 -
                20;

        }


        const geometry =
            new THREE.BufferGeometry();


        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );


        const material =
            new THREE.PointsMaterial({
                color: 0xffffff,
                size: 0.18,
                transparent: true,
                opacity: 0.75
            });


        const stars =
            new THREE.Points(
                geometry,
                material
            );


        this.scene.add(
            stars
        );

    }


    // =====================================================
    // CAMERA SHAKE
    // =====================================================

    shake(amount = 0.25) {

        this.cameraShake =
            Math.max(
                this.cameraShake,
                amount
            );

    }


    // =====================================================
    // UPDATE
    // =====================================================

    update(delta) {

        if (!this.scene) {
            return;
        }


        // Camera shake

        if (
            this.cameraShake > 0
        ) {

            this.cameraShake =
                Math.max(
                    0,
                    this.cameraShake -
                    delta * 1.8
                );


            const strength =
                this.cameraShake;


            this.camera.position.x =
                this.cameraBasePosition.x +
                (Math.random() - 0.5) *
                strength;


            this.camera.position.y =
                this.cameraBasePosition.y +
                (Math.random() - 0.5) *
                strength;


            this.camera.position.z =
                this.cameraBasePosition.z +
                (Math.random() - 0.5) *
                strength;

        }
        else {

            this.camera.position.lerp(
                this.cameraBasePosition,
                0.08
            );

        }


        this.camera.lookAt(
            this.cameraTarget
        );


        // Sea animation

        if (this.sea) {

            this.sea.position.x =
                Math.sin(
                    performance.now() *
                    0.00025
                ) * 0.08;

        }


        // Ships

        this.scene.traverse(
            object => {

                if (
                    object.userData &&
                    object.userData.baseX !==
                    undefined
                ) {

                    const t =
                        performance.now() *
                        0.001;


                    object.position.y =
                        0.4 +
                        Math.sin(
                            t * 0.8 +
                            object.userData.offset
                        ) * 0.12;


                    object.rotation.z =
                        Math.sin(
                            t * 0.7 +
                            object.userData.offset
                        ) * 0.025;

                }

            }
        );


        this.renderer.render(
            this.scene,
            this.camera
        );

    }


    // =====================================================
    // RESIZE
    // =====================================================

    resize() {

        if (
            !this.camera ||
            !this.renderer
        ) {
            return;
        }


        const width =
            this.container.clientWidth ||
            window.innerWidth;


        const height =
            this.container.clientHeight ||
            window.innerHeight;


        this.camera.aspect =
            width / height;


        this.camera.updateProjectionMatrix();


        this.renderer.setSize(
            width,
            height
        );

    }


    // =====================================================
    // GET SCENE
    // =====================================================

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


// =========================================================
// FALLBACK MATERIAL
// =========================================================

function wallMaterialFallback() {

    return new THREE.MeshStandardMaterial({
        color: 0x746b5d,
        roughness: 0.9
    });

}
