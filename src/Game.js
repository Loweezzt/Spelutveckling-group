import Player from './Player.js'
import InputHandler from './InputHandler.js'
import UserInterface from './UserInterface.js'
import Camera from './Camera.js'
import mainMenu from './menus/MainMenu.js'
import Projectile from './Projectile.js'
import MainMenu from './menus/MainMenu.js'
import Rectangle from './Rectangle.js'
import themesong from './assets/GrowingPainsTheme.mp3'
import Spikes from './spike.js'
import Flower from './flower.js'
import Plant from './Plant.js'
import Level1 from './levels/Level1.js'
import Level2 from './levels/Level2.js'
import Level3 from './levels/Level3.js'
import Level4 from './levels/level4.js'
import TitleScreen from './menus/TitleScreen.js'

export default class Game {
    constructor(width, height) {
        this.width = width
        this.height = height

        // World size (större än skärmen)
        this.worldWidth = width * 3 // 3x bredare
        this.worldHeight = height

        // Fysik
        this.gravity = 0.003     // pixels per millisekund^2
        this.friction = 0.00015 // luftmotstånd för att bromsa fallhastighet

        // Game state
        this.gameState = 'MENU' // MENU, PLAYING, GAME_OVER, WIN
        this.score = 0
        this.coinsCollected = 0
        this.totalCoins = 0 // Sätts när vi skapar coins
        this.currentMenu = null // Nuvarande meny som visas
        this.plant = null
        this.gameStateExtra = null // t.ex. 'WATERING'

        this.isLevelTransitioning = false
        this.transitionCircleRadius = 0
        this.bgMusic = new Audio(themesong)
        this.bgMusic.loop = true
        this.bgMusic.volume = 0.3

        this.mouse = {
            x: 0,
            y: 0,
            clicked: false
        }

        window.addEventListener('mousedown', (e) => {
            this.mouse.x = e.offsetX || e.clientX
            this.mouse.y = e.offsetY || e.clientY
        })
        window.addEventListener('mousedown', () => {
            this.mouse.clicked = true
        })
        window.addEventListener('mouseup', () => {
            this.mouse.clicked = false
        })

        // levels
        this.levels = [Level4, Level1, Level3, Level2]
        this.currentLevelIndex = 0
        this.currentLevel = null
        this.deathZones = []
        this.spikes = []
        this.fakespikes = []

        this.inputHandler = new InputHandler(this)
        this.ui = new UserInterface(this)

        // debug
        this.debug = false
        this.debugKeyPressed = false


        this.muteKeyPressed = false


        // Camera
        this.camera = new Camera(0, 0, width, height)
        this.camera.setWorldBounds(this.worldWidth, this.worldHeight)

        // Initiera spelet
        this.init()
        this.gameHasStarted = false


        // Skapa och visa huvudmenyn
        this.currentMenu = new MainMenu(this)
    }

    // Create and register a pushable box
    spawnBox(x, y, w = 90, h = 100, color = '#654321') {
        const b = new Rectangle(this, x, y, w, h, color)
        b.isBox = true
        b.velocityX = 0
        b.velocityY = 0
        b.stopped = false
        b.stopAfter = null
        b.stopTimer = 0
        b.markedForDeletion = false
        if (!this.gameObjects) this.gameObjects = []
        this.gameObjects.push(b)
        return b
    }


    init() {
        this.projectiles = []
        this.gameObjects = []
        this.spikes = []
        this.fakespikes = []  // LÄGG TILL DENNA RAD
        this.deathZones = []

        // återställ score
        this.score = 0
        this.coinsCollected = 0

        // återställ camera
        this.camera.x = 0
        this.camera.y = 0
        this.camera.targetX = 0
        this.camera.targetY = 0

        this.loadLevel(this.currentLevelIndex)
    }

    handleDebugInput() {
        if (this.inputHandler.keys.has('d') || this.inputHandler.keys.has('D')) {
            if (!this.debugKeyPressed) {
                this.debug = !this.debug
                this.debugKeyPressed = true
                console.log('Debug mode:', this.debug)
            }
        } else {
            this.debugKeyPressed = false
        }
    }

    addProjectile(x, y, directionX) {
        const projectile = new Projectile(this, x, y, directionX)
        this.projectiles.push(projectile)
    }

