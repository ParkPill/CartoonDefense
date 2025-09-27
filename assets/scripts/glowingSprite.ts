import { _decorator, Component, Node, Sprite, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('glowingSprite')
export class glowingSprite extends Component {
    @property
    duration: number = 0.1; // 색상 변경 지속 시간

    private colors: Color[] = [
        new Color(255, 100, 100, 255),     // 빨간색
        new Color(255, 165, 165, 255),   // 주황색
        new Color(255, 255, 255, 255),   // 노란색
        new Color(100, 255, 100, 255),     // 초록색
        new Color(100, 100, 255, 255)      // 파란색
    ];

    private currentColorIndex: number = 0;
    private nextColorIndex: number = 1;
    private elapsedTime: number = 0;
    private sprite: Sprite = null;

    start() {
        this.sprite = this.getComponent(Sprite);
        if (this.sprite) {
            this.sprite.color = this.colors[0];
        }
    }

    update(deltaTime: number) {
        if (!this.sprite) return;

        this.elapsedTime += deltaTime;

        // duration 시간이 지났으면 다음 색상으로 이동
        if (this.elapsedTime >= this.duration) {
            this.elapsedTime = 0;
            this.currentColorIndex = this.nextColorIndex;
            this.nextColorIndex = (this.nextColorIndex + 1) % this.colors.length;
        }

        // 현재 색상과 다음 색상 사이를 보간
        const progress = this.elapsedTime / this.duration;
        const currentColor = this.colors[this.currentColorIndex];
        const nextColor = this.colors[this.nextColorIndex];

        const r = Math.floor(currentColor.r + (nextColor.r - currentColor.r) * progress);
        const g = Math.floor(currentColor.g + (nextColor.g - currentColor.g) * progress);
        const b = Math.floor(currentColor.b + (nextColor.b - currentColor.b) * progress);

        this.sprite.color = new Color(r, g, b, 255);
    }
}


