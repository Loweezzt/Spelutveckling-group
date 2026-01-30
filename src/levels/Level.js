export default class Level {
    constructor(game) {
        this.game = game

        this.platforms = []
        this.coins = []
        this.enemies = []
        this.deathZones = []
        this.spikes = []
        this.rectangles = []
        this.fakespikes = []
        this.boxes = []
        this.dartShooters = []
        this.levelEndZone = { x: 0, y: 0, width: 0, height: 0 }
        this.playerSpawn = { x: 50, y: 200 }
    }





    init() {
        this.createPlatforms()
        this.createCoins()
        this.createEnemies()
        this.createEndZone()
        this.createDeathZones()
        this.createSpikes()
        this.createRectangles()
        this.createFakespikes()
        this.createBoxes()
        this.createDartShooters()
    }

    createPlatforms() { }
    createCoins() { }
    createEnemies() { }
    createEndZone() { }
    createDeathZones() { }
    createSpikes() { }
    createRectangles() { }
    createFakespikes() { }
    createBoxes() { }
    createDartShooters() { }


    getData() {
        return {
            platforms: this.platforms,
            coins: this.coins,
            enemies: this.enemies,
            deathZones: this.deathZones,
            playerSpawn: this.playerSpawn,
            levelEndZone: this.levelEndZone,
            spikes: this.spikes,
            rectangles: this.rectangles,
            fakespikes: this.fakespikes,
            boxes: this.boxes,
        }
    }
}