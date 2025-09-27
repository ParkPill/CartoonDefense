import { _decorator, Button, Color, Node, Sprite, sp, instantiate, resources } from 'cc';
import { glowingSprite } from '../../glowingSprite';
import { playerData } from '../../playerData';
import { saveData } from '../../saveData';
import { gameManager } from '../../gameManager';
import { popupManager } from '../popupManager';
import { popupBase } from '../popupBase';
import { mergeUnit, UnitType } from '../../mergeUnit';
import { dataManager } from '../../dataManager';
const { ccclass, property } = _decorator;

@ccclass('pnlCollection')
export class pnlCollection extends popupBase {
    public data: playerData;
    @property(Node)
    public units: Node;
    @property(Node)
    public heroes: Node;
    start() {
        this.data = saveData.Instance.data;
        this.setupUI();
    }

    setupUI() {
        console.log("유닛 설정 시작");
        for (let i = 0; i < 11; i++) {
            let collectionState = this.data.getCollection(i);
            console.log("유닛 설정 중: " + i + ", 상태: " + collectionState);
            let obj = this.units.getChildByName("unit" + i);
            let sptNode = obj.getChildByName("Sprite");
            sptNode.getComponent(Sprite).color = collectionState >= 1 ? new Color(255, 255, 255) : new Color(0, 0, 0);
            if (i == 10) {
                sptNode.getComponent(glowingSprite).enabled = collectionState >= 1;
            }
            obj.getChildByName("imgNew").active = collectionState == 1;
            obj.getChildByName("imgGem").active = collectionState == 1;
        }
        console.log("히어로 설정 시작");
        let lastHeroIndex = mergeUnit.getLastHeroType();
        let temp = this.heroes.getChildByName("hero0");
        let collectionState = this.data.getCollection(12);
        temp.getChildByName("imgNew").active = collectionState == 1;
        temp.getChildByName("imgGem").active = collectionState == 1;
        temp.getChildByName("Spine").getComponent(sp.Skeleton).color = collectionState >= 1 ? new Color(255, 255, 255) : new Color(0, 0, 0);
        for (let i = 12; i <= lastHeroIndex; i++) {
            let obj = instantiate(temp);
            obj.setParent(this.heroes);
            obj.setPosition(0, 0, 0);
            collectionState = this.data.getCollection(i);
            obj.getChildByName("imgNew").active = collectionState == 1;
            obj.getChildByName("imgGem").active = collectionState == 1;
            let data = dataManager.Instance.unitInfoList[i];
            obj.name = data.ID;
            obj.getComponent(Button).clickEvents[0].customEventData = i.toString();
            let spineName = mergeUnit.getSpineName(data);
            if (spineName != "") {
                // console.log("spineSet: " + spineName);
                resources.load('spine/' + spineName, sp.SkeletonData, (err, skeletonData) => {
                    if (err) {
                        console.error("SkeletonData 로드 실패:", err);
                        return;
                    }
                    let spine = obj.getChildByName("Spine").getComponent(sp.Skeleton);
                    spine.skeletonData = skeletonData;

                    if (spineName == "werewolf") spine.setSkin("werewolf");
                    else if (spineName == "bear") spine.setSkin("bear");
                    else if (spineName == "lion") spine.setSkin("lion");
                    spine.setAnimation(0, "idle", true);

                    spine.color = collectionState >= 1 ? new Color(255, 255, 255) : new Color(0, 0, 0);
                });
            }
        }
    }

    update(deltaTime: number) {

    }

    public onUnitClick(event: Event, customEventData: string) {
        console.log("onUnitClick:" + customEventData);
        let unitIndex = parseInt(customEventData);
        console.log("unitIndex:" + unitIndex);
        let collectionState = this.data.getCollection(unitIndex);
        if (collectionState === 1) {
            this.data.receiveCollectionReward(unitIndex);
            let node;
            if (unitIndex < 11) {
                node = this.units.getChildByName("unit" + unitIndex);
                node.getChildByName("imgGem").active = false;
                node.getChildByName("imgNew").active = false;
            }
            else {
                node = this.heroes.getChildByName("hero" + unitIndex);
                node.getChildByName("imgGem").active = false;
                node.getChildByName("imgNew").active = false;
            }
            gameManager.Instance.theGameScript.addGem(5, node.getWorldPosition().toVec2());
            saveData.Instance.save();
        }
        else if (collectionState >= 2) {
            console.log("open pnlUnitInfo:" + unitIndex);
            popupManager.Instance.openPopup("pnlUnitInfo", unitIndex);
        }
        else {
            console.log("not discover:" + unitIndex);
            popupManager.Instance.showToastMessage("not discovered");
        }
    }
}


