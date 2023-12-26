import Stats from 'stats.js'

export default class StatsMonitor {
    constructor() {
        this.instance = new Stats()
        this.instance.showPanel(0)

        document.body.appendChild(this.instance.dom)
    }
}