import 'phaser';
import { GameCoreClient } from './proto/core/CoreServiceClientPb'

export default class Demo extends Phaser.Scene {
    gcc

    constructor() {
        super('demo');
    }

    preload() {

    }

    create() {
        this.add.dom(300, 400, 'div', 'background-color: lime; width: 220px; height: 100px; font: 48px Arial', 'Phaser');
        this.add.text(400, 300, "Hello world");
    }

    OnClick() {
        let serverAddr = "localhost:8080"
        this.gcc = new GameCoreClient(serverAddr);
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 800,
    height: 600,
    scene: Demo,
    createDOMContainer: true
};

const game = new Phaser.Game(config);
