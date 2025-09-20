import { _decorator, Component, Node } from 'cc';
import { gameScript } from './gameScript';
const { ccclass, property } = _decorator;

@ccclass('gameManager')
export class gameManager extends Component {
    private static _instance: gameManager = null;

    @property({ type: Node })
    public playerUnitsContainer: Node = null;

    @property({ type: Node })
    public enemiesContainer: Node = null;

    @property({ type: Node })
    public projectilesContainer: Node = null;

    @property({ type: gameScript })
    public theGameScript: gameScript = null;

    public static get Instance(): gameManager {
        if (!gameManager._instance) {
            console.error("gameManager 인스턴스가 초기화되지 않았습니다. 씬에 gameManager가 있는지 확인하세요.");
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

        // 씬 전환 시에도 유지되도록 설정 (필요한 경우)
        // this.node.setParent(null);
        // director.addPersistRootNode(this.node);
    }

    start() {
        this.initializeGame();
    }

    update(deltaTime: number) {

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
}


