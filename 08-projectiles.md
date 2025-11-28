# Steg 8: Projektiler

I detta steg implementerar vi ett projektilsystem så spelaren kan skjuta fiender. Detta är en grundläggande mekanism som används i många spelgenrer - från platformers till space shooters.

## Koncept: Projektiler som GameObject

Projektiler är objekt som:
- Skapas vid en startposition (t.ex. från spelaren)
- Rör sig i en riktning med konstant hastighet
- Försvinner vid kollision eller efter en viss distans
- Kan interagera med andra objekt (fiender, väggar)

**I vårt spel:**
- Spelaren trycker **X** för att skjuta
- Projektilen flyger i senaste rörelseriktningen
- Max räckvidd: 800px (en skärm)
- Kolliderar med fiender och plattformar

## Projektilklassen

Skapa filen `src/Projectile.js`:

```javascript
import GameObject from './GameObject.js'

export default class Projectile extends GameObject {
    constructor(game, x, y, directionX) {
        super(game, x, y, 12, 6)
        this.directionX = directionX // -1 för vänster, 1 för höger
        this.speed = 0.5 // pixels per millisekund
        this.startX = x // Spara startposition
        this.maxDistance = 800 // Max en skärm långt
        this.color = '#ffff00'
    }
    
    update(deltaTime) {
        // Flytta projektilen
        this.x += this.directionX * this.speed * deltaTime
        
        // Kolla om projektilen har flugit för långt
        const distanceTraveled = Math.abs(this.x - this.startX)
        if (distanceTraveled > this.maxDistance) {
            this.markedForDeletion = true
        }
    }
    
    draw(ctx, camera = null) {
        // Beräkna screen position
        const screenX = camera ? this.x - camera.x : this.x
        const screenY = camera ? this.y - camera.y : this.y
        
        // Rita projektilen som en avlång rektangel
        ctx.fillStyle = this.color
        ctx.fillRect(screenX, screenY, this.width, this.height)
        
        // Lägg till en kant för effekt
        ctx.strokeStyle = '#ffaa00'
        ctx.lineWidth = 1
        ctx.strokeRect(screenX, screenY, this.width, this.height)
    }
}
```

### Viktiga delar

**directionX:**
- `-1` = projektilen flyger åt vänster
- `1` = projektilen flyger åt höger
- Används för att beräkna rörelse: `this.x += this.directionX * this.speed * deltaTime`

**startX och maxDistance:**
- Sparar var projektilen skapades
- Räknar ut hur långt den flugit: `Math.abs(this.x - this.startX)`
- När distansen > 800px markeras den för borttagning
- Detta förhindrar eviga projektiler som äter minne

**speed:**
- 0.5 pixels per millisekund
- Vid 60 FPS (~16ms per frame): 0.5 * 16 = 8 pixels/frame
- Snabbt nog att kännas responsivt, inte så snabbt att man inte ser den

## Uppdatera Player.js

Lägg till skjutsystem i konstruktorn:

```javascript
constructor(game, x, y, width, height, color) {
    super(game, x, y, width, height)
    this.color = color
    
    // ... befintlig kod
    
    // Shooting system
    this.canShoot = true
    this.shootCooldown = 300 // millisekunder mellan skott
    this.shootCooldownTimer = 0
    this.lastDirectionX = 1 // Kom ihåg senaste riktningen för skjutning
}
```

**lastDirectionX:**
- Sparar senaste riktningen spelaren rörde sig
- Default: 1 (höger)
- Används för att bestämma projektilens riktning
- Annars skulle spelaren inte kunna skjuta när hen står still

**Cooldown system:**
- `canShoot`: Boolean - kan spelaren skjuta nu?
- `shootCooldown`: 300ms mellan skott (förhindrar spam)
- `shootCooldownTimer`: Räknar ner till 0

Uppdatera rörelselogiken för att spara riktning:

```javascript
update(deltaTime) {
    // Horisontell rörelse
    if (this.game.inputHandler.keys.has('ArrowLeft')) {
        this.velocityX = -this.moveSpeed
        this.directionX = -1
        this.lastDirectionX = -1 // Spara riktning
    } else if (this.game.inputHandler.keys.has('ArrowRight')) {
        this.velocityX = this.moveSpeed
        this.directionX = 1
        this.lastDirectionX = 1 // Spara riktning
    } else {
        this.velocityX = 0
        this.directionX = 0
    }
    
    // ... befintlig kod (hopp, gravitation, etc)
    
    // Uppdatera shoot cooldown
    if (!this.canShoot) {
        this.shootCooldownTimer -= deltaTime
        if (this.shootCooldownTimer <= 0) {
            this.canShoot = true
        }
    }
    
    // Skjut med X-tangenten
    if ((this.game.inputHandler.keys.has('x') || this.game.inputHandler.keys.has('X')) && this.canShoot) {
        this.shoot()
    }
}
```

