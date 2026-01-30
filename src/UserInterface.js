export default class UserInterface {
    constructor(game) {
        this.game = game
        this.fontSize = 24
        this.fontFamily = 'Arial'
        this.textColor = '#FFFFFF'
        this.shadowColor = '#000000'
    }

    draw(ctx) {
        // Rita HUD (bara score nu)
        this.drawHUD(ctx)
        
        // Rita game state overlays
        if (this.game.gameState === 'GAME_OVER') {
            this.drawGameOver(ctx)
        } else if (this.game.gameState === 'WIN') {
            this.drawWin(ctx)
        }
    }
    
    drawHUD(ctx) {
        ctx.save()
        
        // Konfigurera text
        ctx.font = `${this.fontSize}px ${this.fontFamily}`
        ctx.fillStyle = this.textColor
        ctx.shadowColor = this.shadowColor
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        ctx.shadowBlur = 3
        
        // Rita score
        ctx.fillText(`Score: ${this.game.score}`, 20, 40)
        
        ctx.restore()
    }
    
    drawGameOver(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(0, 0, this.game.width, this.game.height)
        
        ctx.save()
        ctx.fillStyle = '#FF0000'
        ctx.font = 'bold 60px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('GAME OVER', this.game.width / 2, this.game.height / 2 - 50)
        
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '30px Arial'
        ctx.fillText(`Final Score: ${this.game.score}`, this.game.width / 2, this.game.height / 2 + 20)
        
        ctx.font = '24px Arial'
        ctx.fillText('Press R to Restart', this.game.width / 2, this.game.height / 2 + 80)
        ctx.restore()
    }
    
    drawWin(ctx) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'
        ctx.fillRect(0, 0, this.game.width, this.game.height)
        
        ctx.save()
        ctx.fillStyle = '#FFD700'
        ctx.font = 'bold 60px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('VICTORY!', this.game.width / 2, this.game.height / 2 - 50)
        
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '30px Arial'
        ctx.fillText(`Final Score: ${this.game.score}`, this.game.width / 2, this.game.height / 2 + 20)
        
        ctx.font = '24px Arial'
        ctx.fillText('Press R to Play Again', this.game.width / 2, this.game.height / 2 + 80)
        ctx.restore()
    }
}