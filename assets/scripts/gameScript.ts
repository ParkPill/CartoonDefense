import { _decorator, CCInteger, Component, director, instantiate, Label, Node, Prefab, tween, Vec2, Vec3 } from 'cc';
import { gameManager } from './gameManager';
import { mergeUnit, UnitType } from './mergeUnit';
import { enemy } from './enemy';
import { mergeSlot } from './mergeSlot';
import { dataManager } from './dataManager';
import { languageManager } from './languageManager';
import { playerData } from './playerData';
import { saveData } from './saveData';
import { heroSlot } from './heroSlot';
const { ccclass, property } = _decorator;

@ccclass('gameScript')
export class gameScript extends Component {
    @property(Label)
    public lblStage: Label;
    @property(Node)
    public testUnitSpine: Node;
    @property(Node)
    public canvas: Node;
    @property(Node)
    public unitNode: Node;
    @property(Node)
    public aboveNode: Node;
    @property({ type: [Vec2] })
    public routeArray: Vec2[] = [];
    @property({ type: [Node] })
    public routeFlagNodes: Node[] = [];

    // public playerUnits: mergeUnit[] = [];
    public enemies: enemy[] = [];
    @property(Label)
    public lblGoldCount: Label;
    @property(CCInteger)
    public goldCount: number = 0;
    @property(CCInteger)
    public summonPrice: number = 50;
    @property({ type: [Prefab] })
    public mergeUnitPrefabs: Prefab[] = [];
    @property(Prefab)
    public goldPrefab: Prefab;
    @property(Prefab)
    public enemyPrefab: Prefab;
    isGameStart: boolean = false;
    enemySpawnInterval: number = 1;
    enemySpawnTime: number = 0;
    stage: number = 1;
    subStage: number = 1;
    totalEnemyCount: number = 1;
    totalKilledEnemy: number;
    spawnedEnemyCount: number;
    enemyIndexList: number[];
    enemyScaleList: number[];
    enemyHPScaleList: number[];
    data: playerData;
    @property({ type: [mergeSlot] })
    public mergeSlotArray: mergeSlot[] = [];

    @property({ type: [heroSlot] })
    public heroSlotArray: heroSlot[] = [];

