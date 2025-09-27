import { _decorator, Component, Node, director } from 'cc';
import { playerData } from './playerData';
import { serverManager } from './serverManager';
const { ccclass, property } = _decorator;

@ccclass('saveData')
export class saveData extends Component {
    public data: playerData;
    isLoaded: boolean = false;
    // 싱글톤 인스턴스
    private static _instance: saveData = null;

    public static get Instance(): saveData {
        if (!saveData._instance) {
            // 자동으로 인스턴스 생성
            const saveDataNode = new Node('SaveData');
            saveData._instance = saveDataNode.addComponent(saveData);
            saveData._instance.loadData();

            // 씬 전환 시에도 유지되도록 설정
            director.addPersistRootNode(saveDataNode);
        }
        return saveData._instance;
    }

    onLoad() {
        // 싱글톤 인스턴스 설정
        if (saveData._instance === null) {
            saveData._instance = this;
        } else if (saveData._instance !== this) {
            console.warn("saveData 인스턴스가 이미 존재합니다. 중복된 saveData를 제거합니다.");
            this.node.destroy();
            return;
        }
    }
    loadData() {
        try {
            let jsonData = localStorage.getItem("playerData");
            console.log("데이터 로드 시작: " + jsonData);
            this.data = new playerData();
            if (jsonData == null) {

            }
            else {
                jsonData = serverManager.decrypt(jsonData, serverManager.getKey());
                console.log("데이터 로드 복호화: " + jsonData);
                this.data.fromJSON(jsonData);
            }
            console.log("nickname: ", this.data.nickname);
            console.log("_id: ", this.data._id);
            console.log("데이터 로드 중: " + jsonData);
            this.checkForEmptyData();
            this.isLoaded = true;
        } catch (error) {
            console.error("데이터 로드 실패:", error);
        }
    }
    private checkForEmptyData() {
        if (this.data.nickname == null) {
            this.data.nickname = "Guest";
        }
        if (this.data.lastDayCheckTime === undefined) {
            console.log("lastDayCheckTime 초기화");
            this.data.lastDayCheckTime = new Date();
        }
        // lastDayCheckTime 타입이 string이면 변환
        if (typeof this.data.lastDayCheckTime === "string") {
            this.data.lastDayCheckTime = new Date(this.data.lastDayCheckTime);
        }
        if (!this.data.tickets) {
            this.data.tickets = [];
        }
    }
    public save() {
        try {
            let jsonData = this.data.toJSON();
            console.log("raw saved jsonData:", jsonData);
            jsonData = serverManager.encrypt(jsonData, serverManager.getKey());
            // console.log("encrypted saved jsonData:", jsonData);
            localStorage.setItem("playerData", jsonData);
            console.log("데이터 저장 성공");
        } catch (error) {
            console.error("데이터 저장 실패:", error);
        }
    }
    start() {

    }

    update(deltaTime: number) {

    }
}

