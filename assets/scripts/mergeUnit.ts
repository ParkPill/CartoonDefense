import { _decorator, Component, Node, Prefab, instantiate, input, Input, EventTouch, Vec3, Vec2, Animation, animation, Enum, CCInteger, resources, tween, Sprite, SpriteFrame, loader, Color, sp } from 'cc';
import { gameManager } from './gameManager';
import projectile from './projectile';
import { mergeSlot } from './mergeSlot';
import { dataManager, UnitData } from './dataManager';
import { enemy } from './enemy';
import { saveData } from './saveData';
import { unitBase, UnitType } from './unitBase';
import { UITransform } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('mergeUnit')
export class mergeUnit extends unitBase {
    public onSlotChange: (() => void) | null = null;
    // @property({ type: UnitType })
    // public unitType: UnitType = UnitType.UNIT_WORKER;
    @property({ type: Enum(UnitType) })
    public unitType: UnitType = UnitType.UNIT_WORKER;
    public starCount: number = 0;

    @property({ type: Node })
    public modelContainer: Node = null;
    @property({ type: Node })
    public aboveNode: Node = null;

    @property({ type: Node })
    public spriteUnit: Node = null;

    @property({ type: sp.Skeleton })
    public spineUnit: sp.Skeleton = null;

    public currentSlot: mergeSlot = null;

    private isDragging: boolean = false;
    private dragStartPosition: Vec3 = new Vec3();
    private originalPosition: Vec3 = new Vec3();

    shootInterval: number = 1;
    shootTime: number = 0;


    @property({ type: Prefab })
    public projectilePrefab0: Prefab = null;
    @property({ type: Prefab })
    public projectilePrefab1: Prefab = null;


    isChest: boolean = false;
    chestNode: Node = null;
    isPredictive: boolean = false;

    // constructor 

    start() {
        // this.setupModel();
        this.setupInputEvents();
        // console.log("spriteUnit", this.spriteUnit);
        // console.log("spineUnit", this.spineUnit);
        if (this.spriteUnit != null) {
            let animation = this.spriteUnit.getComponent(Animation);
            animation.play(animation.clips[0].name);
            // console.log("animation", animation);
            // animation.loop = true;
        }
        if (this.spineUnit != null) {
            // this.spineUnit.getComponent(Animation).unitType = this.unitType;
        }
        if (this.isChest) {
            resources.load('prefab/chest', Prefab, (err, prefab) => {
                this.chestNode = instantiate(prefab);
                this.chestNode.setParent(this.node);
                this.chestNode.setPosition(0, 0, 0);
                this.node.getChildByName('ModelContainer').active = false;
            });
        }
    }
    public updateStats() {
        let level = saveData.Instance.data.getUpgradeLevel(this.unitType);
        let extraDamage = level;
        let extraHP = 0;
        if (this.unitType >= UnitType.UNIT_HERO_ORC) {
            extraDamage = level * 0.5;
            extraHP = level * 0.5;
        }
        let data = dataManager.Instance.unitInfoList[this.unitType];
        this.damage = data.Damage + extraDamage;
        this.HP = data.HP + extraHP;
    }
    public override setData(data: UnitData): void {
        this.damage = data.Damage;
        this.HP = data.HP;
        let spineName = mergeUnit.getSpineName(data);
        if (spineName != "") {
            // console.log("spineSet: " + spineName);
            resources.load('spine/' + spineName, sp.SkeletonData, (err, skeletonData) => {
                if (err) {
                    console.error("SkeletonData 로드 실패:", err);
                    return;
                }
                this.spineUnit = this.node.getChildByName("ModelContainer").getChildByName("Model").getComponent(sp.Skeleton);
                this.spineUnit.skeletonData = skeletonData;

                gameManager.Instance.initSpine(this.spineUnit, spineName);
            });
        }
    }
    public static getSpineName(data: UnitData): string {
        let spineName = "";
        if (data.ID === "hero0") spineName = "orc";
        else if (data.ID === "hero1") spineName = "goblin";
        else if (data.ID === "hero2") spineName = "spearMan";
        else if (data.ID === "hero3") spineName = "lizard";
        else if (data.ID === "hero4") spineName = "archer";
        else if (data.ID === "hero5") spineName = "werewolf";
        else if (data.ID === "hero6") spineName = "monk";
        else if (data.ID === "hero7") spineName = "fighter";
        else if (data.ID === "hero8") spineName = "bear";
        else if (data.ID === "hero9") spineName = "healer";
        else if (data.ID === "hero10") spineName = "knight";
        else if (data.ID === "hero11") spineName = "elfSwordMan";
        else if (data.ID === "hero12") spineName = "assassin";
        else if (data.ID === "hero13") spineName = "lion";
        else if (data.ID === "hero14") spineName = "wizard";
        else if (data.ID === "hero15") spineName = "tanker";
        else if (data.ID === "hero16") spineName = "skeleton";
        else if (data.ID === "hero17") spineName = "necromancer";
        else if (data.ID === "hero18") spineName = "ent";
        else if (data.ID === "hero19") spineName = "salamander";
        else if (data.ID === "hero20") spineName = "undine";
        else if (data.ID === "hero21") spineName = "werewolfFemale";
        else if (data.ID === "hero22") spineName = "femaleLion";
        else if (data.ID === "hero23") spineName = "ladybear";
        else if (data.ID === "hero24") spineName = "santa";
        else if (data.ID === "hero25") spineName = "rudolph";
        else if (data.ID === "hero26") spineName = "santadog";
        else if (data.ID === "hero27") spineName = "penguin";
        else if (data.ID === "hero28") spineName = "catinboots";
        else if (data.ID === "hero29") spineName = "mole";
        else if (data.ID === "hero30") spineName = "robotMouse";
        else if (data.ID === "hero31") spineName = "savageArcher";
        else if (data.ID === "hero32") spineName = "batmonster";
        else if (data.ID === "hero33") spineName = "green_meat";
        else if (data.ID === "hero34") spineName = "parasite";
        else if (data.ID === "hero35") spineName = "watermelon";
        else if (data.ID === "hero36") spineName = "minobaby";
        else if (data.ID === "hero37") spineName = "mino";
        else if (data.ID === "hero38") spineName = "kerberos";
        else if (data.ID === "hero39") spineName = "lamia";
        else if (data.ID === "hero40") spineName = "chunja";
        else if (data.ID === "hero41") spineName = "golem";
        return spineName;
    }

