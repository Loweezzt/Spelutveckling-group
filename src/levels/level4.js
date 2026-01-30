import Level from './Level.js'
import Platform from '../Platform.js'
import Coin from '../Coin.js'
import Spikes from '../spike.js'
import Rectangle from '../Rectangle.js'
import Fakespikes from '../fakespike.js'  // Ändrat till stort F
import Box from '../Box.js'
import DeathZone from '../DeathZone.js'
import DartShooter from '../DartShooter.js'
export default class Level4 extends Level {
    createPlatforms() {
        const h = this.game.height
        this.platforms.push(
            new Platform(this.game, 300, h - 80, 200, 500, '#654321'),
            new Platform(this.game, 0, h - 80, 150, 500, '#654321'),
            new Platform(this.game, 650, h - 80, 200, 500, '#654321'),
            new Platform(this.game, 1000, h - 80, 900, 500, '#654321'),
        )
    }

    createDeathZones() {
        const h = this.game.height
        this.deathZones.push(new DeathZone(this.game, 0, 1000, 3000, 3000))
    }



    createFakespikes() {  // Ändrat från createfakespikes till createFakespikes
        const h = this.game.height
        this.fakespikes = [
            
        ]
    }



    createBoxes() {
        const h = this.game.height



        // const box2 = new Box(this.game, 478, h - 81, 91, 100, '#654321')
        // this.game.gameObjects.push(box2)


    }

    createRectangles() {
        // Tom - använd createBoxes istället
    }

    createSpikes() {
        const h = this.game.height
        this.spikes = [

        ]
    }

    createCoins() {
        this.coins.push(
            new Coin(this.game, 300, this.game.height - 200)
        )
    }

    createEnemies() {
        // tom just nu
    }

    createDartShooters() {
        this.dartShooters = []


        // Lägg till dart shooters här
        this.dartShooters.push(new DartShooter(this.game, 1100, 350, -1)) // höger
        // Exempel: this.dartShooters.push(new DartShooter(this.game, 1000, 250, -1)) // vänster
    }

    createEndZone() {
        this.levelEndZone = {
            x: 1200,
            y: this.game.height - 140,
            width: 100,
            height: 60
        }
    }
}