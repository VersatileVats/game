const monsters = {
    Emby: {
        position: {
            x: 280,
            y: 325
        },
        image: {
            src: './img/embySprite.png'
        },
        frames: {
            max: 4,
            hold: 25
        },
        animate: true,
        name: 'Emby',
        attacks: [attacks.Tackle, attacks.Fireball]
    },
    Dragle: {
        position: {
            x: 800,
            y: 100
        },
        image: {
            src: './img/draggleSprite.png'
        },
        frames: {
            max: 4,
            hold: 25
        },
        animate: true,
        isEnemy: true,
        name: 'Dragle',
        attacks: [attacks.Tackle, attacks.Fireball]
    }
}