// =========================================================
// SIEGE OF CONSTANTINOPLE V3
// UI SYSTEM
// =========================================================

export class UI {

    constructor() {

        this.elements = {};

        this.cacheElements();

    }


    // =====================================================
    // CACHE
    // =====================================================

    cacheElements() {

        const ids = [

            "loadingScreen",
            "loadingBar",
            "loadingText",

            "startScreen",
            "gameScreen",

            "gameOverScreen",
            "victoryScreen",

            "waveDisplay",
            "goldDisplay",
            "killDisplay",
            "scoreDisplay",
            "suppliesDisplay",

            "cityHpBar",
            "cityHpText",

            "fireRainStatus",
            "upgradeCost",

            "startWaveButton",

            "waveAnnouncement",
            "announcementTitle",
            "announcementSubtitle",

            "notification",
            "notificationText",

            "pauseOverlay",

            "damageLayer",

            "finalWave",
            "finalKills",
            "finalScore",

            "victoryWave",
            "victoryKills",
            "victoryScore"

        ];


        ids.forEach(id => {

            this.elements[id] =
                document.getElementById(id);

        });

    }


    // =====================================================
    // LOADING
    // =====================================================

    setLoadingProgress(
        percent,
        text
    ) {

        if (
            this.elements.loadingBar
        ) {

            this.elements.loadingBar.style.width =
                `${percent}%`;

        }


        if (
            this.elements.loadingText
        ) {

            this.elements.loadingText.textContent =
                text;

        }


        if (
            percent >= 100
        ) {

            setTimeout(
                () => {

                    this.elements.loadingScreen
                        ?.classList
                        .remove("active");

                },
                450
            );

        }

    }


    // =====================================================
    // SCREEN
    // =====================================================

    showScreen(id) {

        const screens = [

            "loadingScreen",
            "startScreen",
            "gameScreen",
            "gameOverScreen",
            "victoryScreen"

        ];


        screens.forEach(
            screenId => {

                const element =
                    this.elements[screenId];


                if (!element) {
                    return;
                }


                if (
                    screenId === id
                ) {

                    element.classList.add(
                        "active"
                    );

                }
                else {

                    element.classList.remove(
                        "active"
                    );

                }

            }
        );

    }


    // =====================================================
    // HUD
    // =====================================================

    updateHUD(data) {

        this.setText(
            "waveDisplay",
            data.wave
        );


        this.setText(
            "goldDisplay",
            data.gold
        );


        this.setText(
            "killDisplay",
            data.kills
        );


        this.setText(
            "scoreDisplay",
            data.score
        );


        this.setText(
            "suppliesDisplay",
            data.supplies
        );


        // -------------------------------------------------
        // CITY HP
        // -------------------------------------------------

        if (
            this.elements.cityHpBar
        ) {

            const percent =
                Math.max(
                    0,
                    Math.min(
                        100,
                        (
                            data.cityHP /
                            data.maxCityHP
                        ) * 100
                    )
                );


            this.elements.cityHpBar.style.width =
                `${percent}%`;


            if (percent > 60) {

                this.elements.cityHpBar.style.background =
                    "#7fbd62";

            }
            else if (percent > 30) {

                this.elements.cityHpBar.style.background =
                    "#d7a94d";

            }
            else {

                this.elements.cityHpBar.style.background =
                    "#b84235";

            }

        }


        this.setText(
            "cityHpText",
            `${Math.ceil(data.cityHP)} / ${data.maxCityHP}`
        );


        // -------------------------------------------------
        // UPGRADE
        // -------------------------------------------------

        if (
            this.elements.upgradeCost
        ) {

            this.elements.upgradeCost.textContent =
                100 * data.upgradeLevel;

        }


        // -------------------------------------------------
        // FIRE RAIN
        // -------------------------------------------------

        if (
            this.elements.fireRainStatus
        ) {

            if (
                data.fireRainCooldown <= 0
            ) {

                this.elements.fireRainStatus.textContent =
                    "READY";

            }
            else {

                this.elements.fireRainStatus.textContent =
                    `${Math.ceil(
                        data.fireRainCooldown
                    )}s`;

            }

        }


        // -------------------------------------------------
        // WAVE BUTTON
        // -------------------------------------------------

        if (
            this.elements.startWaveButton
        ) {

            this.elements.startWaveButton.disabled =
                data.waveActive;

        }

    }


