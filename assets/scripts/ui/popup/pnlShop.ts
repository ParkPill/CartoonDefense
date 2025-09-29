import { _decorator, Component, Label, Node } from 'cc';
import { saveData } from '../../saveData';
import { popupManager } from '../popupManager';
import { dataManager } from '../../dataManager';
import { popupBase } from '../popupBase';
import { languageManager } from '../../languageManager';
import { gameManager } from '../../gameManager';
const { ccclass, property } = _decorator;

@ccclass('pnlShop')
export class pnlShop extends popupBase {
    start() {
        this.updateUI();
    }

    public updateUI() {
        let pData = saveData.Instance.data;
        let content = this.content.getChildByName("sv").getChildByName("view").getChildByName("content");

        for (let i = 0; i < content.children.length; i++) {
            let obj = content.children[i];
            let productID = obj.name;
            let indexOfItem = dataManager.Instance.getShopItemIndex(productID);
            let sData = dataManager.Instance.shopInfoList[indexOfItem];
            let isAllBought = false;
            let lblBuy = obj.getChildByName("lblBuy").getComponent(Label);
            if (sData.Limit === 'd') {
                isAllBought = pData.iapDay.indexOf(indexOfItem) !== -1;
                lblBuy.string = languageManager.getText("day limit");
            }
            else if (sData.Limit === 'w') {
                isAllBought = pData.iapWeek.indexOf(indexOfItem) !== -1;
                lblBuy.string = languageManager.getText("week limit");
            }
            else if (sData.Limit === 'm') {
                isAllBought = pData.iapMonth.indexOf(indexOfItem) !== -1;
                lblBuy.string = languageManager.getText("month limit");
            }
            else if (sData.Limit === 'p') {
                lblBuy.string = languageManager.getText("account limit");
            }
            else {
                lblBuy.string = languageManager.getText("buy");
            }
            obj.active = !isAllBought;
        }
    }

    update(deltaTime: number) {

    }

    public onBuyClick(event: Event, customEventData: string) {
        let sData = dataManager.Instance.shopInfoList.find(shop => shop.ID === customEventData);
        if (!sData) {
            popupManager.Instance.showToastMessage("not found shop item");
            return;
        }
        let item = sData.Reward;
        let pData = saveData.Instance.data;
        if (sData.Price <= saveData.Instance.data.gold) {
            pData.gems -= sData.Price;
            let indexOfItem = dataManager.Instance.getShopItemIndex(sData.Reward);
            console.log("indexOf shop Item:" + indexOfItem);
            pData.iap.push(indexOfItem);
            if (sData.Limit === 'd') pData.iapDay.push(indexOfItem);
            else if (sData.Limit === 'w') pData.iapWeek.push(indexOfItem);
            else if (sData.Limit === 'm') pData.iapMonth.push(indexOfItem);
            saveData.Instance.save();
            popupManager.Instance.showToastMessage("buy success");
            this.updateUI();
            gameManager.Instance.theGameScript.updateShopUI();
        }
        else {
            popupManager.Instance.showToastMessage("not enough money");
        }
    }
}


