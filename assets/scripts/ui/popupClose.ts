import { _decorator, Component, Node } from 'cc';
import { popupBase } from './popupBase';
const { ccclass, property } = _decorator;

@ccclass('popupClose')
export class popupClose extends Component {
    start() {

    }

    public onClose() {
        this.getComponent(popupBase).close();
    }
}


