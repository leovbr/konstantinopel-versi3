import * as THREE from "three";

export class Units {
  constructor(world, game) {
    this.world = world;
    this.game = game;
    this.scene = world.getScene();

    this.enemies = [];
    this.defenses = [];

    this.enemyId = 0;
    this.defenseId = 0;
  }

  // =========================================================
  // ENEMY
  // =========================================================

  createEnemy(type, data = {}) {
    const wave = data.wave ?? this.game.currentWave;

    const enemy = {
      id: ++this.enemyId,

      type,

      hp: this.getBaseHP(type, wave),
      maxHP: this.getBaseHP(type, wave),

      speed: this.getSpeed(type),
      damage: this.getDamage(type),

      x: data.x ?? (Math.random() - 0.5) * 18,
      z: data.z ?? 18,

      attackTimer: Math.random() * 0.8,
      walkTime: Math.random() * 10,

      alive: true,
      attacking: false,

      mesh: null
    };

    enemy.mesh = this.buildEnemy(enemy);

    this.enemies.push(enemy);

    return enemy;
  }

  getBaseHP(type, wave) {
    const scale = 1 + wave * 0.16;

    const base = {
      soldier: 90,
      archer: 65,
      janissary: 150,
      commander: 700
    };

    return Math.round((base[type] ?? 90) * scale);
  }

  getSpeed(type) {
    switch (type) {
      case "soldier":
        return 1.15;

      case "archer":
        return 0.85;

      case "janissary":
        return 1.0;

      case "commander":
        return 0.55;

      default:
        return 1;
    }
  }

