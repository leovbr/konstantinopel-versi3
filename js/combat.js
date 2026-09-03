import * as THREE from "three";

export class Combat {
  constructor(world, game, units) {
    this.world = world;
    this.game = game;
    this.units = units;

    this.scene = world.getScene();

    this.projectiles = [];
  }

  // =========================================================
  // UPDATE
  // =========================================================

  update(delta) {
    for (
      let i = this.projectiles.length - 1;
      i >= 0;
      i--
    ) {
      const projectile =
        this.projectiles[i];

      this.updateProjectile(
        projectile,
        delta
      );
    }
  }

  // =========================================================
  // ARROW
  // =========================================================

  fireArrow(
    start,
    target,
    damage
  ) {
    if (!target?.alive) return;

    const projectile =
      this.createProjectile(
        "arrow",
        start,
        target,
        damage
      );

    this.projectiles.push(
      projectile
    );
  }

  // =========================================================
  // CANNON
  // =========================================================

  fireCannon(
    start,
    target,
    damage
  ) {
    if (!target?.alive) return;

    const projectile =
      this.createProjectile(
        "cannon",
        start,
        target,
        damage
      );

    this.projectiles.push(
      projectile
    );
  }

  // =========================================================
  // CREATE PROJECTILE
  // =========================================================

  createProjectile(
    type,
    start,
    target,
    damage
  ) {
    const mesh =
      this.createProjectileMesh(type);

    mesh.position.copy(start);

    this.scene.add(mesh);

    return {
      type,

      mesh,

      target,

      damage,

      start:
        start.clone(),

      elapsed: 0,

      duration:
        type === "cannon"
          ? 0.65
          : 0.5,

      arc:
        type === "cannon"
          ? 3.5
          : 1.8
    };
  }

  createProjectileMesh(type) {
    if (type === "arrow") {
      const group =
        new THREE.Group();

      const shaft =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.025,
            0.025,
            0.65,
            6
          ),
          new THREE.MeshStandardMaterial({
            color: 0x8a5a2b
          })
        );

      shaft.rotation.z =
        Math.PI / 2;

      group.add(shaft);

      const tip =
        new THREE.Mesh(
          new THREE.ConeGeometry(
            0.08,
            0.2,
            6
          ),
          new THREE.MeshStandardMaterial({
            color: 0xbfc5cc,
            metalness: 0.8
          })
        );

      tip.rotation.z =
        -Math.PI / 2;

      tip.position.x = 0.4;

      group.add(tip);

      return group;
    }

    // CANNON BALL
    return new THREE.Mesh(
      new THREE.SphereGeometry(
        0.16,
        10,
        10
      ),
      new THREE.MeshStandardMaterial({
        color: 0x161616,
        metalness: 0.8,
        roughness: 0.3
      })
    );
  }

  // =========================================================
  // PROJECTILE MOVEMENT
  // =========================================================

  updateProjectile(
    projectile,
    delta
  ) {
    if (
      !projectile.mesh ||
      !projectile.target?.alive
    ) {
      this.destroyProjectile(
        projectile
      );

      return;
    }

    projectile.elapsed += delta;

    const progress =
      Math.min(
        projectile.elapsed /
          projectile.duration,
        1
      );

    const target =
      projectile.target.mesh.position;

    const position =
      projectile.start.clone().lerp(
        target,
        progress
      );

    position.y +=
      Math.sin(
        progress * Math.PI
      ) *
      projectile.arc;

    projectile.mesh.position.copy(
      position
    );

    // Rotate projectile toward travel direction
    const nextProgress =
      Math.min(
        progress + 0.03,
        1
      );

    const nextPosition =
      projectile.start.clone().lerp(
        target,
        nextProgress
      );

    nextPosition.y +=
      Math.sin(
        nextProgress * Math.PI
      ) *
      projectile.arc;

    projectile.mesh.lookAt(
      nextPosition
    );

    if (progress >= 1) {
      this.impact(projectile);
    }
  }

  // =========================================================
  // IMPACT
  // =========================================================

  impact(projectile) {
    const target =
      projectile.target;

    if (
      target &&
      target.alive
    ) {
      this.game.damageEnemy(
        target,
        projectile.damage
      );

      if (target.mesh) {
        this.createImpactEffect(
          target.mesh.position
        );
      }
    }

    this.destroyProjectile(
      projectile
    );
  }

  // =========================================================
  // IMPACT FX
  // =========================================================

  createImpactEffect(position) {
    const ring =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.12,
          0.035,
          6,
          16
        ),
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 1
        })
      );

    ring.position.copy(position);

    ring.position.y += 0.9;

    this.scene.add(ring);

    let elapsed = 0;

    const animate = () => {
      elapsed += 0.03;

      ring.scale.setScalar(
        1 + elapsed * 5
      );

      ring.material.opacity =
        Math.max(
          0,
          1 - elapsed * 2.5
        );

      if (
        elapsed < 0.4 &&
        ring.parent
      ) {
        requestAnimationFrame(
          animate
        );
      } else if (ring.parent) {
        ring.parent.remove(ring);
      }
    };

    animate();
  }

  // =========================================================
  // FIRE RAIN
  // =========================================================

  fireRain(damage) {
    const enemies =
      this.units.enemies.filter(
        enemy => enemy.alive
      );

    for (const enemy of enemies) {
      this.game.damageEnemy(
        enemy,
        damage
      );

      if (enemy.mesh) {
        this.createImpactEffect(
          enemy.mesh.position
        );
      }
    }

    this.world.shake(0.45);
  }

  // =========================================================
  // CLEANUP
  // =========================================================

  destroyProjectile(
    projectile
  ) {
    if (
      projectile.mesh?.parent
    ) {
      projectile.mesh.parent.remove(
        projectile.mesh
      );
    }

    const index =
      this.projectiles.indexOf(
        projectile
      );

    if (index !== -1) {
      this.projectiles.splice(
        index,
        1
      );
    }
  }

  clear() {
    for (
      const projectile
      of this.projectiles
    ) {
      if (
        projectile.mesh?.parent
      ) {
        projectile.mesh.parent.remove(
          projectile.mesh
        );
      }
    }

    this.projectiles.length = 0;
  }
}