    loadLevel(index) {
        this.transitionCircleRadius = Math.sqrt(this.width ** 2 + this.height ** 2)
        this.currentMenu = null

        // Rensa gameObjects (tar bort DeathWall och andra dynamiska objekt från föregående level)
        this.gameObjects = []

        const LevelClass = this.levels[index]
        this.currentLevel = new LevelClass(this)
        this.currentLevel.init()

        const data = this.currentLevel.getData()

        this.platforms = data.platforms || []
        this.coins = data.coins || []
        this.enemies = data.enemies || []
        this.levelEndZone = data.levelEndZone
        this.deathZones = data.deathZones || []
        this.spikes = data.spikes || []
        this.fakespikes = data.fakespikes || []

        this.totalCoins = this.coins.length

        let maxX = this.width * 3
        this.platforms.forEach(platform => {
            const platformEnd = platform.x + platform.width
            if (platformEnd > maxX) {
                maxX = platformEnd
            }
        })
        if (this.levelEndZone && this.levelEndZone.x + this.levelEndZone.width > maxX) {
            maxX = this.levelEndZone.x + this.levelEndZone.width
        }
        this.worldWidth = maxX
        this.camera.setWorldBounds(this.worldWidth, this.worldHeight)

        this.player = new Player(
            this,
            data.playerSpawn.x,
            data.playerSpawn.y,
            50, 50, 'green'
        )

        // Sätt kameran direkt och clamppa den
        this.camera.x = Math.max(0, Math.min(
            data.playerSpawn.x + 25 - this.width / 2,
            this.worldWidth - this.width
        ))
        this.camera.y = Math.max(0, Math.min(
            data.playerSpawn.y + 25 - this.height / 2,
            this.worldHeight - this.height
        ))
        this.camera.targetX = this.camera.x
        this.camera.targetY = this.camera.y

        if (this.levelEndZone) {
            const plantSize = 64
            this.plant = new Plant(
                this,
                this.levelEndZone.x + this.levelEndZone.width / 2 - (plantSize / 2),
                this.levelEndZone.y + this.levelEndZone.height,
                plantSize
            )
        } else {
            this.plant = null
        }
        
        this.gameStateExtra = null
    }

    handleMusicInput() {
        if (this.inputHandler.keys.has('m') || this.inputHandler.keys.has('M')) {
            if (!this.muteKeyPressed) {
                this.bgMusic.muted = !this.bgMusic.muted
                this.muteKeyPressed = true
                console.log('Music Muted:', this.bgMusic.muted)
            }
        } else {
            this.muteKeyPressed = false
        }
    }

    restart() {
        this.init()
        this.gameHasStarted = true
        this.gameState = 'PLAYING'
        this.currentMenu = null
        this.bgMusic.currentTime = 0

        this.bgMusic.play().catch(error => {
            console.warn('musik kunde inte startas:', error)
        })
    }

    playerInLevelEndZone() {
        const player = this.player
        const zone = this.levelEndZone
        if (!zone) return false
        return (
            player.x < zone.x + zone.width &&
            player.x + player.width > zone.x &&
            player.y < zone.y + zone.height &&
            player.y + player.height > zone.y
        )
    }

    handleMenu(deltaTime) {
        if (this.gameState === 'MENU' && this.currentMenu) {
            this.currentMenu.update(deltaTime)
            this.inputHandler.keys.clear()
            return true
        }

        if (this.inputHandler.keys.has('Escape') && this.gameState === 'PLAYING') {
            this.gameState = 'MENU'
            this.currentMenu = new MainMenu(this)
            return true
        }

        if (
            (this.inputHandler.keys.has('r') || this.inputHandler.keys.has('R')) &&
            (this.gameState === 'WIN')
        ) {
            this.restart()
            return true
        }

        return false
    }

    isPlaying() {
        return this.gameState === 'PLAYING'
    }

    updateEntites(deltaTime) {
        // this.platforms.forEach(p => p.update(deltaTime))
        // this.coins.forEach(c => c.update(deltaTime))
        // this.enemies.forEach(e => e.update(deltaTime))
        this.projectiles.forEach(p => p.update(deltaTime))
        this.player.update(deltaTime)

        // Uppdatera dart shooters
        if (this.currentLevel && this.currentLevel.dartShooters) {
            this.currentLevel.dartShooters.forEach(shooter => {
                shooter.update(deltaTime)
            })
        }
    }

