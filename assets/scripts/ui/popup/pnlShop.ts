import { _decorator, Component, Label, Node } from 'cc';
import { saveData } from '../../saveData';
import { popupManager } from '../popupManager';
import { dataManager, ShopData } from '../../dataManager';
import { popupBase } from '../popupBase';
import { languageManager } from '../../languageManager';
import { gameManager } from '../../gameManager';
import { serverManager } from '../../serverManager';
import { gameScript } from '../../gameScript';
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
            console.log("productID: ", productID, "indexOfItem: ", indexOfItem);
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

    public async onBuyClick(event: Event, customEventData: string) {
        let sData = dataManager.Instance.shopInfoList.find(shop => shop.ID === customEventData);
        if (!sData) {
            popupManager.Instance.showToastMessage("not found shop item");
            return;
        }

        let indexOfItem = dataManager.Instance.getShopItemIndex(sData.ID);
        if (sData.Limit === 'd') {
            if (this.data.iapDay.indexOf(indexOfItem) !== -1) {
                popupManager.Instance.showToastMessage("buy limit");
                return;
            }
        }
        else if (sData.Limit === 'w') {
            if (this.data.iapWeek.indexOf(indexOfItem) !== -1) {
                popupManager.Instance.showToastMessage("buy limit");
                return;
            }
        }
        else if (sData.Limit === 'm') {
            if (this.data.iapMonth.indexOf(indexOfItem) !== -1) {
                popupManager.Instance.showToastMessage("buy limit");
                return;
            }
        }
        else if (sData.Limit === 'p') {
            if (this.data.iap.indexOf(indexOfItem) !== -1) {
                popupManager.Instance.showToastMessage("buy limit");
                return;
            }
        }

        this.buyItem(sData);


    }
    async buyItem(sData: ShopData) {
        try {
            let priceDataArray = sData.PriceData.split('-');

            if (priceDataArray[0] === "gem" && parseInt(priceDataArray[1]) > this.data.gem) {
                popupManager.Instance.showToastMessage("not enough currency");
                return;
            }

            // serverManager.log 함수의 결과 값을 받아서 처리
            let msg = this.data.nickname + "," + this.data.idx + "," + "buy " + sData.ID;
            const logResult = await serverManager.Instance.log(msg);
            let jsonData = JSON.parse(logResult.data);
            // console.log("logResult.data: ", jsonData.result);
            if (logResult.success && jsonData.result === 1) {
                // console.log("구매 로그 전송 성공:", logResult.data);
                if (priceDataArray[0] === "gem") {
                    this.data.gem -= parseInt(sData.PriceData);
                    this.handleBuySuccess(sData);
                }
                else if (priceDataArray[0] === "$") {

                }


            } else {
                console.error("구매 로그 전송 실패:", logResult.error);
                popupManager.Instance.showToastMessage("로그 전송 실패");
            }
        } catch (error) {
            console.error("구매 로그 전송 중 오류:", error);
            popupManager.Instance.showToastMessage("로그 전송 오류");
        }
    }

    handleBuySuccess(sData: ShopData): void {
        let indexOfItem = dataManager.Instance.getShopItemIndex(sData.Reward);
        console.log("indexOf shop Item:" + indexOfItem);
        this.data.iap.push(indexOfItem);
        if (sData.Limit === 'd') this.data.iapDay.push(indexOfItem);
        else if (sData.Limit === 'w') this.data.iapWeek.push(indexOfItem);
        else if (sData.Limit === 'm') this.data.iapMonth.push(indexOfItem);
        saveData.Instance.save();
        popupManager.Instance.showToastMessage("buy success");
        this.updateUI();
        gameManager.Instance.theGameScript.getComponent(gameScript).updateShopUI();
    }
}