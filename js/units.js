// =========================================================
// SIEGE OF CONSTANTINOPLE V3
// 3D UNITS
// =========================================================

import * as THREE from "three";


export class Units {

    constructor(world, game) {

        this.world = world;
        this.game = game;

        this.enemies = [];

        this.defenses = [];

    }


    // =====================================================
    // CREATE ENEMY
    // =====================================================

    createEnemy(type, data = {}) {

        const enemy = {

            id:
                Date.now() +
                Math.random(),

            type,

            hp:
                data.hp ??
                this.getBaseHP(type),

            maxHP:
                data.hp ??
                this.getBaseHP(type),

            speed:
                this.getSpeed(type),

            damage:
                this.getDamage(type),

            x:
                data.x ??
                (Math.random() - 0.5) * 25,

            z:
                data.z ??
                -18 - Math.random() * 12,

            alive: true,

            attackTimer: 0,

            walkTime:
                Math.random() * 10,

            mesh: null

        };


        enemy.mesh =
            this.buildEnemy(
                enemy
            );


        this.enemies.push(
            enemy
        );


        return enemy;

    }


    // =====================================================
    // STATS
    // =====================================================

    getBaseHP(type) {

        switch (type) {

            case "archer":
                return 65;

            case "janissary":
                return 150;

            case "commander":
                return 700;

            default:
                return 90;

        }

    }


    getSpeed(type) {

        switch (type) {

            case "archer":
                return 0.7;

            case "janissary":
                return 0.95;

            case "commander":
                return 0.5;

            default:
                return 1.1;

        }

    }


    getDamage(type) {

        switch (type) {

            case "archer":
                return 7;

            case "janissary":
                return 18;

            case "commander":
                return 35;

            default:
                return 10;

        }

    }


    // =====================================================
    // BUILD ENEMY
    // =====================================================

