import { Color } from 'cc';
import { _decorator, Component, view, ResolutionPolicy, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ResponsiveCanvas')
export class ResponsiveCanvas extends Component {

    // 디자인 해상도 설정
    private DESIGN_WIDTH = 720;
    private DESIGN_HEIGHT = 1280;
    // @property(Sprite)
    // public image: Sprite;

    start() {
        this.adjustFitMode();
        // 화면 크기 변경 시에도 적용되도록 이벤트 리스너 추가
        view.on('canvas-resize', this.adjustFitMode, this);
    }

    onDestroy() {
        view.off('canvas-resize', this.adjustFitMode, this);
    }

    adjustFitMode() {
        // 기기의 실제 화면 크기 비율을 가져옴
        const frameSize = view.getFrameSize();
        const frameRatio = frameSize.width / frameSize.height;

        // 디자인 해상도의 비율
        const designRatio = this.DESIGN_WIDTH / this.DESIGN_HEIGHT;

        // 기기의 화면 비율이 디자인 비율보다 크면(더 넓은 화면), Fit Height를 사용
        // 기기의 화면 비율이 디자인 비율보다 작으면(더 좁은 화면), Fit Width를 사용
        if (frameRatio > designRatio) {
            // 가로 비율이 더 긴 기기: 세로를 꽉 채우고 가로는 확장
            view.setDesignResolutionSize(this.DESIGN_WIDTH, this.DESIGN_HEIGHT, ResolutionPolicy.SHOW_ALL);
            // this.image.color = new Color(0, 0, 255, 255);
        } else {
            // 세로 비율이 더 긴 기기: 가로를 꽉 채우고 세로는 확장
            view.setDesignResolutionSize(this.DESIGN_WIDTH, this.DESIGN_HEIGHT, ResolutionPolicy.FIXED_WIDTH);
            // this.image.color = new Color(0, 255, 0, 255);
        }
    }
}
