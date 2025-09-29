import { _decorator, Component, instantiate, Label, Node, Prefab, Sprite, Animation } from 'cc';
import { gameManager } from '../gameManager';
import { enemy } from '../enemy';
import { glowingSprite } from '../glowingSprite';
import { gameScript } from '../gameScript';
import { mergeUnit } from '../mergeUnit';
import { saveData } from '../saveData';
import { popupManager } from '../ui/popupManager';
const { ccclass, property } = _decorator;

@ccclass('dungeon0')
export class dungeon0 extends Component {
    @property(Node)
    public canvasNode: Node;
    @property(Prefab)
    public trollPrefab: Prefab;

    trollDamage = 70;
    trollHP = 300;

    timer: number = 0;
    startTime: number = 3;
    startTimeInteger: number = 4;
    gameTime: number = 60;
    isGameStarted: boolean = false;
    trollList: enemy[] = [];

    heroCount: number = 0;
    totalTrollCount: number = 0;
    isGameOver: boolean = false;
    @property(Node)
    public lblTimer: Node;


    @property(Sprite)
    public imgTime: Sprite;
    start() {

        let level = gameManager.Instance.dungeonLevel;
        this.spawnTroll(level);
    }
    spawnTroll(level: number) {
        let trollCount = level + 1;
        let rainbowTroll = false;
        if (trollCount > 10) {
            trollCount = level - 10;
            rainbowTroll = true;
            this.trollDamage = 100;
            this.trollHP = 500;
        }
        this.totalTrollCount = trollCount;
        console.log("trollCount", trollCount);
        let spawnPointNode = this.canvasNode.getChildByName('enemySpawnPoint');
        let xRange = 220;
        let yRange = 280;
        for (let i = 0; i < trollCount; i++) {
            let troll = instantiate(this.trollPrefab);
            troll.setParent(this.canvasNode.getChildByName("Unit"));
            if (rainbowTroll) {
                troll.getChildByName("ModelContainer").getChildByName("Model").addComponent(glowingSprite);
            }
            // 적의 위치를 spawnPointNode의 위치 + random하게 +-
            let randomX = Math.random() * xRange - xRange / 2;
            let randomY = Math.random() * yRange - yRange / 2;
            troll.setPosition(spawnPointNode.position.x + randomX, spawnPointNode.position.y + randomY, 0);
            let trollComponent = troll.getComponent(enemy);
            trollComponent.damage = this.trollDamage;
            trollComponent.setHP(this.trollHP);
            trollComponent.onDead = (deadTroll: enemy) => {
                this.totalTrollCount--;
                if (this.totalTrollCount <= 0) {
                    this.gameOver(true);
                }
                let gScript = gameManager.Instance.theGameScript;
                gScript.enemies.splice(gScript.enemies.indexOf(deadTroll), 1);
                deadTroll.node.destroy();
            }
            this.trollList.push(trollComponent);
        }
    }

    update(deltaTime: number) {

        if (!this.isGameStarted && !this.isGameOver) {
            this.startTime -= deltaTime;
            if (this.startTimeInteger > this.startTime) {
                this.startTimeInteger--;
                if (this.startTimeInteger == 0) {
                    this.lblTimer.getChildByName("lblTimer").getComponent(Label).string = "START!";
                } else {
                    this.lblTimer.getChildByName("lblTimer").getComponent(Label).string = this.startTimeInteger.toFixed(0);
                }
                let ani = this.lblTimer.getComponent(Animation);
                ani.play(ani.clips[0].name);

            }
            if (this.startTime <= 0) {
                this.startGame();
                this.lblTimer.destroy();
            }
        }
        else if (this.isGameStarted) {
            this.timer += deltaTime;
            this.imgTime.fillRange = 1 - this.timer / this.gameTime;
            if (this.timer >= this.gameTime) {
                this.gameOver(false);
            }
        }
    }
    startGame() {
        this.isGameStarted = true;
        this.timer = 0;
        for (let i = 0; i < this.trollList.length; i++) {
            this.trollList[i].isReady = true;
        }
        let gScript = gameManager.Instance.theGameScript;
        this.heroCount = gScript.heroList.length;
        // console.log("heroCount", this.heroCount);
        for (let i = 0; i < gScript.heroList.length; i++) {
            gScript.heroList[i].onDead = (deadUnit: mergeUnit) => {
                this.heroCount--;
                // console.log("heroCount", this.heroCount);
                if (this.heroCount <= 0) {
                    this.gameOver(false);
                }
            }
        }

        for (let i = 0; i < this.trollList.length; i++) {
            gScript.enemies.push(this.trollList[i]);
        }

    }
    gameOver(isStageClear: boolean) {
        this.isGameStarted = false;
        this.isGameOver = true;
        for (let i = 0; i < this.trollList.length; i++) {
            this.trollList[i].isReady = false;
        }
        let rewardGemCount = 0;
        if (isStageClear) {
            rewardGemCount = 5;
            saveData.Instance.data.gem += rewardGemCount;
            saveData.Instance.data.spendTicket(0);
            saveData.Instance.data.dungeonLevels[0]++;
        }
        popupManager.Instance.openPopup("pnlDungeonResult", this.timer.toFixed(0) + "_" + rewardGemCount + "_" + (isStageClear ? "success" : "fail"));
        saveData.Instance.save();

    }
}


