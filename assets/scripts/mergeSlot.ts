import { _decorator, Component, Node, Sprite, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('mergeSlot')
export class mergeSlot extends Component {
    @property({ type: Node })
    public mergeUnit: Node = null;

    start() {

    }

    public setMergeUnit(mergeUnit: Node) {
        this.mergeUnit = mergeUnit;
        this.mergeUnit.setParent(this.node);
        const unitHeight = this.mergeUnit.getChildByName('ModelContainer').getChildByName('Model').getComponent(UITransform).contentSize.height
        console.log("unitHeight", unitHeight);
        this.mergeUnit.setPosition(0, unitHeight / 2, 0);
    }
}


