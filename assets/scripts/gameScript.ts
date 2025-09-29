import { _decorator, CCInteger, Component, director, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, TiledLayer, tween, UITransform, Vec2, Vec3, Animation } from 'cc';
import { gameManager } from './gameManager';
import { mergeUnit, UnitType } from './mergeUnit';
import { enemy } from './enemy';
import { mergeSlot } from './mergeSlot';
import { dataManager } from './dataManager';
import { languageManager } from './languageManager';
import { playerData } from './playerData';
import { saveData } from './saveData';
import { heroSlot } from './heroSlot';
import { serverManager } from './serverManager';
import { popupManager } from './ui/popupManager';
import { pnlCreateUser } from './ui/popup/pnlCreateUser';
const { ccclass, property } = _decorator;

@ccclass('gameScript')
export class gameScript extends Component {
    @property(Label)
    public lblStage: Label;
    @property(Node)
    public stageInfoNode: Node;
    @property(Node)
    public testUnitSpine: Node;
    @property(Node)
    public canvas: Node;
    @property(Node)
    public unitNode: Node;
    @property(Node)
    public uiNode: Node;
    @property(Node)
    public aboveNode: Node;
    @property({ type: [Vec2] })
    public routeArray: Vec2[] = [];
    @property({ type: [Node] })
    public routeFlagNodes: Node[] = [];
    @property([SpriteFrame])
    public unitSpriteFrame: SpriteFrame[] = [];
    public passedEnemyCount: number = 0;
    stageFailPassCount = 10;
    starOnePassCount = 10;


    // public playerUnits: mergeUnit[] = [];
    @property({ type: [enemy] })
    public enemies: enemy[] = [];
    @property(Label)
    public lblGoldCount: Label;
    @property(Label)
    public lblGemCount: Label;
    @property(CCInteger)
    public summonPrice: number = 50;
    @property({ type: [Prefab] })
    public mergeUnitPrefabs: Prefab[] = [];
    // @property({ type: [Prefab] })
    // public heroUnitPrefabs: Prefab[] = [];
    @property({ type: [Prefab] })
    public enemyPrefabs: Prefab[] = [];
    @property({ type: Prefab })
    public summonPrefab: Prefab;
    @property({ type: [SpriteFrame] })
    public treeSprites: SpriteFrame[] = [];
    @property(Prefab)
    public treeTemp: Prefab;
    @property(Prefab)
    public goldPrefab: Prefab;
    @property(Prefab)
    public gemPrefab: Prefab;
    @property(Prefab)
    public heroPrefab: Prefab;
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
    enemyModelIndexList: number[];
    heroList: mergeUnit[] = [];
    data: playerData;
    @property(Node)
    public TheTileMap: Node;
    decoTiledLayer: TiledLayer;

    @property({ type: [mergeSlot] })
    public mergeSlotArray: mergeSlot[] = [];

    @property({ type: [mergeSlot] })
    public heroSlotArray: mergeSlot[] = [];

    public canvasNode: Node;
    isBursterCall: boolean = true; // test now

