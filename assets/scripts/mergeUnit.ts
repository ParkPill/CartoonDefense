import { _decorator, Component, Node, Prefab, instantiate, input, Input, EventTouch, Vec3, Vec2, Animation, animation } from 'cc';
import { gameManager } from './gameManager';
import projectile from './projectile';
const { ccclass, property } = _decorator;


// C#의 enum과 유사하게 TypeScript enum으로 변환
export enum UnitType {
    UNIT_WORKER = 0,
    UNIT_SWORDMAN = 1,
    UNIT_ARCHER = 2,
    UNIT_CATAPULT = 3,
    UNIT_HELICOPTER = 4,
    UNIT_ORC_AXE = 5,
    UNIT_ORC_SPEAR = 6,
    UNIT_GOBLIN = 7,
    UNIT_GOBLIN_BOMB = 8,
    UNIT_TROLL = 9,
    UNIT_AIRPORT = 10,
    UNIT_BARRACKS = 11,
    UNIT_CASTLE = 12,
    UNIT_FACTORY = 13,
    UNIT_FARM = 14,
    UNIT_LUMBERMILL = 15,
    UNIT_MINE = 16,
    UNIT_WATCHERTOWER = 17,
    UNIT_METEOR = 18,
    UNIT_MISSILE_STRAIGHT = 19,
    UNIT_MISSILE_CHASING = 20,
    UNIT_DESTRUCTABLE = 21,
    UNIT_MISSILE_CUSTOM = 22,
    UNIT_MISSILE_Movable = 23,
    UNIT_ITEM = 24,
    UNIT_NPC = 25,
    UNIT_TREE = 26,
    UNIT_ORC_BUNKER = 28,
    UNIT_ORC_HQ = 29,
    UNIT_ZOMBIE_ORC_AXE = 30,
    UNIT_ZOMBIE_SWORDSMAN = 31,
    UNIT_ZOMBIE_CASTLE = 32,
    UNIT_ZOMBIE_HQ = 33,
    UNIT_LAMINGTON = 34,
    UNIT_UNREACHABLE_TREE = 35,
    UNIT_START_POINT = 36,
    UNIT_EVENT_POINT = 37,
    UNIT_UNDERGROUND_BUNKER = 38,
    UNIT_TRIGGER = 39,
    UNIT_WIZARD = 40,
    UNIT_TEMPLE = 41,
    UNIT_ORC_BARRACKS = 42,
    UNIT_ORC_TROLL_HOUSE = 43,
    UNIT_TREE_FOR_BATTLE = 44,
    UNIT_GOBLIN_WORKER = 45,
    UNIT_BARBECUE = 46,
    UNIT_HERO_ORC = 47,
    UNIT_HERO_GOBLIN = 48,
    UNIT_HERO_SPEARMAN = 49,
    UNIT_HERO_LIZARDMAN = 50,
    UNIT_HERO_ARCHER = 51,
    UNIT_HERO_WEREWOLF = 52,
    UNIT_HERO_MONK = 53,
    UNIT_HERO_FIGHTER = 54,
    UNIT_HERO_BEAR = 55,
    UNIT_HERO_HEALER = 56,
    UNIT_HERO_KNIGHT = 57,
    UNIT_HERO_ELF_SWORDMAN = 58,
    UNIT_HERO_ASSASSIN = 59,
    UNIT_HERO_LION = 60,
    UNIT_HERO_WIZARD = 61,
    UNIT_HERO_TANKER = 62,
    UNIT_HERO_SKELETON = 63,
    UNIT_HERO_REAPER = 64,
    UNIT_HERO_ENT = 65,
    UNIT_HERO_SALAMANDER = 66,
    UNIT_HERO_UNDINE = 67,
    UNIT_HERO_CRAZY_WEREWOLF = 68,
    UNIT_HERO_CRAZY_BEAR = 69,
    UNIT_HERO_CRAZY_LION = 70,
    UNIT_HERO_LADY_WEREWOLF = 71,
    UNIT_HERO_LADY_LION = 72,
    UNIT_HERO_LADY_BEAR = 73,
    UNIT_HERO_SANTA = 74,
    UNIT_HERO_RUDOLPH = 75,
    UNIT_HERO_SANTADOG = 76,
    UNIT_HERO_PENGUIN = 77,
    UNIT_HERO_CATINBOOTS = 78,
    UNIT_HERO_MOLE = 79,
    UNIT_HERO_TOYMOUSE = 80,
    UNIT_HERO_SAVAGEARCHER = 81,
    UNIT_HERO_BATMONSTER = 82,
    UNIT_HERO_MEMEAT = 83,
    UNIT_HERO_PARASITE = 84,
    UNIT_HERO_WATERMELON = 85,
    UNIT_HERO_BABYMINO = 86,
    UNIT_HERO_MINO = 87,
    UNIT_HERO_KERBEROS = 88,
    UNIT_HERO_LAMIA = 89,
    UNIT_HERO_CHUNJA = 90,
    UNIT_HERO_GOLEM = 91,
    UNIT_MISSILE_NOTHING = 100
}
@ccclass('mergeUnit')
export class mergeUnit extends Component {
    @property({ type: UnitType })
    public unitType: UnitType = UnitType.UNIT_WORKER;