Lägg till `shoot()` metoden:

```javascript
shoot() {
    // Skjut i senaste riktningen spelaren rörde sig
    const projectileX = this.x + this.width / 2
    const projectileY = this.y + this.height / 2
    
    this.game.addProjectile(projectileX, projectileY, this.lastDirectionX)
    
    // Sätt cooldown
    this.canShoot = false
    this.shootCooldownTimer = this.shootCooldown
}
```

**Varför från spelarens centrum?**
- `this.x + this.width / 2` = mitt på spelaren horisontellt
- `this.y + this.height / 2` = mitt på spelaren vertikalt
- Ser mer naturligt ut än att skjuta från hörnet

## Uppdatera Game.js

Importera Projectile-klassen:

```javascript
import Projectile from './Projectile.js'
```

I `init()`, lägg till projektil-arrayen:

```javascript
init() {
    // ... befintlig kod (platforms, coins, enemies)
    
    // Projektiler
    this.projectiles = []
    
    // ... rest av init
}
```

Lägg till metod för att skapa projektiler:

```javascript
addProjectile(x, y, directionX) {
    const projectile = new Projectile(this, x, y, directionX)
    this.projectiles.push(projectile)
}
```

**Varför en egen metod?**
- Player behöver inte veta hur Projectile skapas
- Game ansvarar för alla objekt i världen
- Enkelt att lägga till ljud/effekter senare

I `update()`, efter fiendekollisioner, lägg till projektillogik:

```javascript
// Uppdatera projektiler
this.projectiles.forEach(projectile => {
    projectile.update(deltaTime)
    
    // Kolla kollision med fiender
    this.enemies.forEach(enemy => {
        if (projectile.intersects(enemy) && !enemy.markedForDeletion) {
            enemy.markedForDeletion = true
            projectile.markedForDeletion = true
            this.score += 50 // Bonuspoäng för att döda fiende
        }
    })
    
    // Kolla kollision med plattformar/världen
    this.platforms.forEach(platform => {
        if (projectile.intersects(platform)) {
            projectile.markedForDeletion = true
        }
    })
})

// Ta bort alla objekt markerade för borttagning
this.coins = this.coins.filter(coin => !coin.markedForDeletion)
this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion)
this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion)
```

**Kollisionslogik:**
1. Uppdatera projektilens position
2. Kolla om den träffar fiende → båda förstörs, +50 poäng
3. Kolla om den träffar plattform → projektilen förstörs
4. Filtrera bort alla markerade objekt

I `draw()`, rita projektilerna:

```javascript
// Rita fiender med camera offset
this.enemies.forEach(enemy => {
    if (this.camera.isVisible(enemy)) {
        enemy.draw(ctx, this.camera)
    }
})

// Rita projektiler med camera offset
this.projectiles.forEach(projectile => {
    if (this.camera.isVisible(projectile)) {
        projectile.draw(ctx, this.camera)
    }
})

// ... rita spelaren och UI
```

## Viktiga koncept

### 1. Cooldown-system

Ett cooldown-system förhindrar spam och skapar gameplay-balans:

```javascript
// Check om vi kan skjuta
if (canShoot && input) {
    shoot()
    canShoot = false
    timer = cooldownTime
}

// Räkna ner varje frame
if (!canShoot) {
    timer -= deltaTime
    if (timer <= 0) {
        canShoot = true
    }
}
```

**Varför behövs detta?**
- Utan cooldown: 60 projektiler/sekund = obalanserat
- Med 300ms cooldown: ~3 projektiler/sekund = rimligt
- Skapar strategi - spelaren måste sikta

### 2. Max räckvidd

Projektiler som lever för evigt är dåligt:

```javascript
const distanceTraveled = Math.abs(this.x - this.startX)
if (distanceTraveled > this.maxDistance) {
    this.markedForDeletion = true
}
```

**Varför?**
- Minnesläcka: Tusentals projektiler i arrayen
- Prestandaproblem: Uppdatera och rita alla
- Gameplay: Spelaren måste vara nära fienden

### 3. Direction vs Velocity

**Direction:**
- Enkel riktning: -1, 0, eller 1
- Används för enkla binära val
- Projektilen går antingen vänster eller höger

**Velocity:**
- Vektor med X och Y komponenter
- Används för komplex rörelse (gravitation, friktion)
- Spelaren har både velocityX och velocityY

