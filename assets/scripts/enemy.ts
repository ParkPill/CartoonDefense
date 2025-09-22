import { _decorator, Component, Node, Vec2, tween, Sprite, UIOpacity, Label, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('enemy')
export class enemy extends Component {
    @property({ type: [Vec2] })
    public routeArray: Vec2[] = [];

    @property
    public onMovementComplete: (() => void) | null = null;

    @property
    public onDead: ((deadEnemy: enemy) => void) | null = null;

    @property
    public maxHealth: number = 100;
    @property
    public rewardGold: number = 50;
    private currentHealth: number = 0;
    private currentRouteIndex: number = 0;
    private isMoving: boolean = false;
    private isDead: boolean = false;
    public speed: number = 80;

    // HP 바 관련 변수들
    private hpBarNode: Node | null = null;
    private hpBarBackground: Node | null = null;
    private hpBarFill: Node | null = null;
    private hpBarLabel: Node | null = null;
    start() {
        this.currentHealth = this.maxHealth;
        // this.createHPBar();
        this.startMovement();
    }

    update(deltaTime: number) {

    }

    private startMovement(): void {
        if (this.routeArray.length === 0) {
            this.executeCallback();
            return;
        }

        this.isMoving = true;
        this.currentRouteIndex = 1;
        this.moveToNextPoint();
    }

    private moveToNextPoint(): void {
        if (this.currentRouteIndex >= this.routeArray.length) {
            this.isMoving = false;
            this.executeCallback();
            return;
        }

        const targetPosition = this.routeArray[this.currentRouteIndex];
        // 이동 거리에 비례한 시간으로 변경
        const prevPos = this.routeArray[this.currentRouteIndex - 1];
        const currPos = targetPosition;
        const distance = prevPos.clone().subtract(currPos).length();
        const duration = distance / this.speed; // 이동 시간 (초)

        // 방향 검사 후 flip
        // 이전 위치와 현재 타겟 위치를 비교하여 x축 방향에 따라 flip 처리
        // ModelContainer라는 이름의 자식 노드를 찾아서 flip 처리
        if (this.currentRouteIndex > 0) {
            const prevPos = this.routeArray[this.currentRouteIndex - 1];
            const currPos = targetPosition;
            const modelContainer = this.node.children.find(child => child.name === "ModelContainer");
            // console.log("prev x: " + prevPos.x + " curr x: " + currPos.x + " left or right: " + (currPos.x < prevPos.x ? "left" : "right"));
            if (modelContainer) {
                if (currPos.x < prevPos.x) {
                    modelContainer.setScale(Math.abs(modelContainer.scale.x), modelContainer.scale.y, modelContainer.scale.z);
                } else {
                    modelContainer.setScale(-Math.abs(modelContainer.scale.x), modelContainer.scale.y, modelContainer.scale.z);
                }
            }
        }

        tween(this.node)
            .to(duration, { position: targetPosition.toVec3() })
            .call(() => {
                this.currentRouteIndex++;
                this.moveToNextPoint();
            })
            .start();
    }

    private executeCallback(): void {
        if (this.onMovementComplete) {
            this.onMovementComplete();
        }
    }

    public takeDamage(damage: number): void {
        // console.log("enemy takeDamage" + damage + ' currentHealth' + this.currentHealth);
        if (this.isDead) {
            return;
        }

        this.currentHealth -= damage;

        // HP 바 업데이트
        this.updateHPBar();

        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            this.die();
        }
    }

    private die(): void {
        if (this.isDead) {
            return;
        }
        // console.log("enemy die");

        this.isDead = true;
        this.onDeadCallback();

        this.node.destroy();
    }

    private onDeadCallback(): void {
        if (this.onDead) {
            this.onDead(this);
        }
    }

    public getCurrentHealth(): number {
        return this.currentHealth;
    }

    public getMaxHealth(): number {
        return this.maxHealth;
    }

    public isAlive(): boolean {
        // console.log("enemy isAlive", this.isDead, this.currentHealth);
        return !this.isDead && this.currentHealth > 0;
    }

    private createHPBar(): void {
        // HP 바 컨테이너 노드 생성


        // const label = this.hpBarLabel.addComponent(Label);
        // label.fontSize = 16;
        // label.string = `${this.currentHealth}/${this.maxHealth}`;

        // 초기 HP 바 상태 설정
        this.updateHPBar();
    }

    private updateHPBar(): void {
        if (!this.hpBarFill) {
            this.hpBarNode = this.node.getChildByName('HPBar');
            this.hpBarNode.active = true;

            this.hpBarFill = this.hpBarNode.getChildByName('imgFill');
            const fillTransform = this.hpBarFill.getComponent(UITransform);
            fillTransform.setAnchorPoint(0, 0.5);

            const fillSprite = this.hpBarFill.getComponent(Sprite);
            fillSprite.sizeMode = Sprite.SizeMode.CUSTOM;
            fillTransform.setContentSize(49, 5);

            // HP 텍스트 라벨 생성 (선택사항)
            this.hpBarLabel = new Node('HPBarLabel');
            this.hpBarLabel.setParent(this.hpBarNode);
            this.hpBarLabel.setPosition(0, -15, 0);
        }

        const healthPercentage = this.currentHealth / this.maxHealth;
        const hpBarWidth = 49; // HP 바 전체 너비

        // HP 바 채우기 크기 조정
        // this.hpBarFill.setScale(healthPercentage, 1, 1);
        this.hpBarFill.getComponent(UITransform).setContentSize(healthPercentage * hpBarWidth, 4);

        // HP 텍스트 업데이트
        // const label = this.hpBarLabel.getComponent(Label);
        // if (label) {
        //     label.string = `${this.currentHealth}/${this.maxHealth}`;
        // }

        // HP에 따른 색상 변경
        const fillSprite = this.hpBarFill.getComponent(Sprite);
        if (fillSprite) {
            if (healthPercentage > 0.6) {
                fillSprite.color.set(0, 255, 0, 255); // 녹색
            } else if (healthPercentage > 0.3) {
                fillSprite.color.set(255, 255, 0, 255); // 노란색
            } else {
                fillSprite.color.set(255, 0, 0, 255); // 빨간색
            }
        }
    }
}


