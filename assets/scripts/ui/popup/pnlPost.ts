import { _decorator, Component, Label, Node } from 'cc';
import { popupBase } from '../popupBase';
import { PoolItemRecycle } from '../PoolItemRecycle';
import { saveData } from '../../saveData';
import { languageManager } from '../../languageManager';
const { ccclass, property } = _decorator;

@ccclass('pnlPost')
export class pnlPost extends popupBase {
    start() {

    }

    updateUI() {
        let content = this.content.getChildByName("sv").getChildByName("view").getChildByName("content");
        let pData = saveData.Instance.data;
        let postList = pData.post.split('_');
        let recycle = PoolItemRecycle.Recycle(content);
        for (let i = 0; i < postList.length; i++) {
            let obj = recycle.GetItem(content.getChildByName("post" + i));
            let postDetail = postList[i].split('-');
            obj.getChildByName("lblDesc").getComponent(Label).string = languageManager.getText(postDetail[0]);
            obj.getChildByName("lblReward").getComponent(Label).string = languageManager.getText(postDetail[1]);
            obj.getChildByName("lblCount").getComponent(Label).string = postDetail[2];
        }
    }

    update(deltaTime: number) {

    }
}


