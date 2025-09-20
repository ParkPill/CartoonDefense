import { _decorator, Component, Node, Vec2, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('enemy')
export class enemy extends Component {
    @property({ type: [Vec2] })
    public routeArray: Vec2[] = [];

    @property
    public onMovementComplete: (() => void) | null = null;

    @property
    public onDead: (() => void) | null = null;

    @property
    public maxHealth: number = 100;

    private currentHealth: number = 0;
    private currentRouteIndex: number = 0;
    private isMoving: boolean = false;
    private isDead: boolean = false;
    public speed: number = 80;
    start() {
        this.currentHealth = this.maxHealth;
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
        console.log("enemy takeDamage" + damage + ' currentHealth' + this.currentHealth);
        if (this.isDead) {
            return;
        }

        this.currentHealth -= damage;

        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            this.die();
        }
    }

    private die(): void {
        if (this.isDead) {
            return;
        }
        console.log("enemy die");

        this.isDead = true;
        this.onDeadCallback();

        this.node.destroy();
    }

    private onDeadCallback(): void {
        if (this.onDead) {
            this.onDead();
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
}


