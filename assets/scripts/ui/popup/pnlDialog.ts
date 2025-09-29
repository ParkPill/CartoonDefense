import { _decorator, Component, Label, Node } from 'cc';
import { popupBase } from '../popupBase';
import { languageManager } from '../../languageManager';
const { ccclass, property } = _decorator;

@ccclass('pnlDialog')
export class pnlDialog extends popupBase {
    okCallback: () => void;
    start() {

    }

    update(deltaTime: number) {

    }

    override open(param: any = null) {
        super.open(param);
        console.log("open pnlDialog:" + param);
        this.content.getChildByName("lblContent").getComponent(Label).string = languageManager.getText(param);
    }

    public setOkCallback(callback: () => void) {
        this.okCallback = callback;
    }

    public onOkClick() {
        this.okCallback();
        this.close();
    }

}


