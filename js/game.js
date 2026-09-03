import { Units } from "./units.js";
import { Combat } from "./combat.js";
import { Waves } from "./waves.js";
import { Effects } from "./effects.js";

export class Game {
  constructor(world, ui) {
    this.world = world;
    this.ui = ui;

    this.units = new Units(world, this);
    this.combat = new Combat(world, this, this.units);
    this.waves = new Waves(this);
    this.effects = new Effects(world);

    this.running = false;
    this.paused = false;
    this.gameOver = false;
    this.victory = false;

    this.maxCityHP = 1000;
    this.cityHP = 1000;

    this.gold = 500;
    this.supplies = 60;

    this.kills = 0;
    this.score = 0;

    this.currentWave = 0;
    this.maxWave = 20;

    this.waveActive = false;

    this.upgradeLevel = 1;

    this.fireRainCooldown = 0;
    this.fireRainMaxCooldown = 12;

    this.waveTimer = 0;
  }

  async init() {
    this.setupButtons();
    this.updateUI();
  }

  start() {
    this.reset();

    this.running = true;
    this.paused = false;

    this.updateUI();

    setTimeout(() => {
      if (this.running && !this.paused) {
        this.startNextWave();
      }
    }, 1200);
  }

  restart() {
    this.reset();

    this.running = true;
    this.paused = false;

    this.updateUI();

    setTimeout(() => {
      if (this.running) {
        this.startNextWave();
      }
    }, 800);
  }

  reset() {
    this.units.clear();
    this.combat.clear();
    this.effects.clear();

    this.cityHP = this.maxCityHP;

    this.gold = 500;
    this.supplies = 60;

    this.kills = 0;
    this.score = 0;

    this.currentWave = 0;

    this.waveActive = false;

    this.upgradeLevel = 1;

    this.fireRainCooldown = 0;

    this.waveTimer = 0;

    this.gameOver = false;
    this.victory = false;

    this.updateUI();
  }

  update(delta) {
    if (!this.running || this.paused || this.gameOver || this.victory) {
      return;
    }

    if (this.fireRainCooldown > 0) {
      this.fireRainCooldown -= delta;

      if (this.fireRainCooldown < 0) {
        this.fireRainCooldown = 0;
      }
    }

    this.units.update(delta);
    this.combat.update(delta);
    this.effects.update(delta);

    this.updateWaveState(delta);
  }

  updateWaveState(delta) {
    if (!this.waveActive) return;

    const aliveEnemies = this.units.enemies.filter(
      enemy => enemy.alive
    );

    if (aliveEnemies.length === 0) {
      this.completeWave();
    }
  }

  startNextWave() {
    if (!this.running) return;
    if (this.paused) return;
    if (this.gameOver || this.victory) return;
    if (this.waveActive) return;

    if (this.currentWave >= this.maxWave) {
      this.win();
      return;
    }

    this.currentWave++;

    this.waveActive = true;

    this.updateUI();

    this.waves.start(this.currentWave);
  }

  spawnEnemy(type) {
    if (!this.running || this.paused) return;

    const enemy = this.units.createEnemy(type, {
      wave: this.currentWave
    });

    if (!enemy) return;

    this.updateUI();
  }

