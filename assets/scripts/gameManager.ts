import { _decorator, Component, director, Node, sp, Vec3, Animation } from 'cc';
import { mergeSlot } from './mergeSlot';
import { instantiate } from 'cc';
import { dataManager } from './dataManager';
import { Prefab } from 'cc';
import { playerData } from './playerData';
import { unitBase } from './unitBase';
import { tween } from 'cc';
import { saveData } from './saveData';
const { ccclass, property } = _decorator;

@ccclass('gameManager')
export class gameManager extends Component {
    public TheTileMap: Node = null;
    public canvasNode: Node = null;
    public summonPrefab: Prefab = null;
    public dungeonLevel: number = 0;
    public isTitleLoaded: boolean = false;
    @property({ type: Node })
    public playerUnitsContainer: Node = null;

    @property({ type: Node })
    public enemiesContainer: Node = null;

    @property({ type: Node })
    public projectilesContainer: Node = null;

    public theGameScript: Node = null;
    public heroList: Node[] = [];
    public enemies: Node[] = [];
    @property({ type: [mergeSlot] })
    public mergeSlotArray: mergeSlot[] = [];

    @property({ type: [mergeSlot] })
    public heroSlotArray: mergeSlot[] = [];
    // 싱글톤 인스턴스
    private static _instance: gameManager = null;
    @property({ type: Prefab })
    public heroPrefab: Prefab = null;
    @property({ type: Prefab })
    public mergeUnitPrefabs: Prefab[] = [];
    @property({ type: Node })
    public unitNode: Node = null;
    @property({ type: Node })
    public aboveNode: Node = null;
    public data: playerData = null;

    public static get Instance(): gameManager {
        if (!gameManager._instance) {
            // 자동으로 인스턴스 생성
            const gameManagerNode = new Node('gameManager');
            gameManager._instance = gameManagerNode.addComponent(gameManager);
            // 씬 전환 시에도 유지되도록 설정
            director.addPersistRootNode(gameManagerNode);
        }
        return gameManager._instance;
    }

    onLoad() {
        // 싱글톤 인스턴스 설정
        if (gameManager._instance === null) {
            gameManager._instance = this;
        } else if (gameManager._instance !== this) {
            console.warn("gameManager 인스턴스가 이미 존재합니다. 중복된 gameManager를 제거합니다.");
            this.node.destroy();
            return;
        }
    }
    start() {
        this.initializeGame();
    }

    update(deltaTime: number) {

    }

    public spawnHero(slot: mergeSlot, unitIndex: number = 0): Node {
        let unitData = dataManager.Instance.unitInfoList[unitIndex];
        const unit = instantiate(this.heroPrefab);//this.heroUnitPrefabs[unitIndex - 11]);
        unit.setParent(this.unitNode);
        // 오른쪽을 바라보도록 scale -1
        unit.getChildByName("ModelContainer").setScale(-1, 1, 1);
        let theUnit = unit.getComponent(unitBase);
        theUnit.aboveNode = this.aboveNode;
        unit.setPosition(0, 0, 0);
        theUnit.unitType = unitIndex;
        theUnit.setData(unitData);
        slot.setMergeUnit(unit);

        this.data.discoverCollection(unitIndex);


        this.showSummonEffect(unit.getWorldPosition());

        return theUnit.node;
    }
    showSummonEffect(worldPos: Vec3) {
        // effect
        let objSummonEffect = instantiate(this.summonPrefab);
        objSummonEffect.setParent(this.aboveNode);
        // let worldPos = unit.getWorldPosition();
        objSummonEffect.setWorldPosition(worldPos.x, worldPos.y - 30, worldPos.z);
        let summonEffect = objSummonEffect.getComponent(Animation);
        summonEffect.play(summonEffect.clips[0].name);
        let duration = summonEffect.clips[0].duration;
        this.scheduleOnce(() => {
            objSummonEffect.destroy();
        }, duration);

        // shake effect by tween
        this.shakeNode(this.TheTileMap, 0.2);
        this.shakeNode(this.canvasNode.getChildByName('Background'), 0.3);
    }
    public shakeNode(node: Node, duration: number) {
        let devideCount = 8;
        tween(node)
            .to(duration / devideCount, { position: new Vec3(node.position.x + 10, node.position.y, node.position.z) }, { easing: 'quadOut' })
            .to(duration / devideCount, { position: new Vec3(node.position.x - 10, node.position.y, node.position.z) }, { easing: 'quadIn' })
            .to(duration / devideCount, { position: new Vec3(node.position.x, node.position.y, node.position.z) }, { easing: 'quadOut' })
            .to(duration / devideCount, { position: new Vec3(node.position.x + 10, node.position.y, node.position.z) }, { easing: 'quadOut' })
            .to(duration / devideCount, { position: new Vec3(node.position.x - 10, node.position.y, node.position.z) }, { easing: 'quadIn' })
            .to(duration / devideCount, { position: new Vec3(node.position.x, node.position.y, node.position.z) }, { easing: 'quadOut' })
            .to(duration, { position: new Vec3(node.position.x, node.position.y, node.position.z) }, { easing: 'quadOut' })
            .start();
    }

