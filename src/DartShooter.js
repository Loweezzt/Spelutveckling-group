import GameObject from './GameObject.js'
import shooterImage from './assets/Shooter.png'

export default class DartShooter extends GameObject {
    constructor(game, x, y, direction = 1) {
        super(game, x, y, 50, 50)
        this.direction = direction // 1 för höger, -1 för vänster
        this.shootCooldown = 900 // millisekunder mellan skott
        this.shootTimer = 0
        this.color = '#FF6600' // Orange färg som fallback

        // Ladda Shooter sprite
        this.image = new Image()
        this.image.src = shooterImage
        this.image.onload = () => {
            // Sprite loaded successfully
        }
        this.image.onerror = () => {
            console.error('Failed to load shooter sprite from:', shooterImage)
        }
    }

    update(deltaTime) {
        // Uppdatera shoot timer
        this.shootTimer -= deltaTime

        // console.log('DartShooter timer:', this.shootTimer) // DEBUG

        // Skjut när timer är klar
        if (this.shootTimer <= 0) {
            console.log('SHOOTING!') // DEBUG
            this.shoot()
            this.shootTimer = this.shootCooldown
        }
    }

    shoot() {
        // Skapa en projektil från dart shootern
        const projectileX = this.x + this.width / 2
        const projectileY = this.y + this.height / 2

        console.log('Creating projectile at:', projectileX, projectileY) // DEBUG
        this.game.addProjectile(projectileX, projectileY, this.direction)
    }

    draw(ctx, camera = null) {
        // Rita dart shootern med camera offset
        const screenX = camera ? this.x - camera.x : this.x
        const screenY = camera ? this.y - camera.y : this.y

        // Om bilden är laddad, rita den
        if (this.image && this.image.complete && this.image.naturalHeight !== 0) {
            ctx.save()
            
            // Vänd bilden om den skjuter åt vänster
            if (this.direction < 0) {
                ctx.translate(screenX + this.width, screenY)
                ctx.scale(-1, 1)
                ctx.drawImage(this.image, 0, 0, this.width, this.height)
            } else {
                ctx.drawImage(this.image, screenX, screenY, this.width, this.height)
            }
            
            ctx.restore()
        } else {
            // Fallback: Rita som orange box med pil
            ctx.fillStyle = this.color
            ctx.fillRect(screenX, screenY, this.width, this.height)

            // Rita en pil som visar vilket håll den skjuter åt
            ctx.fillStyle = '#FFFFFF'
            if (this.direction > 0) {
                // Pil åt höger
                ctx.fillRect(screenX + 25, screenY + 20, 15, 10)
                ctx.beginPath()
                ctx.moveTo(screenX + 40, screenY + 25)
                ctx.lineTo(screenX + 35, screenY + 20)
                ctx.lineTo(screenX + 35, screenY + 30)
                ctx.fill()
            } else {
                // Pil åt vänster
                ctx.fillRect(screenX + 10, screenY + 20, 15, 10)
                ctx.beginPath()
                ctx.moveTo(screenX + 10, screenY + 25)
                ctx.lineTo(screenX + 15, screenY + 20)
                ctx.lineTo(screenX + 15, screenY + 30)
                ctx.fill()
            }
        }
    }
}
