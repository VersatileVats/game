const battleBackgroundImage = new Image()
battleBackgroundImage.src = './img/battleBackground.png'

const battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    image: battleBackgroundImage
})

let dragle
let emby
let battleId
let queue
let renderedSprites 

function backToAnimateLooop() {
    // fade back to black
    queue.push(() => {
        gsap.to('#overlappingDiv', {
            opacity: 1,
            onComplete: () => {
                audio.map.play()
                cancelAnimationFrame(battleId)
                document.querySelector('#userInterface').style.display = 'none'
                battle.initiated = false
                animate()
                gsap.to('#overlappingDiv', {
                    opacity: 0
                })
            }
        })
    })
}

function initBattle() {
    document.querySelector('#userInterface').style.display = 'block'
    document.querySelector('#dialogBox').style.display = 'none'
    document.querySelector('#dragleHealthBar').style.width = '100%'
    document.querySelector('#embyHealthBar').style.width = '100%'
    document.querySelector('#attacksBox').replaceChildren()

    dragle = new Monster(monsters.Dragle)
    emby = new Monster(monsters.Emby)
    renderedSprites= [dragle, emby]
    
    queue = []

    emby.attacks.forEach((attack) => {
        const button = document.createElement('button')
        button.innerHTML = attack.name
        document.querySelector('#attacksBox').append(button)
    })

    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            emby.attack({
                attackData: attacks[e.currentTarget.innerHTML],
                recipient: dragle,
                renderedSprites
            })
    
            if(dragle.health <= 0) {
                queue.push(() => {
                    dragle.faint()
                })
                backToAnimateLooop()
            }
            // dragle (enemy) attacks after ours
            const randomAttack = dragle.attacks[Math.floor(Math.random() * dragle.attacks.length)]
    
            queue.push(() => {
                dragle.attack({
                    attackData: randomAttack,
                    recipient: emby,
                    renderedSprites
                })
            })
        })
        button.addEventListener('mouseenter', (e) => {
            document.querySelector('#attackType').innerHTML = attacks[e.currentTarget.innerHTML].type
            document.querySelector('#attackType').style.color = attacks[e.currentTarget.innerHTML].color
        })
    })
    
}

function animateBattle() {
    battleId = window.requestAnimationFrame(animateBattle)
    battleBackground.draw()
    renderedSprites.forEach(sprite => {
        sprite.draw()
    })
}

animate()
// initBattle()
// animateBattle()

document.querySelector('#dialogBox').addEventListener('click', (e) => {
    if(queue.length > 0) {
        queue[0]()
        queue.shift()
        if(emby.health <= 0) {
            emby.faint()
            backToAnimateLooop()
        }
    } else e.currentTarget.style.display = 'none'
})