    // =====================================================
    // TEXT
    // =====================================================

    setText(
        id,
        value
    ) {

        if (
            this.elements[id]
        ) {

            this.elements[id].textContent =
                value;

        }

    }


    // =====================================================
    // WAVE ANNOUNCEMENT
    // =====================================================

    announceWave(
        wave,
        subtitle,
        duration = 1800
    ) {

        const box =
            this.elements.waveAnnouncement;


        if (!box) {
            return;
        }


        this.setText(
            "announcementTitle",
            `WAVE ${this.toRoman(wave)}`
        );


        this.setText(
            "announcementSubtitle",
            subtitle
        );


        box.classList.add(
            "show"
        );


        setTimeout(
            () => {

                box.classList.remove(
                    "show"
                );

            },
            duration
        );

    }


    // =====================================================
    // NOTIFICATION
    // =====================================================

    showNotification(
        message,
        duration = 1600
    ) {

        const box =
            this.elements.notification;


        const text =
            this.elements.notificationText;


        if (!box || !text) {
            return;
        }


        text.textContent =
            message;


        box.classList.add(
            "show"
        );


        clearTimeout(
            this.notificationTimer
        );


        this.notificationTimer =
            setTimeout(
                () => {

                    box.classList.remove(
                        "show"
                    );

                },
                duration
            );

    }


    // =====================================================
    // DAMAGE NUMBER
    // =====================================================

    damageNumber(
        amount,
        mesh
    ) {

        const layer =
            this.elements.damageLayer;


        if (
            !layer ||
            !mesh
        ) {
            return;
        }


        const camera =
            window.SiegeGame
                ?.world
                ?.getCamera();


        const renderer =
            window.SiegeGame
                ?.world
                ?.getRenderer();


        if (
            !camera ||
            !renderer
        ) {
            return;
        }


        const position =
            mesh.position.clone();


        position.y += 2.5;


        position.project(
            camera
        );


        const rect =
            renderer
                .domElement
                .getBoundingClientRect();


        const x =
            (
                position.x *
                0.5 +
                0.5
            ) *
            rect.width;


        const y =
            (
                -position.y *
                0.5 +
                0.5
            ) *
            rect.height;


        const element =
            document.createElement(
                "div"
            );


        element.className =
            "damage-number";


        element.textContent =
            `-${Math.round(amount)}`;


        element.style.left =
            `${x}px`;


        element.style.top =
            `${y}px`;


        layer.appendChild(
            element
        );


        setTimeout(
            () => {

                element.remove();

            },
            900
        );

    }


    // =====================================================
    // PAUSE
    // =====================================================

    showPause(
        visible
    ) {

        if (
            this.elements.pauseOverlay
        ) {

            this.elements.pauseOverlay
                .classList
                .toggle(
                    "show",
                    visible
                );

        }

    }


    // =====================================================
    // FINAL
    // =====================================================

    setFinalStats(
        wave,
        kills,
        score
    ) {

        this.setText(
            "finalWave",
            wave
        );


        this.setText(
            "finalKills",
            kills
        );


        this.setText(
            "finalScore",
            score
        );

    }


    setVictoryStats(
        wave,
        kills,
        score
    ) {

        this.setText(
            "victoryWave",
            wave
        );


        this.setText(
            "victoryKills",
            kills
        );


        this.setText(
            "victoryScore",
            score
        );

    }


    // =====================================================
    // ROMAN NUMERALS
    // =====================================================

    toRoman(number) {

        const values = [

            [1000, "M"],
            [900, "CM"],
            [500, "D"],
            [400, "CD"],
            [100, "C"],
            [90, "XC"],
            [50, "L"],
            [40, "XL"],
            [10, "X"],
            [9, "IX"],
            [5, "V"],
            [4, "IV"],
            [1, "I"]

        ];


        let result = "";
        let n = number;


        for (
            const [value, symbol]
            of values
        ) {

            while (
                n >= value
            ) {

                result += symbol;
                n -= value;

            }

        }


        return result;

    }

}
