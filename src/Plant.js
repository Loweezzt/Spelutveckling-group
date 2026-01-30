import GameObject from './GameObject.js'
import plantSpriteImage from './assets/Pixel Adventure 1/Other/plant_grow.png'

export default class Plant extends GameObject {
    constructor(game, x, y, size = 64) {
        // Justera startpositionen så den börjar nere vid marken
        super(game, x, y - size, size, size) 
        
        this.frameWidth = 64
        this.frameHeight = 64
        
        this.image = new Image()
        this.image.src = plantSpriteImage
        
        this.overlap = 14 
        this.growthSpeed = 150
        
        this.growthState = 0 
        this.currentSegmentHeight = 0 
        
        this.frameTimer = 0
        this.frameInterval = 100

        this.potFrameIndex = 0
        this.potMaxFrame = 7
        
        this.middleFrame = 10 
        this.upperStemFrame = 11 

        this.headFrameIndex = 12
        this.headMinFrame = 12
        this.headMaxFrame = 15
        
        this.isFullyGrown = false
        this.isPotFinished = false

        this.isWatered = false

        // --- HÄR ÄNDRAR DU HÖJDEN ---
        // Hur många delar ska plantan bestå av totalt?
        // (Pot + Stammar + Huvud). Originalet var typ 4.
        this.maxSegments = 9 
    }

    water() {
        this.isWatered = true
    }

    update(deltaTime) {
        if (!this.isWatered) return

        this.frameTimer += deltaTime

        // 1. Kör kruk-animationen först
        if (!this.isPotFinished) {
            if (this.frameTimer > this.frameInterval) {
                if (this.potFrameIndex < this.potMaxFrame) {
                    this.potFrameIndex++
                    this.frameTimer = 0
                } else {
                    this.isPotFinished = true
                    this.growthState = 1 // Nu börjar första stammen växa
                    this.currentSegmentHeight = 0 
                }
            }
        } 
        
        // 2. Väx stammen och huvudet
        else if (!this.isFullyGrown) {
            this.currentSegmentHeight += this.growthSpeed * (deltaTime / 1000)

            // När en del är fullvuxen (64px)
            if (this.currentSegmentHeight >= 64) {
                this.currentSegmentHeight = 0 
                this.growthState++ // Gå vidare till nästa del
                
                // Om vi har nått maxantalet delar (minus 1 eftersom vi börjar på 0/1)
                if (this.growthState >= this.maxSegments) {
                    this.growthState = this.maxSegments - 1
                    this.isFullyGrown = true

                    // Uppdatera hitboxen för hela plantan
                    const totalHeight = (this.width * this.maxSegments) - (this.overlap * (this.maxSegments - 1))
                    
                    // Flytta Y uppåt så basen står kvar på marken
                    this.y = this.y + this.height - totalHeight
                    this.height = totalHeight
                }
            }
        }

        // 3. Animera huvudet när det är klart
        if (this.isFullyGrown) {
            if (this.frameTimer > this.frameInterval + 100) {
                this.headFrameIndex++
                if (this.headFrameIndex > this.headMaxFrame) {
                    this.headFrameIndex = this.headMinFrame
                }
                this.frameTimer = 0
            }
        }
    }

    isSolid() {
        return this.isFullyGrown
    }
    
    drawFrame(ctx, frameIndex, x, y) {
        this.drawGrowingFrame(ctx, frameIndex, x, y, 64)
    }

    drawGrowingFrame(ctx, frameIndex, x, y, height) {
        const columns = 4
        const col = frameIndex % columns
        const row = Math.floor(frameIndex / columns)

        const sourceX = col * this.frameWidth
        const sourceY = row * this.frameHeight
        
        // Rita nerifrån och upp
        const drawY = y + (64 - height)

        ctx.drawImage(
            this.image,
            sourceX, sourceY, this.frameWidth, height, 
            x, drawY, this.width, height 
        )
    }

    draw(ctx, camera = null) {
        let baseX = this.x
        let baseY = this.y
        
        // Om den är fullvuxen har vi ändrat this.y och this.height i update(),
        // så vi måste räkna "botten" baserat på det.
        if (this.isFullyGrown) {
            baseY = this.y + this.height - 64 // 64 är bas-storleken
        } 
        
        const drawX = camera ? baseX - camera.x : baseX
        const drawY = camera ? baseY - camera.y : baseY
        
        const size = 64
        const stepUp = size - this.overlap

        if (this.image && this.image.complete) {
            // 1. Rita alltid krukan (botten)
            this.drawFrame(ctx, this.potFrameIndex, drawX, drawY)

            // 2. Loopa igenom alla delar som växer
            // Vi börjar på 1 eftersom 0 är krukan
            for (let i = 1; i <= this.growthState; i++) {
                
                // Räkna ut Y-positionen för denna del
                // Varje del hamnar "stepUp" pixlar högre upp än den förra
                const currentY = drawY - (stepUp * i)

                let frameToUse = this.middleFrame // Standard är "mitten-stam"

                // Om det är sista delen -> Det är HUVUDET
                if (i === this.maxSegments - 1) {
                    frameToUse = this.headFrameIndex
                } 
                // Om det är näst sista delen -> Det är ÖVRE STAM (övergången)
                else if (i === this.maxSegments - 2) {
                    frameToUse = this.upperStemFrame
                }

                // Kolla om denna del håller på att växa eller är klar
                if (i < this.growthState) {
                    // Denna del är helt klar -> Rita hela (64px)
                    this.drawFrame(ctx, frameToUse, drawX, currentY)
                } else {
                    // Denna del växer fortfarande -> Rita bara currentSegmentHeight
                    this.drawGrowingFrame(ctx, frameToUse, drawX, currentY, this.currentSegmentHeight)
                }
            }
        }
    }
}