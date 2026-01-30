import GameObject from './GameObject.js'
import terrainSprite from './assets/terrain.png'

export default class Rectangle extends GameObject {
    constructor(game, x, y, width, height, color = 'green') {
        super(game, x, y, width, height)
        this.color = color

        // Ladda terrain sprite
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

        // Hastighet (pixels per millisekund)
        this.velocityX = 0
        this.velocityY = 0
        
        // Studs-faktor (1.0 = perfekt studs, 0.8 = tappar energi)
        this.bounce = 1.0
    }

    update(deltaTime) {
        // Boxar uppdateras inte - de är stationära
        // De försvinner när spelaren kommer tillräckligt nära (hanteras i Game.js)
    }

    draw(ctx, camera = null) {
        // Rita rektangeln med camera offset om camera finns
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

    // Hantera kollision med plattformar (samma som Player)
    handlePlatformCollision(platform) {
        if (!this.intersects(platform)) return

        // Beräkna överlappen i alla riktningar
        const overlapLeft = (this.x + this.width) - platform.x
        const overlapRight = (platform.x + platform.width) - this.x
        const overlapTop = (this.y + this.height) - platform.y
        const overlapBottom = (platform.y + platform.height) - this.y

        // Hitta minsta överlapning
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)

        if (minOverlap === overlapTop && this.velocityY >= 0) {
            // Faller ner på plattformen
            this.y = platform.y - this.height
            this.velocityY = 0
        } else if (minOverlap === overlapBottom && this.velocityY < 0) {
            // Slår huvudet på plattformen
            this.y = platform.y + platform.height
            this.velocityY = 0
        } else if (minOverlap === overlapLeft && this.velocityX > 0) {
            // Kolliderar från vänster
            this.x = platform.x - this.width
            this.velocityX = -this.velocityX * this.bounce
        } else if (minOverlap === overlapRight && this.velocityX < 0) {
            // Kolliderar från höger
            this.x = platform.x + platform.width
            this.velocityX = -this.velocityX * this.bounce
        }
    }
}