    @property({ type: Node })
    public modelContainer: Node = null;

    @property({ type: Node })
    public spriteUnit: Node = null;

    @property({ type: Node })
    public spineUnit: Node = null;

    private isDragging: boolean = false;
    private dragStartPosition: Vec3 = new Vec3();
    private originalPosition: Vec3 = new Vec3();

    shootInterval: number = 1;
    shootTime: number = 0;

    @property({ type: Prefab })
    public projectilePrefab: Prefab = null;

    start() {
        // this.setupModel();
        this.setupInputEvents();
        console.log("spriteUnit", this.spriteUnit);
        console.log("spineUnit", this.spineUnit);
        if (this.spriteUnit != null) {
            let animation = this.spriteUnit.getComponent(Animation);
            animation.play(animation.clips[0].name);
            console.log("animation", animation);
            // animation.loop = true;
        }
        if (this.spineUnit != null) {
            // this.spineUnit.getComponent(Animation).unitType = this.unitType;
        }
    }

    update(deltaTime: number) {
        this.shootTime += deltaTime;
        if (this.shootTime >= this.shootInterval) {
            this.shootTime -= this.shootInterval;
            this.startAttack();
        }
    }

    public startAttack(): void {
        console.log("attack");
        this.spawnProjectile();
    }

    public spawnProjectile(): void {
        console.log("spawnProjectile");
        const prj = instantiate(this.projectilePrefab);
        prj.setParent(this.node.parent);
        prj.setPosition(this.node.position);
        let enemy = gameManager.Instance.theGameScript.enemies[0];
        if (enemy == null || enemy.getCurrentHealth() <= 0) {
            for (let i = 0; i < gameManager.Instance.theGameScript.enemies.length; i++) {
                enemy = gameManager.Instance.theGameScript.enemies[i]
                if (enemy.getCurrentHealth() > 0) {
                    break;
                }
            }
        }

        prj.getComponent(projectile).setTarget(enemy.node);
    }

