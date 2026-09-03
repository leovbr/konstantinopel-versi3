// =========================================================
// SIEGE OF CONSTANTINOPLE V3
// GAME CORE
// =========================================================

export class Game {

    constructor(world, ui) {

        this.world = world;
        this.ui = ui;


        // -------------------------------------------------
        // GAME STATE
        // -------------------------------------------------

        this.running = false;
        this.paused = false;
        this.gameOver = false;
        this.victory = false;


        // -------------------------------------------------
        // CITY
        // -------------------------------------------------

        this.maxCityHP = 1000;
        this.cityHP = 1000;


        // -------------------------------------------------
        // RESOURCES
        // -------------------------------------------------

        this.gold = 500;
        this.supplies = 60;


        // -------------------------------------------------
        // SCORE
        // -------------------------------------------------

        this.kills = 0;
        this.score = 0;


        // -------------------------------------------------
        // WAVE
        // -------------------------------------------------

        this.currentWave = 0;
        this.maxWave = 20;

        this.waveActive = false;


        // -------------------------------------------------
        // UPGRADE
        // -------------------------------------------------

        this.upgradeLevel = 1;


        // -------------------------------------------------
        // FIRE RAIN
        // -------------------------------------------------

        this.fireRainCooldown = 0;

        this.fireRainMaxCooldown =
            12;


        // -------------------------------------------------
        // TIMERS
        // -------------------------------------------------

        this.waveTimer = 0;

        this.enemyTimer = 0;

        this.enemySpawnInterval =
            1.4;


        this.enemies = [];

        this.defenses = [];

    }


    // =====================================================
    // INIT
    // =====================================================

    async init() {

        this.setupButtons();

        this.updateUI();

    }


    // =====================================================
    // START
    // =====================================================

    start() {

        this.reset();


        this.running = true;
        this.paused = false;


        this.ui.showScreen(
            "gameScreen"
        );


        this.updateUI();


        // First wave

        setTimeout(
            () => {

                if (
                    this.running &&
                    !this.paused
                ) {

                    this.startNextWave();

                }

            },
            1200
        );

    }


    // =====================================================
    // RESET
    // =====================================================

    reset() {

        this.running = false;

        this.paused = false;

        this.gameOver = false;

        this.victory = false;


        this.cityHP =
            this.maxCityHP;


        this.gold = 500;

        this.supplies = 60;


        this.kills = 0;

        this.score = 0;


        this.currentWave = 0;

        this.waveActive = false;


        this.upgradeLevel = 1;


        this.fireRainCooldown = 0;


        this.waveTimer = 0;

        this.enemyTimer = 0;


        this.enemies = [];

        this.defenses = [];


        this.updateUI();

    }


    // =====================================================
    // RESTART
    // =====================================================

    restart() {

        this.reset();

        this.start();

    }


    // =====================================================
    // UPDATE
    // =====================================================

    update(delta) {

        if (
            !this.running ||
            this.paused ||
            this.gameOver ||
            this.victory
        ) {
            return;
        }


        // Fire Rain cooldown

        if (
            this.fireRainCooldown > 0
        ) {

            this.fireRainCooldown =
                Math.max(
                    0,
                    this.fireRainCooldown -
                    delta
                );

        }


        // Wave timer

        if (this.waveActive) {

            this.waveTimer +=
                delta;

        }


        this.updateUI();

    }


    // =====================================================
    // WAVE
    // =====================================================

    startNextWave() {

        if (
            !this.running ||
            this.paused ||
            this.waveActive
        ) {
            return;
        }


        if (
            this.currentWave >=
            this.maxWave
        ) {

            this.win();

            return;

        }


        this.currentWave++;

        this.waveActive = true;

        this.waveTimer = 0;


        this.ui.announceWave(
            this.currentWave,
            this.getWaveSubtitle(),
            1800
        );


        this.spawnWave();


        this.updateUI();

    }


    // =====================================================
    // WAVE SPAWNING
    // =====================================================