    buildEnemy(enemy) {

        const group =
            new THREE.Group();


        const scale =
            enemy.type === "commander"
                ? 1.65
                : enemy.type === "janissary"
                    ? 1.15
                    : 1;


        group.scale.setScalar(
            scale
        );


        // -------------------------------------------------
        // COLORS
        // -------------------------------------------------

        const bodyColor =
            this.getBodyColor(
                enemy.type
            );


        // -------------------------------------------------
        // BODY
        // -------------------------------------------------

        const bodyGeometry =
            new THREE.CapsuleGeometry(
                0.42,
                1.05,
                5,
                8
            );


        const bodyMaterial =
            new THREE.MeshStandardMaterial({
                color: bodyColor,
                roughness: 0.8
            });


        const body =
            new THREE.Mesh(
                bodyGeometry,
                bodyMaterial
            );


        body.position.y =
            1.15;


        body.castShadow = true;


        group.add(
            body
        );


        // -------------------------------------------------
        // HEAD
        // -------------------------------------------------

        const headGeometry =
            new THREE.SphereGeometry(
                0.35,
                12,
                12
            );


        const headMaterial =
            new THREE.MeshStandardMaterial({
                color: 0xb77f60,
                roughness: 0.9
            });


        const head =
            new THREE.Mesh(
                headGeometry,
                headMaterial
            );


        head.position.y =
            2.15;


        head.castShadow = true;


        group.add(
            head
        );


        // -------------------------------------------------
        // HELMET
        // -------------------------------------------------

        if (
            enemy.type !== "archer"
        ) {

            const helmetGeometry =
                new THREE.SphereGeometry(
                    0.39,
                    12,
                    8,
                    0,
                    Math.PI * 2,
                    0,
                    Math.PI / 2
                );


            const helmetMaterial =
                new THREE.MeshStandardMaterial({
                    color:
                        enemy.type ===
                        "commander"
                            ? 0xb99b55
                            : 0x292c32,

                    metalness: 0.65,

                    roughness: 0.35
                });


            const helmet =
                new THREE.Mesh(
                    helmetGeometry,
                    helmetMaterial
                );


            helmet.position.y =
                2.27;


            group.add(
                helmet
            );

        }


        // -------------------------------------------------
        // LEGS
        // -------------------------------------------------

        const legMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x25252a,
                roughness: 0.9
            });


        const legGeometry =
            new THREE.CapsuleGeometry(
                0.12,
                0.7,
                4,
                6
            );


        const leftLeg =
            new THREE.Mesh(
                legGeometry,
                legMaterial
            );


        const rightLeg =
            new THREE.Mesh(
                legGeometry,
                legMaterial
            );


        leftLeg.position.set(
            -0.18,
            0.42,
            0
        );


        rightLeg.position.set(
            0.18,
            0.42,
            0
        );


        leftLeg.castShadow = true;
        rightLeg.castShadow = true;


        group.add(
            leftLeg,
            rightLeg
        );


        enemy.leftLeg =
            leftLeg;

        enemy.rightLeg =
            rightLeg;


        // -------------------------------------------------
        // WEAPON
        // -------------------------------------------------

        if (
            enemy.type === "archer"
        ) {

            this.addBow(
                group
            );

        }
        else {

            this.addSword(
                group,
                enemy.type
            );

        }


        // -------------------------------------------------
        // COMMANDER CAPE
        // -------------------------------------------------

        if (
            enemy.type === "commander"
        ) {

            const capeGeometry =
                new THREE.BoxGeometry(
                    0.8,
                    1.8,
                    0.12
                );


            const capeMaterial =
                new THREE.MeshStandardMaterial({
                    color: 0x5d1219,
                    roughness: 0.9
                });


            const cape =
                new THREE.Mesh(
                    capeGeometry,
                    capeMaterial
                );


            cape.position.set(
                0,
                1.2,
                0.35
            );


            cape.rotation.x =
                -0.12;


            group.add(
                cape
            );

        }


        group.position.set(
            enemy.x,
            0,
            enemy.z
        );


        this.world.scene.add(
            group
        );


        return group;

    }


    // =====================================================
    // BODY COLOR
    // =====================================================

    getBodyColor(type) {

        switch (type) {

            case "archer":
                return 0x40586b;

            case "janissary":
                return 0xc19b58;

            case "commander":
                return 0x771c25;

            default:
                return 0x6b3433;

        }

    }


    // =====================================================
    // SWORD
    // =====================================================

    addSword(
        group,
        type
    ) {

        const swordGroup =
            new THREE.Group();


        const bladeGeometry =
            new THREE.BoxGeometry(
                0.12,
                1.35,
                0.08
            );


        const bladeMaterial =
            new THREE.MeshStandardMaterial({
                color: 0xbfc6cc,
                metalness: 0.85,
                roughness: 0.2
            });


        const blade =
            new THREE.Mesh(
                bladeGeometry,
                bladeMaterial
            );


        blade.position.y =
            0.65;


        const handleGeometry =
            new THREE.CylinderGeometry(
                0.07,
                0.07,
                0.45,
                8
            );


        const handleMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x4b2b1b
            });


        const handle =
            new THREE.Mesh(
                handleGeometry,
                handleMaterial
            );


        handle.position.y =
            -0.2;


        swordGroup.add(
            blade,
            handle
        );


        swordGroup.position.set(
            0.55,
            1.1,
            0
        );


        swordGroup.rotation.z =
            -0.5;


        group.add(
            swordGroup
        );

    }


    // =====================================================
    // BOW
    // =====================================================

    addBow(group) {

        const bow =
            new THREE.Group();


        const bowGeometry =
            new THREE.TorusGeometry(
                0.55,
                0.055,
                6,
                18,
                Math.PI
            );


        const bowMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x8d5d2d,
                roughness: 0.8
            });


        const bowMesh =
            new THREE.Mesh(
                bowGeometry,
                bowMaterial
            );


        bowMesh.rotation.z =
            Math.PI / 2;


        bow.add(
            bowMesh
        );


        bow.position.set(
            0.5,
            1.35,
            -0.1
        );


        group.add(
            bow
        );

    }


    // =====================================================
    // UPDATE
    // =====================================================

    update(delta) {

        this.enemies.forEach(
            enemy => {

                if (
                    !enemy.alive ||
                    !enemy.mesh
                ) {
                    return;
                }


                this.updateEnemy(
                    enemy,
                    delta
                );

            }
        );

    }


    // =====================================================
    // ENEMY MOVEMENT
    // =====================================================

    updateEnemy(
        enemy,
        delta
    ) {

        const mesh =
            enemy.mesh;


        // Target wall

        const targetZ =
            1.0;


        const distance =
            targetZ -
            mesh.position.z;


        if (
            distance > 1.5
        ) {

            mesh.position.z +=
                enemy.speed *
                delta;


            // Walking animation

            enemy.walkTime +=
                delta * 8;


            if (
                enemy.leftLeg &&
                enemy.rightLeg
            ) {

                enemy.leftLeg.rotation.x =
                    Math.sin(
                        enemy.walkTime
                    ) * 0.55;


                enemy.rightLeg.rotation.x =
                    Math.sin(
                        enemy.walkTime +
                        Math.PI
                    ) * 0.55;

            }

        }
        else {

            enemy.attackTimer +=
                delta;


            if (
                enemy.attackTimer >
                1.4
            ) {

                enemy.attackTimer = 0;


                this.game.damageCity(
                    enemy.damage
                );


                this.attackAnimation(
                    enemy
                );

            }

        }

    }


    // =====================================================
    // ATTACK ANIMATION
    // =====================================================

    attackAnimation(enemy) {

        const mesh =
            enemy.mesh;


        mesh.rotation.y =
            -0.25;


        setTimeout(
            () => {

                if (
                    mesh
                ) {

                    mesh.rotation.y =
                        0;

                }

            },
            180
        );

    }


    // =====================================================
    // REMOVE ENEMY
    // =====================================================

    removeEnemy(enemy) {

        if (
            !enemy
        ) {
            return;
        }


        enemy.alive = false;


        if (
            enemy.mesh
        ) {

            this.world.scene.remove(
                enemy.mesh
            );

        }

    }


    // =====================================================
    // CLEAR
    // =====================================================

    clear() {

        this.enemies.forEach(
            enemy => {

                if (
                    enemy.mesh
                ) {

                    this.world.scene.remove(
                        enemy.mesh
                    );

                }

            }
        );


        this.enemies = [];

    }

}