    cleanup() {
        this.coins = this.coins.filter(c => !c.markedForDeletion)
        this.enemies = this.enemies.filter(e => !e.markedForDeletion)
        this.projectiles = this.projectiles.filter(p => !p.markedForDeletion)
        this.gameObjects = this.gameObjects.filter(obj => !obj.markedForDeletion)

        if (this.player.x < 0) this.player.x = 0
        if (this.player.x + this.player.width > this.worldWidth) {
            this.player.x = this.worldWidth - this.player.width
        }
    }



    // Antag att spelaren inte står på marken, tills vi hittar en kollision
    handleCollisions() {
        if (this.isLevelTransitioning) return

        this.player.isGrounded = false

        this.deathZones.forEach(zone => {
            if (this.player.intersects(zone)) {
                this.player.health = 0
            }
        })

        this.platforms.forEach(p => {
            this.player.handlePlatformCollision(p)
        })

        this.enemies.forEach(enemy => {
            enemy.isGrounded = false

            this.platforms.forEach(p => {
                enemy.handlePlatformCollision(p)
            })

            enemy.handleScreenBounds(this.worldWidth)
        })

        this.spikes.forEach(spike => {
            spike.isGrounded = false

            this.platforms.forEach(platform => {
                spike.handlePlatformCollision(platform)
            })

            // Vänd vid world bounds istället för screen bounds
            spike.handleScreenBounds(this.worldWidth)
        })

        // Kontrollera kollisioner mellan fiender
        this.enemies.forEach((enemy, index) => {
            this.enemies.slice(index + 1).forEach(otherEnemy => {
                enemy.handleEnemyCollision(otherEnemy)
                otherEnemy.handleEnemyCollision(enemy)
            })
        })



        this.spikes.forEach((spike, index) => {
            this.spikes.slice(index + 1).forEach(otherSpike => {
                spike.handleEnemyCollision(otherSpike)
                otherSpike.handleEnemyCollision(spike)
            })
        })
        // Kontrollera kollision med mynt

        this.coins.forEach(coin => {
            if (this.player.intersects(coin) && !coin.markedForDeletion) {
                this.score += coin.value
                this.coinsCollected++
                coin.markedForDeletion = true
            }
        })



        // Kontrollera kollision med fiender
        this.enemies.forEach(enemy => {
            if (this.player.intersects(enemy)) {
                this.player.takeDamage(1)
            }
        })

        this.spikes.forEach(spike => {
            if (this.player.intersects(spike) && !spike.markedForDeletion) {
                // Spelaren tar skada
                this.player.takeDamage(spike.damage)
            }
        })

        // Level 3: Kolla kollision med dödlig vägg
        if (this.currentLevelIndex === 2 && this.currentLevel.deathWall) {
            if (this.player.intersects(this.currentLevel.deathWall)) {
                this.player.health = 0
            }
        }

        // Kolla om projektiler från dart shooters träffar spelaren
        if (this.currentLevel && this.currentLevel.dartShooters) {
            this.projectiles.forEach(projectile => {
                this.currentLevel.dartShooters.forEach(shooter => {
                    // Kolla om denna projektil kommer från en dart shooter
                    // (vi antar att alla projektiler från dart shooters är "farliga")
                    if (this.player.intersects(projectile)) {
                        this.player.health = 0
                    }
                })
            })
        }

        // Uppdatera projektiler
        this.projectiles.forEach(projectile => {
            this.enemies.forEach(enemy => {
                if (projectile.intersects(enemy)) {
                    enemy.markedForDeletion = true
                    projectile.markedForDeletion = true
                    this.score += 50
                }

            })


            // Kolla kollision med plattformar/världen
            this.platforms.forEach(platform => {
                if (projectile.intersects(platform)) {
                    this.platforms.forEach(p => {
                        if (projectile.intersects(p)) {
                            projectile.markedForDeletion = true
                        }
                    })
                }
            })
        })

        // Hantera boxkollisioner
        this.gameObjects.forEach(box => {
            if (!box.isBox) return

            // Om spelaren är tillräckligt nära lådan, markera den för borttagning
            const distance = Math.hypot(
                (box.x + box.width / 2) - (this.player.x + this.player.width / 2),
                (box.y + box.height / 2) - (this.player.y + this.player.height / 2)
            )

            const triggerDistance = 100 // pixels - ändra detta för att justera när lådan försvinner

            if (distance < triggerDistance) {
                box.markedForDeletion = true
            }
        })

        this.gameObjects.forEach(obj => {
            if (!obj.isBox || obj.stopped) return
            const eps = 1
            const centerX = obj.x + obj.width / 2
            // Convert the desired screen X (center of view) into world coordinates
            const stopScreenX = this.camera.width / 2 // use camera center instead of magic 500
            const worldStopX = this.camera.x + stopScreenX
            if (Math.abs(centerX - worldStopX) <= eps) {
                obj.x = worldStopX - obj.width / 2
                obj.velocityX = 0
                obj.stopped = true
                return
            }
        })
    }

