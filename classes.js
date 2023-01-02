class Sprite {
    constructor({
            position, 
            image, 
            // hold is for the frames per second (drames before animating)
            frames = {max: 1, hold: 10}, 
            sprites, 
            animate = false,
            rotation = 0
        }) {
        this.position = position
        this.image = new Image()
        this.frames = {...frames, val: 0, elapsed: 0}

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }
        this.image.src = image.src
        this.animate = animate
        this.sprites = sprites
        this.opacity = 1
        this.rotation = rotation
    } 

    draw() {
        // global properties affect the context content btw save and restore()
        ctx.save()
        ctx.translate(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2
        )
        ctx.rotate(this.rotation)
        ctx.translate(
            -this.position.x - this.width / 2,
            -this.position.y - this.height / 2
        )
        ctx.globalAlpha = this.opacity
        ctx.drawImage(
            // 192*68 is the dimension of the down player png (192/4 = 48)
            this.image, 
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,        
            this.image.width / this.frames.max ,
            this.image.height
        )
        ctx.restore()

        if(!this.animate) return
        
        if(this.frames.max > 1) {
            this.frames.elapsed++
        }

        if(this.frames.elapsed % this.frames.hold == 0) {
            // as there are only 4 frames available, so we want the frames.val to be 0,1,2
            // in this manner, for val = 2, we increased the frame three times (iterating the fourth sprite also)
            if(this.frames.val < this.frames.max - 1) this.frames.val++
            else this.frames.val = 0
        }
    }
}

class Monster extends Sprite {
    constructor({
            position, 
            image, 
            // hold is for the frames per second (drames before animating)
            frames = {max: 1, hold: 10}, 
            sprites, 
            animate = false,
            rotation = 0,
            // monster-specific things
            isEnemy = false,
            name,
            attacks
        }) {
            super({
                position, 
                image, 
                frames, 
                sprites, 
                animate,
                rotation,
            })
            this.isEnemy = isEnemy,
            this.health = 100
            this.name = name,
            this.attacks = attacks
        }

    faint() {
        document.querySelector('#dialogBox').innerHTML = this.name + ' fainted! '
        gsap.to(this.position, {
            y: this.position.y + 20
        })
        gsap.to(this, {
            opacity: 0
        })
        audio.battle.stop()
        audio.victory.play()
    }

    attack({attackData, recipient, renderedSprites}) {
        document.querySelector('#dialogBox').style.display = 'block'
        document.querySelector('#dialogBox').innerHTML = this.name + ' used ' + attackData.name

        let healthBar = '#dragleHealthBar'
        if(this.isEnemy) healthBar = '#embyHealthBar'

        const str = recipient.image.src.split("/")
        console.log(str[str.length - 1])
        recipient.health -= attackData.damage
        console.log(recipient.health)

        let rotation = 1
        if(this.isEnemy) rotation = -2.2
        
        switch(attackData.name) {
            case 'Tackle':
                // moving the sprite to a different position
                const timeline = gsap.timeline()

                let movementDistance = 20
                if(this.isEnemy) movementDistance = -20

                timeline.to(this.position, {
                    x: this.position.x - movementDistance
                }).to(this.position, {
                    x: this.position.x + movementDistance * 2,
                    duration: 0.1,
                    // enemy (dragle) gets hit
                    onComplete: () => {
                        audio.tackleHit.play()
                        gsap.to(healthBar, {
                            // can use this because we have made the onComplete function an arrow function
                            // this will point to dragleHealthBar (the section which the to() is pointing to)
                            width: recipient.health + '%'
                        }) 
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                        gsap.to(recipient, {
                            opacity: 0.2,
                            // repeat means that the opacity property will be chaged 5+1 = 6 times
                            // in simple words, repeat means No of Iterations (default is 0 ie 1 iteration)
                            // using repeat (without yoyo) means that the opacity will always be 0.2
                            repeat: 5,
                            // yoyo makes sure that every repeat will go in opposite direction
                            // 1: 1to.2 | 2: .2to1 | 3: 1to.2 | 4: .2to1 | 5: 1to.2 | 6: .2to1
                            yoyo: true,
                            duration: 0.08
                        })
                    }
                }).to(this.position, {
                    x: this.position.x
                })
                break;

            case 'Fireball':
                audio.initFireball.play()
                const fireballImage = new Image()
                fireballImage.src = './img/fireball.png'
                const fireball = new Sprite({
                    position: {
                        // used this as the position coordinates are for the starting position of the fireball
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: fireballImage,
                    frames: {
                        max: 4,
                        hold: 10
                    },
                    animate: true,
                    // as the key value has the same name as that of property 
                    rotation
                })
                
                renderedSprites.splice(1,0, fireball)

                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {
                        audio.fireballHit.play()
                        gsap.to(healthBar, {
                            // can use this because we have made the onComplete function an arrow function
                            // this will point to dragleHealthBar (the section which the to() is pointing to)
                            width: recipient.health + '%'
                        }) 
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                        gsap.to(recipient, {
                            opacity: 0.2,
                            // repeat means that the opacity property will be chaged 5+1 = 6 times
                            // in simple words, repeat means No of Iterations (default is 0 ie 1 iteration)
                            // using repeat (without yoyo) means that the opacity will always be 0.2
                            repeat: 5,
                            // yoyo makes sure that every repeat will go in opposite direction
                            // 1: 1to.2 | 2: .2to1 | 3: 1to.2 | 4: .2to1 | 5: 1to.2 | 6: .2to1
                            yoyo: true,
                            duration: 0.08
                        })
                        renderedSprites.splice(1,1)
                    }
                })
                break;
        }
    }
}

class Boundary {
    // initially we used a 12*12 px tileset, but we imported the map with 400% zoom
    // that increased the tileset image to 12*4 = 48px
    static width = 48
    static height = 48
    constructor({position}) {
        this.position = position
        this.width = 48
        this.height = 48
    }

    draw() {
        ctx.fillStyle = 'rgba(255,0,0,0)'
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}