    @property(Sprite)
    public imgStageProgress: Sprite;
    @property(Sprite)
    public imgHP: Sprite;
    isDungeon: boolean = false;
    public isUnitLoaded: boolean = false;
    start() {
        // 씬 이름이 game인지 확인
        this.isDungeon = this.node.scene.name !== "game";
        this.canvasNode = this.node.scene.getChildByName('Canvas');
        if (!gameManager.Instance.isTitleLoaded) {
            director.loadScene("title");
            return;
        }

        this.data = saveData.Instance.data;
        this.subStage = this.data.currentStage % 10;
        this.stage = Math.floor(this.data.currentStage / 10) + 1;
        console.log("stage", this.stage);
        console.log("subStage", this.subStage);

        gameManager.Instance.theGameScript = this;
        // 스파인 애니메이션에서 attack 애니메이션을 실행
        // sp.Skeleton 타입으로 명시적 형 변환이 필요합니다.
        // let spine = this.testUnitSpine.getComponent('sp.Skeleton') as any;
        // console.log("spine gogo1", spine);
        // if (spine) {
        //     console.log("spine gogo2", spine);
        //     spine.setAnimation(0, "attack", false);
        // }
        this.routeFlagNodes.forEach(node => {
            this.routeArray.push(node.position.toVec2());
        });

        if (!this.isDungeon) {
            this.startStage();
        }

        this.decoTiledLayer = this.TheTileMap.getChildByName('deco').getComponent(TiledLayer);
        // decoTiledLayer에서 타일이 칠해진 부분을 찾아서 console.log 찍기
        if (this.decoTiledLayer) {
            const layerSize = this.decoTiledLayer.getLayerSize();
            let tileSize = 50;
            let backgroundNode = this.canvasNode.getChildByName('Background');
            let height = layerSize.height;
            let width = layerSize.width;
            let tileMapTransform = this.TheTileMap.getComponent(UITransform);
            for (let x = 0; x < layerSize.width; x++) {
                for (let y = 0; y < layerSize.height; y++) {
                    const tile = this.decoTiledLayer.getTileGIDAt(x, y);
                    if (tile === 50) {
                        let objTree = instantiate(this.treeTemp);
                        let treeIndex = Math.floor(Math.random() * this.treeSprites.length);
                        // console.log("treeIndex " + treeIndex + " tree length " + this.treeSprites.length + " objTree " + objTree);
                        objTree.setParent(backgroundNode);
                        objTree.getComponent(Sprite).spriteFrame = this.treeSprites[treeIndex];
                        objTree.position = new Vec3(x * tileSize - tileMapTransform.contentSize.width / 2, height - (y + 1) * tileSize + tileMapTransform.contentSize.height / 2, 0);
                        this.decoTiledLayer.setTileGIDAt(tile, x, y, -1);
                    }
                }
            }
        }
        this.updateCurrency();
        serverManager.Instance; // init and test

        console.log("_id: ", this.data._id);

        // this.addGold(1000000, new Vec2(0, 0)); // test 
        // this.data.currentStage = 1;
        // saveData.Instance.save();

        this.loadUnits();
        // for (let i = 0; i < 10; i++) {
        //     this.spawnHero(this.heroSlotArray[i], UnitType.UNIT_HERO_KNIGHT + i);
        // }
        // this.spawnHero(this.getHeroSlot(), UnitType.UNIT_HERO_ORC);
        // this.spawnHero(this.getHeroSlot(), UnitType.UNIT_HERO_GOBLIN);
        // this.spawnHero(this.getHeroSlot(), UnitType.UNIT_HERO_SPEARMAN);
        // this.data.gold = 0; // test

        // let playerData = this.data._id + ",gem,100";
        // serverManager.Instance.savePlayerData(playerData);
        // init done
    }
    loadUnits() {
        console.log("로드 유닛 시작");
        if (!this.isDungeon) {
            let unitArray = this.data.unit.split("_");
            for (let i = 0; i < unitArray.length; i++) {
                let unit = unitArray[i];
                if (unit != "") {
                    // console.log("unit: " + unit + " i: " + i);
                    let unitIndex = parseInt(unit);
                    const newUnit = this.createMergeUnit(unitIndex);
                    this.mergeSlotArray[i].setMergeUnit(newUnit);
                    let unitData = dataManager.Instance.unitInfoList[unitIndex];
                    newUnit.getComponent(mergeUnit).setData(unitData);
                }
            }
        }

        let heroArray = this.data.hero.split("_");
        for (let i = 0; i < heroArray.length; i++) {
            let hero = heroArray[i];
            if (hero != "") {
                // console.log("히어로: " + hero);
                let heroIndex = parseInt(hero);

                let unitData = dataManager.Instance.unitInfoList[heroIndex];
                const unit = instantiate(this.heroPrefab);//this.heroUnitPrefabs[unitIndex - 11]);
                unit.setParent(this.unitNode);
                // 오른쪽을 바라보도록 scale -1
                unit.getChildByName("ModelContainer").setScale(-1, 1, 1);
                let theUnit = unit.getComponent(mergeUnit);
                theUnit.aboveNode = this.aboveNode;
                unit.setPosition(0, 0, 0);
                theUnit.unitType = heroIndex;
                theUnit.setData(unitData);
                this.heroSlotArray[i].setMergeUnit(unit);
                this.heroList.push(theUnit);
            }
        }
        this.isUnitLoaded = true;
    }
    updateCurrency() {
        this.lblGemCount.string = this.data.gem.toString();
        this.lblGoldCount.string = this.data.gold.toString();
    }

