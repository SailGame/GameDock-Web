import 'phaser';
import LoginScene from './dock/login.js'
import LobbyScene from './dock/lobby.js'
import GameCore from './proto/core/core_grpc_web_pb.js'
import * as RegistryConst from './dock/registry.js'

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 1280,
    height: 720,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    mode: Phaser.Scale.FIT,
    scene: [LoginScene, LobbyScene],
    parent: "phaser",
    dom: {
        createContainer: true
    }
};

const game = new Phaser.Game(config);