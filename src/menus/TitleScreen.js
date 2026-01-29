import Menu from './Menu.js'
import ControlsMenu from './ControlsMenu.js'
import titleImgSrc from '../assets/titlescreen.png'

export default class TitleScreen extends Menu {
    constructor(game) {
        super(game)

        this.image = new Image ()
        this.image.src = titleImgSrc

        this.blinkTimer = 0
    }
    getTitle() {
        return 'Growing Pains' 
    }
    
    getOptions() {
        return [
            {
                text: 'Start Game',
                key: 'Enter', 
                action: () => {
                    this.game.restart()
                }
            },
            {
                text: 'Controls',
                key: 'c',
                action: () => {
                    this.game.currentMenu = new ControlsMenu(this.game)
                }
            }
        ]
    }

    update(deltaTime) {
        super.update(deltaTime)

        this.blinkTimer += deltaTime
    }

    draw(ctx) {
        if (this.image.complete) {
            ctx.drawImage(this.image, 0, 0, this.game.width, this.game.height)
        }

        const shouldShow = Math.sin(this.blinkTimer * 0.005) > 0

        if (shouldShow) {
            ctx.save()
            
            ctx.font = 'bold 30px Arial'
            ctx.fillStyle = '#FFFFFF' 
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            
            ctx.shadowColor = 'black'
            ctx.shadowBlur = 4
            ctx.shadowOffsetX = 2
            ctx.shadowOffsetY = 2

            const xOffset = 26
            ctx.fillText(this.options[0].text, (this.game.width / 2) + xOffset, this.game.height - 120)
            
            ctx.font = '10px Arial'
            ctx.fillStyle = '#FFFF00'
            ctx.fillText('[ PRESS ENTER ]', (this.game.width / 2) + xOffset, this.game.height - 85)

            ctx.restore()
        }
    }
}