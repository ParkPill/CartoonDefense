import { _decorator, Component, director, instantiate, Node, Prefab, resources } from 'cc';
import { popupBase } from './popupBase';
import { languageManager } from '../languageManager';
const { ccclass, property } = _decorator;

@ccclass('popupManager')
export class popupManager extends Component {

    // 싱글톤 인스턴스
    private static _instance: popupManager = null;

    public static get Instance(): popupManager {
        if (!popupManager._instance) {
            // 자동으로 인스턴스 생성
            const popupManagerNode = new Node('popupManager');
            popupManager._instance = popupManagerNode.addComponent(popupManager);
            // 씬 전환 시에도 유지되도록 설정
            director.addPersistRootNode(popupManagerNode);
        }
        return popupManager._instance;
    }

    onLoad() {
        // 싱글톤 인스턴스 설정
        if (popupManager._instance === null) {
            popupManager._instance = this;
        } else if (popupManager._instance !== this) {
            console.warn("popupManager 인스턴스가 이미 존재합니다. 중복된 popupManager를 제거합니다.");
            this.node.destroy();
            return;
        }
    }

    public popupBaseList: popupBase[] = [];
    start() {

    }

    update(deltaTime: number) {

    }

    public openPopup(popupName: string, param: any = null, callback: (pBase: popupBase) => void = null) {
        console.log(popupName);
        // console.log(`prefab/popup/${popupName}`);
        resources.load(`prefab/popup/${popupName}`, Prefab, (err, prefab) => {
            // console.log('prefab', prefab, popupName, param);
            let popupNode = instantiate(prefab);
            let canvasNode = this.node.scene.getChildByName('Canvas');
            popupNode.setParent(canvasNode.getChildByName('UI').getChildByName('Popup'));
            this.popupBaseList.push(popupNode.getComponent(popupBase));
            let pBase = popupNode.getComponent(popupBase);
            pBase.open(param);
            callback?.(pBase);
        });
    }

    public closeLastPopup() {
        let popupBase = this.popupBaseList.pop();
        popupBase.close();
    }
    public showToastMessage(message: string) {
        let localized = languageManager.getText(message);
        this.openPopup("toastMessage", localized);
    }
    public getPopup(popupName: string): popupBase {
        for (let i = 0; i < this.popupBaseList.length; i++) {
            // console.log("popupBaseList[i].name:" + this.popupBaseList[i].name);
            if (this.popupBaseList[i].name === popupName + "<" + popupName + ">") {
                // console.log("find popupBase:" + this.popupBaseList[i]);
                return this.popupBaseList[i];
            }
        }
        return null;
    }
}


