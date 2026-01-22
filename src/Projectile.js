import GameObject from './GameObject.js'

export default class Projectile extends GameObject {
    constructor(game, x, y, directionX, owner = null, directionY = 0) {
        super(game, x, y, 12, 6)
        this.directionX = directionX // -1 för vänster, 1 för höger
        this.directionY = directionY // -1 för upp, 0 för horisontellt, 1 för ner
        this.speed = 0.001 // pixels per millisekund (mycket långsammare)
        this.startX = x // Spara startposition
        this.startY = y // Spara startposition Y
        this.maxDistance = 800 // Max en skärm långt
        
        // Identifiera vem som skjuter
        this.owner = owner
        this.color = owner && owner.constructor.name === 'Dart' ? 'black' : 'orange'
    }
    
    update(deltaTime) {
        // Flytta projektilen horisontellt och vertikalt
        this.x += this.directionX * this.speed * deltaTime
        this.y += this.directionY * this.speed * deltaTime
        
        // Applicera gravity på vertikala projektiler
        if (this.directionY !== 0) {
            this.directionY += this.game.gravity * deltaTime * 500 // Mindre gravity påverkan för att inte bli för snabb
        }
        
        // Kolla om projektilen har flugit för långt
        const distanceTraveled = Math.hypot(this.x - this.startX, this.y - this.startY)
        if (distanceTraveled > this.maxDistance) {
            this.markedForDeletion = true
        }
    }
    
    draw(ctx, camera = null) {
        // Beräkna screen position
        const screenX = camera ? this.x - camera.x : this.x
        const screenY = camera ? this.y - camera.y : this.y
        
        // Rita projektilen som en avlång rektangel
        ctx.fillStyle = this.color
        ctx.fillRect(screenX, screenY, this.width, this.height)
    }
}