  damageEnemy(enemy, damage) {
    if (!enemy || !enemy.alive) return;

    enemy.hp -= damage;

    if (enemy.mesh) {
      this.ui.damageNumber(
        Math.round(damage),
        enemy.mesh
      );
    }

    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  killEnemy(enemy) {
    if (!enemy || !enemy.alive) return;

    enemy.alive = false;

    this.kills++;

    this.gold += this.getKillReward(enemy.type);

    this.score += this.getScoreReward(enemy.type);

    if (enemy.mesh) {
      this.effects.explosion(
        enemy.mesh.position,
        enemy.type === "commander" ? 1.5 : 0.7
      );
    }

    this.units.removeEnemy(enemy);

    this.ui.showNotification(
      `ENEMY DESTROYED +${this.getKillReward(enemy.type)} GOLD`,
      900
    );

    this.updateUI();

    this.checkWaveClear();
  }

  getKillReward(type) {
    switch (type) {
      case "archer":
        return 20;

      case "janissary":
        return 30;

      case "commander":
        return 150;

      default:
        return 10;
    }
  }

  getScoreReward(type) {
    switch (type) {
      case "archer":
        return 150;

      case "janissary":
        return 250;

      case "commander":
        return 1000;

      default:
        return 100;
    }
  }

  checkWaveClear() {
    if (!this.waveActive) return;

    const alive = this.units.enemies.some(
      enemy => enemy.alive
    );

    if (!alive) {
      this.completeWave();
    }
  }

  completeWave() {
    if (!this.waveActive) return;

    this.waveActive = false;

    const waveGold = 75 + this.currentWave * 15;
    const waveSupplies = 10 + Math.floor(this.currentWave / 2);

    this.gold += waveGold;
    this.supplies += waveSupplies;

    this.score += this.currentWave * 250;

    this.ui.showNotification(
      `WAVE ${this.currentWave} CLEARED! +${waveGold} GOLD`,
      1800
    );

    if (this.currentWave >= this.maxWave) {
      setTimeout(() => {
        this.win();
      }, 1200);

      return;
    }

    this.updateUI();
  }

  useFireRain() {
    if (!this.running) return;
    if (this.paused) return;
    if (this.fireRainCooldown > 0) return;

    const cost = 35;

    if (this.supplies < cost) {
      this.ui.showNotification(
        "NOT ENOUGH SUPPLIES",
        1200
      );

      return;
    }

    this.supplies -= cost;

    this.fireRainCooldown =
      this.fireRainMaxCooldown;

    const damage =
      120 + this.upgradeLevel * 20;

    this.combat.fireRain(damage);

    this.effects.fireRain();

    this.ui.showNotification(
      "🔥 FIRE RAIN!",
      1200
    );

    this.updateUI();
  }

  upgradeDefenses() {
    const cost = 100 * this.upgradeLevel;

    if (this.gold < cost) {
      this.ui.showNotification(
        "NOT ENOUGH GOLD",
        1200
      );

      return;
    }

    this.gold -= cost;

    this.upgradeLevel++;

    this.ui.showNotification(
      `DEFENSE UPGRADED TO LEVEL ${this.upgradeLevel}`,
      1500
    );

    this.updateUI();
  }

  repairCity() {
    const cost = 40;

    if (this.gold < cost) {
      this.ui.showNotification(
        "NOT ENOUGH GOLD",
        1200
      );

      return;
    }

    if (this.cityHP >= this.maxCityHP) {
      this.ui.showNotification(
        "CITY HP IS ALREADY FULL",
        1200
      );

      return;
    }

    this.gold -= cost;

    this.cityHP = Math.min(
      this.maxCityHP,
      this.cityHP + 150
    );

    this.ui.showNotification(
      "CITY REPAIRED +150 HP",
      1200
    );

    this.updateUI();
  }

  damageCity(amount) {
    if (this.gameOver || this.victory) return;

    this.cityHP -= amount;

    this.cityHP = Math.max(
      0,
      this.cityHP
    );

    this.world.shake(
      Math.min(0.6, amount / 30)
    );

    this.ui.showNotification(
      `CITY DAMAGED -${amount}`,
      700
    );

    this.updateUI();

    if (this.cityHP <= 0) {
      this.lose();
    }
  }

  buyDefense(type) {
    const costs = {
      archer: 150,
      cannon: 300
    };

    const cost = costs[type] ?? 0;

    if (!cost) return;

    if (this.gold < cost) {
      this.ui.showNotification(
        "NOT ENOUGH GOLD",
        1200
      );

      return;
    }

    this.gold -= cost;

    this.units.createDefense(
      type,
      this.upgradeLevel
    );

    this.ui.showNotification(
      `${type.toUpperCase()} DEFENSE BUILT`,
      1200
    );

    this.updateUI();
  }

  pause() {
    if (!this.running) return;

    this.paused = true;

    this.ui.showPause(true);
  }

  resume() {
    if (!this.running) return;

    this.paused = false;

    this.ui.showPause(false);
  }

  togglePause() {
    if (this.paused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  lose() {
    if (this.gameOver) return;

    this.gameOver = true;
    this.running = false;

    this.ui.setFinalStats({
      wave: this.currentWave,
      kills: this.kills,
      score: this.score
    });

    this.ui.showScreen("gameOverScreen");
  }

  win() {
    if (this.victory) return;

    this.victory = true;
    this.running = false;

    this.ui.setVictoryStats({
      wave: this.currentWave,
      kills: this.kills,
      score: this.score
    });

    this.ui.showScreen("victoryScreen");
  }

  setupButtons() {
    document
      .getElementById("archerButton")
      ?.addEventListener("click", () => {
        this.buyDefense("archer");
      });

    document
      .getElementById("cannonButton")
      ?.addEventListener("click", () => {
        this.buyDefense("cannon");
      });

    document
      .getElementById("fireRainButton")
      ?.addEventListener("click", () => {
        this.useFireRain();
      });

    document
      .getElementById("upgradeButton")
      ?.addEventListener("click", () => {
        this.upgradeDefenses();
      });

    document
      .getElementById("repairButton")
      ?.addEventListener("click", () => {
        this.repairCity();
      });

    document
      .getElementById("startWaveButton")
      ?.addEventListener("click", () => {
        this.startNextWave();
      });
  }

  updateUI() {
    this.ui.updateHUD({
      wave: this.currentWave,
      maxWave: this.maxWave,
      gold: this.gold,
      kills: this.kills,
      score: this.score,
      supplies: this.supplies,
      cityHP: this.cityHP,
      maxCityHP: this.maxCityHP,
      upgradeLevel: this.upgradeLevel,
      upgradeCost: 100 * this.upgradeLevel,
      fireRainCooldown: this.fireRainCooldown,
      fireRainMaxCooldown: this.fireRainMaxCooldown,
      waveActive: this.waveActive
    });
  }
}