    private setupInputEvents(): void {
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    private onTouchStart(event: EventTouch): void {
        this.isDragging = true;
        this.dragStartPosition = event.getLocation().toVec3();
        this.originalPosition = this.node.position.clone();

        // 드래그 중일 때 시각적 피드백 (예: 투명도 변경)
        this.node.setScale(1.1, 1.1, 1.1);
    }

    private onTouchMove(event: EventTouch): void {
        if (!this.isDragging) return;

        const currentPosition = event.getLocation().toVec3();
        const deltaPosition = Vec3.subtract(new Vec3(), currentPosition, this.dragStartPosition);
        this.node.position = Vec3.add(new Vec3(), this.originalPosition, deltaPosition);
    }

    private onTouchEnd(event: EventTouch): void {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.node.setScale(1.0, 1.0, 1.0);

        // 드롭된 위치에서 다른 mergeUnit 찾기
        const targetUnit = this.findMergeTarget(event.getLocation().toVec3().toVec2());

        if (targetUnit && targetUnit !== this) {
            this.tryMergeWith(targetUnit);
        } else {
            // 원래 위치로 돌아가기
            this.node.position = this.originalPosition;
        }
    }

    private findMergeTarget(position: Vec2): mergeUnit | null {
        // 드롭 위치 근처의 다른 mergeUnit 찾기
        const nearbyUnits = this.node.parent.children.filter(child => {
            if (child === this.node) return false;
            const mergeUnitComp = child.getComponent(mergeUnit);
            return mergeUnitComp !== null;
        });

        for (const unit of nearbyUnits) {
            const distance = Vec2.distance(position, unit.position.toVec2());
            if (distance < 100) { // 100 픽셀 이내
                return unit.getComponent(mergeUnit);
            }
        }

        return null;
    }

    private tryMergeWith(targetUnit: mergeUnit): void {
        // 같은 유닛 타입인지 확인
        if (this.unitType !== targetUnit.unitType) {
            this.node.position = this.originalPosition;
            return;
        }

        // 합치기 가능한지 확인
        const newUnitType = this.getNextUnitType(this.unitType);
        if (newUnitType === null) {
            this.node.position = this.originalPosition;
            return;
        }

        // 새로운 유닛 생성
        this.createMergedUnit(newUnitType, targetUnit.node.position);

        // 기존 두 유닛 제거
        this.node.destroy();
        targetUnit.node.destroy();
    }

    private getNextUnitType(currentType: UnitType): UnitType | null {
        // UNIT_TROLL(9) 이상인 경우 랜덤 히어로 생성
        if (currentType >= UnitType.UNIT_TROLL) {
            const heroTypes = [];
            for (let i = UnitType.UNIT_HERO_ORC; i <= UnitType.UNIT_HERO_GOLEM; i++) {
                heroTypes.push(i);
            }
            return heroTypes[Math.floor(Math.random() * heroTypes.length)];
        }

        // 일반적인 경우 다음 단계로
        const nextType = currentType + 1;
        if (nextType <= UnitType.UNIT_TROLL) {
            return nextType;
        }

        return null;
    }

    private createMergedUnit(unitType: UnitType, position: Vec3): void {
        // 새로운 유닛 노드 생성
        const newNode = new Node(`MergedUnit_${unitType}`);
        newNode.position = position;

        // mergeUnit 컴포넌트 추가
        const mergeUnitComp = newNode.addComponent(mergeUnit);
        mergeUnitComp.unitType = unitType;
        mergeUnitComp.modelContainer = newNode; // 자기 자신을 모델 컨테이너로 설정
        // mergeUnitComp.spriteUnitPrefab = this.spriteUnitPrefab;
        // mergeUnitComp.spineUnitPrefab = this.spineUnitPrefab;

        // 부모 노드에 추가
        this.node.parent.addChild(newNode);

        // 모델 설정
        mergeUnitComp.setupModel();
    }

    public getUnitAttackHappenTime(unitType: UnitType): number {
        if (unitType == UnitType.UNIT_ARCHER) {
            return 0.3;
        } else if (unitType == UnitType.UNIT_SWORDMAN || unitType == UnitType.UNIT_HELICOPTER || unitType == UnitType.UNIT_ORC_SPEAR || unitType == UnitType.UNIT_ORC_AXE || unitType == UnitType.UNIT_GOBLIN || unitType == UnitType.UNIT_TROLL) {
            return 0.3;
        } else if (unitType == UnitType.UNIT_CATAPULT || unitType == UnitType.UNIT_WATCHERTOWER || unitType == UnitType.UNIT_ORC_BUNKER || unitType == UnitType.UNIT_ORC_HQ) {
            return 0.0;
        } else if (unitType == UnitType.UNIT_WORKER || unitType == UnitType.UNIT_GOBLIN_WORKER) {
            return 0.5;
        } else if (unitType == UnitType.UNIT_WIZARD) {
            return 0.4;
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
    public setupModel(): void {
        // 기존 모델 제거
        if (this.modelContainer) {
            this.modelContainer.removeAllChildren();
        }

        // 새로운 모델 생성
        let modelPrefab: Prefab = null;

        if (this.unitType >= UnitType.UNIT_HERO_ORC && this.unitType <= UnitType.UNIT_HERO_GOLEM) {
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
