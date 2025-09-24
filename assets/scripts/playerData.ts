// 플레이어 데이터 클래스
export class playerData {
    // 기본 플레이어 정보
    public nickname: string = "Guest";
    public gold: number = 0;
    public gems: number = 0;
    public level: number = 1;
    public experience: number = 0;

    // 게임 진행 상태
    public currentStage: number = 1;
    public highestStage: number = 1;
    public totalKills: number = 0;
    public totalDamage: number = 0;

    // 설정 정보
    public soundEnabled: boolean = true;
    public musicEnabled: boolean = true;
    public language: string = "ko";

    // 유닛 정보 (예시)
    public unlockedUnits: string[] = [];
    public unitLevels: { [unitId: string]: number } = {};

    // 업그레이드 정보
    public upgrades: { [upgradeId: string]: number } = {};

    // 생성자
    constructor() {
        this.initializeDefaultData();
    }

    // 기본 데이터 초기화
    private initializeDefaultData(): void {
        this.gold = 1000;
        this.gems = 50;
        this.level = 1;
        this.experience = 0;
        this.currentStage = 1;
        this.highestStage = 1;
        this.totalKills = 0;
        this.totalDamage = 0;
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.language = "ko";
        this.unlockedUnits = ["u0"]; // 기본 유닛
        this.unitLevels = {};
        this.upgrades = {};
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

    // 경험치 추가
    public addExperience(amount: number): void {
        this.experience += amount;
        this.checkLevelUp();
    }

    // 레벨업 확인
    private checkLevelUp(): void {
        const requiredExp = this.level * 100; // 레벨당 100 경험치 필요
        if (this.experience >= requiredExp) {
            this.level++;
            this.experience -= requiredExp;
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
    public unlockUnit(unitId: string): void {
        if (this.unlockedUnits.indexOf(unitId) === -1) {
            this.unlockedUnits.push(unitId);
        }
    }

    // 유닛 레벨업
    public upgradeUnit(unitId: string): boolean {
        if (this.unlockedUnits.indexOf(unitId) !== -1) {
            if (!this.unitLevels[unitId]) {
                this.unitLevels[unitId] = 1;
            } else {
                this.unitLevels[unitId]++;
            }
            return true;
        }
        return false;
    }

    // 업그레이드 적용
    public applyUpgrade(upgradeId: string, level: number): void {
        this.upgrades[upgradeId] = level;
    }

    // 데이터를 JSON으로 직렬화
    public toJSON(): string {
        return JSON.stringify({
            gold: this.gold,
            gems: this.gems,
            level: this.level,
            experience: this.experience,
            currentStage: this.currentStage,
            highestStage: this.highestStage,
            totalKills: this.totalKills,
            totalDamage: this.totalDamage,
            soundEnabled: this.soundEnabled,
            musicEnabled: this.musicEnabled,
            language: this.language,
            unlockedUnits: this.unlockedUnits,
            unitLevels: this.unitLevels,
            upgrades: this.upgrades
        });
    }

    // JSON에서 데이터 복원
    public fromJSON(jsonString: string): void {
        if (jsonString === null) {
            this.initializeDefaultData();
            return;
        }
            
        try {
            const data = JSON.parse(jsonString);
            this.gold = data.gold || 0;
            this.gems = data.gems || 0;
            this.level = data.level || 1;
            this.experience = data.experience || 0;
            this.currentStage = data.currentStage || 1;
            this.highestStage = data.highestStage || 1;
            this.totalKills = data.totalKills || 0;
            this.totalDamage = data.totalDamage || 0;
            this.soundEnabled = data.soundEnabled !== undefined ? data.soundEnabled : true;
            this.musicEnabled = data.musicEnabled !== undefined ? data.musicEnabled : true;
            this.language = data.language || "ko";
            this.unlockedUnits = data.unlockedUnits || ["u0"];
            this.unitLevels = data.unitLevels || {};
            this.upgrades = data.upgrades || {};
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