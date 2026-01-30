import GameObject from './GameObject.js'

export default class Fakespikes extends GameObject {
    constructor(game, x, y, width, height) {
        super(game, x, y, width, height)
        this.color = 'red' // Röd färg
    }

    update(deltaTime) {
        // Fakespikes är statiska - gör ingenting
    }

    draw(ctx, camera = null) {
        const screenX = camera ? this.x - camera.x : this.x
        const screenY = camera ? this.y - camera.y : this.y

        // Rita som en röd rektangel
        ctx.fillStyle = this.color
        ctx.fillRect(screenX, screenY, this.width, this.height)
    }
}