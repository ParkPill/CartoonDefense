import { _decorator, Component, Node } from 'cc';
import { gameManager } from '../gameManager';
const { ccclass, property } = _decorator;

@ccclass('dungeon0')
export class dungeon0 extends Component {
    @property(Node)
    public canvasNode: Node;

    start() {

        let level = gameManager.Instance.dungeonLevel;

    }

    update(deltaTime: number) {

    }
}


