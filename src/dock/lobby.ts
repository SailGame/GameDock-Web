import 'phaser';
import GameCore from '../proto/core/core_grpc_web_pb.js'
import ErrorPb from '../proto/core/error_pb.js';
import CommonTypes from '../proto/core/types_pb.js'
import * as RegistryConst from './registry.js'

const RoomHTML = `
<tr>
    <th>0</th>
    <th></th>
    <th>0</th>
    <th>Join</th>
</tr>
`

const LobbyHTML = `
<button id="create-room-button">Create Room</button>
<br>
<table id="rooms">
  <tr>
    <th>RoomId</th>
    <th>Game</th>
    <th>Users</th>
    <th>Action</th>
  </tr>
</table>
<br>
<div id="Total Rooms"></div>
<button id="last-page-button">Last Page</button>
<button id="next-page-button">Next Page</button>
`

function createElementFromHTML(htmlString): HTMLElement {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild as HTMLElement;
}

export default class LobbyScene extends Phaser.Scene {
    gcc: GameCore.GameCorePromiseClient
    rooms: CommonTypes.Room[] = []
    roomPageIndex: integer
    roomsOnePage = 5

    constructor() {
        super('LobbyScene');
    }

    preload() {
        this.gcc = this.registry.get("GameClient")
    }

    create() {
        this.add.dom(200, 100).createFromHTML(LobbyHTML)
        let table = document.getElementById("rooms")
        for (let i = 0; i < this.roomsOnePage; i++) {
            let room = createElementFromHTML(RoomHTML)
            room.style.visibility = "false";
            room.children.item(3).addEventListener("onClick", ()=> {
                this.joinRoom(i)
            })
            table.appendChild(room)
        }
        this.queryRoom()
    }

    queryRoom() {
        let listRoomArgs = new CommonTypes.ListRoomArgs()
        this.gcc.listRoom(listRoomArgs).then((ret) => {
            if (ret.getErr() != ErrorPb.ErrorNumber.OK) {
                alert("Failed to get rooms errno: " + ret.getErr().toString())
            }
            this.rooms = ret.getRoomList()
            this.roomPageIndex = 0
            this.resetRoomDOM()
        }).catch(() => {
            alert("Failed to get rooms. Network Error")
        })
    }

    resetRoomDOM() {
        let totalRooms = this.rooms.length
        if (totalRooms == 0) {
            this.roomPageIndex = 0
        }
        else if (this.roomPageIndex > ((totalRooms - 1) % this.roomsOnePage)) {
            this.roomPageIndex = 0
        }

        let table = document.getElementById("rooms")
        for (let i = 0; i < this.roomsOnePage; i++) {
            let roomIndex = this.roomPageIndex * 5 + i;
            let room = table.childNodes.item(1 + i) as HTMLElement;

            if (roomIndex < totalRooms) {
                room.children.item(0).innerHTML = this.rooms[roomIndex].getRoomid().toString()
                room.children.item(1).innerHTML = this.rooms[roomIndex].getGamename()
                room.children.item(2).innerHTML = this.rooms[roomIndex].getUsernameList().toString()
                room.style.visibility = "true"
            }
            room.style.visibility = "true";
        }
    }

    joinRoom(row: integer) {
        let table = document.getElementById("rooms")
        let joinRoomArgs = new CommonTypes.JoinRoomArgs
        joinRoomArgs.setToken(this.registry.get(RegistryConst.REGISTRY_TOKEN))
        joinRoomArgs.setRoomid(Number(table.children.item(row + 1).children.item(0).innerHTML))

        this.gcc.joinRoom(joinRoomArgs).then((ret)=> {
            if (ret.getErr() != ErrorPb.ErrorNumber.OK)
            {
                alert("Failed to join room, Error:" + ret.getErr().toString())
            }
            else
            {
                this.registry.set(RegistryConst.REGISTRY_ROOM, joinRoomArgs.getRoomid())
                this.scene.start("RoomScene")
            }
        }).catch(()=>{
            alert("Failed to join room, Network Error")
        })
    }
}