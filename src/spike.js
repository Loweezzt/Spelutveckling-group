import GameObject from './GameObject.js'
import taggImage from './assets/tagg.png'

export default class Spike extends GameObject {
    constructor(game, x, y, width = 32, height = 16, patrolDistance = null) {
        super(game, x, y, width, height)
        this.color = 'red' // Röd fallback
        
        // Hitbox (mycket liten, bara i spetsen på taggen)
        this.hitboxWidth = 10  // Smal hitbox (bara spetsen)
        this.hitboxHeight = 2  // Väldigt liten höjd för collision
        this.hitboxOffsetX = 11 // Centrerad horisontellt (width 32, så (32-10)/2 = 11)
        this.hitboxOffsetY = 13 // Offset långt neråt (bara spetsen)
        
        // Ladda tagg sprite
        this.image = new Image()
        this.image.src = taggImage
        this.image.onload = () => {
            // Sprite loaded successfully
        }
        this.image.onerror = () => {
            console.error('Failed to load tagg sprite from:', taggImage)
        }
        
        // Fysik
        this.velocityX = 0
        this.velocityY = 0
        this.isGrounded = false
        
        // Patrol AI
        this.startX = x
        this.patrolDistance = patrolDistance
        this.endX = patrolDistance !== null ? x + patrolDistance : null
        this.speed = 0.1
        this.direction = 1 // 1 = höger, -1 = vänster
        
        this.damage = 1 // Hur mycket skada fienden gör
        
        // TODO: Ladda sprites här
        // Använd this.loadSprite() metoden från GameObject
        // Exempel: this.loadSprite('idle', idleSprite, frames, frameInterval)
        
        this.currentAnimation = 'run'
    }

    update(deltaTime) {
        // Applicera luftmotstånd
        if (this.velocityY > 0) {
            this.velocityY -= this.game.friction * deltaTime
            if (this.velocityY < 0) this.velocityY = 0
        }
        
        // Patruller när på marken
        if (this.isGrounded) {
            this.velocityX = this.speed * this.direction
            
            // Om vi har en patrolldistans, vänd vid ändpunkter
            if (this.patrolDistance !== null) {
                if (this.x >= this.endX) {
                    this.direction = -1
                    this.x = this.endX
                } else if (this.x <= this.startX) {
                    this.direction = 1
                    this.x = this.startX
                }
            }
            // Annars fortsätter fienden tills den kolliderar med något
        } else {
            this.velocityX = 0
        }
        
        // Uppdatera position
        this.x += this.velocityX * deltaTime
        this.y += this.velocityY * deltaTime
        
        // Uppdatera animation state
        if (this.velocityX !== 0 && this.isGrounded) {
            this.setAnimation('run')
        } else {
            this.setAnimation('idle')
        }
        
        // Uppdatera animation frame
        this.updateAnimation(deltaTime)
    }

    // Överskugga intersects för mindre hitbox
    intersects(other) {
        const hitboxX = this.x + this.hitboxOffsetX
        const hitboxY = this.y + this.hitboxOffsetY
        return hitboxX < other.x + other.width &&
               hitboxX + this.hitboxWidth > other.x &&
               hitboxY < other.y + other.height &&
               hitboxY + this.hitboxHeight > other.y
    }

    handlePlatformCollision(platform) {
        const collision = this.getCollisionData(platform)
        
        if (collision) {
            if (collision.direction === 'top' && this.velocityY > 0) {
                // Fienden landar på plattformen
                this.y = platform.y - this.height
                this.velocityY = 0
                this.isGrounded = true
            } else if (collision.direction === 'bottom' && this.velocityY < 0) {
                // Fienden träffar huvudet
                this.y = platform.y + platform.height
                this.velocityY = 0
            } else if (collision.direction === 'left' && this.velocityX > 0) {
                // Fienden träffar vägg - vänd
                this.x = platform.x - this.width
                this.direction = -1
            } else if (collision.direction === 'right' && this.velocityX < 0) {
                // Fienden träffar vägg - vänd
                this.x = platform.x + platform.width
                this.direction = 1
            }
        }
    }
    
    handleEnemyCollision(otherEnemy) {
        if (this.intersects(otherEnemy)) {
            this.direction *= -1
        }
    }
    
    handleScreenBounds(gameWidth) {
        // Vänd vid skärmkanter (för fiender utan patrolDistance)
        if (this.patrolDistance === null) {
            if (this.x <= 0) {
                this.x = 0
                this.direction = 1
            } else if (this.x + this.width >= gameWidth) {
                this.x = gameWidth - this.width
                this.direction = -1
            }
        }
    }

    draw(ctx, camera = null) {
        // Beräkna screen position (om camera finns)
        const screenX = camera ? this.x - camera.x : this.x
        const screenY = camera ? this.y - camera.y : this.y
        
        // Skala upp tagg-bilden (1.5x större)
        const scale = 1.5
        const scaledWidth = this.width * scale
        const scaledHeight = this.height * scale
        
        // Om tagg-bilden är laddad, rita den
        if (this.image && this.image.complete && this.image.naturalHeight !== 0) {
            // Rita tagg-bilden på toppen av hitboxen (vid hitboxOffsetY)
            ctx.drawImage(
                this.image,
                screenX - (scaledWidth - this.width) / 2,
                screenY + this.hitboxOffsetY - scaledHeight,
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