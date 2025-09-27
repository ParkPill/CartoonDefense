import { _decorator, Component, Node } from 'cc';
import { playerData } from '../playerData';
import { saveData } from '../saveData';
const { ccclass, property } = _decorator;

@ccclass('popupBase')
export class popupBase extends Component {
    @property(Node)
    public content: Node;
    public data: playerData;
    start() {

    }
    public setContent() {
        this.content = this.node.getChildByName("content");
        this.data = saveData.Instance.data;
    }
    public open(param: any = null) {
        console.log("open popupBase:" + param);
        this.node.active = true;
        this.setContent();
    }
    public close() {
        this.node.destroy();
    }
}


