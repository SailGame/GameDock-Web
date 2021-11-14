import 'phaser';
import GameCore from './proto/core/core_grpc_web_pb.js'
import CommonTypes from './proto/core/types_pb.js'

export default class Demo extends Phaser.Scene {
    gcc: GameCore.GameCorePromiseClient

    constructor() {
        super('demo');
    }

    preload() {

    }

    create() {
        this.add.dom(300, 400, 'div', 'background-color: lime; width: 220px; height: 100px; font: 48px Arial', 'Phaser');
        this.add.text(400, 300, "Hello world");
        this.OnClick()
    }

    OnClick() {
        let serverAddr = "localhost:8080"
        console.log(GameCore)
        this.gcc = new GameCore.GameCorePromiseClient(serverAddr);
        let loginArgs = new CommonTypes.LoginArgs()
        loginArgs.setUsername("")
        this.gcc.login(loginArgs).then(() => { console.log("Success") }).catch(() => { console.log("Error") })
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
