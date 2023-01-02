const CANVAS = document.querySelector('canvas')
const ctx = CANVAS.getContext('2d')

const width = CANVAS.width = 1024
const height = CANVAS.height = 576

// My logic to make the 1D collisions array into a 2D resulting array
// console.log(collisions)
// let testArray = []
// let resultArray = []

// collisions.forEach((el, index) => {
//     testArray.push((el && el%1025 == 0) ? 1 : 0)
//     if(!((index + 1) % 70))  {
//         resultArray.push(testArray)
//         testArray = []
//     }
// });
// console.log(resultArray)

let collisionMap = []
for(let i=0; i<collisions.length; i+=70) {
    collisionMap.push(collisions.slice(i, i+70))
}

let battleZonesMap = []
for(let i=0; i<battleZonesData.length; i+=70) {
    battleZonesMap.push(battleZonesData.slice(i, i+70))
}

const offset = {
    x: -740,
    y: -600
}

// there are a total of 185 collision block 
const boundaries = []
collisionMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if(symbol === 1025)
            boundaries.push(
                new Boundary({
                position: {
                    x: j * Boundary.width + offset.x ,
                    y: i * Boundary.height + offset.y  
                }
            }))
    })
})

const battleZones = []
battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if(symbol === 1025)
            battleZones.push(
                new Boundary({
                position: {
                    x: j * Boundary.width + offset.x ,
                    y: i * Boundary.height + offset.y  
                }
            }))
    })
})

const image = new Image()
image.src = './img/village.png'

const foregroundImage = new Image()
foregroundImage.src = './img/foreground.png'

const playerImage = new Image()
playerImage.src = './img/playerDown.png'

const playerImageUp = new Image()
playerImageUp.src = './img/playerUp.png'

const playerImageLeft = new Image()
playerImageLeft.src = './img/playerLeft.png'

const playerImageRight = new Image()
playerImageRight.src = './img/playerRight.png'

const player = new Sprite({
    position: {
    // 192*68 is the dimension of the playerDown.png
    x: CANVAS.width / 2 - (192 / 4) / 2 ,
    y: CANVAS.height / 2 - 68 / 2 +20, 
    },
    image: playerImage,
    frames: {
        max: 4,
        hold: 10
    },
    sprites:  {
        down: playerImage,
        up: playerImageUp,
        left: playerImageLeft,
        right: playerImageRight
    }
})

const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
})

const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImage
})

const keys = {
    up:     {    pressed: false   },
    down:   {    pressed: false   },
    left:   {    pressed: false   },
    right:  {    pressed: false   }
}

const movables = [background, ...boundaries, foreground, ...battleZones]

const rectColiision = ({ rect1, rect2 }) => {
    return (
        // for right side detection
        rect1.position.x + rect1.width >= rect2.position.x && 
        // for left side detection
        rect1.position.x <= rect2.position.x + rect2.width &&
        // for topside detection (upside)
        rect1.position.y <= rect2.position.y + rect2.height &&
        // for downside detection
        rect1.position.y + rect1.height >= rect2.position.y
    )
}

const battle = {
    initiated: false
}