    public spawnMergeUnit(slot: mergeSlot, unitIndex: number = 0): Node {
        // console.log("mergeUnit1");
        // let unitIndex = 0;
        let unitData = dataManager.Instance.unitInfoList[unitIndex];
        const unit = instantiate(this.mergeUnitPrefabs[unitIndex]);
        // console.log("mergeUnit2", unit);
        unit.setParent(this.unitNode);
        unit.setPosition(0, 0, 0);
        let theUnit = unit.getComponent(unitBase);
        theUnit.aboveNode = this.aboveNode;
        theUnit.setData(unitData);
        this.data.discoverCollection(unitIndex);

        // console.log("theUnit.damage", theUnit.damage);
        // mergeSlotArray 중에 mergeSlot.mergeUnit이 null인 곳 아무데나 setMergeUnit(mergeUnit); 실행
        slot.setMergeUnit(unit);

        this.showSummonEffect(unit.getWorldPosition());
        // // effect
        // let objSummonEffect = instantiate(this.summonPrefab);
        // objSummonEffect.setParent(this.aboveNode);
        // let worldPos = unit.getWorldPosition();
        // objSummonEffect.setWorldPosition(worldPos.x, worldPos.y - 30, worldPos.z);
        // let summonEffect = objSummonEffect.getComponent(Animation);
        // summonEffect.play(summonEffect.clips[0].name);
        // let duration = summonEffect.clips[0].duration;
        // this.scheduleOnce(() => {
        //     objSummonEffect.destroy();
        // }, duration);

        // // shake effect by tween
        // this.shakeNode(this.TheTileMap, 0.2);
        // this.shakeNode(this.canvasNode.getChildByName('Background'), 0.3);

        return theUnit.node;
    }
    saveMergeUnit() {
        let strUnits = "";
        for (let i = 0; i < gameManager.Instance.mergeSlotArray.length; i++) {
            let slot = gameManager.Instance.mergeSlotArray[i];
            if (slot.currentUnit) {
                let unitIndexAsNumber = slot.currentUnit.getComponent(unitBase).unitType as number;
                strUnits += unitIndexAsNumber.toString() + "_";
            }
            else {
                strUnits += "_";
            }
        }
        // console.log("strUnits:", strUnits);
        this.data.unit = strUnits;

        let strHeroes = "";
        for (let i = 0; i < gameManager.Instance.heroSlotArray.length; i++) {
            let slot = gameManager.Instance.heroSlotArray[i];
            if (slot.currentUnit) {
                // console.log("slot.currentUnit: " + slot.currentUnit);
                let unitIndexAsNumber = slot.currentUnit.getComponent(unitBase).unitType as number;
                // console.log("unitIndexAsNumber: " + unitIndexAsNumber);
                strHeroes += unitIndexAsNumber.toString() + "_";
            }
            else {
                strHeroes += "_";
            }
        }
        console.log("strHeroes:", strHeroes);
        this.data.hero = strHeroes;

        saveData.Instance.save();

        let strPlayerData = "unit,";
        strPlayerData += strUnits;

        // serverManager.Instance.savePlayerData(strPlayerData); // test now
    }


    public getHeroSlot(): mergeSlot {
        for (let i = 0; i < this.heroSlotArray.length; i++) {
            if (this.heroSlotArray[i].currentUnit == null || this.heroSlotArray[i].currentUnit == undefined) {
                console.log("heroSlotArray[i]: " + this.heroSlotArray[i]);
                return this.heroSlotArray[i];
            }
        }
        console.log("heroSlotArray null");
        return null;
    }
    private initializeGame(): void {
        console.log("GameManager 초기화 완료");
        // 게임 초기화 로직
    }

    // 게임 상태 관리 메서드들
    public getPlayerUnitsContainer(): Node {
        return this.playerUnitsContainer;
    }

    public getEnemiesContainer(): Node {
        return this.enemiesContainer;
    }

    public getProjectilesContainer(): Node {
        return this.projectilesContainer;
    }

    // 게임 이벤트 처리 메서드들
    public onEnemyDied(enemy: any): void {
        console.log("적이 죽었습니다:", enemy);
        // 적 죽음 처리 로직
    }

    public onPlayerUnitMerged(unitType: any): void {
        console.log("유닛이 합쳐졌습니다:", unitType);
        // 유닛 합치기 처리 로직
    }

    onDestroy() {
        if (gameManager._instance === this) {
            gameManager._instance = null;
        }
    }

    public getTimeString(seconds: number): string {
        let minutes = Math.floor(seconds / 60);
        let remainingSeconds = seconds % 60;

        // 00:00 포멧으로 변경 (padStart 미지원 환경 대응)
        const minuteStr = minutes < 10 ? "0" + minutes.toString() : minutes.toString();
        const secondStr = remainingSeconds < 10 ? "0" + remainingSeconds.toString() : remainingSeconds.toString();
        return minuteStr + ":" + secondStr;
    }
    public initSpine(spine: sp.Skeleton, spineName: string) {
        if (spineName == "werewolf") spine.setSkin("werewolf");
        else if (spineName == "bear") spine.setSkin("bear");
        else if (spineName == "lion") spine.setSkin("lion");
        spine.setAnimation(0, "idle", true);
    }
    public getPredict(unitIndex: number): number {
        if (unitIndex < 11) {
            return 0;
        }
        return 70;
    }
}