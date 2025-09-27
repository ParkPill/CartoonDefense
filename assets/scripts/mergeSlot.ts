import { _decorator, Component, Node, Sprite, UITransform } from 'cc';
import { mergeUnit } from './mergeUnit';
const { ccclass, property } = _decorator;

@ccclass('mergeSlot')
export class mergeSlot extends Component {
    @property({ type: Node })
    public currentUnit: Node;

    start() {

    }

    public setMergeUnit(unit: Node) {
        // console.log("setMergeUnit: " + unit);
        this.currentUnit = unit;
        let theUnit = this.currentUnit.getComponent(mergeUnit);
        if (theUnit != null && theUnit.currentSlot != null) {
            theUnit.currentSlot.currentUnit = null;
        }
        theUnit.currentSlot = this;
        // this.mergeUnit.setParent(this.node);
        // const unitHeight = this.currentUnit.getChildByName('ModelContainer').getChildByName('Model').getComponent(UITransform).contentSize.height
        // console.log("unitHeight", unitHeight);
        let worldPos = this.node.getWorldPosition();
        this.currentUnit.setWorldPosition(worldPos.x, worldPos.y, worldPos.z);
    }
}


