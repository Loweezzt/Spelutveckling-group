// Basklass för alla objekt i spelet
export default class GameObject {
    constructor(game, x = 0, y = 0, width = 0, height = 0) {
        this.game = game // referens till spelet
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        
        this.animations = null
        this.currentAnimation = null
        this.frameIndex = 0
        this.frameTimer = 0
        this.frameInterval = 100 
        this.spriteLoaded = false
    }

    draw(ctx, camera = null) {
        // Gör inget, implementera i subklasser
    }

    intersects(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y
    }

    getCollisionData(other) {
        if (!this.intersects(other)) return null
        
        const overlapLeft = (this.x + this.width) - other.x
        const overlapRight = (other.x + other.width) - this.x
        const overlapTop = (this.y + this.height) - other.y
        const overlapBottom = (other.y + other.height) - this.y
        
        // hitta minsta överlappningen för att bestämma riktning
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)
        
        // Bestäm riktning baserat på minsta överlappningen
        if (minOverlap === overlapTop) return { direction: 'top' }
        if (minOverlap === overlapBottom) return { direction: 'bottom' }
        if (minOverlap === overlapLeft) return { direction: 'left' }
        if (minOverlap === overlapRight) return { direction: 'right' }
        
        return null
    }
    
    setAnimation(animationName) {
        if (this.currentAnimation !== animationName) {
            this.currentAnimation = animationName
            const anim = this.animations[animationName] // nytt
            this.frameIndex = anim ? anim.startFrame : 0 // nytt
            this.frameTimer = 0
        }
    }
    
    // la till totalFramesInSheet, startFrame och endFrame
    loadSprite(animationName, imagePath, totalFramesInSheet, startFrame = 0, endFrame = null, frameInterval = null) {
        if (!this.animations) {
            this.animations = {}
        }
        
        const img = new Image()
        img.src = imagePath
        
        img.onload = () => {
            this.spriteLoaded = true
        }
        
        const finalEndFrame = endFrame !== null ? endFrame : totalFramesInSheet - 1

        img.onerror = () => {
            console.error(`Failed to load sprite: ${imagePath} for animation: ${animationName}`)
        }
        
        this.animations[animationName] = {
            image: img,
            totalFrames: totalFramesInSheet, // hur många frames bilden har totalt
            startFrame: startFrame, // var animationen börjar
            endFrame: finalEndFrame, // var animationen slutar
            frameInterval: frameInterval
        }
    }
    
    // Uppdatera animation frame (anropa i subklassens update)
    updateAnimation(deltaTime) {
        if (!this.animations || !this.currentAnimation) return
        
        const anim = this.animations[this.currentAnimation]
        const length = anim.endFrame - anim.startFrame + 1
        if (length > 0) {
            // Använd animation-specifik frameInterval om den finns, annars default
            const interval = anim.frameInterval || this.frameInterval
            
            this.frameTimer += deltaTime
            if (this.frameTimer >= interval) {
                this.frameTimer = 0
                this.frameIndex++
                
                const wasLastFrame = this.frameIndex > anim.endFrame

                if (wasLastFrame) {
                    this.frameIndex = anim.startFrame
                    if (this.onAnimationComplete) {
                        this.onAnimationComplete(this.currentAnimation)
                    }
                }
            }
        }
    }
    
    // Rita sprite (anropa i subklassens draw för att rita sprite)
    drawSprite(ctx, camera = null, flipHorizontal = false) {
        if (!this.spriteLoaded || !this.animations || !this.currentAnimation) return false
        
        const anim = this.animations[this.currentAnimation]
        const frameWidth = anim.image.width / anim.totalFrames
        const frameHeight = anim.image.height
        
        const screenX = camera ? this.x - camera.x : this.x
        const screenY = camera ? this.y - camera.y : this.y
        
        ctx.save()
        
        if (flipHorizontal) {
            ctx.translate(screenX + this.width, screenY)
            ctx.scale(-1, 1)
            ctx.drawImage(
                anim.image,
                this.frameIndex * frameWidth,
                0,
                frameWidth,
                frameHeight,
                0,
                0,
                this.width,
                this.height
            )
        } else {
            ctx.drawImage(
                anim.image,
                this.frameIndex * frameWidth,
                0,
                frameWidth,
                frameHeight,
                screenX,
                screenY,
                this.width,
                this.height
            )
        }
        
        ctx.restore()
        return true // Returnera true om sprite ritades
    }
}