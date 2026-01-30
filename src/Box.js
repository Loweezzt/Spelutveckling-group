import Rectangle from './Rectangle.js'

export default class Box extends Rectangle {
    constructor(game, x, y, w = 90, h = 100, color = '#654321') {
        super(game, x, y, w, h, color)
        this.isBox = true
        this.velocityX = 0
        this.velocityY = 0
        this.stopped = false
        this.stopAfter = null
        this.stopTimer = 0
        this.markedForDeletion = false
    }
}