**För projektiler i detta steg:**
- Använder `directionX` (-1 eller 1)
- Multipliceras med `speed` för att få hastighet
- Enkelt och tydligt för horisontell rörelse

### 4. Separation of concerns

**Player:**
- Vet när den ska skjuta (X-tangent)
- Vet VAR projektilen ska skapas (sin position)
- Vet RIKTNING (lastDirectionX)

**Game:**
- Äger alla projektiler
- Hanterar kollisioner
- Tar bort döda projektiler

**Projectile:**
- Vet hur den rör sig
- Vet hur den ritas
- Vet när den ska dö (max distans)

Varje klass har sitt eget ansvar!

## Förbättringar och utmaningar

### Utmaning 1: Variabel projektilstorlek

Lägg till en parameter för storlek:

```javascript
constructor(game, x, y, directionX, size = 12) {
    super(game, x, y, size, size / 2) // Dubbelt så bred som hög
    // ...
}

// I Player.shoot()
this.game.addProjectile(projectileX, projectileY, this.lastDirectionX, 16)
```

### Utmaning 2: Power-ups

Lägg till snabbare projektiler med power-up:

```javascript
// I Player
this.projectileSpeed = 0.5
this.hasPowerUp = false

shoot() {
    const speed = this.hasPowerUp ? 1.0 : 0.5
    this.game.addProjectile(x, y, directionX, speed)
}

// I Projectile
constructor(game, x, y, directionX, speed = 0.5) {
    // ...
    this.speed = speed
}
```

### Utmaning 3: Begränsad ammunition

```javascript
// I Player
this.maxAmmo = 10
this.currentAmmo = this.maxAmmo

shoot() {
    if (this.currentAmmo <= 0) return
    // ... skjut
    this.currentAmmo--
}

// Rita ammo i UI
ctx.fillText(`Ammo: ${this.player.currentAmmo}`, 20, 160)
```

### Utmaning 4: Projektiler påverkas av gravitation

```javascript
// I Projectile
constructor(game, x, y, directionX) {
    // ...
    this.velocityY = 0
}

update(deltaTime) {
    // Horisontell rörelse
    this.x += this.directionX * this.speed * deltaTime
    
    // Vertikal rörelse (gravitation)
    this.velocityY += this.game.gravity * deltaTime
    this.y += this.velocityY * deltaTime
}
```

Detta skapar en "båge" - projektilen faller ner!

### Utmaning 5: Skjut i 8 riktningar

```javascript
// I Player
shoot() {
    let dirX = this.lastDirectionX
    let dirY = 0
    
    // Lägg till vertikal riktning
    if (this.game.inputHandler.keys.has('ArrowUp')) {
        dirY = -1
    } else if (this.game.inputHandler.keys.has('ArrowDown')) {
        dirY = 1
    }
    
    // Normalisera så hastigheten är konstant
    const magnitude = Math.sqrt(dirX * dirX + dirY * dirY)
    dirX /= magnitude
    dirY /= magnitude
    
    this.game.addProjectile(x, y, dirX, dirY)
}

// I Projectile
constructor(game, x, y, directionX, directionY) {
    // ...
    this.directionX = directionX
    this.directionY = directionY
}

update(deltaTime) {
    this.x += this.directionX * this.speed * deltaTime
    this.y += this.directionY * this.speed * deltaTime
}
```

## Testfrågor

1. Varför använder vi `lastDirectionX` istället för `directionX` för skjutning?

2. Vad händer om vi inte har en `maxDistance` på projektiler? Varför är detta ett problem?

3. Förklara cooldown-systemet. Varför behövs både `canShoot` (boolean) och `shootCooldownTimer` (number)?

4. Varför skapas projektilen från spelarens centrum (`this.x + this.width / 2`) istället för från `this.x`?

5. Vilken ordning händer saker i när spelaren trycker X? Lista stegen från input till projektilen syns på skärmen.

6. Varför markerar vi projektilen för borttagning istället för att ta bort den direkt från arrayen med `splice()`?

7. Om `speed = 0.5` och `deltaTime = 16ms`, hur många pixels rör sig projektilen den framen?

8. Vad är skillnaden mellan `direction` och `velocity`? När använder vi vilket?

9. Varför får spelaren +50 poäng för att döda en fiende med projektil istället för att nudda den? Vad påverkar detta i gameplay?

10. Hur skulle du implementera att projektiler studsar mot väggar istället för att försvinna?

## Nästa steg

Nu kan spelaren skjuta! I nästa steg kan vi:
- Lägga till musaiming för twinstick shooter-stil
- Implementera olika projektiltyper
- Skapa fiender som också kan skjuta
- Lägga till partikeleffekter vid träff

Byt till `09-` branchen för att fortsätta.
