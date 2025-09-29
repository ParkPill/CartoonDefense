import { _decorator, Color, Component, director, Label, Node } from 'cc';
import { popupBase } from '../popupBase';
import { saveData } from '../../saveData';
import { languageManager } from '../../languageManager';
import { gameManager } from '../../gameManager';
const { ccclass, property } = _decorator;

@ccclass('pnlDungeonResult')
export class pnlDungeonResult extends popupBase {
    @property([Node])
    public objList: Node[] = [];
    start() {

    }

    override open(param: any = null) {
        super.open(param);
        for (let i = 0; i < this.objList.length; i++) {
            this.objList[i].active = false;
            this.scheduleOnce(() => {
                this.objList[i].active = true;
            }, i * 0.1);
        }

        let strResult = param.split("_");
        let seconds = parseInt(strResult[0]);
        let rewardGemCount = parseInt(strResult[1]);
        let isStageClear = strResult[2];

        saveData.Instance.save();

        this.content.getChildByName("lblTime").getComponent(Label).string = gameManager.Instance.getTimeString(seconds);
        this.content.getChildByName("lblReward").getComponent(Label).string = rewardGemCount.toString();
        let lblSuccess = this.content.getChildByName("lblSuccess").getComponent(Label);
        lblSuccess.string = languageManager.getText(isStageClear);
        lblSuccess.color = isStageClear === "success" ? new Color(0, 255, 0) : new Color(255, 0, 0);
    }


    public onOkClick() {
        this.close();
        // 메인 씬으로 이동
        director.loadScene("game");
    }
}


