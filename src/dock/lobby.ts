import 'phaser';
import GameCore from '../proto/core/core_grpc_web_pb.js'
import { ErrorNumber } from '../proto/core/error_pb.js';
import CommonTypes, { ListRoomArgs } from '../proto/core/types_pb.js'

const LoginHTML = `
<form id="login-form">
    <label>User Name:</label><br>
    <input type="text" id="username" value=""><br>
    <label>Password:</label><br>
    <input type="text" id="password" value=""><br><br>
    <input type="submit" value="Login">
</form>
`

export default class LobbyScene extends Phaser.Scene {
    gcc: GameCore.GameCorePromiseClient
    rooms: CommonTypes.Room[]
    roomPage: integer

    constructor() {
        super('LobbyScene');
    }

    preload() {
        this.gcc = this.registry.get("GameClient")
    }

    create() {
        this.queryRoom()
    }

    queryRoom() {
        let listRoomArgs = new CommonTypes.ListRoomArgs()
        this.gcc.listRoom(listRoomArgs).then((ret) => {
            if (ret.getErr() != ErrorNumber.OK) {
                alert("Failed to get rooms errno: " + ret.getErr().toString())
            }
            this.rooms = ret.getRoomList()
            this.roomPage = 0
            this.resetRoomDOM()
        }).catch(() => {
            alert("Failed to get rooms. Network Error")
        })
    }

    resetRoomDOM() {

    }

    joinRoom() {

    }
}