    spawnWave() {

        const wave =
            this.currentWave;


        const enemyCount =
            5 +
            Math.floor(
                wave * 1.8
            );


        let spawned = 0;


        const interval =
            Math.max(
                0.35,
                1.4 -
                wave * 0.035
            );


        const spawnEnemy =
            () => {

                if (
                    !this.running ||
                    this.paused ||
                    this.gameOver
                ) {
                    return;
                }


                this.spawnEnemy(
                    this.getEnemyType()
                );


                spawned++;


                if (
                    spawned <
                    enemyCount
                ) {

                    setTimeout(
                        spawnEnemy,
                        interval * 1000
                    );

                }
                else {

                    // Commander every 5 waves

                    if (
                        wave % 5 === 0
                    ) {

                        setTimeout(
                            () => {

                                this.spawnEnemy(
                                    "commander"
                                );

                            },
                            1600
                        );

                    }


                    // Allow next wave

                    setTimeout(
                        () => {

                            this.waveActive =
                                false;

                            this.updateUI();

                        },
                        7000
                    );

                }

            };


        spawnEnemy();

    }


    // =====================================================
    // ENEMY TYPE
    // =====================================================

    getEnemyType() {

        const wave =
            this.currentWave;


        const random =
            Math.random();


        if (wave < 3) {

            return "soldier";

        }


        if (wave < 5) {

            if (
                random < 0.15
            ) {

                return "archer";

            }

            return "soldier";

        }


        if (
            random < 0.12
        ) {

            return "janissary";

        }


        if (
            random < 0.30
        ) {

            return "archer";

        }


        return "soldier";

    }


    // =====================================================
    // SPAWN ENEMY
    // =====================================================

    spawnEnemy(type) {

        const enemy =
            {

                id:
                    Date.now() +
                    Math.random(),


                type,

                hp:
                    this.getEnemyHP(type),


                maxHP:
                    this.getEnemyHP(type),


                alive: true,


                x:
                    (Math.random() - 0.5) *
                    28,


                z:
                    -20 -
                    Math.random() *
                    15,


                speed:
                    this.getEnemySpeed(type),


                attack:
                    this.getEnemyAttack(type),


                attackTimer: 0

            };


        this.enemies.push(
            enemy
        );


        this.createEnemyVisual(
            enemy
        );

    }


    // =====================================================
    // ENEMY STATS
    // =====================================================

    getEnemyHP(type) {

        const wave =
            this.currentWave;


        const scale =
            1 +
            wave * 0.16;


        const stats =
            {

                soldier: 90,

                archer: 65,

                janissary: 150,

                commander: 700

            };


        return Math.floor(
            (stats[type] || 90) *
            scale
        );

    }


    getEnemySpeed(type) {

        const stats =
            {

                soldier: 1.15,

                archer: 0.85,

                janissary: 1.0,

                commander: 0.55

            };


        return (
            stats[type] ||
            1
        );

    }


    getEnemyAttack(type) {

        const stats =
            {

                soldier: 10,

                archer: 7,

                janissary: 18,

                commander: 35

            };


        return (
            stats[type] ||
            10
        );

    }


    // =====================================================
    // ENEMY VISUAL
    // =====================================================

    createEnemyVisual(enemy) {

        if (!this.world.scene) {
            return;
        }


        // Temporary V3 soldier visual.
        // Detailed models will come later.

        const THREE =
            window.THREE;


        const group =
            new THREE.Group();


        const color =
            enemy.type === "commander"
                ? 0x8c2020
                : enemy.type === "janissary"
                    ? 0xd2b36a
                    : enemy.type === "archer"
                        ? 0x536f86
                        : 0x7b3030;


        const bodyGeometry =
            new THREE.CapsuleGeometry(
                0.45,
                1.1,
                4,
                8
            );


        const bodyMaterial =
            new THREE.MeshStandardMaterial({
                color,
                roughness: 0.8
            });


        const body =
            new THREE.Mesh(
                bodyGeometry,
                bodyMaterial
            );


        body.position.y =
            1.25;


        body.castShadow = true;


        group.add(
            body
        );


        const headGeometry =
            new THREE.SphereGeometry(
                0.36,
                12,
                12
            );


        const headMaterial =
            new THREE.MeshStandardMaterial({
                color: 0xb98567
            });


        const head =
            new THREE.Mesh(
                headGeometry,
                headMaterial
            );


        head.position.y =
            2.25;


        head.castShadow = true;


        group.add(
            head
        );


        group.position.set(
            enemy.x,
            0,
            enemy.z
        );


        group.scale.setScalar(
            enemy.type === "commander"
                ? 1.55
                : enemy.type === "janissary"
                    ? 1.15
                    : 1
        );


        this.world.scene.add(
            group
        );


        enemy.mesh =
            group;


        enemy.baseY = 0;

    }


