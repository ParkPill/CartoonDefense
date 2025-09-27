import { saveData } from "./saveData";

// 플레이어 데이터 클래스
export class playerData {
    // 기본 플레이어 정보
    public nickname: string = "Guest";
    public _id: string = "";
    public gold: number = 0;
    public gems: number = 0;
    public level: number = 1;
    public exp: number = 0;

    // 게임 진행 상태
    public currentStage: number = 1;
    public highestStage: number = 1;
    public totalKills: number = 0;
    public tickets: number[] = [];

    // 설정 정보
    public soundEnabled: boolean = true;
    public musicEnabled: boolean = true;
    public language: string = "ko";

    // 유닛 정보 (예시)
    public unit: string = "";
    public hero: string = "";
    public collection: number[];
    public stageStar: number[] = [];
    public lastDayCheckTime: Date = new Date();
    public defaultTicketCount: number = 3;
    public dungeonLevels: number[] = [];



    // 업그레이드 정보
    public upgrades: number[] = [];

    // 생성자
    constructor() {
        this.initializeDefaultData();
    }

    // 기본 데이터 초기화
    private initializeDefaultData(): void {
        this.gold = 1000;
        this.gems = 50;
        this.level = 1;
        this.exp = 0;
        this.currentStage = 1;
        this.highestStage = 1;
        this.totalKills = 0;
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.language = "ko";
        // this.collection = [10]; // 기본 유닛
        // this.upgrades = {};
    }

    public setStageStar(stage: number, star: number): void {
        if (this.stageStar == null) {
            this.stageStar = [];
        }
        if (this.stageStar.length <= stage) {
            for (let i = this.stageStar.length; i <= stage; i++) {
                this.stageStar.push(0);
            }
        }
        if (this.stageStar[stage] < star) {
            this.stageStar[stage] = star;
        }
        else {
            this.stageStar[stage] = star;
        }
    }

    // 골드 추가
    public addGold(amount: number): void {
        this.gold += amount;
    }

    // 골드 사용
    public spendGold(amount: number): boolean {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }

    // 젬 추가
    public addGems(amount: number): void {
        this.gems += amount;
    }

    // 젬 사용
    public spendGems(amount: number): boolean {
        if (this.gems >= amount) {
            this.gems -= amount;
            return true;
        }
        return false;
    }
    public getTicket(dungeonIndex: number): number {
        if (this.tickets == null) {
            this.tickets = [];
        }

        if (this.tickets.length <= dungeonIndex) {
            for (let i = this.tickets.length; i <= dungeonIndex; i++) {
                this.tickets.push(this.defaultTicketCount);
            }
            saveData.Instance.save();
        }

        return this.tickets[dungeonIndex];
    }
    public spendTicket(dungeonIndex: number): void {
        if (this.tickets[dungeonIndex] > 0) {
            this.tickets[dungeonIndex]--;
            saveData.Instance.save();
        }
    }
    public getDungeonLevel(dungeonIndex: number): number {
        if (this.dungeonLevels == null) {
            this.dungeonLevels = [];
        }
        if (this.dungeonLevels.length <= dungeonIndex) {
            for (let i = this.dungeonLevels.length; i <= dungeonIndex; i++) {
                this.dungeonLevels.push(0);
            }
        }

        return this.dungeonLevels[dungeonIndex];
    }
    public setDungeonLevel(dungeonIndex: number, level: number): void {
        if (this.dungeonLevels == null) {
            this.dungeonLevels = [];
        }
        if (this.dungeonLevels.length <= dungeonIndex) {
            for (let i = this.dungeonLevels.length; i <= dungeonIndex; i++) {
                this.dungeonLevels.push(0);
            }
        }
        this.dungeonLevels[dungeonIndex] = level;
    }
    public getCollection(unitIndex: number): number {
        if (this.collection == null) {
            this.collection = [];
        }
        // 배열 길이가 적으면 배열 마지막 부터 해당 인덱스 까지 0을 추가
        if (this.collection.length <= unitIndex) {
            for (let i = this.collection.length; i <= unitIndex; i++) {
                this.collection.push(0);
            }
        }
        return this.collection[unitIndex];
    }

    // 컬렉션 발견 1, 보상 수령 2
    public discoverCollection(unitIndex: number): void {
        if (this.collection == null) {
            this.collection = [];
        }
        // 배열 길이가 적으면 배열 마지막 부터 해당 인덱스 까지 0을 추가
        if (this.collection.length <= unitIndex) {
            for (let i = this.collection.length; i <= unitIndex; i++) {
                this.collection.push(0);
            }
        }
        if (this.collection[unitIndex] === 0) {
            this.collection[unitIndex] = 1;
        }
    }
    public receiveCollectionReward(unitIndex: number): void {
        if (this.collection[unitIndex] === 1) {
            this.collection[unitIndex] = 2;
        }
    }

    // 경험치 추가
    public addExperience(amount: number): void {
        this.exp += amount;
        this.checkLevelUp();
    }

    // 레벨업 확인
    private checkLevelUp(): void {
        const requiredExp = this.level * 100; // 레벨당 100 경험치 필요
        if (this.exp >= requiredExp) {
            this.level++;
            this.exp -= requiredExp;
            console.log(`레벨업! 현재 레벨: ${this.level}`);
        }
    }

    // 스테이지 클리어
    public completeStage(stageNumber: number): void {
        if (stageNumber > this.highestStage) {
            this.highestStage = stageNumber;
        }
        this.currentStage = stageNumber + 1;
    }

    // 유닛 잠금 해제
    // public unlockUnit(unitId: string): void {
    //     if (this.collection.indexOf(unitId) === -1) {
    //         this.collection.push(unitId);
    //     }
    // }

    // 유닛 레벨업
    // public upgradeUnit(unitId: string): boolean {
    //     if (this.unlockedUnits.indexOf(unitId) !== -1) {
    //         if (!this.unitLevels[unitId]) {
    //             this.unitLevels[unitId] = 1;
    //         } else {
    //             this.unitLevels[unitId]++;
    //         }
    //         return true;
    //     }
    //     return false;
    // }

    // 업그레이드 적용
    public applyUpgrade(upgradeId: string, level: number): void {
        this.upgrades[upgradeId] = level;
    }

    // 데이터를 JSON으로 직렬화
    public toJSON(): string {
        // 모든 인스턴스 변수를 자동으로 직렬화하기 위해 Object.getOwnPropertyNames와 reduce 사용
        // 단, 함수나 프로토타입 체인 상의 속성은 제외
        const data: any = {};
        Object.getOwnPropertyNames(this).forEach(key => {
            // 함수가 아니고, 언더스코어로 시작하지 않는(내부 변수 제외) 속성만 저장
            if (typeof (this as any)[key] !== "function") {
                data[key] = (this as any)[key];
            }
        });
        console.log("raw toJSON:", data);
        return JSON.stringify(data);
    }

    // JSON에서 데이터 복원
    public fromJSON(jsonString: string): void {
        if (jsonString === null) {
            this.initializeDefaultData();
            return;
        }

        try {
            const data = JSON.parse(jsonString);
            // data의 모든 키를 순회하며, this에 동일한 프로퍼티가 있으면 할당
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(this, key)) {
                    (this as any)[key] = data[key];
                }
            }
        } catch (error) {
            console.error("플레이어 데이터 로드 실패:", error);
            this.initializeDefaultData();
        }
    }

    // 데이터 초기화
    public resetData(): void {
        this.initializeDefaultData();
    }
}