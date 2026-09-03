export class Waves {
  constructor(game) {
    this.game = game;
  }

  getEnemyCount(wave) {
    return 5 + Math.floor(wave * 1.8);
  }

  getEnemyType(wave) {
    const r = Math.random();

    if (wave >= 5 && r < 0.12) {
      return "janissary";
    }

    if (wave >= 3 && r < 0.30) {
      return "archer";
    }

    return "soldier";
  }

  createWave(wave) {
    const enemies = [];
    const count = this.getEnemyCount(wave);

    for (let i = 0; i < count; i++) {
      enemies.push(this.getEnemyType(wave));
    }

    if (wave % 5 === 0) {
      enemies.push("commander");
    }

    return enemies;
  }

  start(wave) {
    const enemies = this.createWave(wave);

    this.game.ui.announceWave(
      wave,
      wave % 5 === 0
        ? "THE OTTOMAN COMMANDER HAS ARRIVED"
        : "THE OTTOMAN ARMY APPROACHES",
      2200
    );

    enemies.forEach((type, index) => {
      setTimeout(() => {
        if (!this.game.running || this.game.paused) return;

        this.game.spawnEnemy(type);
      }, index * 450);
    });
  }
}