function animate() {
    const animationId = window.requestAnimationFrame(animate);

    // you can see that the layers are drawn according to the way they have to be rendered onto the screen
    background.draw();
    // not used rectCollision() becuase we have to predict the collision in future & have
    // to break from the loop (forEach doesn't allow to break the iteration)
    boundaries.forEach(boundary => {
        boundary.draw()
    })
    battleZones.forEach(battleZone => {
        battleZone.draw()
    })
    player.draw()
    foreground.draw()

    let moving = true
    player.animate = false
    // console.log("Animation Frmae ID is:" + animationId)

    // below code should only work when the battle is not initiated
    if(battle.initiated) return

    // battle activation
    if(keys.up.pressed || keys.down.pressed || keys.left.pressed || keys.right.pressed) {
        for (let i=0; i<battleZones.length; i++) {
            const battleZone = battleZones[i]
            const overlappingArea = 
                (
                    Math.min(player.position.x + player.width,battleZone.position.x + battleZone.width) -
                    Math.max(player.position.x,battleZone.position.x)
                ) *
                (
                    Math.min(player.position.y + player.height,battleZone.position.y + battleZone.height) -
                    Math.max(player.position.y,battleZone.position.y)
                )
            if(
                rectColiision({
                rect1: player,
                rect2: battleZone
                }) &&
                // overlappingArea will be small in comparision to total area of player (that is why / by 2)
                overlappingArea > player.width * player.height / 2
                &&
                Math.random() <0.01
            ) {
                audio.map.stop()
                audio.initBattle.play()
                audio.battle.play()
                // de-activate the old animation loop
                window.cancelAnimationFrame(animationId)
                console.log("Battle Zone Activated")
                battle.initiated = true
                gsap.to('#overlappingDiv', {
                    opacity: 1,
                    repeat: 4,
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                        // activate a new animation loop
                        initBattle()
                        animateBattle()
                        gsap.to('#overlappingDiv', {
                            opacity: 0,
                            duration: 0.4
                        })
                    }
                })
                break
            }
        }
    }

    // that is why using the collision detection when keys are pressed
    if(keys.up.pressed && lastKey === 'up') {
        player.image = player.sprites.up
        player.animate = true
        for (let i=0; i<boundaries.length; i++) {
            const boundary = boundaries[i]
            if(rectColiision({
                rect1: player,
                rect2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x,
                        y: boundary.position.y + 3
                    }
                }
            })) {
                // console.log("Collision Detected")
                moving = false
                break
            }
        }
        if(moving)
            movables.forEach(movable => {
                movable.position.y += 3
            })
    } else if(keys.down.pressed && lastKey === 'down') {
        player.image = player.sprites.down
        player.animate = true
        for (let i=0; i<boundaries.length; i++) {
            const boundary = boundaries[i]
            if(rectColiision({
                rect1: player,
                rect2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x,
                        y: boundary.position.y - 3
                    }
                }
            })) {
                // console.log("Collision Detected")
                moving = false
                break
            }
        }
        if(moving)
            movables.forEach(movable => {
                movable.position.y-= 3
            })
    } else if(keys.left.pressed && lastKey === 'left') {
        player.image = player.sprites.left
        player.animate = true
        for (let i=0; i<boundaries.length; i++) {
            const boundary = boundaries[i]
            if(rectColiision({
                rect1: player,
                rect2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x + 3,
                        y: boundary.position.y
                    }
                }
            })) {
                // console.log("Collision Detected")
                moving = false
                break
            }
        }
        if(moving)
            movables.forEach(movable => {
                movable.position.x += 3
            })
    } else if(keys.right.pressed && lastKey === 'right') {
        player.image = player.sprites.right
        player.animate = true
        for (let i=0; i<boundaries.length; i++) {
            const boundary = boundaries[i]
            if(rectColiision({
                rect1: player,
                rect2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x - 3,
                        y: boundary.position.y
                    }
                }
            })) {
                // console.log("Collision Detected")
                moving = false
                break
            }
        }
        if(moving)
            movables.forEach(movable => {
                movable.position.x -= 3
            })
    }
} 

let lastKey = ''
window.addEventListener('keydown',(e) =>{
    switch(e.key) {
        case 'ArrowUp':
            keys.up.pressed = true
            lastKey = 'up'
            break;
        case 'ArrowDown':
            keys.down.pressed = true
            lastKey = 'down'
            break;
        case 'ArrowLeft':
            keys.left.pressed = true
            lastKey = 'left'
            break;
        case 'ArrowRight':
            keys.right.pressed = true
            lastKey = 'right'
            break;        
    }
})

window.addEventListener('keyup',(e) =>{
    switch(e.key) {
        case 'ArrowUp':
            keys.up.pressed = false
            break;
        case 'ArrowDown':
            keys.down.pressed = false
            break;
        case 'ArrowLeft':
            keys.left.pressed = false
            break;
        case 'ArrowRight':
            keys.right.pressed = false
            break;        
    }
})

let clicked = false
window.addEventListener('click', () => {
    if(!clicked) {
        audio.map.play()
        clicked = true
    }
})