import { _decorator, Component, Node, resources, TextAsset, director } from 'cc';
import { gameManager } from './gameManager';
const { ccclass, property } = _decorator;

// EnemyData 인터페이스 정의
export interface EnemyData {
    ID: string;
    Damage: number;
    HP: number;
    RewardGold: number;
}

export interface UnitData {
    ID: string;
    Damage: number;
    HP: number;
    Rate: number;
    Rarity: string;
}

export interface ShopData {
    ID: string;
    PriceData: string;
    Reward: string;
    Limit: string;
}

@ccclass('dataManager')
export class dataManager extends Component {
    private enemyInfoList: EnemyData[] = [];
    private bossInfoList: EnemyData[] = [];
    public unitInfoList: UnitData[] = [];
    public shopInfoList: ShopData[] = [];
    public loadingCount: number = 0;
    public maxLoadingCount: number = 2;


    // 싱글톤 인스턴스
    private static _instance: dataManager = null;

    public static get Instance(): dataManager {
        if (!dataManager._instance) {
            // 자동으로 인스턴스 생성
            const dataManagerNode = new Node('DataManager');
            dataManager._instance = dataManagerNode.addComponent(dataManager);
            dataManager._instance.loadingCount = 0;
            // 씬 전환 시에도 유지되도록 설정
            director.addPersistRootNode(dataManagerNode);
        }
        return dataManager._instance;
    }

    onLoad() {
        // 싱글톤 인스턴스 설정
        if (dataManager._instance === null) {
            dataManager._instance = this;
        } else if (dataManager._instance !== this) {
            console.warn("dataManager 인스턴스가 이미 존재합니다. 중복된 dataManager를 제거합니다.");
            this.node.destroy();
            return;
        }
    }

    start() {
        gameManager.Instance.isTitleLoaded = true;
    }
    public init() {
        this.loadEnemyData();
        this.loadUnitData();
        this.loadShopData();
    }

    loadEnemyData() {
        // CSV 파일 로드
        console.log("적 데이터 로드!")
        resources.load("CartoonDefense - enemy", TextAsset, (err, textAsset) => {
            if (err || !textAsset) {
                console.error("적 데이터 파일 로드 실패:", err);
                return;
            }

            let wholeText = textAsset.text;
            wholeText = this.decryptData(wholeText);
            const arrayString = wholeText.split("\n");

            this.enemyInfoList = [];
            this.bossInfoList = [];
            // console.log("적 라인 lineCount: " + arrayString.length);

            for (let i = 1; i < arrayString.length; i++) {
                let line = arrayString[i];
                line = line.replace(/\r\n/g, "").replace(/\r/g, "").replace(/\n/g, "");
                // console.log("enemy info: " + line);
                const strs = line.split(',');
                if (!strs[1] || strs[1].trim() === "") continue;

                const info: EnemyData = {
                    ID: strs[0],
                    Damage: this.parseFloat(strs[1]),
                    HP: this.parseFloat(strs[2]),
                    RewardGold: this.parseInt(strs[3])
                };

                this.enemyInfoList.push(info);
            }
            console.log("적 데이터 로드 완료!");
            this.loadingCount++;
        });
    }

    loadUnitData() {
        resources.load("CartoonDefense - unit", TextAsset, (err, textAsset) => {
            if (err || !textAsset) {
                console.error("유닛 데이터 파일 로드 실패:", err);
                return;
            }

            let wholeText = textAsset.text;
            wholeText = this.decryptData(wholeText);
            const arrayString = wholeText.split("\n");

            this.unitInfoList = [];
            // console.log("유닛 라인 lineCount: " + arrayString.length);

            for (let i = 1; i < arrayString.length; i++) {
                let line = arrayString[i];
                line = line.replace(/\r\n/g, "").replace(/\r/g, "").replace(/\n/g, "");
                // console.log("unit info: " + line);
                const strs = line.split(',');
                if (!strs[1] || strs[1].trim() === "") continue;

                const info: UnitData = {
                    ID: strs[0],
                    Damage: this.parseFloat(strs[1]),
                    HP: this.parseFloat(strs[2]),
                    Rate: this.parseFloat(strs[3]),
                    Rarity: strs[4]
                };

                this.unitInfoList.push(info);
            }
            console.log("유닛 데이터 로드 완료!");
            this.loadingCount++;
        });
    }