    // =====================================================
    // DAMAGE ENEMY
    // =====================================================

    damageEnemy(
        enemy,
        amount
    ) {

        if (
            !enemy ||
            !enemy.alive
        ) {
            return;
        }


        enemy.hp -= amount;


        this.ui.damageNumber(
            amount,
            enemy.mesh
        );


        if (
            enemy.hp <= 0
        ) {

            this.killEnemy(
                enemy
            );

        }

    }


    // =====================================================
    // KILL
    // =====================================================

    killEnemy(enemy) {

        if (
            !enemy.alive
        ) {
            return;
        }


        enemy.alive = false;


        this.kills++;


        const reward =
            enemy.type === "commander"
                ? 250
                : enemy.type === "janissary"
                    ? 45
                    : enemy.type === "archer"
                        ? 30
                        : 20;


        this.gold += reward;


        this.score +=
            reward * 10;


        if (
            enemy.mesh
        ) {

            this.world.scene.remove(
                enemy.mesh
            );

        }


        this.ui.showNotification(
            `ENEMY DESTROYED +${reward} GOLD`
        );


        this.updateUI();


        this.checkWaveClear();

    }


    // =====================================================
    // WAVE CLEAR
    // =====================================================

    checkWaveClear() {

        const alive =
            this.enemies.some(
                enemy =>
                    enemy.alive
            );


        if (
            this.waveActive &&
            !alive
        ) {

            this.waveActive =
                false;


            this.gold +=
                75 +
                this.currentWave *
                10;


            this.supplies +=
                8;


            this.score +=
                500;


            this.ui.showNotification(
                "WAVE CLEARED"
            );


            this.updateUI();

        }

    }


    // =====================================================
    // FIRE RAIN
    // =====================================================

    useFireRain() {

        if (
            !this.running ||
            this.paused
        ) {
            return;
        }


        if (
            this.fireRainCooldown > 0
        ) {

            this.ui.showNotification(
                "FIRE RAIN RECHARGING"
            );

            return;

        }


        if (
            this.supplies < 35
        ) {

            this.ui.showNotification(
                "NOT ENOUGH SUPPLIES"
            );

            return;

        }


        this.supplies -= 35;


        this.fireRainCooldown =
            this.fireRainMaxCooldown;


        const damage =
            120 +
            this.upgradeLevel *
            20;


        this.enemies.forEach(
            enemy => {

                if (
                    enemy.alive
                ) {

                    this.damageEnemy(
                        enemy,
                        damage
                    );

                }

            }
        );


        this.world.shake(
            0.8
        );


        this.ui.showNotification(
            "🔥 FIRE RAIN!"
        );


        this.updateUI();

    }


    // =====================================================
    // UPGRADE
    // =====================================================

    upgradeDefenses() {

        const cost =
            100 *
            this.upgradeLevel;


        if (
            this.gold < cost
        ) {

            this.ui.showNotification(
                "NOT ENOUGH GOLD"
            );

            return;

        }


        this.gold -=
            cost;


        this.upgradeLevel++;


        this.score +=
            100;


        this.ui.showNotification(
            `DEFENSES UPGRADED TO LV ${this.upgradeLevel}`
        );


        this.updateUI();

    }


    // =====================================================
    // REPAIR
    // =====================================================

    repairCity() {

        const cost =
            40;


        if (
            this.gold < cost
        ) {

            this.ui.showNotification(
                "NOT ENOUGH GOLD"
            );

            return;

        }


        if (
            this.cityHP >=
            this.maxCityHP
        ) {

            this.ui.showNotification(
                "CITY IS ALREADY AT FULL HP"
            );

            return;

        }


        this.gold -=
            cost;


        this.cityHP =
            Math.min(
                this.maxCityHP,
                this.cityHP + 150
            );


        this.ui.showNotification(
            "CITY REPAIRED +150 HP"
        );


        this.updateUI();

    }


