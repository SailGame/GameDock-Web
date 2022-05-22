import 'phaser';
import GameCore from '../../proto/core/core_grpc_web_pb.js'
import CommonTypes from '../../proto/core/types_pb.js'

export default class UnoScene extends Phaser.Scene {
    gcc: GameCore.GameCorePromiseClient

    constructor() {
        super('UnoScene');
    }

    preload() {
        this.gcc = this.registry.get("GameClient")
    }

    create() {

    }
}