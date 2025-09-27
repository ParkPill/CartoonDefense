import { _decorator, Button, Color, Node, Sprite, sp, instantiate, resources, Label, Prefab } from 'cc';
import { glowingSprite } from '../../glowingSprite';
import { playerData } from '../../playerData';
import { saveData } from '../../saveData';
import { gameManager } from '../../gameManager';
import { popupManager } from '../popupManager';
import { popupBase } from '../popupBase';
import { mergeUnit, UnitType } from '../../mergeUnit';
import { dataManager } from '../../dataManager';
import { languageManager } from '../../languageManager';
const { ccclass, property } = _decorator;

@ccclass('pnlUnitInfo')
export class pnlUnitInfo extends popupBase {
    public data: playerData;

    unitIndex: number;

    start() {
    }

    override open(param: any = null) {
        super.open(param);
        console.log("open pnlUnitInfo:" + param);
        this.unitIndex = param;
        this.setupUI();
    }

    setupUI() {
        console.log("setupUI1:" + this.unitIndex);
        this.setContent();
        console.log("setupUI2:" + this.unitIndex);
        let data = dataManager.Instance.unitInfoList[this.unitIndex];
        this.content.getChildByName("lblName").getComponent(Label).string = languageManager.getText("name") + ": "
            + languageManager.getText(data.ID);
        this.content.getChildByName("lblDesc").getComponent(Label).string = languageManager.getText("desc " + data.ID);
        this.content.getChildByName("lblAtk").getComponent(Label).string = data.Damage.toString();
        this.content.getChildByName("lblHP").getComponent(Label).string = data.HP.toString();
        this.content.getChildByName("lblRarity").getComponent(Label).string = languageManager.getText("rarity") + ": "
            + languageManager.getText(data.Rarity);
        let spt = this.content.getChildByName("unit").getChildByName("Sprite");
        if (this.unitIndex < 11) {
            spt.getComponent(Sprite).spriteFrame = gameManager.Instance.theGameScript.unitSpriteFrame[this.unitIndex];
            this.content.getChildByName("unit").getChildByName("Spine").active = false;
            if (this.unitIndex == 10) {
                spt.addComponent(glowingSprite);
            }
        }
        else {
            spt.active = false;

            let spineName = mergeUnit.getSpineName(data);
            if (spineName != "") {
                // console.log("spineSet: " + spineName);
                resources.load('spine/' + spineName, sp.SkeletonData, (err, skeletonData) => {
                    if (err) {
                        console.error("SkeletonData 로드 실패:", err);
                        return;
                    }
                    let spine = this.content.getChildByName("unit").getChildByName("Spine").getComponent(sp.Skeleton);
                    spine.skeletonData = skeletonData;

                    if (spineName == "werewolf") spine.setSkin("werewolf");
                    else if (spineName == "bear") spine.setSkin("bear");
                    else if (spineName == "lion") spine.setSkin("lion");
                    spine.setAnimation(0, "idle", true);
                });
            }
        }

    }

}