    // =====================================================
    // CITY DAMAGE
    // =====================================================

    damageCity(amount) {

        if (
            this.gameOver ||
            this.victory
        ) {
            return;
        }


        this.cityHP =
            Math.max(
                0,
                this.cityHP -
                amount
            );


        this.world.shake(
            0.5
        );


        if (
            this.cityHP <= 0
        ) {

            this.lose();

        }


        this.updateUI();

    }


    // =====================================================
    // PAUSE
    // =====================================================

    pause() {

        if (
            !this.running ||
            this.gameOver ||
            this.victory
        ) {
            return;
        }


        this.paused = true;

        this.ui.showPause(
            true
        );

    }


    resume() {

        if (
            !this.running
        ) {
            return;
        }


        this.paused = false;

        this.ui.showPause(
            false
        );

    }


    togglePause() {

        if (
            this.paused
        ) {

            this.resume();

        }
        else {

            this.pause();

        }

    }


    // =====================================================
    // LOSE
    // =====================================================

    lose() {

        this.gameOver = true;

        this.running = false;

        this.waveActive = false;


        this.ui.setFinalStats(
            this.currentWave,
            this.kills,
            this.score
        );


        this.ui.showScreen(
            "gameOverScreen"
        );

    }


    // =====================================================
    // VICTORY
    // =====================================================

    win() {

        this.victory = true;

        this.running = false;

        this.waveActive = false;


        this.ui.setVictoryStats(
            this.currentWave,
            this.kills,
            this.score
        );


        this.ui.showScreen(
            "victoryScreen"
        );

    }


    // =====================================================
    // WAVE SUBTITLE
    // =====================================================

    getWaveSubtitle() {

        if (
            this.currentWave % 5 === 0
        ) {

            return "THE COMMANDER MARCHES";

        }


        if (
            this.currentWave >= 15
        ) {

            return "THE FINAL ASSAULT";

        }


        if (
            this.currentWave >= 10
        ) {

            return "THE SIEGE INTENSIFIES";

        }


        return "DEFEND THE WALLS";

    }


    // =====================================================
    // BUTTONS
    // =====================================================

    setupButtons() {

        document
            .getElementById(
                "startWaveButton"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.startNextWave();

                }
            );


        document
            .getElementById(
                "fireRainButton"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.useFireRain();

                }
            );


        document
            .getElementById(
                "upgradeButton"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.upgradeDefenses();

                }
            );


        document
            .getElementById(
                "repairButton"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.repairCity();

                }
            );


        document
            .getElementById(
                "archerButton"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.buyDefense(
                        "archer"
                    );

                }
            );


        document
            .getElementById(
                "cannonButton"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.buyDefense(
                        "cannon"
                    );

                }
            );

    }


    // =====================================================
    // BUY DEFENSE
    // =====================================================

    buyDefense(type) {

        const costs =
            {

                archer: 150,

                cannon: 250

            };


        const cost =
            costs[type];


        if (
            this.gold < cost
        ) {

            this.ui.showNotification(
                "NOT ENOUGH GOLD"
            );

            return;

        }


        this.gold -=
            cost;


        this.defenses.push(
            {

                type,

                level:
                    this.upgradeLevel

            }
        );


        this.score +=
            50;


        this.ui.showNotification(
            `${type.toUpperCase()} DEPLOYED`
        );


        this.updateUI();

    }


    // =====================================================
    // UI
    // =====================================================

    updateUI() {

        this.ui.updateHUD({

            wave:
                this.currentWave,

            gold:
                this.gold,

            kills:
                this.kills,

            score:
                this.score,

            supplies:
                this.supplies,

            cityHP:
                this.cityHP,

            maxCityHP:
                this.maxCityHP,

            upgradeLevel:
                this.upgradeLevel,

            fireRainCooldown:
                this.fireRainCooldown

        });

    }

}
