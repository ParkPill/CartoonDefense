import { _decorator, Component, Node, Vec2, tween, Sprite, UIOpacity, Label, UITransform, Animation } from 'cc';
import { EnemyData } from './dataManager';
import { mergeUnit } from './mergeUnit';
import { gameManager } from './gameManager';
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
    private currentHealth: number = 0;
    @property
    public isRouteMove: boolean = true;
    private currentRouteIndex: number = 0;
    private isMoving: boolean = false;
    private isDead: boolean = false;
    public speed: number = 80;
    public data: EnemyData;
    public reservedDamage: number = 0;
    @property(Node)
    public target: Node;
    attackRange: number = 50;
    isAttacking: boolean = false;
    public damage: number = 70;

    // HP 바 관련 변수들
    private hpBarNode: Node | null = null;
    private hpBarBackground: Node | null = null;
    private hpBarFill: Node | null = null;
    private hpBarLabel: Node | null = null;
    actionTimer: number = 0;
    public isReady: boolean = false;
    start() {
        this.currentHealth = this.maxHealth;
        // this.createHPBar();
        if (this.isRouteMove) {
            this.startMovement();
        }
    }

    update(deltaTime: number) {
        if (!this.isRouteMove && this.isReady) {
            this.actionTimer += deltaTime;
            if (this.actionTimer > .2) {
                this.actionTimer -= .2;

                if (!this.target) this.findTarget();

            }
            if (this.target == null || this.target == undefined || !this.target.isValid || (this.target.getComponent(mergeUnit) && this.target.getComponent(mergeUnit).HP <= 0)) {
                this.target = null;
            }
            if (this.target) {
                // 타겟을 향해 이동
                // console.log("target", this.target);
                // console.log("node", this.node);
                let distance = this.target.getWorldPosition().clone().subtract(this.node.getWorldPosition()).length();
                if (distance < this.attackRange) {
                    // 타겟을 향해 이동
                    if (!this.isAttacking) this.startAttack();
                } else {
                    // 타겟을 향해 이동
                    // console.log("target1", this.target);
                    // console.log("node1", this.node);
                    let direction = this.target.getWorldPosition().clone().subtract(this.node.getWorldPosition()).normalize();
                    this.node.setWorldPosition(this.node.getWorldPosition().add(direction.multiplyScalar(this.speed * deltaTime)));
                    if (!this.isMoving) {
                        let ani = this.node.getChildByName("ModelContainer").getChildByName("Model").getComponent(Animation);
                        ani.play(ani.clips[2].name);
                    }
                    this.isMoving = true;
                    // console.log("isMoving", this.isMoving);
                }
            }
        }
    }
    private startAttack(): void {
        this.isAttacking = true;
        this.isMoving = false;
        let ani = this.node.getChildByName("ModelContainer").getChildByName("Model").getComponent(Animation);
        ani.play(ani.clips[1].name);
        let duration = ani.clips[1].duration;
        this.scheduleOnce(() => {
            ani.play(ani.clips[0].name);
            this.isAttacking = false;
        }, duration);
        this.scheduleOnce(() => {
            this.target.getComponent(mergeUnit).takeDamage(this.damage);
        }, 8 / 60);
    }
    private findTarget(): void {
        // 가장 가까운 히어로를 찾기
        let currentPos = this.node.getWorldPosition();
        let gScript = gameManager.Instance.theGameScript;
        let minDistance = Number.MAX_SAFE_INTEGER
        gScript.heroList.forEach(hero => {
            if (hero.node == null || hero.node == undefined || !hero.node.isValid || (hero.node.getComponent(mergeUnit) && hero.node.getComponent(mergeUnit).HP <= 0)) {

            }
            else {
                let distance = Vec2.distance(currentPos, hero.node.getWorldPosition());
                if (distance < minDistance) {
                    minDistance = distance;
                    this.target = hero.node;
                }

            }

        });
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
        this.reservedDamage -= damage;

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
    public setHP(hp: number) {
        this.currentHealth = hp;
        this.maxHealth = hp;
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


