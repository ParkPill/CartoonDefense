// project.ts
import { _decorator, Component, Node, Vec3, Animation, math } from 'cc';
import { enemy } from './enemy';
const { ccclass, property } = _decorator;

@ccclass('Project')
export default class Project extends Component {
    @property({ type: Node, tooltip: '움직일 목표 노드 (에디터에서 드래그 가능)' })
    public target: Node | null = null;

    @property({ tooltip: '이동 속도 (units / second)' })
    public speed = 500;

    @property({ tooltip: '타겟에 도착했다고 판단할 최소 거리' })
    public arrivalThreshold = 2;

    @property({ tooltip: '이동 방향으로 노드를 회전시킬지 여부' })
    public rotateToDirection = false;

    @property({ tooltip: '데미지' })
    public damage = 100;

    public extraRotation = 0;

    // 내부용 벡터 재사용 (GC 줄이기)
    private _tmpTargetPos = new Vec3();
    private _tmpMyPos = new Vec3();
    private _tmpDir = new Vec3();

    private _paused = false;
    private _moving = false;
    isDead = false;
    // 도착 시 실행할 콜백 (선택)
    public onArrived: (() => void) | null = null;

    start() {
        if (this.target) this._moving = true;
    }

    update(dt: number) {
        if (this._paused) return;
        if (!this.target) {
            this.destroyThis();
            return;
        }
        if (this.isDead) {
            return;
        }

        // console.log("this.target", this.target);
        if (!this.target || !this.target.isValid || !this.target.getComponent(enemy)!.isAlive()) {
            this.destroyThis();
            return;
        }

        // world positions
        this.target.getWorldPosition(this._tmpTargetPos);
        this.node.getWorldPosition(this._tmpMyPos);

        Vec3.subtract(this._tmpDir, this._tmpTargetPos, this._tmpMyPos);
        // console.log("this._tmpDir", this._tmpDir);
        const dist = this._tmpDir.length();

        if (dist <= this.arrivalThreshold) {
            // 도착 처리
            this.arrivedTarget();
            return;
        }

        // 이동량 계산 (상수 속도)
        this._tmpDir.normalize();
        const moveLen = this.speed * dt;

        if (moveLen >= dist) {
            // 넘치지 않게 타겟 위치로 정확히 설정
            this.arrivedTarget();
            return;
        }

        // 이동 적용
        Vec3.multiplyScalar(this._tmpDir, this._tmpDir, moveLen);
        const newPos = new Vec3();
        Vec3.add(newPos, this._tmpMyPos, this._tmpDir);
        this.node.setWorldPosition(newPos);
        this._moving = true;

        // 선택적 회전: 이동 방향을 바라보게 함 (2D 용 - z 축 회전)
        if (this.rotateToDirection) {
            // 방향각 계산 (x,y 평면)
            const angle = Math.atan2(this._tmpDir.y, this._tmpDir.x);
            // 라디안을 도 단위로 바꾸려면 Math.PI/180 사용. setRotationFromEuler expects degrees in CC? 
            // 여기서는 노드의 eulerAngles.z 에 각도(도) 대입 (Cocos Creator의 경우 eulerAngles는 degrees)
            this.node.eulerAngles = this.node.eulerAngles.set(this.node.eulerAngles.x, this.node.eulerAngles.y, math.toDegree(angle) + this.extraRotation);
        }
    }
    arrivedTarget() {
        // console.log("projectile arrivedTarget");
        this.node.setWorldPosition(this._tmpTargetPos);
        this._moving = false;
        if (this.onArrived) {
            const cb = this.onArrived;
            this.onArrived = null;
            cb();
        }
        this.target.getComponent(enemy)!.takeDamage(this.damage);

        this.isDead = true;
        this.node.destroy();
    }

    public destroyThis() {
        if (this.isDead) {
            return;
        }
        // console.log("projectile destroyThis");
        this.isDead = true;
        let animation = this.node.getComponent(Animation);
        animation.play(animation.clips[1].name);
        let duration = animation.clips[1].duration;
        this.scheduleOnce(() => {
            this.node.destroy();
        }, duration);
        // this.node.destroy();
    }

    /**
     * 런타임에서 타겟 지정
     * @param targetNode 이동할 목표 Node (null이면 멈춤)
     */
    public setTarget(targetNode: Node | null) {
        this.target = targetNode;
        this._moving = !!targetNode;
    }

    public clearTarget() {
        this.target = null;
        this._moving = false;
    }

    public isMoving() {
        return this._moving;
    }

    public pause() {
        this._paused = true;
    }

    public resume() {
        this._paused = false;
    }

    /**
     * 목적지에 도착했을 때 한 번 실행될 콜백 설정 (한 번만 호출)
     */
    public setOnArrivedCallback(cb: () => void) {
        this.onArrived = cb;
    }
}
