import Menu from './Menu.js'
import ControlsMenu from './ControlsMenu.js'
import TitleScreen from './TitleScreen.js' 

export default class MainMenu extends Menu {
    getTitle() {
        return 'Paused' 
    }
    
    getOptions() {
        return [
            {
                text: 'Resume Game', 
                key: 'Esc',          
                action: () => {
                    this.game.gameState = 'PLAYING'
                    this.game.currentMenu = null
                    this.game.inputHandler.keys.clear()
                }
            },
            {
                text: 'Controls',
                key: 'c',
                action: () => {
                    this.game.currentMenu = new ControlsMenu(this.game)
                }
            },
            {
                text: 'Quit to Title',
                key: 'q',
                action: () => {
                    this.game.gameState = 'MENU'
                    this.game.gameHasStarted = false
                    this.game.currentMenu = new TitleScreen(this.game)
                }
            }
        ]
    }
}