import { _decorator, Button, Color, Node, Sprite, sp, instantiate, resources, Label, Prefab } from 'cc';
import { glowingSprite } from '../../glowingSprite';
import { playerData } from '../../playerData';
import { saveData } from '../../saveData';
import { gameManager } from '../../gameManager';
import { popupManager } from '../popupManager';
import { popupBase } from '../popupBase';
import { mergeUnit } from '../../mergeUnit';
import { dataManager } from '../../dataManager';
import { languageManager } from '../../languageManager';
import { pnlUpgrade } from './pnlUpgrade';
const { ccclass, property } = _decorator;

@ccclass('pnlUnitInfo')
export class pnlUnitInfo extends popupBase {
    public data: playerData;

    unitIndex: number;
    isUpgrade: boolean;

    start() {
    }

    override open(param: any = null) {
        super.open(param);
        console.log("open pnlUnitInfo:" + param);
        if (param.toString().includes('u')) {
            this.isUpgrade = true;
            console.log("param.split('u').length:" + param.split('u').length);
            for (let i = 0; i < param.split('u').length; i++) {
                console.log("param.split('u')[" + i + "]:" + param.split('u')[i]);
            }
            this.unitIndex = param.split('u')[1];
            console.log("unitIndex:" + this.unitIndex);
        }
        else {
            this.isUpgrade = false;
            this.unitIndex = param;
        }

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

        this.content.getChildByName("lblRarity").getComponent(Label).string = languageManager.getText("rarity") + ": "
            + languageManager.getText(data.Rarity);
        this.content.getChildByName("lblPredict").getComponent(Label).string = gameManager.Instance.getPredict(this.unitIndex) + "%";
        let spt = this.content.getChildByName("unit").getChildByName("Sprite");
        if (this.unitIndex < 11) {
            spt.getComponent(Sprite).spriteFrame = gameManager.Instance.unitSpriteFrame[this.unitIndex];
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

                    gameManager.Instance.initSpine(spine, spineName);
                });
            }
        }
        this.updateUI();
    }
    public updateUI() {
        let data = dataManager.Instance.unitInfoList[this.unitIndex];
        let level = saveData.Instance.data.getUpgradeLevel(this.unitIndex);
        let extraDamage = level;
        let extraHP = 0;
        if (this.unitIndex >= 11) {
            extraDamage = level * 0.5;
            extraHP = level * 0.5;
        }
        this.content.getChildByName("unit").getChildByName("lblLevel").getComponent(Label).string = "Lv." + (level + 1).toString();
        this.content.getChildByName("lblAtk").getComponent(Label).string = (data.Damage + extraDamage).toString();
        this.content.getChildByName("lblHP").getComponent(Label).string = (data.HP + extraHP).toString();

        this.content.getChildByName("btnUpgrade").active = this.isUpgrade;
        this.content.getChildByName("btnOk").active = !this.isUpgrade;
    }

    public onPredictHelpClick() {
        popupManager.Instance.openPopup("pnlDialog", "predict help");
    }

    public onUpgradeClick() {
        let level = saveData.Instance.data.getUpgradeLevel(this.unitIndex);
        let pricePerLevel = 100;
        if (this.unitIndex >= 11) {
            pricePerLevel = 200;
        }
        let price = level * pricePerLevel;
        if (saveData.Instance.data.gold < price) {
            popupManager.Instance.showToastMessage("not enough currency");
            return;
        }
        saveData.Instance.data.spendGold(price);
        saveData.Instance.data.setUpgradeLevel(this.unitIndex, level + 1);
        saveData.Instance.save();
        this.updateUI();
        // 현재 열려있는 창 중에 pnlUpgrade가 있으면 업데이트
        let pnlUpgrade = popupManager.Instance.getPopup("pnlUpgrade") as pnlUpgrade;
        console.log("find pnlUpgrade:" + pnlUpgrade);
        if (pnlUpgrade) {
            pnlUpgrade.updateUI();
        }
        gameManager.Instance.updateStats();
    }
}


