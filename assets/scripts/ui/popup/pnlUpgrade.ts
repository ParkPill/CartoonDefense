import { _decorator, Button, Color, Component, instantiate, Label, Node, Prefab, resources, sp, Sprite } from 'cc';
import { popupBase } from '../popupBase';
import { popupManager } from '../popupManager';
import { mergeUnit, UnitType } from '../../mergeUnit';
import { dataManager } from '../../dataManager';
import { gameManager } from '../../gameManager';
import { glowingSprite } from '../../glowingSprite';
const { ccclass, property } = _decorator;

@ccclass('pnlUpgrade')
export class pnlUpgrade extends popupBase {
    @property(Node)
    public unitUpgrades: Node;
    @property(Node)
    public heroUpgrades: Node;
    @property(Prefab)
    public heroUpgradePrefab: Prefab;
    start() {
        this.setupUI();
    }
    setupUI() {
        this.setContent();
        for (let i = 0; i < 11; i++) {
            let obj = this.unitUpgrades.getChildByName("unit" + i);
            let collectionState = this.data.getCollection(i);
            console.log("collectionState unit:" + i + "/" + collectionState);
            obj.getChildByName("Sprite").getComponent(Sprite).color = collectionState >= 1 ? new Color(255, 255, 255) : new Color(0, 0, 0);
            obj.getChildByName("Sprite-001").active = collectionState > 0;
            obj.getChildByName("lblLevel").active = collectionState > 0;
            obj.getChildByName("lblLevel").getComponent(Label).string = "Lv." + (this.data.getUpgradeLevel(i) + 1).toString();
            if (i == 10 && collectionState >= 1) {
                obj.getChildByName("Sprite").addComponent(glowingSprite);
            }
        }
        for (let i = UnitType.UNIT_HERO_ORC; i <= mergeUnit.getLastHeroType(); i++) {
            resources.load(`prefab/ui/heroUpgrade`, Prefab, (err, prefab) => {
                let obj = instantiate(prefab);
                let heroIndex = i - UnitType.UNIT_HERO_ORC;
                obj.name = "hero" + heroIndex;
                obj.setParent(this.heroUpgrades);
                let btn = obj.getComponent(Button);
                btn.clickEvents[0].target = this.node;
                btn.clickEvents[0]._componentName = 'pnlUpgrade';
                btn.clickEvents[0].handler = 'onUnitClick';
                btn.clickEvents[0].customEventData = i.toString();
                let collectionState = this.data.getCollection(i);
                obj.getChildByName("Sprite").active = collectionState > 0;
                obj.getChildByName("lblLevel").active = collectionState > 0;
                obj.getChildByName("lblLevel").getComponent(Label).string = "Lv." + (this.data.getUpgradeLevel(i) + 1).toString();
                let data = dataManager.Instance.unitInfoList[i];
                let spineName = mergeUnit.getSpineName(data);
                resources.load('spine/' + spineName, sp.SkeletonData, (err, skeletonData) => {
                    if (err) {
                        console.error("SkeletonData 로드 실패:", err);
                        return;
                    }
                    let spineUnit = obj.getChildByName("Model").getComponent(sp.Skeleton);
                    spineUnit.skeletonData = skeletonData;

                    gameManager.Instance.initSpine(spineUnit, spineName);

                    let collectionState = this.data.getCollection(i);
                    spineUnit.color = collectionState >= 1 ? new Color(255, 255, 255) : new Color(0, 0, 0);
                });
            });
        }
    }

    update(deltaTime: number) {

    }
    public onUnitClick(event: Event, customEventData: string) {
        console.log("onUnitClick:" + customEventData);
        let unitIndex = parseInt(customEventData);
        let collectionState = this.data.getCollection(unitIndex);
        if (collectionState < 1) {
            // console.log("not discover:" + unitIndex);
            popupManager.Instance.showToastMessage("not discovered");
            return;
        }
        console.log("unitIndex:" + unitIndex);
        popupManager.Instance.openPopup("pnlUnitInfo", 'u' + unitIndex);
    }
    public updateUI() {
        console.log("pnlUpgrade updateUI");
        for (let i = 0; i < 11; i++) {
            let obj = this.unitUpgrades.getChildByName("unit" + i);
            obj.getChildByName("lblLevel").getComponent(Label).string = "Lv." + (this.data.getUpgradeLevel(i) + 1).toString();
        }

        for (let i = UnitType.UNIT_HERO_ORC; i <= mergeUnit.getLastHeroType(); i++) {
            let obj = this.heroUpgrades.getChildByName("hero" + (i - UnitType.UNIT_HERO_ORC));
            obj.getChildByName("lblLevel").getComponent(Label).string = "Lv." + (this.data.getUpgradeLevel(i) + 1).toString();
        }
    }
}