  getDamage(type) {
    switch (type) {
      case "soldier":
        return 10;

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

  buildEnemy(enemy) {
    const group = new THREE.Group();

    const colors = {
      soldier: 0x586070,
      archer: 0x304d38,
      janissary: 0x5c2020,
      commander: 0x7a2020
    };

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: colors[enemy.type] ?? 0x555555,
      roughness: 0.8
    });

    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xc98d68,
      roughness: 0.9
    });

    // BODY
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(
        enemy.type === "commander" ? 0.55 : 0.38,
        enemy.type === "commander" ? 1.25 : 0.9,
        6,
        10
      ),
      bodyMaterial
    );

    body.position.y = enemy.type === "commander" ? 1.25 : 1.05;

    group.add(body);

    // HEAD
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(
        enemy.type === "commander" ? 0.42 : 0.3,
        12,
        12
      ),
      skinMaterial
    );

    head.position.y = enemy.type === "commander" ? 2.25 : 1.85;

    group.add(head);

    // HELMET
    if (enemy.type !== "archer") {
      const helmet = new THREE.Mesh(
        new THREE.SphereGeometry(
          enemy.type === "commander" ? 0.47 : 0.34,
          12,
          8,
          0,
          Math.PI * 2,
          0,
          Math.PI * 0.55
        ),
        new THREE.MeshStandardMaterial({
          color:
            enemy.type === "commander"
              ? 0xb88a32
              : 0x444b55,
          metalness: 0.7,
          roughness: 0.3
        })
      );

      helmet.position.y =
        enemy.type === "commander" ? 2.4 : 2.0;

      group.add(helmet);
    }

    // LEGS
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x20242b,
      roughness: 0.9
    });

    const legLeft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.13, 0.75, 8),
      legMaterial
    );

    const legRight = legLeft.clone();

    legLeft.position.set(-0.18, 0.42, 0);
    legRight.position.set(0.18, 0.42, 0);

    group.add(legLeft, legRight);

    enemy.legs = [legLeft, legRight];

    // ARROW/BOW
    if (enemy.type === "archer") {
      const bow = new THREE.Mesh(
        new THREE.TorusGeometry(
          0.34,
          0.035,
          6,
          12,
          Math.PI
        ),
        new THREE.MeshStandardMaterial({
          color: 0x6b3f20,
          roughness: 0.8
        })
      );

      bow.rotation.y = Math.PI / 2;
      bow.position.set(0, 1.15, -0.35);

      group.add(bow);
    }

    // SWORD
    if (
      enemy.type === "soldier" ||
      enemy.type === "janissary" ||
      enemy.type === "commander"
    ) {
      const sword = new THREE.Mesh(
        new THREE.BoxGeometry(
          enemy.type === "commander" ? 0.09 : 0.06,
          enemy.type === "commander" ? 0.9 : 0.65,
          0.03
        ),
        new THREE.MeshStandardMaterial({
          color: 0xc5cbd2,
          metalness: 0.9,
          roughness: 0.25
        })
      );

      sword.position.set(
        0.48,
        1.15,
        -0.1
      );

      sword.rotation.z = -0.35;

      group.add(sword);

      enemy.weapon = sword;
    }

    // COMMANDER CAPE
    if (enemy.type === "commander") {
      const cape = new THREE.Mesh(
        new THREE.PlaneGeometry(0.95, 1.45),
        new THREE.MeshStandardMaterial({
          color: 0x4a0710,
          side: THREE.DoubleSide,
          roughness: 0.9
        })
      );

      cape.position.set(0, 1.35, 0.38);
      cape.rotation.x = 0.15;

      group.add(cape);
    }

    // COMMANDER SCALE
    if (enemy.type === "commander") {
      group.scale.setScalar(1.35);
    }

    group.position.set(
      enemy.x,
      0,
      enemy.z
    );

    this.scene.add(group);

    return group;
  }

  // =========================================================
  // UPDATE ENEMIES
  // =========================================================

  update(delta) {
    this.updateEnemies(delta);
    this.updateDefenses(delta);
  }

  updateEnemies(delta) {
    for (const enemy of this.enemies) {
      if (!enemy.alive || !enemy.mesh) continue;

      this.updateEnemy(enemy, delta);
    }
  }

  updateEnemy(enemy, delta) {
    const targetZ = 2.0;

    const distance = enemy.mesh.position.z - targetZ;

    enemy.walkTime += delta;

    // MOVE
    if (distance > 0.7) {
      enemy.attacking = false;

      enemy.mesh.position.z -=
        enemy.speed * delta;

      // WALK ANIMATION
      if (enemy.legs) {
        enemy.legs[0].rotation.x =
          Math.sin(enemy.walkTime * 9) * 0.45;

        enemy.legs[1].rotation.x =
          Math.sin(enemy.walkTime * 9 + Math.PI) * 0.45;
      }
    } else {
      enemy.attacking = true;

      enemy.attackTimer -= delta;

      if (enemy.attackTimer <= 0) {
        enemy.attackTimer = 1.4;

        this.game.damageCity(
          enemy.damage
        );

        this.attackAnimation(enemy);
      }
    }

    // SMALL BODY BOB
    enemy.mesh.position.y =
      Math.abs(
        Math.sin(enemy.walkTime * 6)
      ) * 0.025;
  }

  attackAnimation(enemy) {
    if (!enemy.mesh) return;

    const original = enemy.mesh.rotation.x;

    enemy.mesh.rotation.x = -0.25;

    setTimeout(() => {
      if (enemy.mesh) {
        enemy.mesh.rotation.x = original;
      }
    }, 140);
  }

  // =========================================================
  // DEFENSES
  // =========================================================

  createDefense(type, level = 1) {
    const defense = {
      id: ++this.defenseId,

      type,

      level,

      damage:
        type === "cannon"
          ? 90 + level * 25
          : 35 + level * 12,

      range:
        type === "cannon"
          ? 25
          : 22,

      fireRate:
        type === "cannon"
          ? 2.8
          : 1.2,

      cooldown: 0,

      alive: true,

      mesh: null,

      position: null
    };

    const position = this.getDefensePosition(
      type,
      this.defenses.length
    );

    defense.position = position;

    defense.mesh =
      this.buildDefense(defense);

    this.defenses.push(defense);

    return defense;
  }

  getDefensePosition(type, index) {
    const side = index % 2 === 0 ? -1 : 1;

    const row =
      Math.floor(index / 2);

    return new THREE.Vector3(
      side * (7.2 + row * 1.2),
      5.2,
      0.4
    );
  }

  buildDefense(defense) {
    const group = new THREE.Group();

    const isCannon =
      defense.type === "cannon";

    // BASE
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(
        isCannon ? 0.65 : 0.45,
        isCannon ? 0.8 : 0.6,
        0.35,
        10
      ),
      new THREE.MeshStandardMaterial({
        color: isCannon ? 0x454545 : 0x6b4324,
        metalness: isCannon ? 0.65 : 0,
        roughness: 0.7
      })
    );

    group.add(base);

    // TOWER
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(
        isCannon ? 0.8 : 0.55,
        isCannon ? 0.7 : 0.9,
        isCannon ? 0.8 : 0.55
      ),
      new THREE.MeshStandardMaterial({
        color: 0x343942,
        roughness: 0.75
      })
    );

    tower.position.y =
      isCannon ? 0.45 : 0.6;

    group.add(tower);

    // BARREL / BOW
    if (isCannon) {
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.16,
          0.22,
          1.25,
          10
        ),
        new THREE.MeshStandardMaterial({
          color: 0x1d2024,
          metalness: 0.85,
          roughness: 0.3
        })
      );

      barrel.rotation.z =
        Math.PI / 2;

      barrel.position.set(
        0,
        0.7,
        -0.65
      );

      group.add(barrel);

      defense.barrel = barrel;
    } else {
      const archerBody =
        new THREE.Mesh(
          new THREE.CapsuleGeometry(
            0.18,
            0.45,
            5,
            8
          ),
          new THREE.MeshStandardMaterial({
            color: 0x5a704e
          })
        );

      archerBody.position.y = 1.2;

      group.add(archerBody);

      defense.barrel = archerBody;
    }

    group.position.copy(
      defense.position
    );

    this.scene.add(group);

    return group;
  }

  updateDefenses(delta) {
    for (const defense of this.defenses) {
      if (!defense.alive) continue;

      defense.cooldown -= delta;

      const target =
        this.findTarget(defense);

      if (!target) continue;

      // AIM
      this.aimDefense(
        defense,
        target
      );

      // FIRE
      if (defense.cooldown <= 0) {
        defense.cooldown =
          defense.fireRate;

        this.fireDefense(
          defense,
          target
        );
      }
    }
  }

  findTarget(defense) {
    let closest = null;
    let closestDistance = Infinity;

    for (const enemy of this.enemies) {
      if (!enemy.alive || !enemy.mesh) {
        continue;
      }

      const distance =
        defense.position.distanceTo(
          enemy.mesh.position
        );

      if (
        distance <= defense.range &&
        distance < closestDistance
      ) {
        closest = enemy;
        closestDistance = distance;
      }
    }

    return closest;
  }

  aimDefense(defense, target) {
    if (!defense.mesh || !target.mesh) {
      return;
    }

    const targetPosition =
      target.mesh.position.clone();

    targetPosition.y += 1;

    defense.mesh.lookAt(
      targetPosition
    );
  }

  fireDefense(defense, target) {
    if (!target || !target.alive) {
      return;
    }

    const start =
      defense.position.clone();

    start.y +=
      defense.type === "cannon"
        ? 0.8
        : 1.3;

    if (defense.type === "cannon") {
      this.game.combat.fireCannon(
        start,
        target,
        defense.damage
      );
    } else {
      this.game.combat.fireArrow(
        start,
        target,
        defense.damage
      );
    }

    // recoil
    if (defense.barrel) {
      defense.barrel.position.z += 0.12;

      setTimeout(() => {
        if (defense.barrel) {
          defense.barrel.position.z -= 0.12;
        }
      }, 80);
    }
  }

  // =========================================================
  // REMOVE / CLEAR
  // =========================================================

  removeEnemy(enemy) {
    if (!enemy) return;

    enemy.alive = false;

    if (enemy.mesh?.parent) {
      enemy.mesh.parent.remove(
        enemy.mesh
      );
    }

    const index =
      this.enemies.indexOf(enemy);

    if (index !== -1) {
      this.enemies.splice(index, 1);
    }
  }

  clear() {
    for (const enemy of this.enemies) {
      if (enemy.mesh?.parent) {
        enemy.mesh.parent.remove(
          enemy.mesh
        );
      }
    }

    for (const defense of this.defenses) {
      if (defense.mesh?.parent) {
        defense.mesh.parent.remove(
          defense.mesh
        );
      }
    }

    this.enemies.length = 0;
    this.defenses.length = 0;
  }
}
