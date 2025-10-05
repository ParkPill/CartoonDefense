import { _decorator, CCString, Component, Label, Node } from 'cc';
import { iapManager } from './iapManager';
const { ccclass, property } = _decorator;

@ccclass('iapPrice')
export class iapPrice extends Component {
    @property(Label)
    public lblPrice: Label;
    @property(CCString)
    public iapID: string;
    start() {
        console.log("iapPrice start: ", iapManager.Instance.ProductList);
        this.updatePrice();
        iapManager.Instance.PriceRegisteredDelegate = this.onIAPPriceRegistered;

    }

    update(deltaTime: number) {

    }

    public updatePrice() {
        let product = iapManager.Instance.ProductList.find(product => product.zzc === this.iapID);
        this.lblPrice.string = product?.oneTimePurchaseOfferDetails?.formattedPrice || "0";
        console.log("iapPrice updatePrice: ", product?.oneTimePurchaseOfferDetails?.formattedPrice);
    }

    public onIAPPriceRegistered(result: string, data: any) {
        console.log("iapPrice onIAPPriceRegistered: ", result, data);
        if (result === "success") {
            for (let i = 0; i < data.length; i++) {
                let product = data[i];
                console.log("iapPrice onIAPPriceRegistered: ", product);
                if (product.zzc === this.iapID) {
                    this.updatePrice();
                }
            }

        }
    }

}