    update(deltaTime: number) {
        if (this.isChest) return;
        this.shootTime += deltaTime;
        if (this.shootTime >= this.shootInterval) {
            this.shootTime -= this.shootInterval + Math.random() * 0.2;
            this.startAttack();
        }
    }

    public startAttack(): void {
        let target = this.getTarget();
        if (target == null) return;
        target.getComponent(enemy).reservedDamage += this.damage;

        let delay = this.getUnitAttackHappenTime(this.unitType);

        if (this.spriteUnit != null) {
            let animation = this.spriteUnit.getComponent(Animation);
            animation.play(animation.clips[1].name);
            // console.log("animation", animation);
        }
        if (this.spineUnit != null) {
            this.spineUnit.setAnimation(0, "attack", false);
        }

        this.scheduleOnce(() => {
            if (this.spriteUnit != null) {
                let animation = this.spriteUnit.getComponent(Animation);
                animation.play(animation.clips[0].name);
                // console.log("animation", animation);
            }
            if (this.spineUnit != null) {
                // this.spineUnit.getComponent(Animation).unitType = this.unitType;
            }
            if (target != null) {
                this.spawnProjectile(target);
            }
        }, delay);
        // this.spawnProjectile();
    }
    canPredict(): boolean {
        return this.isPredictive || (this.unitType >= UnitType.UNIT_HERO_ORC && Math.random() < 0.7);
    }
    getTarget(): Node {
        if (gameManager.Instance.enemies.length == 0) {
            return null;
        }
        let enemy = gameManager.Instance.enemies[0];
        // console.log("enemy.reservedDamage1 " + enemy.reservedDamage + " enemies.length " + gameManager.Instance.theGameScript.enemies.length);
        let enemyFound = false;
        let unit = enemy.getComponent(unitBase);
        if (enemy == null || unit.HP <= 0 || (this.canPredict() && unit.reservedDamage >= unit.HP)) {
            for (let i = 0; i < gameManager.Instance.enemies.length; i++) {
                // console.log("enemy.reservedDamage2", enemy.reservedDamage);
                enemy = gameManager.Instance.enemies[i]
                unit = enemy.getComponent(unitBase);
                if (unit.HP > 0 && (this.canPredict() && unit.reservedDamage < unit.HP)) {
                    enemyFound = true;
                    break;
                }
            }
            if (!enemyFound) {
                // console.log("enemyFound false");
                return null;
            }
        }
        return enemy;
    }

