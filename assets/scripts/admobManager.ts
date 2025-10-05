import { _decorator, Component, Node, director } from 'cc';
import { RewardedAdClient } from 'db://admob/ads/client/RewardedAdClient';
const { ccclass, property } = _decorator;

@ccclass('admobManager')
export class admobManager extends Component {
    // 싱글톤 인스턴스
    private static _instance: admobManager = null;

    public static get Instance(): admobManager {
        if (!admobManager._instance) {
            // 자동으로 인스턴스 생성
            const admobManagerNode = new Node('admobManager');
            admobManager._instance = admobManagerNode.addComponent(admobManager);
            // 씬 전환 시에도 유지되도록 설정
            director.addPersistRootNode(admobManagerNode);

        }
        return admobManager._instance;
    }

    onLoad() {
        // 싱글톤 인스턴스 설정
        if (admobManager._instance === null) {
            admobManager._instance = this;
        } else if (admobManager._instance !== this) {
            console.warn("admobManager 인스턴스가 이미 존재합니다. 중복된 admobManager를 제거합니다.");
            this.node.destroy();
            return;
        }
    }
    start() {



    }

    update(deltaTime: number) {

    }

    public showVideo(callback: () => void) {
        console.log("showVideo");
        let a = new RewardedAdClient();
        a.load("ca-app-pub-7893694248975700/7644223399", {
            // a.load("ca-app-pub-3940256099942544/5224354917", { // test 
            onAdFailedToLoad: () => {
                console.log("Ad Failed to load");
            },
            onAdLoaded: () => {
                console.log("Ad Loaded");
                console.log("showVideo");
                a.show();
            },
            onAdImpression() {
                console.log("Ad Imoression");
            },
            onEarn: (rewardType, amount) => {
                console.log("Ad Earn", rewardType, amount);
                callback();
            },
        });
    }

    public showInterstitial(callback: () => void) {
        // 
    }
}


