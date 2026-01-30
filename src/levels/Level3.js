import Level from './Level.js'
import Platform from '../Platform.js'
import Coin from '../Coin.js'
import Spike from '../spike.js'
import Rectangle from '../Rectangle.js'
import Fakespikes from '../fakespike.js'  // Ändrat till stort F
import Box from '../Box.js'
import DeathZone from '../DeathZone.js'
export default class Level3 extends Level {
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

    createCoins() {
        this.coins.push(
            new Coin(this.game, 300, this.game.height - 1000)
        )
    }
    createSpikes() {
        const h = this.game.height
        this.spikes = [
            new Spike(this.game, 900, h - 92),
            new Spike(this.game, 750, h - 92),
            new Spike(this.game, 300, h - 92),
            new Spike(this.game, 450, h - 92),
            new Spike(this.game, 1050, h - 92),
            new Spike(this.game, 1200, h - 92),
            new Spike(this.game, 1350, h - 92),
            new Spike(this.game, 1500, h - 92),
            new Spike(this.game, 1650, h - 92),
        ]
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
        this.endZoneTeleported = false // Flag för att bara trigga en gång
        this.deathWall = null // Dödlig vägg som åker mot början
        this.deathWallActive = false
        this.deathWallTimer = 0
    }

    checkEndZoneTeleport() {
        // Endast på Level 3 och bara en gång
        if (this.endZoneTeleported) return

        const player = this.game.player
        const zone = this.levelEndZone

        // Beräkna distans mellan spelaren och end zonen
        const distance = Math.hypot(
            (player.x + player.width / 2) - (zone.x + zone.width / 2),
            (player.y + player.height / 2) - (zone.y + zone.height / 2)
        )

        console.log('Distance to end zone:', distance) // DEBUG

        // Om spelaren kommer inom 50 pixels från end zonen
        if (distance < 200) {
            console.log('TELEPORTING END ZONE!') // DEBUG
            // Teleportera end zonen till spelarens spawn-position
            this.levelEndZone.x = this.playerSpawn.x
            this.levelEndZone.y = this.playerSpawn.y + 140

            console.log('End zone moved to:', this.levelEndZone.x, this.levelEndZone.y) // DEBUG

            this.endZoneTeleported = true // Gör det bara en gång
            this.deathWallActive = true
            this.deathWallTimer = 400 // 1 sekunds fördröjning innan väggen börjar röra sig

            // Skapa dödlig vägg vid slutet
            this.deathWall = new Rectangle(this.game, 2000, this.game.height - 200, 100, 300, '#FF0000')
            this.game.gameObjects.push(this.deathWall)
        }
    }

    updateDeathWall(deltaTime) {
        if (!this.deathWallActive || !this.deathWall) return

        // Vänta 1 sekund innan väggen börjar röra sig
        if (this.deathWallTimer > 0) {
            this.deathWallTimer -= deltaTime
            return
        }

        // Rörelse: åka mot början med hastighet 0.25
        const moveSpeed = 0.25
        this.deathWall.x -= moveSpeed * deltaTime

        // Stoppa vid x = 300
        if (this.deathWall.x <= 300) {
            this.deathWall.x = 300
        }
    }
}