    public override takeDamage(damage: number): void {
        super.takeDamage(damage);
    }


    public spawnProjectile(target: Node): void {
        // console.log("spawnProjectile");
        let projectilePrefab = this.projectilePrefab0;
        if (this.unitType == UnitType.UNIT_HERO_ARCHER) projectilePrefab = this.projectilePrefab1;
        const prj = instantiate(projectilePrefab);
        prj.setParent(this.aboveNode);
        prj.setWorldPosition(this.node.worldPosition);
        prj.getComponent(projectile).damage = this.damage;
        if (this.unitType == UnitType.UNIT_ARCHER || this.unitType == UnitType.UNIT_HERO_ARCHER) prj.getComponent(projectile).extraRotation = -90;
        // console.log("spawnProjectile unit:" + this.unitType + " damage:" + this.damage);

        if (target != null) prj.getComponent(projectile).setTarget(target);
    }

    private setupInputEvents(): void {
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    private onTouchStart(event: EventTouch): void {
        if (this.isChest) {
            resources.load("images/ui/chestWoodOpen/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error("SpriteFrame 로드 실패:", err);
                    return;
                }
                const sprite = this.chestNode.getComponent(Sprite);
                sprite.spriteFrame = spriteFrame;
            });

            let duration = 0.5;
            tween(this.chestNode.getComponent(Sprite))
                .to(duration, { color: new Color(255, 255, 255, 0) }, { easing: 'quadOut' })
                .start();
            tween(this.chestNode)
                .to(duration, { scale: new Vec3(1.5, 1.5, 1.5) }, { easing: 'quadOut' })
                .call(() => {
                    this.chestNode.destroy();
                    this.node.getChildByName('ModelContainer').active = true;
                    this.isChest = false;
                })
                .start();
            return;
        }
        this.isDragging = true;
        this.dragStartPosition = event.getUILocation().toVec3();
        this.originalPosition = this.node.position.clone();

