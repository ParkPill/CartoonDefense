import { _decorator, CCInteger, Component, instantiate, Label, Node, Prefab, Vec2 } from 'cc';
import { gameManager } from './gameManager';
import { mergeUnit } from './mergeUnit';
import { enemy } from './enemy';
import { mergeSlot } from './mergeSlot';
const { ccclass, property } = _decorator;

@ccclass('gameScript')
export class gameScript extends Component {
    @property(Label)
    public lblStage: Label;
    @property(Node)
    public testUnitSpine: Node;
    @property(Node)
    public canvas: Node;
    @property({ type: [Vec2] })
    public routeArray: Vec2[] = [];
    @property({ type: [Node] })
    public routeFlagNodes: Node[] = [];

    public playerUnits: mergeUnit[] = [];
    public enemies: enemy[] = [];
    @property(Label)
    public lblGoldCount: Label;
    @property(CCInteger)
    public goldCount: number = 0;
    @property(CCInteger)
    public summonPrice: number = 50;
    @property(Prefab)
    public mergeUnitPrefab: Prefab;
    @property(Prefab)
    public enemyPrefab: Prefab;
    isGameStart: boolean = false;
    enemySpawnInterval: number = 1;
    enemySpawnTime: number = 0;
    stage: number = 1;
    subStage: number = 1;
    spawnEnemyCount: number = 1;

    @property({ type: [mergeSlot] })
    public mergeSlotArray: mergeSlot[] = [];

    start() {
        gameManager.Instance.theGameScript = this;
        // 스파인 애니메이션에서 attack 애니메이션을 실행
        // sp.Skeleton 타입으로 명시적 형 변환이 필요합니다.
        let spine = this.testUnitSpine.getComponent('sp.Skeleton') as any;
        console.log("spine gogo1", spine);
        if (spine) {
            console.log("spine gogo2", spine);
            spine.setAnimation(0, "attack", false);
        }
        this.routeFlagNodes.forEach(node => {
            this.routeArray.push(node.position.toVec2());
        });
        this.startStage();
    }
    startStage() {
        this.isGameStart = true;
        this.lblStage.string = "Stage " + this.stage + "-" + this.subStage;
        if (this.subStage == 1) {
            this.spawnEnemyCount = 1;
        } else if (this.subStage == 2) {
            this.spawnEnemyCount = 2;
        } else if (this.subStage == 3) {
            this.spawnEnemyCount = 3;
        }
    }

    public onSummonButtonClicked() {
        console.log("onSummonButtonClicked", this.goldCount, this.summonPrice);
        if (this.goldCount >= this.summonPrice) {
            this.goldCount -= this.summonPrice;
            this.lblGoldCount.string = this.goldCount.toString();
            this.spawnMergeUnit();
        }
    }

    public spawnMergeUnit() {
        console.log("mergeUnit1");
        const mergeUnit = instantiate(this.mergeUnitPrefab);
        console.log("mergeUnit2", mergeUnit);
        mergeUnit.setParent(this.canvas);
        mergeUnit.setPosition(0, 0, 0);
        // mergeSlotArray 중에 mergeSlot.mergeUnit이 null인 곳 아무데나 setMergeUnit(mergeUnit); 실행
        for (let i = 0; i < this.mergeSlotArray.length; i++) {
            if (this.mergeSlotArray[i].mergeUnit == null) {
                this.mergeSlotArray[i].setMergeUnit(mergeUnit);
                break;
            }
        }
    }

    spawnEnemy() {
        const enemyNode = instantiate(this.enemyPrefab);
        enemyNode.setParent(this.canvas);
        enemyNode.setPosition(this.routeArray[0].toVec3());
        enemyNode.getComponent(enemy).routeArray = this.routeArray.map(vec2 => vec2.clone());
        enemyNode.getComponent(enemy).onDead = () => {
            this.enemies.splice(this.enemies.indexOf(enemyNode.getComponent(enemy)), 1);
        };
        enemyNode.getComponent(enemy).onMovementComplete = () => {
            this.enemies.splice(this.enemies.indexOf(enemyNode.getComponent(enemy)), 1);
        };
        this.enemies.push(enemyNode.getComponent(enemy));
    }

    update(deltaTime: number) {
        if (this.isGameStart) {
            this.enemySpawnTime += deltaTime;
            if (this.enemySpawnTime >= this.enemySpawnInterval) {
                this.spawnEnemy();
                this.enemySpawnTime -= this.enemySpawnInterval;
            }
        }
    }
}