    startStage() {
        if (this.data.nickname === "Guest" && this.subStage > 1) {
            popupManager.Instance.openPopup("pnlCreateUser");
            return;
        }



        this.imgHP.fillRange = 1;
        this.imgStageProgress.fillRange = 0;
        let currentStage = (this.stage - 1) * 10 + this.subStage;
        this.data.currentStage = currentStage;
        if (this.data.highestStage < currentStage) {
            this.data.highestStage = currentStage;
        }
        saveData.Instance.save();

        let animation = this.stageInfoNode.getComponent(Animation);
        animation.play(animation.clips[0].name);
        let duration = animation.clips[0].duration;
        this.stageInfoNode.getChildByName("lblStage").getComponent(Label).string = this.stage + "-" + this.subStage;
        this.scheduleOnce(() => {

            this.isGameStart = true;
            this.spawnedEnemyCount = 0;
            this.totalKilledEnemy = 0;
            this.lblStage.string = languageManager.getText("stage") + " " + this.stage + "-" + this.subStage;
            this.totalEnemyCount = 50 + this.subStage * 10;
            if (this.subStage == 10) {
                this.totalEnemyCount = 150;
            }
            this.enemyIndexList = [this.totalEnemyCount];
            this.enemyScaleList = [this.totalEnemyCount];
            this.enemyHPScaleList = [this.totalEnemyCount];
            this.enemyModelIndexList = [this.totalEnemyCount];
            for (let i = 0; i < this.totalEnemyCount; i++) {
                this.enemyIndexList[i] = 0;
                this.enemyScaleList[i] = 1;
                this.enemyHPScaleList[i] = 1;
                this.enemyModelIndexList[i] = Math.floor(Math.random() * 2);
                if ((i + 1) % 10 == 0 && i > 10) {
                    this.enemyScaleList[i] = 1.4;
                    this.enemyHPScaleList[i] = 5;
                    // this.enemyModelIndexList[i] = 1;
                }
            }

            this.enemyScaleList[this.totalEnemyCount / 2] = 2;
            this.enemyHPScaleList[this.totalEnemyCount / 2] = 20;

            if (this.subStage == 10) {
                this.enemyScaleList[this.totalEnemyCount - 1] = 2;
                this.enemyHPScaleList[this.totalEnemyCount - 1] = 100;
                // this.enemyModelIndexList[this.totalEnemyCount - 1] = 1;
            }
            else {
                this.enemyScaleList[this.totalEnemyCount - 1] = 3;
                this.enemyHPScaleList[this.totalEnemyCount - 1] = 60;
            }
        }, duration);

    }