        // 드래그 중일 때 시각적 피드백 (예: 투명도 변경)
        this.node.setScale(1.1, 1.1, 1.1);
    }

    private onTouchMove(event: EventTouch): void {
        if (!this.isDragging) return;

        const currentPosition = event.getUILocation().toVec3();
        const deltaPosition = Vec3.subtract(new Vec3(), currentPosition, this.dragStartPosition);
        this.node.position = Vec3.add(new Vec3(), this.originalPosition, deltaPosition);
    }

    private onTouchEnd(event: EventTouch): void {
        console.log("position", event.getUILocation());
        if (!this.isDragging) return;

        this.isDragging = false;
        this.node.setScale(1.0, 1.0, 1.0);

        // 드롭된 위치에서 mergeSlot 찾기


        let targetSlot;

        if (this.unitType >= UnitType.UNIT_HERO_ORC) {
            targetSlot = this.findHeroSlot(event.getUILocation());
        }
        else {
            targetSlot = this.findMergeSlot(event.getUILocation());
        }

        if (targetSlot) {
            this.tryDropToMergeSlot(targetSlot);
        } else {
            // 원래 위치로 돌아가기
            this.node.position = this.originalPosition;
        }
    }

    private findHeroSlot(position: Vec2): mergeSlot | null {
        const mergeSlots = gameManager.Instance.heroSlotArray;
        for (let i = 0; i < mergeSlots.length; i++) {
            let slot = mergeSlots[i];
            const slotWorldPos = slot.node.getWorldPosition().toVec2();
            const distance = Vec2.distance(position, slotWorldPos);
            if (distance < 50) {
                return slot;
            }
        }
        return null;
    }

    private findMergeSlot(position: Vec2): mergeSlot | null {
        // 드롭 위치 근처의 mergeSlot 찾기
        const mergeSlots = gameManager.Instance.mergeSlotArray;
        for (const slot of mergeSlots) {
            // mergeSlot의 월드 좌표 구하기
            const slotWorldPos = slot.node.getWorldPosition().toVec2();
            let rect = slot.node.getComponent(UITransform).getBoundingBoxToWorld();
            // const distance = Vec2.distance(position, slotWorldPos);
            if (rect.contains(position)) {
                return slot;
            }
        }

        return null;
    }

    private tryDropToMergeSlot(targetSlot: mergeSlot): void {

        console.log("tryDropToMergeSlot this:", this);
        if (this.currentSlot == targetSlot) {
            this.node.position = this.originalPosition;
            return;
        }

        // mergeSlot이 비어있는 경우
        if (targetSlot.currentUnit == null) {
            // 드래그한 유닛을 해당 슬롯에 배치
            targetSlot.currentUnit = this.node;
            if (this.currentSlot != null) { // 기존 슬롯의 유닛 등록 해제
                this.currentSlot.currentUnit = null;
            }
            this.currentSlot = targetSlot;

            targetSlot.setMergeUnit(this.node);
            this.currentSlot = targetSlot;
            this.onSlotChange?.();
            return;
        }

        // mergeSlot에 이미 유닛이 있는 경우
        const existingUnit = targetSlot.currentUnit.getComponent(mergeUnit);

        // 같은 유닛 타입인지 확인
        if (this.unitType !== existingUnit.unitType) {
            // 다른 타입이면 드래그 드롭 취소
            this.node.position = this.originalPosition;
            return;
        }


        // 같은 타입이면 합치기 가능한지 확인
        const newUnitType = this.getNextUnitType(this.unitType);
        if (newUnitType === null) {
            this.node.position = this.originalPosition;
            return;
        }
        if (newUnitType >= UnitType.UNIT_HERO_ORC) {
            let heroSlot = gameManager.Instance.getHeroSlot();
            if (heroSlot == null) {
                this.node.position = this.originalPosition;
                return;
            }
            this.node.destroy();
            existingUnit.node.destroy();
            let spawnedNode = gameManager.Instance.spawnHero(heroSlot, newUnitType);
            let theUnit = spawnedNode.getComponent(mergeUnit);
            theUnit.currentSlot = heroSlot;

            return;
        }
        this.currentSlot.currentUnit = null;
        targetSlot.currentUnit = null;
        // 새로운 유닛 생성 및 배치
        // const newUnit = gameManager.Instance.theGameScript.createMergeUnit(newUnitType);
        // targetSlot.setMergeUnit(newUnit);
        let spawnedNode = gameManager.Instance.spawnMergeUnit(targetSlot, newUnitType);
        let theUnit = spawnedNode.getComponent(mergeUnit);
        theUnit.currentSlot = targetSlot;

        // 기존 두 유닛 제거
        this.node.destroy();
        existingUnit.node.destroy();
        gameManager.Instance.saveMergeUnit();
    }

    private getNextUnitType(currentType: UnitType): UnitType | null {
        // UNIT_TROLL(9) 이상인 경우 랜덤 히어로 생성
        if (currentType == UnitType.UNIT_TROLL || currentType == UnitType.UNIT_GLOW_TROLL) {
            let extraExclude = 0;
            if (currentType == UnitType.UNIT_GLOW_TROLL) {
                extraExclude = 6;
            }
            const heroTypes = [];
            let totalRate = 0;
            for (let i = UnitType.UNIT_HERO_ORC + extraExclude; i <= mergeUnit.getLastHeroType(); i++) {
                heroTypes.push(i);
                let data = dataManager.Instance.unitInfoList[i];
                totalRate += data.Rate;
            }
            let randomRate = Math.random() * totalRate;
            let currentRate = 0;
            for (let i = 0; i < heroTypes.length; i++) {
                currentRate += dataManager.Instance.unitInfoList[heroTypes[i]].Rate;
                if (randomRate <= currentRate) {
                    return heroTypes[i];
                }
            }
            let finalType = heroTypes[Math.floor(Math.random() * heroTypes.length)] as UnitType;
            // console.log("finalType: " + finalType);
            return finalType;
        }

        // 일반적인 경우 다음 단계로
        const nextType = currentType + 1;
        if (nextType <= UnitType.UNIT_TROLL) {
            return nextType;
        }

        return null;
    }


    public getUnitAttackHappenTime(unitType: UnitType): number {
        if (unitType == UnitType.UNIT_ARCHER) {
            return 0.3;
        } else if (unitType == UnitType.UNIT_SWORDMAN || unitType == UnitType.UNIT_HELICOPTER || unitType == UnitType.UNIT_ORC_SPEAR || unitType == UnitType.UNIT_ORC_AXE || unitType == UnitType.UNIT_GOBLIN || unitType == UnitType.UNIT_TROLL) {
            return 0.3;
        } else if (unitType == UnitType.UNIT_CATAPULT) {//} || unitType == UnitType.UNIT_WATCHERTOWER || unitType == UnitType.UNIT_ORC_BUNKER || unitType == UnitType.UNIT_ORC_HQ) {
            return 0.0;
        } else if (unitType == UnitType.UNIT_WORKER) {// || unitType == UnitType.UNIT_GOBLIN_WORKER) {
            return 0.5;
            // } else if (unitType == UnitType.UNIT_WIZARD) {
            //     return 0.4;
        } else if (unitType == UnitType.UNIT_HERO_ORC) {
            return 1.3;
        } else if (unitType == UnitType.UNIT_HERO_ARCHER) {
            return 1.2;
        } else if (unitType == UnitType.UNIT_HERO_GOBLIN) {
            return 1.13;
        } else if (unitType == UnitType.UNIT_HERO_LIZARDMAN) {
            return 1.33;
        } else if (unitType == UnitType.UNIT_HERO_SPEARMAN) {
            return 0.73;
        } else if (unitType == UnitType.UNIT_HERO_WEREWOLF) {
            return 0.76;
        } else if (unitType == UnitType.UNIT_HERO_MONK) {
            return 0.9;
        } else if (unitType == UnitType.UNIT_HERO_FIGHTER) {
            return 19.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_BEAR) {
            return 19.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_HEALER) {
            return 32.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_KNIGHT) {
            return 20.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_ELF_SWORDMAN) {
            return 20.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_ASSASSIN) {
            return 29.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_LION ||
            unitType == UnitType.UNIT_HERO_PENGUIN) {
            return 20.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_WIZARD) {
            return 13.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_TANKER ||
            unitType == UnitType.UNIT_HERO_MEMEAT) {
            return 40.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_SKELETON) {
            return 22.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_REAPER) {
            return 37.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_ENT) {
            return 18.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_SANTA) {
            return 38.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_SALAMANDER) {
            return 26.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_RUDOLPH) {
            return 26.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_SANTADOG) {
            return 28.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_UNDINE) {
            return 24.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_LADY_WEREWOLF) {
            return 25.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_CATINBOOTS) {
            return 29.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_MOLE) {
            return 19.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_LADY_BEAR) {
            return 23.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_LADY_LION) {
            return 20.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_TOYMOUSE) {
            return 57.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_SAVAGEARCHER) {
            return 30.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_BATMONSTER) {
            return 22.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_PARASITE) {
            return 29.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_WATERMELON) {
            return 25.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_BABYMINO) {
            return 23.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_MINO) {
            return 19.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_KERBEROS) {
            return 16.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_LAMIA) {
            return 25.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_CHUNJA) {
            return 13.0 / 30;
        } else if (unitType == UnitType.UNIT_HERO_GOLEM) {
            return 47.0 / 30;
        }
        return 0.2;
    }
    public static getLastHeroType(): UnitType {
        return UnitType.UNIT_HERO_UNDINE;
    }
    public setupModel(): void {
        // 기존 모델 제거
        if (this.modelContainer) {
            this.modelContainer.removeAllChildren();
        }

        // 새로운 모델 생성
        let modelPrefab: Prefab = null;

        if (this.unitType >= UnitType.UNIT_HERO_ORC && this.unitType <= mergeUnit.getLastHeroType()) {
            // 히어로 유닛 (47-91): spineUnit 사용
            // modelPrefab = this.spineUnitPrefab;
        } else if (this.unitType >= UnitType.UNIT_WORKER && this.unitType <= UnitType.UNIT_TROLL) {
            // 일반 유닛 (0-9): spriteUnit 사용
            // modelPrefab = this.spriteUnitPrefab;
        }

        if (modelPrefab && this.modelContainer) {
            const model = instantiate(modelPrefab);
            this.modelContainer.addChild(model);

            // 모델에 적절한 스크립트 설정
            // if (modelPrefab === this.spriteUnitPrefab) {
            //     // spriteUnit 스크립트 설정
            //     // model.getComponent('spriteUnit')?.setUnitType(this.unitType);
            // } else if (modelPrefab === this.spineUnitPrefab) {
            //     // spineUnit 스크립트 설정
            //     // model.getComponent('spineUnit')?.setUnitType(this.unitType);
            // }
        }
    }
}