    loadShopData() {
        resources.load("CartoonDefense - shop", TextAsset, (err, textAsset) => {
            if (err || !textAsset) {
                console.error("상점 데이터 파일 로드 실패:", err);
                return;
            }

            let wholeText = textAsset.text;
            wholeText = this.decryptData(wholeText);
            const arrayString = wholeText.split("\n");

            this.shopInfoList = [];
            for (let i = 1; i < arrayString.length; i++) {
                let line = arrayString[i];
                line = line.replace(/\r\n/g, "").replace(/\r/g, "").replace(/\n/g, "");
                const strs = line.split(',');
                if (!strs[1] || strs[1].trim() === "") continue;

                const info: ShopData = {
                    ID: strs[0],
                    PriceData: strs[1],
                    Reward: strs[2],
                    Limit: strs[3]
                };
                // console.log("shop info: ", info.ID);
                this.shopInfoList.push(info);
            }

            console.log("상점 데이터 로드 완료!");
            this.loadingCount++;
        });
    }

    update(deltaTime: number) {

    }

    /**
     * 데이터 복호화 (필요에 따라 구현)
     * @param data 암호화된 데이터
     * @returns 복호화된 데이터
     */
    private decryptData(data: string): string {
        // 실제 복호화 로직이 필요하면 여기에 구현
        // 현재는 그대로 반환
        return data;
    }

    /**
     * 문자열을 정수로 변환
     * @param str 변환할 문자열
     * @returns 정수값
     */
    private parseInt(str: string): number {
        const result = parseInt(str);
        return isNaN(result) ? 0 : result;
    }

    /**
     * 문자열을 실수로 변환
     * @param str 변환할 문자열
     * @returns 실수값
     */
    private parseFloat(str: string): number {
        const result = parseFloat(str);
        return isNaN(result) ? 0 : result;
    }

    /**
     * ID로 적 데이터를 찾습니다.
     * @param id 적 ID
     * @returns 적 데이터 또는 null
     */
    getEnemyDataById(id: string): EnemyData | null {
        return this.enemyInfoList.find(enemy => enemy.ID === id) || null;
    }

    /**
     * 모든 적 데이터를 반환합니다.
     * @returns 적 데이터 배열
     */
    getAllEnemyData(): EnemyData[] {
        return [...this.enemyInfoList];
    }

    /**
     * 모든 보스 데이터를 반환합니다.
     * @returns 보스 데이터 배열
     */
    getAllBossData(): EnemyData[] {
        return [...this.bossInfoList];
    }

    /**
     * 적 데이터가 로드되었는지 확인합니다.
     * @returns 로드 완료 여부
     */
    isEnemyDataLoaded(): boolean {
        return this.enemyInfoList.length > 0;
    }

    /**
     * 특정 인덱스의 적 데이터를 반환합니다.
     * @param index 인덱스
     * @returns 적 데이터 또는 null
     */
    getEnemyDataByIndex(index: number): EnemyData | null {
        if (index >= 0 && index < this.enemyInfoList.length) {
            return this.enemyInfoList[index];
        }
        return null;
    }

    /**
     * 적 데이터의 총 개수를 반환합니다.
     * @returns 적 데이터 개수
     */
    getEnemyDataCount(): number {
        return this.enemyInfoList.length;
    }

    // ========== 정적 메서드들 (어디서든 접근 가능) ==========

    /**
     * ID로 적 데이터를 찾습니다. (정적 메서드)
     * @param id 적 ID
     * @returns 적 데이터 또는 null
     */
    public static getEnemyDataById(id: string): EnemyData | null {
        return dataManager.Instance.getEnemyDataById(id);
    }

    /**
     * 모든 적 데이터를 반환합니다. (정적 메서드)
     * @returns 적 데이터 배열
     */
    public static getAllEnemyData(): EnemyData[] {
        return dataManager.Instance.getAllEnemyData();
    }

    /**
     * 모든 보스 데이터를 반환합니다. (정적 메서드)
     * @returns 보스 데이터 배열
     */
    public static getAllBossData(): EnemyData[] {
        return dataManager.Instance.getAllBossData();
    }

    /**
     * 적 데이터가 로드되었는지 확인합니다. (정적 메서드)
     * @returns 로드 완료 여부
     */
    public static isEnemyDataLoaded(): boolean {
        return dataManager.Instance.isEnemyDataLoaded();
    }

    /**
     * 특정 인덱스의 적 데이터를 반환합니다. (정적 메서드)
     * @param index 인덱스
     * @returns 적 데이터 또는 null
     */
    public static getEnemyDataByIndex(index: number): EnemyData | null {
        return dataManager.Instance.getEnemyDataByIndex(index);
    }

    /**
     * 적 데이터의 총 개수를 반환합니다. (정적 메서드)
     * @returns 적 데이터 개수
     */
    public static getEnemyDataCount(): number {
        return dataManager.Instance.getEnemyDataCount();
    }

    onDestroy() {
        if (dataManager._instance === this) {
            dataManager._instance = null;
        }
    }

    public getShopItemIndex(item: string): number {
        return this.shopInfoList.findIndex(shop => shop.ID === item);
    }
}


