// =========================================================
// SIEGE OF CONSTANTINOPLE V3
// MAIN ENTRY
// =========================================================

import * as THREE from "three";

import { World } from "./world.js";
import { Game } from "./game.js";
import { UI } from "./ui.js";


// =========================================================
// GLOBAL
// =========================================================

window.THREE = THREE;


// =========================================================
// APPLICATION
// =========================================================

class SiegeGame {

    constructor() {

        this.world = null;
        this.game = null;
        this.ui = null;

        this.started = false;

        this.clock = new THREE.Clock();

    }


    // =====================================================
    // INITIALIZE
    // =====================================================

    async init() {

        console.log(
            "%cSIEGE OF CONSTANTINOPLE V3",
            "font-size:20px;font-weight:bold;"
        );

        console.log("Initializing 3D engine...");


        this.ui = new UI();

        this.ui.setLoadingProgress(
            20,
            "INITIALIZING 3D ENGINE..."
        );


        // -------------------------------------------------
        // WORLD
        // -------------------------------------------------

        this.world = new World(
            document.getElementById("gameCanvas")
        );

        await this.world.init();


        this.ui.setLoadingProgress(
            60,
            "BUILDING CONSTANTINOPLE..."
        );


        // -------------------------------------------------
        // GAME
        // -------------------------------------------------

        this.game = new Game(
            this.world,
            this.ui
        );

        await this.game.init();


        this.ui.setLoadingProgress(
            85,
            "PREPARING DEFENSES..."
        );


        // -------------------------------------------------
        // EVENTS
        // -------------------------------------------------

        this.setupEvents();


        this.ui.setLoadingProgress(
            100,
            "BATTLEFIELD READY"
        );


        // -------------------------------------------------
        // SHOW START SCREEN
        // -------------------------------------------------

        setTimeout(() => {

            this.ui.showScreen("startScreen");

        }, 500);


        // -------------------------------------------------
        // LOOP
        // -------------------------------------------------

        this.animate();

    }


    // =====================================================
    // EVENTS
    // =====================================================

    setupEvents() {

        const startButton =
            document.getElementById("startButton");

        const restartButton =
            document.getElementById("restartButton");

        const victoryRestartButton =
            document.getElementById(
                "victoryRestartButton"
            );


        // START

        startButton?.addEventListener(
            "click",
            () => {

                this.startGame();

            }
        );


        // RESTART

        restartButton?.addEventListener(
            "click",
            () => {

                this.restartGame();

            }
        );


        victoryRestartButton?.addEventListener(
            "click",
            () => {

                this.restartGame();

            }
        );


        // -------------------------------------------------
        // KEYBOARD
        // -------------------------------------------------

        window.addEventListener(
            "keydown",
            event => {

                if (
                    event.key.toLowerCase() === "p"
                ) {

                    this.game.togglePause();

                }


                if (
                    event.key === " "
                ) {

                    event.preventDefault();

                    this.game.startNextWave();

                }


                if (
                    event.key.toLowerCase() === "f"
                ) {

                    this.game.useFireRain();

                }


                if (
                    event.key.toLowerCase() === "r"
                ) {

                    this.game.repairCity();

                }


                if (
                    event.key.toLowerCase() === "u"
                ) {

                    this.game.upgradeDefenses();

                }

            }
        );


        // -------------------------------------------------
        // WINDOW RESIZE
        // -------------------------------------------------

        window.addEventListener(
            "resize",
            () => {

                this.world.resize();

            }
        );


        // -------------------------------------------------
        // VISIBILITY
        // -------------------------------------------------

        document.addEventListener(
            "visibilitychange",
            () => {

                if (
                    document.hidden &&
                    this.started
                ) {

                    this.game.pause();

                }

            }
        );

    }


    // =====================================================
    // START
    // =====================================================

    startGame() {

        if (this.started) {
            return;
        }

        this.started = true;

        console.log(
            "⚔ Siege started."
        );


        this.ui.showScreen(
            "gameScreen"
        );


        this.game.start();


        // Small cinematic delay

        setTimeout(() => {

            this.ui.announceWave(
                1,
                "THE OTTOMAN ARMY APPROACHES",
                2200
            );

        }, 800);

    }


    // =====================================================
    // RESTART
    // =====================================================

    restartGame() {

        console.log(
            "Restarting siege..."
        );


        this.started = true;

        this.ui.showScreen(
            "gameScreen"
        );


        this.game.restart();

    }


    // =====================================================
    // MAIN LOOP
    // =====================================================

    animate() {

        requestAnimationFrame(
            () => this.animate()
        );


        const delta =
            Math.min(
                this.clock.getDelta(),
                0.05
            );


        // -------------------------------------------------
        // WORLD
        // -------------------------------------------------

        if (this.world) {

            this.world.update(
                delta
            );

        }


        // -------------------------------------------------
        // GAME
        // -------------------------------------------------

        if (
            this.game &&
            this.started
        ) {

            this.game.update(
                delta
            );

        }

    }

}


// =========================================================
// BOOT
// =========================================================

window.addEventListener(
    "DOMContentLoaded",
    () => {

        const app =
            new SiegeGame();

        window.SiegeGame =
            app;

        app.init()
            .catch(error => {

                console.error(
                    "V3 INITIALIZATION ERROR:",
                    error
                );

            });

    }
);
