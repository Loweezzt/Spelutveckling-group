import Level from './Level.js'
import Platform from '../Platform.js'
import DeathZone from '../DeathZone.js'
import Coin from '../Coin.js'
import Spike from '../spike.js'
import Box from '../Box.js'

export default class Level2 extends Level {
    createPlatforms() {
        const h = this.game.height

        // 1. Startgolv (långt, lågt)
        this.platforms.push(new Platform(this.game, 0, h - 150, 300, 150, '#654321'))

        // 2. Upp - medium höjd
        this.platforms.push(new Platform(this.game, 370, h - 80, 100, 90, '#654321'))

        // 3. Upp - högre höjd
        this.platforms.push(new Platform(this.game, 550, h - 150, 150, 220, '#654321'))

        // 4. NED - STORT STEG NER (låg höjd)
        this.platforms.push(new Platform(this.game, 750, h - 100, 150, 100, '#654321'))

        // 5. Upp - medium höjd igen
        this.platforms.push(new Platform(this.game, 950, h - 150, 100, 150, '#654321'))

        // 6. Upp - högre höjd
        this.platforms.push(new Platform(this.game, 1100, h - 200, 100, 200, '#654321'))

        // 7. Upp - ännu högre höjd
        this.platforms.push(new Platform(this.game, 1250, h - 250, 100, 250, '#654321'))

        // 8. NED - låg höjd igen
        

        // 9. Slutgolv (långt, lågt)
        this.platforms.push(new Platform(this.game, 1550, h - 80, 500, 80, '#654321'))
    }

    createDeathZones() {
        const h = this.game.height
        const spawnY = 200 - 100 // 100px ovanför spawnen
        
        // 4 death zones på samma ställe - flytta dem dit du vill
        this.deathZones.push(new DeathZone(this.game, 0, 1000, 2000, 2000))

    }

    createSpikes() {
        const h = this.game.height
        // Spikes längs mittplattformen
        this.spikes = [

        ]
    }

    createCoins() {
        const h = this.game.height
        this.coins.push(
            new Coin(this.game, 320, h - 1000),
            new Coin(this.game, 600, h - 1000),
        )
    }

    createBoxes() {
        const h = this.game.height
        // Box på höger plattform
        
        const box2 = new Box(this.game, 1400, h - 110, 100, 110, '#654321')
        
        this.game.gameObjects.push(box2)
    }

    createEnemies() {
        // Tom just nu
    }

    createEndZone() {
        const h = this.game.height
        this.levelEndZone = {
            x: 1750,
            y: h - 140,
            width: 100,
            height: 60
        }
    }
}