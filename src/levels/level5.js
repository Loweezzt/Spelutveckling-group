import Level from './Level.js'
import Platform from '../Platform.js'
import Coin from '../Coin.js'
import Spikes from '../spike.js'
import Rectangle from '../Rectangle.js'
import Fakespikes from '../fakespike.js'  // Ändrat till stort F
import Box from '../Box.js'
import DeathZone from '../DeathZone.js'
export default class Level4 extends Level {
    createPlatforms() {
        const h = this.game.height
        this.platforms.push(
            new Platform(this.game, 0, h - 80, 477, 300, '#654321'),
            new Platform(this.game, 570, h - 80, 1500, 300, '#654321'),
        )
    }

    createDeathZones() {
        const h = this.game.height
        this.deathZones.push(new DeathZone(this.game, 0, 1000, 2000, 2000))
    }



    createFakespikes() {  // Ändrat från createfakespikes till createFakespikes
        const h = this.game.height
        this.fakespikes = [
            new Fakespikes(this.game, 570, h - 91, 28, 10),
        ]
    }



    createBoxes() {
        const h = this.game.height



        const box2 = new Box(this.game, 478, h - 81, 91, 100, '#654321')
        this.game.gameObjects.push(box2)


    }

    createRectangles() {
        // Tom - använd createBoxes istället
    }

    createSpikes() {
        const h = this.game.height
        this.spikes = [
            new Spikes(this.game, 900, h - 91, 28, 10),
            new Spikes(this.game, 750, h - 91, 28, 10),
            new Spikes(this.game, 300, h - 91, 28, 10),
            new Spikes(this.game, 450, h - 91, 28, 10),
            new Spikes(this.game, 1050, h - 91, 28, 10),
            new Spikes(this.game, 1200, h - 91, 28, 10),
            new Spikes(this.game, 1350, h - 91, 28, 10),
            new Spikes(this.game, 1500, h - 91, 28, 10),
            new Spikes(this.game, 1650, h - 91, 28, 10),
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

    createEndZone() {
        this.levelEndZone = {
            x: 1800,
            y: this.game.height - 140,
            width: 100,
            height: 60
        }
    }
}