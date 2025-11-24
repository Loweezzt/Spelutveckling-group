# Player

I den här delen så skapar vi en `Player`-klass som ärver från `GameObject`. Denna klass representerar spelaren i spelet och hanterar dess rörelse och rendering.

Klassen använder `InputHandler` för att läsa av tangentbordsinput och uppdatera spelarens position baserat på detta.

## Konstruktor

Konstruktorn tar emot `game`-instansen samt position och storlek för spelaren. Den initierar även hastighet och riktning.

```javascript
    constructor(game, x, y, width, height, color) {
        super(game, x, y, width, height)
        this.color = color
        
        // Nuvarande hastighet (pixels per millisekund)
        this.velocityX = 0
        this.velocityY = 0

        // Rörelsehastighet (hur snabbt spelaren accelererar/rör sig)
        this.moveSpeed = 0.5
        this.directionX = 0
        this.directionY = 0
    }
```

Inget jättekonstigt, vi sätter egenskaper för färg, hastighet och riktning.

## Uppdateringsmetod

I uppdateringsmetoden så händer det en hel del. Vi kollar vilka tangenter som är nedtryckta och uppdaterar spelarens hastighet och riktning baserat på detta. Utifrån det här sätter vi även en variabel för spelarens riktning. Det kan användas för bland annat att rita ut ögon som "tittar" i den riktningen spelaren rör sig, men det är även användbart för andra saker som animationer, attacker med mera.

```javascript
    update(deltaTime) {
        // Kolla input för rörelse
        if (this.game.input.isKeyPressed('ArrowUp')) {
            this.velocityY = -this.moveSpeed
            this.directionY = -1
        } else if (this.game.input.isKeyPressed('ArrowDown')) {
            this.velocityY = this.moveSpeed
            this.directionY = 1
        } else {
            this.velocityY = 0
            this.directionY = 0
        }

        // ... samma för vänster och höger

        // Uppdatera position baserat på hastighet
        this.x += this.velocityX * deltaTime
        this.y += this.velocityY * deltaTime
    }
```

Som du ser är hanteringen av input och rörelsen ganska likadan. Vi kollar om en viss tangent är nedtryckt, och om den är det så sätter vi hastigheten i den riktningen. Om ingen tangent är nedtryckt så sätter vi hastigheten till 0.

Fundera här varför vi hanterar rörelsen i två separata if-satser istället för att använda `else if` för både X- och Y-rörelsen.

Slutligen uppdaterar vi spelarens position baserat på hastigheten och `deltaTime`. Det är för att göra rörelsen framerate-oberoende.

### Stoppa spelaren från att gå utanför canvas

Om du vill kan du lägga till kod för att stoppa spelaren från att gå utanför canvasens gränser. Lägg till följande kod i slutet av `update`-metoden men innan vi uppdaterar positionen för spelaren.

```javascript
// stoppa från att gå utanför canvas
if (this.x < 0) this.x = 0
if (this.x + this.width > this.game.width) this.x = this.game.width - this.width
if (this.y < 0) this.y = 0
if (this.y + this.height > this.game.height) this.y = this.game.height - this.height
```

## Renderingsmetod

I draw så ritar vi ut spelaren som en rektangel. Detta sker likadant som i `Rectangle`-klassen vi skapade tidigare. Men här så lägger vi även till ögon som "tittar" i den riktning spelaren rör sig. Detta för att ge spelaren karaktär.

För att flytta på ögonen så använder vi `directionX` och `directionY` som vi satte i `update`-metoden. Vi kan sedan påverka var vi ritar ut ögonen baserat på dessa värden.

### Rita mun

I slutet av `draw`-metoden så ritar vi även en mun som ett streck. Detta gör vi med hjälp av `beginPath`, `moveTo`, `lineTo` och `stroke`-metoderna på canvas-kontexten.

```javascript
        // rita mun som ett streck
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(this.x + this.width * 0.3, this.y + this.height * 0.65)
        ctx.lineTo(this.x + this.width * 0.7, this.y + this.height * 0.65)
        ctx.stroke()
```

Detta ger spelaren ett enkelt ansikte med ögon och mun, vilket gör den mer levande och karaktärsfull.

## Uppgifter

### Glad och ledsen mun

Hur kan vi göra spelarens mun mer uttrycksfull? Experimentera med ritmetoderna för att göra munnen glad eller ledsen. Testa att styra det med inputs, eller varför inte göra spelaren ledsen när den inte rör sig?

### Rektanglar och kollision

