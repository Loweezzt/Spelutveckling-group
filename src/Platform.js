import GameObject from './GameObject.js'
// nytt
import terrainSprite from './assets/terrain.png'

export default class Platform extends GameObject {
    constructor(game, x, y, width, height, color = '#8B4513') {
        super(game, x, y, width, height)
        this.color = color

        // nytt
        this.image = new Image()
        this.image.src = terrainSprite
        this.originalTileSize = 16
        this.scale = 2 // så varje bricka blir 32x32 i spel
        this.tileSize = this.originalTileSize * this.scale
    }

    update(deltaTime) {
        // Plattformar är statiska, gör inget
    }

    draw(ctx, camera = null) {
        // Beräkna screen position (om camera finns)
        const screenX = camera ? this.x - camera.x : this.x
        const screenY = camera ? this.y - camera.y : this.y

        // nytt
        for (let i = 0; i < this.width; i += this.tileSize) {
            for (let j = 0; j < this.height; j += this.tileSize) {
                let spriteX = 112
                let spriteY = (j === 0) ? 0 : 16

                const destW = Math.min(this.tileSize, this.width - i)
                const destH = Math.min(this.tileSize, this.height - j)

                ctx.drawImage(
                    this.image,
                    spriteX, spriteY,
                    this.originalTileSize, this.originalTileSize,
                    screenX + i, screenY + j,
                    destW, destH
                )
            }
        }
    }
}