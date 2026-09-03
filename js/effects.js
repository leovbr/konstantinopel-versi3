import * as THREE from "three";

export class Effects {
  constructor(world) {
    this.world = world;
    this.scene = world.getScene();

    this.effects = [];
  }

  update(delta) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i];

      effect.life -= delta;

      if (effect.update) {
        effect.update(delta);
      }

      if (effect.life <= 0) {
        if (effect.object?.parent) {
          effect.object.parent.remove(effect.object);
        }

        this.effects.splice(i, 1);
      }
    }
  }

  explosion(position, size = 1) {
    const group = new THREE.Group();
    group.position.copy(position);

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 12, 12),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.9
      })
    );

    group.add(sphere);
    this.scene.add(group);

    const effect = {
      object: group,
      life: 0.55,

      update: () => {
        const progress = 1 - effect.life / 0.55;

        const scale = 0.5 + progress * size * 3;

        group.scale.setScalar(scale);

        sphere.material.opacity = Math.max(
          0,
          0.9 - progress
        );
      }
    };

    this.effects.push(effect);
  }

  fireRain() {
    const scene = this.scene;

    for (let i = 0; i < 45; i++) {
      const fire = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 1
        })
      );

      fire.position.set(
        (Math.random() - 0.5) * 22,
        14 + Math.random() * 5,
        -2 + Math.random() * 12
      );

      scene.add(fire);

      const effect = {
        object: fire,
        life: 1.5 + Math.random(),

        update: delta => {
          fire.position.y -= delta * 15;

          fire.rotation.x += delta * 8;
          fire.rotation.z += delta * 5;

          fire.material.opacity =
            Math.min(1, effect.life);
        }
      };

      this.effects.push(effect);
    }

    this.world.shake(0.35);
  }

  hit(position) {
    this.explosion(position, 0.7);
  }

  clear() {
    for (const effect of this.effects) {
      if (effect.object?.parent) {
        effect.object.parent.remove(effect.object);
      }
    }

    this.effects.length = 0;
  }
}