Nu kan du testa att rita flera rektanglar på canvasen och låta spelaren röra sig runt bland dem. I `GameObject`-klassen finns det redan en metod för att kolla kollision mellan två objekt. Använd denna för att göra så att spelaren inte kan gå igenom rektanglarna. I det här fallet så är det rekommenderat att kontrollera kollision i `Game`-klassens `update`-metod, där du kan iterera över alla `gameObjects` och kolla om spelaren kolliderar med någon av dem.

**Viktigt:** Spelaren ska lagras separat från `gameObjects`-arrayen i `Game`-klassen. Detta gör det enklare att hantera spelaren separat från andra objekt:

```javascript
// I Game.js constructor
this.player = new Player(this, 50, 50, 50, 50, 'green')

this.gameObjects = [
    new Rectangle(this, 200, 150, 50, 50, 'red')
]
```

Sedan i `update`-metoden kollar vi kollision mellan spelaren och alla andra objekt:

```javascript
// Game.js update()
this.player.update(deltaTime)
this.gameObjects.forEach(obj => obj.update(deltaTime))

this.gameObjects.forEach(obj => {
    if (this.player.intersects(obj)) {
        // Hantera kollision, tex. rita en sur mun och stoppa rörelsen
    }
})
```

Vi låter alltså `Game`-klassen hantera kollisionsdetekteringen, vilket är en bra designprincip eftersom `Game` har överblick över alla objekt i spelet.

#### Stoppa spelaren vid kollision

När spelaren väl kolliderar med ett objekt så behöver vi hantera det, till exempel genom att stoppa spelarens rörelse i den riktningen. Detta kan göras genom att justera spelarens position baserat på vilken sida kollisionsdetekteringen inträffade på. Vi använder `directionX` och `directionY` för att bestämma åt vilket håll spelaren rör sig:

```javascript
// Game.js update()
this.gameObjects.forEach(obj => {
    if (this.player.intersects(obj)) {
        // Hantera kollision baserat på riktning
        if (this.player.directionX > 0) { // rör sig åt höger
            this.player.x = obj.x - this.player.width
        } else if (this.player.directionX < 0) { // rör sig åt vänster
            this.player.x = obj.x + obj.width
        }
        if (this.player.directionY > 0) { // rör sig neråt
            this.player.y = obj.y - this.player.height
        } else if (this.player.directionY < 0) { // rör sig uppåt
            this.player.y = obj.y + obj.height
        }
    }
})
```

Och i `draw`-metoden ritar vi spelaren separat:

```javascript
// Game.js draw()
draw(ctx) {
    this.gameObjects.forEach(obj => obj.draw(ctx))
    this.player.draw(ctx)
}
```

Testa detta och se hur det fungerar! Justera gärna koden för att få det att kännas rätt i spelet.

### En labyrint

Skapa en enkel labyrint med rektanglar som spelaren måste navigera genom. Använd kollisiondetekteringen för att hindra spelaren från att gå igenom väggarna i labyrinten. Du kan designa labyrinten genom att placera flera rektanglar på olika positioner i spelet. Testa att lägga till en start- och målpunkt för att göra det mer utmanande!

För att skapa ett mål så kan du ärva från `GameObject` och skapa en `Goal`-klass som ritar ut målet på canvasen. När spelaren når målet (kolla den kollisionen) kan du visa ett meddelande.

## Sammanfattning

I den här filen har vi skapat en `Player`-klass som hanterar spelarens rörelse och rendering. Vi har använt `InputHandler` för att läsa av tangentbordsinput och uppdaterat spelarens position baserat på detta.

Vi har även testat att jobba med kollisioner mellan spelaren och rektanglar, samt gett spelaren ett enkelt ansikte för att göra den mer karaktärsfull. Du har nu en grund för att skapa ett spel där spelaren kan röra sig runt på canvasen.

### Testfrågor

1. Varför lagras spelaren separat från gameObjects-arrayen i Game-klassen?
2. Varför hanterar vi X- och Y-rörelsen i separata if-satser istället för att använda else if?
3. Hur används directionX och directionY för att få ögonen att "titta" åt rätt håll?
4. Varför är det Game-klassen som ansvarar för kollisionsdetektering och inte Player-klassen?
5. När en kollision upptäcks och spelaren rör sig åt höger (directionX > 0), hur stoppar vi spelaren?
6. Hur skulle du stoppa spelaren från att gå utanför canvasens vänstra kant?
7. Varför ritas spelaren efter alla andra objekt i draw()-metoden?
8. Vilka tre Canvas-metoder används för att rita spelarens mun som ett streck?

## Nästa steg