    public onSummonButtonClicked() {
        // console.log("onSummonButtonClicked", this.goldCount, this.summonPrice);
        // check if slot is full
        let isFull = this.isSlotFull();
        if (isFull) {
            console.log("slot is full");
            return;
        }
        if (this.data.gold >= this.summonPrice) {
            this.data.gold -= this.summonPrice;
            this.lblGoldCount.string = this.data.gold.toString();
            this.spawnMergeUnit(this.getMergeSlot());

            if (!this.isSlotFull()) { // test now
                // this.spawnChest(this.chestIndex);
                this.spawnChest(9);
                this.chestIndex++;
                if (this.chestIndex >= UnitType.UNIT_GLOW_TROLL) {
                    this.chestIndex = UnitType.UNIT_GLOW_TROLL;
                }
            }
            this.saveMergeUnit();
        }
    }
    public onCollectionClick() {
        popupManager.Instance.openPopup("pnlCollection");
    }
    public onDungeonClick() {
        popupManager.Instance.openPopup("pnlDungeon");
    }
    public onStageClick() {
        popupManager.Instance.openPopup("pnlStage");
    }
    public onUpgradeClick() {
        popupManager.Instance.openPopup("pnlUpgrade");
    }
    public onShopClick() {
        popupManager.Instance.openPopup("pnlShop");
    }
    public onPostClick() {
        popupManager.Instance.openPopup("pnlPost");
    }
    public onAdsShopClick() {
        popupManager.Instance.openPopup("pnlAdsShop");
    }
    public updateStats() {
        for (let i = 0; i < this.mergeSlotArray.length; i++) {
            let unit = this.mergeSlotArray[i].currentUnit;
            if (unit) {
                unit.getComponent(mergeUnit).updateStats();
            }
        }
        for (let i = 0; i < this.heroSlotArray.length; i++) {
            let unit = this.heroSlotArray[i].currentUnit;
            if (unit) {
                unit.getComponent(mergeUnit).updateStats();
            }
        }
    }
    chestIndex: number = 0;
    isSlotFull(): boolean {
        for (let i = 0; i < this.mergeSlotArray.length; i++) {
            if (this.mergeSlotArray[i].currentUnit == null) {
                return false;
            }
        }
        return true;
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

    public spawnHero(slot: mergeSlot, unitIndex: number = 0): mergeUnit {
        let unitData = dataManager.Instance.unitInfoList[unitIndex];
        const unit = instantiate(this.heroPrefab);//this.heroUnitPrefabs[unitIndex - 11]);
        unit.setParent(this.unitNode);
        // 오른쪽을 바라보도록 scale -1
        unit.getChildByName("ModelContainer").setScale(-1, 1, 1);
        let theUnit = unit.getComponent(mergeUnit);
        theUnit.aboveNode = this.aboveNode;
        unit.setPosition(0, 0, 0);
        theUnit.unitType = unitIndex;
        theUnit.setData(unitData);
        slot.setMergeUnit(unit);
        this.data.discoverCollection(unitIndex);


        this.showSummonEffect(unit.getWorldPosition());

        return theUnit;
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

    public spawnMergeUnit(slot: mergeSlot, unitIndex: number = 0): mergeUnit {
        // console.log("mergeUnit1");
        // let unitIndex = 0;
        let unitData = dataManager.Instance.unitInfoList[unitIndex];
        const unit = instantiate(this.mergeUnitPrefabs[unitIndex]);
        // console.log("mergeUnit2", unit);
        unit.setParent(this.unitNode);
        unit.getComponent(mergeUnit).aboveNode = this.aboveNode;
        unit.setPosition(0, 0, 0);
        let theUnit = unit.getComponent(mergeUnit);
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

        return theUnit;
    }
    getMergeSlot(): mergeSlot {
        for (let i = 0; i < this.mergeSlotArray.length; i++) {
            if (this.mergeSlotArray[i].currentUnit == null) {
                return this.mergeSlotArray[i];
            }
        }
        return null;
    }

    public spawnChest(chestIndex: number) {
        console.log("spawnChest: " + chestIndex);
        let slot = this.getMergeSlot();
        let theUnit = this.spawnMergeUnit(slot, chestIndex);
        theUnit.isChest = true;
    }
    public createAccountTest() {
        popupManager.Instance.openPopup("pnlCreateUser");
    }
    saveMergeUnit() {
        let strUnits = "";
        for (let i = 0; i < this.mergeSlotArray.length; i++) {
            let slot = this.mergeSlotArray[i];
            if (slot.currentUnit) {
                let unitIndexAsNumber = slot.currentUnit.getComponent(mergeUnit).unitType as number;
                strUnits += unitIndexAsNumber.toString() + "_";
            }
            else {
                strUnits += "_";
            }
        }
        // console.log("strUnits:", strUnits);
        this.data.unit = strUnits;

        let strHeroes = "";
        for (let i = 0; i < this.heroSlotArray.length; i++) {
            let slot = this.heroSlotArray[i];
            if (slot.currentUnit) {
                // console.log("slot.currentUnit: " + slot.currentUnit);
                let unitIndexAsNumber = slot.currentUnit.getComponent(mergeUnit).unitType as number;
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
    shakeNode(node: Node, duration: number) {
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

    spawnEnemy() {
        let index = this.spawnedEnemyCount;
        let modelIndex = this.enemyModelIndexList[index];
        const enemyNode = instantiate(this.enemyPrefabs[modelIndex]);
        enemyNode.setParent(this.unitNode);
        // enemyNode.setSiblingIndex(0);
        enemyNode.setPosition(this.routeArray[0].toVec3());
        let theEnemy = enemyNode.getComponent(enemy);

        theEnemy.data = dataManager.Instance.getEnemyDataByIndex(this.enemyIndexList[index]);
        // console.log("theEnemy.data", theEnemy.data.RewardGold);
        let modelScale = this.enemyScaleList[index];
        enemyNode.setScale(modelScale, modelScale, 1);
        let hpScale = this.enemyHPScaleList[index];
        theEnemy.setHP(theEnemy.data.HP * hpScale);
        theEnemy.data.RewardGold *= (hpScale + modelScale) / 2;
        theEnemy.routeArray = this.routeArray.map(vec2 => vec2.clone());
        theEnemy.onDead = (deadEnemy: enemy) => {
            this.totalKilledEnemy++;
            this.addGold(Math.floor(deadEnemy.data.RewardGold), deadEnemy.node.getWorldPosition().toVec2());
            this.enemies.splice(this.enemies.indexOf(deadEnemy), 1);
        };
        theEnemy.onMovementComplete = () => {
            this.passedEnemyCount++;
            this.imgHP.getComponent(Sprite).fillRange = (this.stageFailPassCount - this.passedEnemyCount) / this.stageFailPassCount;

            this.enemies.splice(this.enemies.indexOf(theEnemy), 1);
            theEnemy.node.destroy();

            if (this.passedEnemyCount >= this.stageFailPassCount) {
                this.stageFailed();
            }
        };
        this.enemies.push(theEnemy);
    }

    update(deltaTime: number) {
        if (this.isGameStart) {
            this.enemySpawnTime += deltaTime;
            let interval = this.enemySpawnInterval;
            if (this.isBursterCall) {
                interval = this.enemySpawnInterval / 2;
                // console.log("interval", interval);
            }
            if (this.enemySpawnTime >= interval && this.spawnedEnemyCount < this.totalEnemyCount) {
                this.spawnEnemy();
                this.spawnedEnemyCount++;
                this.imgStageProgress.getComponent(Sprite).fillRange = this.spawnedEnemyCount / this.totalEnemyCount;
                this.enemySpawnTime -= interval;
            }

            if (this.totalKilledEnemy >= this.totalEnemyCount || (this.spawnedEnemyCount >= this.totalEnemyCount && this.enemies.length == 0)) {
                this.stageClear();
            }


            // console.log("current time: ", serverManager.Instance.getCurrentTime());
            if (this.data.lastDayCheckTime.getDate() !== serverManager.Instance.getCurrentTime().getDate()) {
                console.log("lastDayCheckTime is not today");
                this.data.lastDayCheckTime = serverManager.Instance.getCurrentTime();
                for (let i = 0; i < this.data.tickets.length; i++) {
                    if (this.data.tickets[i] < this.data.defaultTicketCount) {
                        this.data.tickets[i] = this.data.defaultTicketCount;
                    }
                }

                saveData.Instance.save();
            }
        }
    }
    stageClear() {
        console.log("stageClear");
        this.isGameStart = false;

        let starCount = 3;
        if (this.spawnedEnemyCount > this.totalKilledEnemy) {
            starCount = 2;
        }
        if (this.spawnedEnemyCount - 5 >= this.totalKilledEnemy) {
            starCount = 1;
        }
        let currentStage = (this.stage - 1) * 10 + this.subStage - 1;
        this.data.setStageStar(currentStage, starCount);

        saveData.Instance.save();


        this.subStage++;
        if (this.subStage > 10) {
            this.stage++;
            this.subStage = 1;
        }

        let playerData = saveData.Instance.data;
        if (playerData.nickname === "Guest") {
            this.createAccountAtServer();
        } else {
            // show ui
            this.startStage();
        }
    }
    createAccountAtServer() {
        // popupManager.Instance.openPopup("pnlCreateUser");
    }
    stageFailed() {
        // remove all enemies
        this.enemies.forEach(enemy => {
            enemy.node.destroy();
        });
        this.enemies = [];

        this.isGameStart = false;
        this.subStage--;
        if (this.subStage < 1) {
            this.stage--;
            this.subStage = 10;
        }
        if (this.stage < 1) {
            this.stage = 1;
            this.subStage = 1;
        }
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
                        this.data.gold += gold;
                        this.lblGoldCount.string = this.data.gold.toString();
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
    public addGem(gem: number, worldPos: Vec2) {
        // gemPrefab 인스턴스 생성
        const gemNode = instantiate(this.gemPrefab);
        gemNode.setParent(this.uiNode); // 월드 상에 우선 unitNode에 붙임
        gemNode.setWorldPosition(worldPos.toVec3());

        // 1단계: 살짝 위로 떠오르기
        const upPosition = worldPos.clone();
        upPosition.y += 50;

        // 2단계: imgGem 위치로 이동
        // imgGem의 월드 좌표 구하기
        const imgGemNode = this.node.scene.getChildByName('Canvas').getChildByName('UI').getChildByName('imgGem');
        const imgGemWorldPos = imgGemNode.getWorldPosition();

        // 1단계 트윈: 위로 떠오르기
        tween(gemNode)
            .to(0.3, { worldPosition: upPosition.toVec3() }, { easing: 'quadOut' })
            .call(() => {
                // console.log("1단계 트윈 완료");
                // 2단계 트윈: imgGem로 이동
                tween(gemNode)
                    .to(1, { worldPosition: imgGemWorldPos }, { easing: 'quadOut' })
                    .call(() => {
                        // 젬 증가
                        this.data.gem += gem;
                        saveData.Instance.save();
                        this.lblGemCount.string = this.data.gem.toString();
                        // 살짝 커졌다가 다시 작아지는 트윈 효과 추가
                        this.lblGemCount.node.setScale(1, 1, 1);
                        tween(this.lblGemCount.node)
                            .to(0.1, { scale: new Vec3(1.3, 1.3, 1.3) }, { easing: 'quadOut' })
                            .to(0.1, { scale: new Vec3(1, 1, 1) }, { easing: 'quadIn' })
                            .start();
                        // 젬 오브젝트 제거
                        gemNode.destroy();
                    })
                    .start();
            })
            .start();
    }
    public updateShopUI(): void {
        console.log("updateShopUI");
    }
}


