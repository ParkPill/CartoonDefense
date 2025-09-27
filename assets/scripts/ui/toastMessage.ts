import { _decorator, Component, Node, Animation, Label } from 'cc';
import { popupBase } from './popupBase';
const { ccclass, property } = _decorator;

@ccclass('toastMessage')
export class toastMessage extends popupBase {
    start() {
        let duration = this.getComponent(Animation).clips[0].duration;
        this.scheduleOnce(() => {
            this.close();
        }, duration);
    }

    override open(param: any = null) {
        super.open(param);
        this.content.getChildByName("lblContent").getComponent(Label).string = param;
    }
}


