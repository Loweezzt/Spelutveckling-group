export default class Menu {
    constructor(game) {
        this.game = game
        this.visible = true
        
        // Subclasses must provide these
        this.title = this.getTitle()
        this.options = this.getOptions()
        
        // Hitta första valbara option (skippa null actions)
        this.selectedIndex = 0
        for (let i = 0; i < this.options.length; i++) {
            if (this.options[i].action !== null) {
                this.selectedIndex = i
                break
            }
        }
        
        // Visual styling
        this.backgroundColor = 'rgba(0, 0, 0, 0.7)'
        this.titleColor = '#FFFFFF'
        this.optionColor = '#CCCCCC'
        this.selectedColor = '#FFD700'
        this.keyColor = '#4CAF50'
        
        this.lastKeys = new Set()

        // Layout-konstanter (så vi kan använda samma värden i update och draw)
        this.layout = {
            startY: 160,
            lineHeight: 60,
            hitBoxWidth: 400, // Hur brett område musen kan träffa
            hitBoxHeight: 40
        }
    }
    
    // Abstract methods - subclasses must override
    getTitle() {
        throw new Error('Menu subclass must implement getTitle()')
    }
    
    getOptions() {
        throw new Error('Menu subclass must implement getOptions()')
    }
    
    update(deltaTime) {
        const keys = this.game.inputHandler.keys
        const mouse = this.game.mouse

        // --- NYTT: MUS-LOGIK ---
        // Vi kollar om musen hovrar över något alternativ
        if (mouse) {
            this.options.forEach((option, index) => {
                // Hoppa över om det inte är ett klickbart val (t.ex. bara text)
                if (!option.action && !option.key) return

                // Beräkna positionen för detta alternativ (samma logik som i draw)
                const centerX = this.game.width / 2
                const y = this.layout.startY + index * this.layout.lineHeight
                
                // Definiera en "hitbox" (en osynlig rektangel runt texten)
                // 
                const hitBox = {
                    left: centerX - (this.layout.hitBoxWidth / 2),
                    right: centerX + (this.layout.hitBoxWidth / 2),
                    top: y - (this.layout.hitBoxHeight / 2),
                    bottom: y + (this.layout.hitBoxHeight / 2)
                }

                // Kolla om musen är innanför hitboxen
                if (mouse.x >= hitBox.left && mouse.x <= hitBox.right &&
                    mouse.y >= hitBox.top && mouse.y <= hitBox.bottom) {
                    
                    // Sätt detta alternativ till valt
                    this.selectedIndex = index

                    // Om musen är klickad, kör action
                    if (mouse.clicked && option.action) {
                        option.action()
                        mouse.clicked = false // "Förbruka" klicket så det inte händer igen direkt
                    }
                }
            })
        }
        // -----------------------
        
        // Kolla Enter för vald option
        if (keys.has('Enter') && !this.lastKeys.has('Enter')) {
            const selectedOption = this.options[this.selectedIndex]
            if (selectedOption && selectedOption.action) {
                selectedOption.action()
            }
        }
        
        // Kolla om någon key-shortcut har tryckts
        this.options.forEach(option => {
            if (option.key && option.action && keys.has(option.key) && !this.lastKeys.has(option.key)) {
                option.action()
            }
        })
        
        // Pil upp/ner för att navigera
        if (keys.has('ArrowDown') && !this.lastKeys.has('ArrowDown')) {
            let newIndex = this.selectedIndex
            do {
                newIndex = (newIndex + 1) % this.options.length
            } while (this.options[newIndex].action === null && newIndex !== this.selectedIndex)
            this.selectedIndex = newIndex
        }
        if (keys.has('ArrowUp') && !this.lastKeys.has('ArrowUp')) {
            let newIndex = this.selectedIndex
            do {
                newIndex = (newIndex - 1 + this.options.length) % this.options.length
            } while (this.options[newIndex].action === null && newIndex !== this.selectedIndex)
            this.selectedIndex = newIndex
        }
        
        // Uppdatera lastKeys
        this.lastKeys = new Set(keys)
    }
    
    draw(ctx) {
        if (!this.visible) return
        
        ctx.save()
        
        // Rita halvgenomskinlig bakgrund
        ctx.fillStyle = this.backgroundColor
        ctx.fillRect(0, 0, this.game.width, this.game.height)
        
        // Rita title
        ctx.fillStyle = this.titleColor
        ctx.font = 'bold 48px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.title, this.game.width / 2, 80)
        
        // Använd samma layout-värden som i update()
        const startY = this.layout.startY
        const lineHeight = this.layout.lineHeight
        
        this.options.forEach((option, index) => {
            const y = startY + index * lineHeight
            const isSelected = index === this.selectedIndex
            
            // Rita option text
            ctx.font = '32px Arial'
            ctx.fillStyle = isSelected ? this.selectedColor : this.optionColor
            
            // Lägg till ">" för vald option
            const prefix = isSelected ? '> ' : '  '
            let displayText = prefix + option.text
            
            // Lägg till key hint om det finns
            if (option.key) {
                ctx.fillText(displayText, this.game.width / 2 - 80, y)
                
                // Rita key hint i grön
                ctx.fillStyle = this.keyColor
                ctx.font = 'bold 24px Arial'
                ctx.fillText(`[${option.key}]`, this.game.width / 2 + 150, y)
            } else {
                ctx.fillText(displayText, this.game.width / 2, y)
            }

            // DEBUG: Om du vill se hitboxarna, avkommentera raden nedan:
            // ctx.strokeRect(this.game.width/2 - 200, y - 20, 400, 40)
        })
        
        // Rita instruktioner längst ner
        ctx.fillStyle = '#888888'
        ctx.font = '18px Arial'
        ctx.fillText('Use Arrow Keys or Mouse to navigate', this.game.width / 2, this.game.height - 50)
        
        ctx.restore()
    }
}