import { _decorator, Component, Label, Node } from 'cc';
import { saveData } from '../../saveData';
import { popupManager } from '../popupManager';
import { dataManager, ShopData } from '../../dataManager';
import { popupBase } from '../popupBase';
import { languageManager } from '../../languageManager';
import { gameManager } from '../../gameManager';
import { serverManager } from '../../serverManager';
const { ccclass, property } = _decorator;

@ccclass('pnlAdsShop')
export class pnlAdsShop extends popupBase {
    oneSecTimer: number;
    start() {
        this.updateUI();
    }

    updateUI(): void{
        let content = this.content.getChildByName("sv").getChildByName("view").getChildByName("content");
        for (let i = 0; i < content.children.length; i++) {
            let obj = content.children[i];
            let lbl = obj.getChildByName("lblVideoDesc").getComponent(Label);
            
            let lastShowVideoTime = this.data.times[0];
            let now = serverManager.Instance.getCurrentTime();
            let twentyMinutes = 60 * 20;
            let isInTwentyMinutes = false;
            if (isInTwentyMinutes) {
                let timeLeft = 0;
                lbl.string = gameManager.Instance.getTimeString(timeLeft);
            }
            else {
                if (i === 0) lbl.string = languageManager.getText('auto merge desc');
                else if (i === 1) lbl.string = languageManager.getText('predict desc');
                else if (i === 2) lbl.string = languageManager.getText('burster desc');
            }
        }

    
    }

    update(deltaTime: number) {
        this.oneSecTimer += deltaTime;
        if (this.oneSecTimer >= 1) {
            this.oneSecTimer -= 1;
            this.updateUI();
        }
    }
}

