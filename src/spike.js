import GameObject from "./GameObject.js";
import spikeImg from './assets/spikes.png'

export default class Spike extends GameObject {
    constructor(game, x, y) {
        super(game, x, y, 32, 16)
        this.loadSprite('idle', spikeImg, 3, 0, 0)
        this.loadSprite('snap', spikeImg, 3, 0, 3, 15)
        this.loadSprite('done', spikeImg, 3, 2, 2)

        this.setAnimation('idle')

        this.triggered = false
        this.damage = 100
        
        this.onAnimationComplete = (animName) => {
            if (animName === 'snap') {
                this.setAnimation('done')
            }
        }
    }

    update(deltaTime) {
        if (!this.triggered) {
            if (this.intersects(this.game.player)) {
                this.snapShut()
            }
        } 

        this.updateAnimation(deltaTime)
    }

    snapShut() {
        this.triggered = true
        this.game.player.takeDamage(this.damage)

        this.setAnimation('snap')
    }

    draw(ctx, camera) {
        this.drawSprite(ctx, camera)

        if (this.game.debug) {
            const screenX = this.x - camera.x
            const screenY = this.y - camera.y
            
            ctx.save()
            ctx.strokeStyle = 'yellow'
            ctx.lineWidth = 2
            ctx.strokeRect(screenX, screenY, this.width, this.height)
            ctx.restore()
        }
    }
}