import { _decorator, CCString, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('iapPrice')
export class iapPrice extends Component {
    @property(Label)
    public lblPrice: Label;
    @property(CCString)
    public iapID: string;
    start() {

    }

    update(deltaTime: number) {

    }
}