    start() {
        if (!gameManager.Instance.isTitleLoaded) {
            director.loadScene("title");
            return;
        }
        this.data = saveData.Instance.data;
        this.subStage = this.data.currentStage % 10;
        this.stage = this.data.currentStage / 10 + 1;

        gameManager.Instance.theGameScript = this;
        // 스파인 애니메이션에서 attack 애니메이션을 실행
        // sp.Skeleton 타입으로 명시적 형 변환이 필요합니다.
        let spine = this.testUnitSpine.getComponent('sp.Skeleton') as any;
        // console.log("spine gogo1", spine);
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
        this.spawnedEnemyCount = 0;
        this.totalKilledEnemy = 0;
        this.lblStage.string = "Stage " + this.stage + "-" + this.subStage;
        this.totalEnemyCount = 50 + this.subStage * 10;
        if (this.subStage == 10) {
            this.totalEnemyCount = 150;
        }
        this.enemyIndexList = [this.totalEnemyCount];
        this.enemyScaleList = [this.totalEnemyCount];
        this.enemyHPScaleList = [this.totalEnemyCount];

        for (let i = 0; i < this.totalEnemyCount; i++) {
            this.enemyIndexList[i] = 0;
            this.enemyScaleList[i] = 1;
            this.enemyHPScaleList[i] = 1;
            if ((i + 1) % 10 == 0 && i > 10) {
                this.enemyScaleList[i] = 2;
                this.enemyHPScaleList[i] = 5;
            }
        }
        if (this.subStage == 10) {
            this.enemyScaleList[this.totalEnemyCount - 1] = 3;
            this.enemyHPScaleList[this.totalEnemyCount - 1] = 20;
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
        const unit = instantiate(this.mergeUnitPrefabs[0]);
        console.log("mergeUnit2", mergeUnit);
        unit.setParent(this.unitNode);
        unit.getComponent(mergeUnit).aboveNode = this.aboveNode;
        unit.setPosition(0, 0, 0);
        // mergeSlotArray 중에 mergeSlot.mergeUnit이 null인 곳 아무데나 setMergeUnit(mergeUnit); 실행
        for (let i = 0; i < this.mergeSlotArray.length; i++) {
            if (this.mergeSlotArray[i].currentUnit == null) {
                this.mergeSlotArray[i].setMergeUnit(unit);
                break;
            }
        }
    }

    spawnEnemy() {
        const enemyNode = instantiate(this.enemyPrefab);
        enemyNode.setParent(this.unitNode);
        enemyNode.setPosition(this.routeArray[0].toVec3());
        let theEnemy = enemyNode.getComponent(enemy);
        let index = this.spawnedEnemyCount;
        theEnemy.data = dataManager.Instance.getEnemyDataByIndex(this.enemyIndexList[index]);
        let scale = this.enemyScaleList[index];
        enemyNode.setScale(scale, scale, 1);
        theEnemy.setHP(theEnemy.data.HP * this.enemyHPScaleList[index]);
        theEnemy.routeArray = this.routeArray.map(vec2 => vec2.clone());
        theEnemy.onDead = (deadEnemy: enemy) => {
            this.totalKilledEnemy++;
            this.addGold(deadEnemy.data.RewardGold, deadEnemy.node.getWorldPosition().toVec2());
            this.enemies.splice(this.enemies.indexOf(deadEnemy), 1);
        };
        theEnemy.onMovementComplete = () => {
            this.enemies.splice(this.enemies.indexOf(theEnemy), 1);
        };
        this.enemies.push(theEnemy);
    }

    update(deltaTime: number) {
        if (this.isGameStart) {
            this.enemySpawnTime += deltaTime;
            if (this.enemySpawnTime >= this.enemySpawnInterval && this.spawnedEnemyCount < this.totalEnemyCount) {
                this.spawnEnemy();
                this.spawnedEnemyCount++;
                this.enemySpawnTime -= this.enemySpawnInterval;
            }

            if (this.totalKilledEnemy >= this.totalEnemyCount) {
                this.stageClear();
            }
        }
    }
    stageClear() {
        this.isGameStart = false;
        this.subStage++;
        if (this.subStage > 10) {
            this.stage++;
            this.subStage = 1;
        }

        // show ui

        this.startStage();
    }


    public createMergeUnit(unitType: UnitType): Node {
        const unit = instantiate(this.mergeUnitPrefabs[unitType]);
        unit.setParent(this.unitNode);
        unit.getComponent(mergeUnit).aboveNode = this.aboveNode;
        unit.getComponent(mergeUnit).unitType = unitType;
        unit.setPosition(0, 0, 0);
        return unit;
    }

    public addGold(gold: number, worldPos: Vec2) {
        // goldPrefab 인스턴스 생성
        const goldNode = instantiate(this.goldPrefab);
        goldNode.setParent(this.unitNode); // 월드 상에 우선 unitNode에 붙임
        goldNode.setWorldPosition(worldPos.toVec3());

        // 1단계: 살짝 위로 떠오르기
        const upPosition = worldPos.clone();
        upPosition.y += 50;

        // 2단계: imgGold 위치로 이동
        // imgGold의 월드 좌표 구하기
        const imgGoldNode = this.node.scene.getChildByName('Canvas').getChildByName('UI').getChildByName('imgGold');
        const imgGoldWorldPos = imgGoldNode.getWorldPosition();

        // 1단계 트윈: 위로 떠오르기
        tween(goldNode)
            .to(0.3, { worldPosition: upPosition.toVec3() }, { easing: 'quadOut' })
            .call(() => {
                // console.log("1단계 트윈 완료");
                // 2단계 트윈: imgGold로 이동
                tween(goldNode)
                    .to(1, { worldPosition: imgGoldWorldPos }, { easing: 'quadOut' })
                    .call(() => {
                        // 골드 증가
                        this.goldCount += gold;
                        this.lblGoldCount.string = this.goldCount.toString();
                        // 살짝 커졌다가 다시 작아지는 트윈 효과 추가
                        this.lblGoldCount.node.setScale(1, 1, 1);
                        tween(this.lblGoldCount.node)
                            .to(0.1, { scale: new Vec3(1.3, 1.3, 1.3) }, { easing: 'quadOut' })
                            .to(0.1, { scale: new Vec3(1, 1, 1) }, { easing: 'quadIn' })
                            .start();
                        // 골드 오브젝트 제거
                        goldNode.destroy();
                    })
                    .start();
            })
            .start();
    }
}


