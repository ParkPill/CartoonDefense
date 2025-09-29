import { _decorator, Component, Node, instantiate, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PoolItemRecycle')
export class PoolItemRecycle extends Component {
    private _poolItemList: Node[] = [];

    /**
     * 컨텐츠의 자식 노드들을 풀에 재활용하는 정적 메서드
     * @param content 풀에 넣을 부모 노드
     * @returns PoolItemRecycle 인스턴스
     */
    public static Recycle(content: Node): PoolItemRecycle {
        let recycle = content.getComponent(PoolItemRecycle);
        if (!recycle) {
            recycle = content.addComponent(PoolItemRecycle);
        }

        const children = content.children;
        for (let i = children.length - 1; i >= 0; i--) {
            const child = children[i];
            if (child.name === "temp" &&
                !child.name.startsWith("btnLoad") &&
                child.active &&
                child.getComponent('NotRecycle') === null) {

                child.name = "poolitem";
                child.active = false;
                recycle._poolItemList.push(child);
            }
        }

        return recycle;
    }

    /**
     * 컨텐츠의 자식 노드 수를 최대 개수로 제한
     * @param content 제한할 부모 노드
     * @param maxCount 최대 자식 노드 수
     */
    public Trim(content: Node, maxCount: number): void {
        if (content.children.length > maxCount) {
            const removeCount = content.children.length - maxCount;
            for (let i = 0; i < removeCount; i++) {
                const child = content.children[i];
                if (child.name === "temp") {
                    child.destroy();
                }
            }
        }
    }

    /**
     * 풀에서 아이템을 가져오거나 새로 생성
     * @param temp 템플릿 노드
     * @returns 아이템 노드
     */
    public GetItem(temp: Node): Node {
        temp.active = false;

        if (this._poolItemList.length <= 0) {
            const newItem = instantiate(temp);
            newItem.parent = temp.parent;
            newItem.active = true;
            return newItem;
        }

        const item = this._poolItemList.shift()!;
        item.active = true;
        item.setSiblingIndex(-1); // SetAsLastSibling

        // 애니메이션 컴포넌트들을 다시 바인딩
        const animators = item.getComponentsInChildren(Animation);
        for (const animator of animators) {
            if (!animator.node.activeInHierarchy) {
                continue;
            }

            // Cocos Creator에서는 rebind와 update 대신 play를 사용
            animator.play();
        }

        return item;
    }

    /**
     * 제네릭을 사용한 아이템 가져오기
     * @param prefab 템플릿 컴포넌트
     * @returns 요청된 타입의 컴포넌트
     */
    public GetItemComponent<T extends Component>(prefab: T): T {
        const instance = this.GetItem(prefab.node);
        return instance.getComponent(prefab.constructor as any) as T;
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


