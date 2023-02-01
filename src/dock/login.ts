import 'phaser';
import GameCore from '../proto/core/core_grpc_web_pb.js'
import ErrorPb from '../proto/core/error_pb.js';
import CommonTypes, { LoginArgs, LoginRet } from '../proto/core/types_pb.js'
import * as RegistryConst from './registry.js'

const LoginHTML = `
<form id="login-form">
    <label>Server (default: source:8080)</label><br>
    <input type="text" id="server" value=""><br>
    <label>User Name:</label><br>
    <input type="text" id="username" value=""><br>
    <label>Password:</label><br>
    <input type="text" id="password" value=""><br><br>
    <input type="submit" value="Login">
</form>
`

export default class LoginScene extends Phaser.Scene {
    gcc: GameCore.GameCorePromiseClient

    constructor() {
        super('LoginScene');
    }

    preload() {
    }

    create() {
        this.add.dom(300, 400).createFromHTML(LoginHTML);

        document.getElementById('login-form').addEventListener('submit', (e) => this.Login(e));
    }

    Login(e: Event) {
        e.preventDefault()
        let serverAddr = (document.getElementById('server') as HTMLInputElement).value;
        let username = (document.getElementById('username') as HTMLInputElement).value;
        let password = (document.getElementById('password') as HTMLInputElement).value;

        if (serverAddr === "") {
            serverAddr = "http://localhost:8080";
        }

        this.gcc = new GameCore.GameCorePromiseClient(serverAddr)
        this.registry.set(RegistryConst.REGISTRY_CORE_CLIENT, this.gcc);

        let loginArgs = new CommonTypes.LoginArgs();
        loginArgs.setUsername(username);
        loginArgs.setPassword(password);
        this.gcc.login(loginArgs).then((ret) => { this.LoginRetHandler(loginArgs, ret) }).catch(() => { alert("Failed to login, Network Error") });
    }

    LoginRetHandler(args: LoginArgs, ret: LoginRet) {
        if (ret.getErr() != ErrorPb.ErrorNumber.OK) {
            alert(`Login Error: ${ErrorPb.ErrorNumber[ret.getErr()]}`)
            return
        }
        if (this.registry.has(RegistryConst.REGISTRY_TOKEN)) {
            return
        }
        this.registry.set(RegistryConst.REGISTRY_USER_NAME, args.getUsername())
        this.registry.set(RegistryConst.REGISTRY_TOKEN, ret.getToken())

        this.Listen()
        this.scene.start("LobbyScene")
    }

    Listen() {
        let listenArgs = new CommonTypes.ListenArgs()

        listenArgs.setToken(this.registry.get(RegistryConst.REGISTRY_TOKEN))
        let listenConn = this.gcc.listen(listenArgs)

        this.registry.set(RegistryConst.REGISTRY_CONN, listenConn)

        listenConn.on("error", (err) => {
            alert(err.message)
        })
        listenConn.on("status", (status) => {
            console.log(status.details)
        })
        listenConn.on("data", (rsp) => {
            if (rsp.hasChat()) {
                this.registry.events.emit(RegistryConst.EVENT_CHAT, rsp)
            }
            else if (rsp.hasRoomdetails()) {
                this.registry.events.emit(RegistryConst.EVENT_ROOM_DETAILS, rsp)
            }
            else if (rsp.hasCustom()) {
                let game = this.registry.get(RegistryConst.REGISTRY_GAME)
                if (game === "uno") {
                    this.registry.events.emit(RegistryConst.EVENT_UNO_CUSTOM, rsp)
                }
                else if (game === "exploding_kitten") {
                    this.registry.events.emit(RegistryConst.EVENT_EXPLODING_CUSTOM, rsp)
                }
            }
        })
    }
}