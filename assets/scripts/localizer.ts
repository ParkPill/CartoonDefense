import { _decorator, CCInteger, CCString, Component, Label, Node } from 'cc';
import { languageManager } from './languageManager';
const { ccclass, property } = _decorator;

@ccclass('localizer')
export class localizer extends Component {
    @property({ type: CCString })
    public Key: string;
    start() {
        if (this.Key) {
            let localizedString = languageManager.getText(this.Key);
            console.log("localizedString: " + localizedString);
            this.node.getComponent(Label)!.string = localizedString;
        }

    }
}

