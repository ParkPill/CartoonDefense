import { _decorator, Component, Node, instantiate, Button, Label, director, Prefab, resources } from 'cc';
import { popupBase } from '../popupBase';
import { saveData } from '../../saveData';
const { ccclass, property } = _decorator;

@ccclass('pnlStage')
export class pnlStage extends popupBase {
    @property(Prefab)
    public stage0: Prefab;
    pageIndex: number = 0;
    loadedCount: number = 0;
    start() {
        this.setupStage();
    }

    async setupStage() {
        let content = this.content.getChildByName("sv").getChildByName("view").getChildByName("content");
        // let stage0 = content.getChildByName("stage0");
        for (let i = 0; i < 100; i++) {
            resources.load(`prefab/ui/stage0`, Prefab, (err, prefab) => {
                let obj = instantiate(prefab);
                obj.name = "stage" + i;
                obj.setParent(content);
                obj.getComponent(Button).clickEvents[0].target = this.node;
                obj.getComponent(Button).clickEvents[0]._componentName = 'pnlStage';
                obj.getComponent(Button).clickEvents[0].handler = 'onStageClick';
                obj.getComponent(Button).clickEvents[0].customEventData = (this.pageIndex * 100 + i + 1).toString();
                this.loadedCount++;
                if (this.loadedCount >= 100) {
                    this.updateUI();
                }
            });
        }
        // this.updateUI();
    }

    update(deltaTime: number) {

    }

    updateUI() {
        let content = this.content.getChildByName("sv").getChildByName("view").getChildByName("content");
        let data = saveData.Instance.data;
        // console.log("data.highestStage: " + data.highestStage);
        for (let i = 0; i < 100; i++) {
            let obj = content.getChildByName("stage" + i);
            let stage = this.pageIndex * 100 + i + 1;
            let isLocked = stage > data.highestStage;
            // console.log("stage: " + stage + " isLocked: " + isLocked);
            obj.getChildByName("imgLock").active = isLocked;
            let starCount = data.getStageStar(this.pageIndex * 100 + i);
            obj.getChildByName("imgStarGray0").active = !isLocked;
            obj.getChildByName("imgStarGray1").active = !isLocked;
            obj.getChildByName("imgStarGray2").active = !isLocked;
            obj.getChildByName("imgStar0").active = starCount >= 1;
            obj.getChildByName("imgStar1").active = starCount >= 2;
            obj.getChildByName("imgStar2").active = starCount >= 3;
            obj.getChildByName("lblStage").getComponent(Label).string = (Math.floor(stage / 10) + 1) + "-" + (stage % 10);
        }

        let limit = Math.floor(saveData.Instance.data.highestStage / 100) + 1;
        this.content.getChildByName("lblPage").getComponent(Label).string = (this.pageIndex + 1).toString() + "/" + limit.toString();
    }

    public onStageClick(event: Event, customEventData: string) {
        let stage = parseInt(customEventData) + this.pageIndex * 100;
        let data = saveData.Instance.data;
        if (stage > data.highestStage) {
            return;
        }
        data.currentStage = stage;
        saveData.Instance.save();
        director.loadScene("game");
    }
    public onPrevClick() {
        this.pageIndex--;
        if (this.pageIndex < 0) {
            this.pageIndex = 0;
        }
        this.updateUI();
    }
    public onNextClick() {
        this.pageIndex++;
        let limit = Math.floor(saveData.Instance.data.highestStage / 100);
        if (this.pageIndex > limit) {
            this.pageIndex = limit;
        }
        this.updateUI();
    }
}