    updateCamera(deltaTime) {
        this.camera.follow(this.player)
        this.camera.update(deltaTime)
    }

    checkGameState() {
        if (this.player.health <= 0) {
            this.gameState = 'GAME_OVER'
        }
    }

    canWaterPlant() {
        return (
            this.gameState === 'PLAYING' &&
            this.plant &&
            !this.plant.isWatered &&
            this.playerInLevelEndZone() &&
            this.player.isGrounded &&
            (this.inputHandler.keys.has('e') || this.inputHandler.keys.has('E'))
        )
    }




    spawnPlant() {
        if (this.plant) {
            this.plant.water()
            this.gameStateExtra = 'WATERING'
        }
    }

    startLevelTransition() {
        this.isLevelTransitioning = true
        this.gameStateExtra = null // ta bort watering

        const maxRadius = Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2)) / 2
        this.transitionCircleRadius = maxRadius

        this.player.startClimbing()
    }

    handleLevelTransition(deltaTime) {
        const plantCenterX = this.plant.x + this.plant.width / 2 - (this.player.width / 2)
        const lerpSpeed = 0.05

        this.player.x += (plantCenterX - this.player.x) * lerpSpeed

        const climbSpeed = 0.15
        this.player.y -= climbSpeed * deltaTime

        const shrinkSpeed = 0.4
        this.transitionCircleRadius -= shrinkSpeed * deltaTime

        // om cirkel helt stängd, då byts level
        if (this.transitionCircleRadius <= 0) {
            // Gå till nästa level
            this.currentLevelIndex++
            if (this.currentLevelIndex >= this.levels.length) {
                this.gameState = 'WIN'
                this.isLevelTransitioning = false
                return
            }
            
            // Ladda ny level FÖRST
            this.loadLevel(this.currentLevelIndex)
            
            // SEDAN sätt isLevelTransitioning till false
            this.isLevelTransitioning = false
        }
    }

    updatePlant(deltaTime) {
        if (!this.plant) return

        this.plant.update(deltaTime)

        if (this.plant.isFullyGrown && !this.isLevelTransitioning) {
            this.startLevelTransition()
        }
    }

    plantStartsGrowing() {
        if (this.plant) {
            this.plant.water()
            this.gameStateExtra = 'GROWING'
        }
    }


    handlePlanting(deltaTime) {
        if (this.canWaterPlant()) {
            this.spawnPlant()
        }

        if (this.gameStateExtra === 'WATERING' && this.plant) {
            this.updatePlant(deltaTime)
        }
    }

    update(deltaTime) {
        
        if (this.handleMenu(deltaTime)) return
        // if (!this.isPlaying()) return

        this.handleDebugInput()
        this.handleMusicInput()
        this.handlePlanting(deltaTime)
        this.updateEntites(deltaTime)
        this.handleCollisions()

        if (this.isLevelTransitioning) {
            this.handleLevelTransition(deltaTime)
            this.player.update(deltaTime) // uppdatera spelaren under transition
            this.updateCamera(deltaTime)
            return
        }


        // Level 3 special: Kolla om end zonen ska teleporteras och uppdatera dödlig vägg
        if (this.currentLevelIndex === 2 && this.currentLevel && this.currentLevel.checkEndZoneTeleport) {
            this.currentLevel.checkEndZoneTeleport()
            // Uppdatera dödlig vägg
            if (this.currentLevel.updateDeathWall) {
                this.currentLevel.updateDeathWall(deltaTime)
            }
        }

        this.cleanup()
        this.updateCamera(deltaTime)
        this.checkGameState()

    }


    draw(ctx) {
        // Rita bakgrund
        ctx.fillStyle = '#87CEEB'
        ctx.fillRect(0, 0, this.width, this.height)

        if (this.bgMusic.muted) {
            ctx.save()
            ctx.fillStyle = 'red'
            ctx.font = 'bold 20px Arial'
            ctx.fillText('MUTED', this.width - 80, 30)
            ctx.restore()
        }
        // debug tool för end zone
        if (this.debug && this.levelEndZone) {
            ctx.save()
            ctx.strokeStyle = 'yellow'
            ctx.lineWidth = 3
            ctx.strokeRect(
                this.levelEndZone.x - this.camera.x,
                this.levelEndZone.y - this.camera.y,
                this.levelEndZone.width,
                this.levelEndZone.height
            )
            ctx.restore()
        }


        // Rita alla plattformar med camera offset
        this.platforms.forEach((platform, i) => {
            if (this.camera.isVisible(platform)) {
                platform.draw(ctx, this.camera)
            }
        })

        // Rita mynt med camera offset
        this.coins.forEach(coin => {
            if (this.camera.isVisible(coin)) {
                coin.draw(ctx, this.camera)
            }
        })

        // Rita fiender med camera offset
        this.enemies.forEach(enemy => {
            if (this.camera.isVisible(enemy)) {
                enemy.draw(ctx, this.camera)
            }
        })

        this.spikes.forEach(spike => {
            if (this.camera.isVisible(spike)) {
                spike.draw(ctx, this.camera)
            }
        })



        this.fakespikes.forEach(fakespike => {
            if (this.camera.isVisible(fakespike)) {
                fakespike.draw(ctx, this.camera)
            }
        })

        // Rita projektiler med camera offset
        this.projectiles.forEach(projectile => {
            if (this.camera.isVisible(projectile)) {
                projectile.draw(ctx, this.camera)
            }
        })

        // Rita dart shooters med camera offset
        if (this.currentLevel && this.currentLevel.dartShooters) {
            this.currentLevel.dartShooters.forEach(shooter => {
                if (this.camera.isVisible(shooter)) {
                    shooter.draw(ctx, this.camera)
                }
            })
        }

        // Rita andra spelobjekt med camera offset
        this.gameObjects.forEach(obj => {
            if (this.camera.isVisible(obj)) {
                obj.draw(ctx, this.camera)
            }
        })

        if (this.playerInLevelEndZone() && this.plant && !this.plant.isWatered) {
            ctx.fillStyle = 'white'
            ctx.font = '16px Arial'
            ctx.fillText(
                'Press E',
                this.levelEndZone.x - this.camera.x,
                this.levelEndZone.y - 10 - this.camera.y
            )
        }

        if (this.plant && this.camera.isVisible(this.plant)) {
            this.plant.draw(ctx, this.camera)
        }

        this.deathZones.forEach(zone => {
            if (this.camera.isVisible(zone)) {
                zone.draw(ctx, this.camera)
            }
        })


        // Rita spelaren med camera offset
        this.player.draw(ctx, this.camera)

        if (this.debug) {
            ctx.save()
            ctx.strokeStyle = 'lime'
            ctx.lineWidth = 1

            const drawDebugRect = (obj) => {
                const sx = obj.x - this.camera.x
                const sy = obj.y - this.camera.y
                ctx.strokeRect(sx, sy, obj.width, obj.height)
            }

            this.platforms.forEach(drawDebugRect)
            this.enemies.forEach(drawDebugRect)
            this.coins.forEach(drawDebugRect)
            this.deathZones.forEach(drawDebugRect)
            this.spikes.forEach(drawDebugRect)

            ctx.strokeStyle = 'magenta'
            drawDebugRect(this.player)

            ctx.restore()
        }

        // Rita UI sist (utan camera offset - alltid synligt)
        this.ui.draw(ctx)

        // Rita meny överst om den är aktiv
        if (this.currentMenu) {
            this.currentMenu.draw(ctx)
        }
        
        if (this.isLevelTransitioning) {
            const playerScreen = this.camera.worldToScreen(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2
            )
            
            ctx.save()
            ctx.fillStyle = 'black'

            ctx.beginPath()

            ctx.rect(0, 0, this.width, this.height)
            ctx.arc(
                playerScreen.x,
                playerScreen.y,
                Math.max(this.transitionCircleRadius),
                0,
                Math.PI * 2,
                true
            )
            ctx.fill()
            ctx.restore()
        }
    }
}