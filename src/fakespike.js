import GameObject from './GameObject.js'
import taggImage from './assets/tagg.png'

export default class Fakespikes extends GameObject {
    constructor(game, x, y, width, height) {
        super(game, x, y, width, height)
        this.color = 'red' // Röd fallback

        // Ladda tagg sprite
        this.image = new Image()
        this.image.src = taggImage
        this.image.onload = () => {
            // Sprite loaded successfully
        }
        this.image.onerror = () => {
            console.error('Failed to load tagg sprite from:', taggImage)
        }
    }

    update(deltaTime) {
        // Fakespikes är statiska - gör ingenting
    }

    draw(ctx, camera = null) {
        const screenX = camera ? this.x - camera.x : this.x
        const screenY = camera ? this.y - camera.y : this.y

        // Skala upp tagg-bilden (2x större)
        const scale = 2
        const scaledWidth = this.width * scale
        const scaledHeight = this.height * scale

        // Om tagg-bilden är laddad, rita den
        if (this.image && this.image.complete && this.image.naturalHeight !== 0) {
            ctx.drawImage(
                this.image,
                screenX - (scaledWidth - this.width) / 2,
                screenY - (scaledHeight - this.height) / 2,
                scaledWidth,
                scaledHeight
            )
        } else {
            // Fallback: Rita som röd rektangel om tagg-bilden inte laddats
            ctx.fillStyle = this.color
            ctx.fillRect(screenX, screenY, this.width, this.height)
        }
    }
}