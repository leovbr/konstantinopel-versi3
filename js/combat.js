// =========================================================
// SIEGE OF CONSTANTINOPLE V3
// COMBAT SYSTEM
// =========================================================

import * as THREE from "three";


export class Combat {

    constructor(
        world,
        game,
        units
    ) {

        this.world = world;
        this.game = game;
        this.units = units;

        this.projectiles = [];

    }


    // =====================================================
    // UPDATE
    // =====================================================

    update(delta) {

        this.projectiles.forEach(
            projectile => {

                if (
                    !projectile.active
                ) {
                    return;
                }


                this.updateProjectile(
                    projectile,
                    delta
                );

            }
        );


        this.projectiles =
            this.projectiles.filter(
                projectile =>
                    projectile.active
            );

    }


    // =====================================================
    // FIRE ARROW
    // =====================================================

    fireArrow(
        start,
        target,
        damage = 35
    ) {

        const projectile =
            this.createProjectile(
                start,
                target,
                damage,
                "arrow"
            );


        this.projectiles.push(
            projectile
        );

    }


    // =====================================================
    // FIRE CANNON
    // =====================================================

    fireCannon(
        start,
        target,
        damage = 100
    ) {

        const projectile =
            this.createProjectile(
                start,
                target,
                damage,
                "cannon"
            );


        this.projectiles.push(
            projectile
        );

    }


    // =====================================================
    // CREATE PROJECTILE
    // =====================================================

    createProjectile(
        start,
        target,
        damage,
        type
    ) {

        const mesh =
            this.createProjectileMesh(
                type
            );


        mesh.position.copy(
            start
        );


        this.world.scene.add(
            mesh
        );


        return {

            mesh,

            target,

            damage,

            type,

            active: true,

            progress: 0,

            duration:
                type === "cannon"
                    ? 0.45
                    : 0.65,

            start:
                start.clone()

        };

    }


    // =====================================================
    // PROJECTILE MESH
    // =====================================================

    createProjectileMesh(
        type
    ) {

        if (
            type === "arrow"
        ) {

            const group =
                new THREE.Group();


            const shaftGeometry =
                new THREE.CylinderGeometry(
                    0.035,
                    0.035,
                    1.0,
                    6
                );


            const shaftMaterial =
                new THREE.MeshStandardMaterial({
                    color: 0x8a5c2f
                });


            const shaft =
                new THREE.Mesh(
                    shaftGeometry,
                    shaftMaterial
                );


            shaft.rotation.z =
                Math.PI / 2;


            group.add(
                shaft
            );


            const headGeometry =
                new THREE.ConeGeometry(
                    0.09,
                    0.25,
                    6
                );


            const headMaterial =
                new THREE.MeshStandardMaterial({
                    color: 0xbcc5cc,
                    metalness: 0.8,
                    roughness: 0.2
                });


            const head =
                new THREE.Mesh(
                    headGeometry,
                    headMaterial
                );


            head.rotation.z =
                -Math.PI / 2;


            head.position.x =
                0.55;


            group.add(
                head
            );


            return group;

        }


        // Cannonball

        const geometry =
            new THREE.SphereGeometry(
                0.22,
                12,
                12
            );


        const material =
            new THREE.MeshStandardMaterial({
                color: 0x171717,
                metalness: 0.65,
                roughness: 0.4
            });


        return new THREE.Mesh(
            geometry,
            material
        );

    }


    // =====================================================
    // UPDATE PROJECTILE
    // =====================================================

    updateProjectile(
        projectile,
        delta
    ) {

        if (
            !projectile.target ||
            !projectile.target.alive
        ) {

            this.destroyProjectile(
                projectile
            );

            return;

        }


        projectile.progress +=
            delta /
            projectile.duration;


        const t =
            Math.min(
                projectile.progress,
                1
            );


        const targetMesh =
            projectile.target.mesh;


        if (!targetMesh) {

            this.destroyProjectile(
                projectile
            );

            return;

        }


        const start =
            projectile.start;


        const end =
            targetMesh.position.clone();


        end.y +=
            projectile.type ===
            "cannon"
                ? 1
                : 1.4;


        // -------------------------------------------------
        // ARC
        // -------------------------------------------------

        const current =
            start.clone().lerp(
                end,
                t
            );


        const arc =
            Math.sin(
                t * Math.PI
            ) *
            (
                projectile.type ===
                "cannon"
                    ? 3
                    : 1.8
            );


        current.y +=
            arc;


        projectile.mesh.position.copy(
            current
        );


        // -------------------------------------------------
        // ROTATE TOWARD TARGET
        // -------------------------------------------------

        if (
            t < 0.98
        ) {

            projectile.mesh.lookAt(
                end
            );

        }


        // -------------------------------------------------
        // IMPACT
        // -------------------------------------------------

        if (
            t >= 1
        ) {

            this.impact(
                projectile
            );

        }

    }


    // =====================================================
    // IMPACT
    // =====================================================

    impact(
        projectile
    ) {

        const target =
            projectile.target;


        if (
            target &&
            target.alive
        ) {

            this.gameHit(
                target,
                projectile.damage
            );

        }


        this.createImpactEffect(
            projectile.mesh.position
        );


        this.destroyProjectile(
            projectile
        );

    }


    // =====================================================
    // DAMAGE
    // =====================================================

    gameHit(
        enemy,
        damage
    ) {

        enemy.hp -=
            damage;


        this.game.ui.damageNumber(
            damage,
            enemy.mesh
        );


        if (
            enemy.hp <= 0
        ) {

            enemy.alive =
                false;


            this.game.kills++;


            const reward =
                enemy.type === "commander"
                    ? 250
                    : enemy.type === "janissary"
                        ? 45
                        : enemy.type === "archer"
                            ? 30
                            : 20;


            this.game.gold +=
                reward;


            this.game.score +=
                reward * 10;


            this.units.removeEnemy(
                enemy
            );


            this.game.checkWaveClear();


            this.game.updateUI();

        }

    }


    // =====================================================
    // IMPACT EFFECT
    // =====================================================

    createImpactEffect(
        position
    ) {

        const geometry =
            new THREE.SphereGeometry(
                0.08,
                8,
                8
            );


        const material =
            new THREE.MeshBasicMaterial({
                color: 0xffb45c,
                transparent: true,
                opacity: 1
            });


        const flash =
            new THREE.Mesh(
                geometry,
                material
            );


        flash.position.copy(
            position
        );


        this.world.scene.add(
            flash
        );


        let time = 0;


        const animate =
            () => {

                time += 0.05;


                flash.scale.setScalar(
                    1 +
                    time * 8
                );


                material.opacity =
                    Math.max(
                        0,
                        1 - time * 2
                    );


                if (
                    material.opacity <= 0
                ) {

                    this.world.scene.remove(
                        flash
                    );

                    return;

                }


                requestAnimationFrame(
                    animate
                );

            };


        animate();

    }


    // =====================================================
    // DESTROY
    // =====================================================

    destroyProjectile(
        projectile
    ) {

        projectile.active =
            false;


        if (
            projectile.mesh
        ) {

            this.world.scene.remove(
                projectile.mesh
            );

        }

    }


    // =====================================================
    // FIRE RAIN
    // =====================================================

    fireRain(
        damage = 150
    ) {

        const enemies =
            this.units.enemies
                .filter(
                    enemy =>
                        enemy.alive
                );


        enemies.forEach(
            enemy => {

                this.gameHit(
                    enemy,
                    damage
                );

            }
        );


        this.world.shake(
            1
        );

    }

}
