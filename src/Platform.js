import GameObject from './GameObject.js'
import terrainSprite from './assets/terrain.png'

export default class Platform extends GameObject {
    constructor(game, x, y, width, height, color = '#8B4513') {
        super(game, x, y, width, height)
        this.color = color

        this.image = new Image()
        this.image.onload = () => {
            // Sprite loaded successfully
        }
        this.image.onerror = () => {
            console.error('Failed to load terrain sprite from:', terrainSprite)
        }
        this.image.src = terrainSprite
        this.originalTileSize = 16
        this.scale = 2
        this.tileSize = this.originalTileSize * this.scale
    }

    update(deltaTime) {
        // Plattformar är statiska, gör inget
    }

    draw(ctx, camera = null) {
        // Beräkna screen position (om camera finns)
        const screenX = camera ? this.x - camera.x : this.x
        const screenY = camera ? this.y - camera.y : this.y

        // Om bilden är laddad, rita sprite
        if (this.image.complete && this.image.naturalHeight !== 0) {
            for (let i = 0; i < this.width; i += this.tileSize) {
                for (let j = 0; j < this.height; j += this.tileSize) {
                    // Övre-center tile på toppen, mitten tile på resten
                    let spriteX = 16
                    let spriteY = (j === 0) ? 0 : 16

                    const destW = Math.min(this.tileSize, this.width - i)
                    const destH = Math.min(this.tileSize, this.height - j)

                    // Flytta spriten uppåt med en offset
                    const spriteYOffset = -13

                    ctx.drawImage(
                        this.image,
                        spriteX, spriteY,
                        this.originalTileSize, this.originalTileSize,
                        screenX + i, screenY + j + spriteYOffset,
                        destW, destH
                    )
                }
            }
        } else {
            // Fallback: Rita som färgad rektangel om sprite inte laddats
            ctx.fillStyle = this.color
            ctx.fillRect(screenX, screenY, this.width, this.height)
        }
    }
}