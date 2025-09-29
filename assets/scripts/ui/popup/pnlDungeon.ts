import { _decorator, Component, director, Label, Node } from 'cc';
import { popupManager } from '../popupManager';
import { popupBase } from '../popupBase';
import { gameManager } from '../../gameManager';
const { ccclass, property } = _decorator;

@ccclass('pnlDungeon')
export class pnlDungeon extends popupBase {
    start() {
        this.content.getChildByName("lblTicket0").getComponent(Label).string = this.data.getTicket(0) + "/" + this.data.defaultTicketCount;

    }

    update(deltaTime: number) {

    }

    public onDungeonClick(event: Event, customEventData: string) {
        let dungeonIndex = parseInt(customEventData);
        let ticket = this.data.getTicket(dungeonIndex);
        if (ticket > 0) {
            // dungeon + dungeonIndex 씬으로 이동
            gameManager.Instance.dungeonLevel = this.data.getDungeonLevel(dungeonIndex);
            director.loadScene("dungeon" + dungeonIndex);
        }
        else {
            popupManager.Instance.showToastMessage("not enough ticket");
        }
    }
}


