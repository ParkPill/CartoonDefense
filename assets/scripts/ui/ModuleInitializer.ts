import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { iapManager } from './iapManager';
const { ccclass, property } = _decorator;

@ccclass('ModuleInitializer')
export class ModuleInitializer extends Component {
    @property(Label)
    public lblIAP: Label;
    start() {
        console.log("ModuleInitializer start: ");

    }

    public initIAP() {
        console.log("ModuleInitializer initIAP: ");
        this.lblIAP.string = "Start init IAP";
        iapManager.Instance.LogDelegate = this.iapLogEventHandler;
        iapManager.Instance.init();
    }

    public iapLogEventHandler(eventName: string, jsonParams: string) {
        console.log("ModuleInitializer iapLogEventHandler: ", eventName, jsonParams);
        this.lblIAP.string += "\n" + eventName + " " + jsonParams;
    }

    public iapRequestProducts() {
        console.log("ModuleInitializer iapRequestProducts: ");
        iapManager.Instance.requestProducts();
    }
}


