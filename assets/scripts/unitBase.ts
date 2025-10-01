import { _decorator, Component, Node, CCInteger } from 'cc';
import { UnitData } from './dataManager';
const { ccclass, property } = _decorator;

@ccclass('unitBase')
export class unitBase extends Component {
    public HP: number = 10;
    @property
    public maxHP: number = 100;
    @property({ type: CCInteger })
    public damage: number = 10;
    public reservedDamage: number = 0;
    public aboveNode: Node = null;
    public unitType: number = 0;
    public data: UnitData = null;
    public isDead: boolean = false;
    @property
    public onDead: ((deadUnit: unitBase) => void) | null = null;
    start() {

    }

    update(deltaTime: number) {

    }
    public setData(data: UnitData): void {
        this.data = data;
    }
    public takeDamage(damage: number): void {
        if (this.isDead) {
            return;
        }
        this.HP -= damage;
        this.reservedDamage -= damage;
        if (this.HP <= 0) {
            this.onDeadCallback();
            this.node.destroy();
        }
    }
    private onDeadCallback(): void {
        if (this.onDead) {
            this.onDead(this);
        }
    }

}



// C#의 enum과 유사하게 TypeScript enum으로 변환
export enum UnitType {
    UNIT_WORKER = 0,
    UNIT_SWORDMAN = 1,
    UNIT_ARCHER = 2,
    UNIT_HELICOPTER = 3,
    UNIT_GOBLIN = 4,
    UNIT_GOBLIN_BOMB = 5,
    UNIT_ORC_AXE = 6,
    UNIT_ORC_SPEAR = 7,
    UNIT_CATAPULT = 8,
    UNIT_TROLL = 9,
    UNIT_GLOW_TROLL = 10,
    UNIT_HERO_ORC = 11,
    UNIT_HERO_GOBLIN = 12,
    UNIT_HERO_SPEARMAN = 13,
    UNIT_HERO_LIZARDMAN = 14,
    UNIT_HERO_ARCHER = 15,
    UNIT_HERO_WEREWOLF = 16,
    UNIT_HERO_MONK = 17,
    UNIT_HERO_FIGHTER = 18,
    UNIT_HERO_BEAR = 19,
    UNIT_HERO_HEALER = 20,
    UNIT_HERO_KNIGHT = 21,
    UNIT_HERO_ELF_SWORDMAN = 22,
    UNIT_HERO_ASSASSIN = 23,
    UNIT_HERO_LION = 24,
    UNIT_HERO_WIZARD = 25,
    UNIT_HERO_TANKER = 26,
    UNIT_HERO_SKELETON = 27,
    UNIT_HERO_REAPER = 28,
    UNIT_HERO_ENT = 29,
    UNIT_HERO_SALAMANDER = 30,
    UNIT_HERO_UNDINE = 31,
    UNIT_HERO_LADY_WEREWOLF = 32,
    UNIT_HERO_LADY_LION = 33,
    UNIT_HERO_LADY_BEAR = 34,
    UNIT_HERO_SANTA = 35,
    UNIT_HERO_RUDOLPH = 36,
    UNIT_HERO_SANTADOG = 37,
    UNIT_HERO_PENGUIN = 38,
    UNIT_HERO_CATINBOOTS = 39,
    UNIT_HERO_MOLE = 40,
    UNIT_HERO_TOYMOUSE = 41,
    UNIT_HERO_SAVAGEARCHER = 42,
    UNIT_HERO_BATMONSTER = 43,
    UNIT_HERO_MEMEAT = 44,
    UNIT_HERO_PARASITE = 45,
    UNIT_HERO_WATERMELON = 46,
    UNIT_HERO_BABYMINO = 47,
    UNIT_HERO_MINO = 48,
    UNIT_HERO_KERBEROS = 49,
    UNIT_HERO_LAMIA = 50,
    UNIT_HERO_CHUNJA = 51,
    UNIT_HERO_GOLEM = 52,
    // UNIT_BARRACKS = 11,
    // UNIT_CASTLE = 12,
    // UNIT_FACTORY = 13,
    // UNIT_FARM = 14,
    // UNIT_LUMBERMILL = 15,
    // UNIT_MINE = 16,
    // UNIT_WATCHERTOWER = 17,
    // UNIT_METEOR = 18,
    // UNIT_MISSILE_STRAIGHT = 19,
    // UNIT_MISSILE_CHASING = 20,
    // UNIT_DESTRUCTABLE = 21,
    // UNIT_MISSILE_CUSTOM = 22,
    // UNIT_MISSILE_Movable = 23,
    // UNIT_ITEM = 24,
    // UNIT_NPC = 25,
    // UNIT_TREE = 26,
    // UNIT_ORC_BUNKER = 28,
    // UNIT_ORC_HQ = 29,
    // UNIT_ZOMBIE_ORC_AXE = 30,
    // UNIT_ZOMBIE_SWORDSMAN = 31,
    // UNIT_ZOMBIE_CASTLE = 32,
    // UNIT_ZOMBIE_HQ = 33,
    // UNIT_LAMINGTON = 34,
    // UNIT_UNREACHABLE_TREE = 35,
    // UNIT_START_POINT = 36,
    // UNIT_EVENT_POINT = 37,
    // UNIT_UNDERGROUND_BUNKER = 38,
    // UNIT_TRIGGER = 39,
    // UNIT_WIZARD = 40,
    // UNIT_TEMPLE = 41,
    // UNIT_ORC_BARRACKS = 42,
    // UNIT_ORC_TROLL_HOUSE = 43,
    // UNIT_TREE_FOR_BATTLE = 44,
    // UNIT_GOBLIN_WORKER = 45,
    // UNIT_BARBECUE = 46,
    UNIT_MISSILE_NOTHING = 100
}