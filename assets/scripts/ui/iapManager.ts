// iapManager.ts
import { _decorator, Component, native, find, game, Node, director } from 'cc';
import { dataManager } from '../dataManager';

const { ccclass, property } = _decorator;

// 결제 결과를 처리할 콜백 함수를 정의합니다.
type PurchaseCallback = (result: string, sku: string) => void;

// 상품 정보를 타입스크립트에서 처리하기 위한 인터페이스
type ProductDetails = {
    zzc?: string; // productId
    zzd?: string; // type (inapp)
    zze?: string; // title
    zzf?: string; // name
    zzg?: string; // description
    zzk?: Array<{
        zza: string; // formattedPrice
        zzb: number; // priceAmountMicros
        zzc: string; // priceCurrencyCode
        zzd: string; // offerIdToken
        zze: string;
    }>;
    // 표준 필드들도 지원
    productId?: string;
    productType?: string;
    title?: string;
    description?: string;
    oneTimePurchaseOfferDetails?: {
        priceCurrencyCode: string;
        formattedPrice: string;
        priceAmountMicros?: number;
    };
};

// 상품 목록 결과를 처리할 콜백 함수를 정의합니다.
type ProductListCallback = (result: 'success' | 'error', products?: ProductDetails[] | string) => void;

@ccclass('iapManager')
export class iapManager extends Component {
    private static _instance: iapManager | null = null;
    private _purchaseCallback: PurchaseCallback | null = null;
    private _productListCallback: ProductListCallback | null = null;
    public ProductList: ProductDetails[] = [];
    public LogDelegate: any = null;
    public PriceRegisteredDelegate: any = null;
    public static isInitialized: boolean = false;

    public static get Instance(): iapManager {
        if (!iapManager._instance) {
            // 자동으로 인스턴스 생성
            const iapManagerNode = new Node('iapManager');
            iapManager._instance = iapManagerNode.addComponent(iapManager);
            // 씬 전환 시에도 유지되도록 설정
            director.addPersistRootNode(iapManagerNode);
        }
        return iapManager._instance;
    }

    onLoad() {
        // 싱글톤 인스턴스 설정
        if (iapManager._instance === null) {
            iapManager._instance = this;
        } else if (iapManager._instance !== this) {
            console.warn("iapManager 인스턴스가 이미 존재합니다. 중복된 iapManager를 제거합니다.");
            this.node.destroy();
            return;
        }

        // if (iapManager._instance && iapManager._instance !== this) {
        //     this.destroy();
        //     return;
        // }
        iapManager._instance = this;
        game.addPersistRootNode(this.node);

        console.log("dataManager.Instance.shopInfoList: ", dataManager.Instance.shopInfoList);


        console.log("iapManager onLoad: ");
        // native.bridge.onNative를 사용하여 네이티브 이벤트 리스너 등록
        native.bridge.onNative = (eventName: string, jsonParams: string) => {
            const params = JSON.parse(jsonParams);
            switch (eventName) {
                case 'onPurchaseResult':
                    this.onPurchaseResult(params, params);
                    break;
                case 'onProductDetailsResult':
                    this.onProductDetailsResult(params, params);
                    break;
                default:
                    console.warn(`Unknown native event: ${eventName}`);
                    break;
            }
        };

    }
    public requestProducts() {
        this.requestProductList(dataManager.Instance.shopInfoList.map(shop => shop.ID), (result, data) => {
            console.log("requestProductList: ");
            console.log("result: ", result);
            console.log("data: ", data);
            this.LogDelegate("requestProducts", result + " " + data);

            if (result === 'success' && Array.isArray(data)) {
                console.log("data length: ", data.length);
                for (let i = 0; i < data.length; i++) {
                    let product = data[i] as ProductDetails;
                    console.log("data[i]: ", product);

                    // 새로운 필드명으로 접근
                    const productId = product.zzc || product.productId;
                    const productType = product.zzd || product.productType;
                    const title = product.zze || product.title;
                    const name = product.zzf;
                    const description = product.zzg || product.description;

                    console.log("Product ID: ", productId);
                    console.log("Product Type: ", productType);
                    console.log("Title: ", title);
                    console.log("Name: ", name);
                    console.log("Description: ", description);

                    // 가격 정보 처리
                    if (product.zzk && product.zzk.length > 0) {
                        const priceInfo = product.zzk[0];
                        console.log("Price: ", priceInfo.zza); // formattedPrice
                        console.log("Price Micros: ", priceInfo.zzb); // priceAmountMicros
                        console.log("Currency: ", priceInfo.zzc); // priceCurrencyCode
                    } else if (product.oneTimePurchaseOfferDetails) {

                        console.log("Price: ", product.oneTimePurchaseOfferDetails.formattedPrice);
                        console.log("Currency: ", product.oneTimePurchaseOfferDetails.priceCurrencyCode);
                    }
                    this.ProductList.push(product);
                }
                this.PriceRegisteredDelegate("success", this.ProductList);
            } else {
                console.log("Failed to get product list or data is not array: " + result + "/data: " + data);
            }
        });
    }

    public init() {
        console.log("iapManager init: ");
        iapManager.isInitialized = true;

        // AppActivity.java의 static 메서드 initIAP 호출
        native.reflection.callStaticMethod(
            'com/cocos/game/AppActivity',
            'initIAP',
            '()V',
            ''
        );
    }

    /**
     * 인앱 결제 요청
     * @param productId 구매하려는 상품의 ID
     * @param callback 결제 결과를 처리할 콜백 함수
     */
    public requestPurchase(productId: string, callback: PurchaseCallback) {
        console.log("iapManager requestPurchase: ", productId);
        if (!native.reflection || !native.reflection.callStaticMethod) {
            console.log("iapManager requestPurchase: ", "네이티브 리플렉션이 지원되지 않는 플랫폼입니다.");
            console.error('네이티브 리플렉션이 지원되지 않는 플랫폼입니다.');
            callback('unsupported_platform', '');
            return;
        }

        console.log("iapManager about to call startPurchaseFlow");
        this._purchaseCallback = callback;

        const jsonProductIds = JSON.stringify(productId); // 배열을 JSON 문자열로 변환
        // AppActivity.java의 static 메서드 startPurchaseFlow 호출
        native.reflection.callStaticMethod(
            'com/cocos/game/AppActivity',
            'startPurchaseFlow',
            '(Ljava/lang/String;)V',
            jsonProductIds
        );
    }

    /**
     * Java에서 호출되는 결제 결과 콜백 함수
     * @param result 'success', 'user_canceled', 'pending', 'error'
     * @param sku 구매된 상품의 SKU (또는 에러 코드)
     */
    public onPurchaseResult(result: string, sku: string) {
        this.LogDelegate("onPurchaseResult", result + " " + sku);
        if (this._purchaseCallback) {
            this._purchaseCallback(result, sku);
        } else {
            console.warn('Purchase result received but no callback was set.');
        }
    }

    /**
     * 등록된 인앱 상품 목록을 요청합니다.
     * @param productIds Google Play 콘솔에 등록된 상품 ID 배열
     * @param callback 결과를 처리할 콜백 함수
     */
    public requestProductList(productIds: string[], callback: ProductListCallback) {
        console.log("iapManager requestProductList: ", productIds);
        if (!native.reflection || !native.reflection.callStaticMethod) {
            console.error('네이티브 리플렉션이 지원되지 않는 플랫폼입니다.');
            callback('error', 'unsupported_platform');
            return;
        }
        console.log("iapManager requestProductList: about to call queryAllProducts");

        this._productListCallback = callback;
        console.log("iapManager requestProductList: about to call queryAllProducts3");

        const jsonProductIds = JSON.stringify(productIds); // 배열을 JSON 문자열로 변환

        native.reflection.callStaticMethod(
            'com/cocos/game/AppActivity',
            'queryAllProducts',
            '(Ljava/lang/String;)V', // String 단일 인자를 받는 시그니처로 변경
            jsonProductIds // JSON 문자열 전달
        );
    }

    /**
     * Java에서 호출되는 상품 목록 결과 콜백 함수
     * @param result 'success' 또는 'error'
     * @param data 결과 데이터 (성공 시 JSON, 실패 시 에러 메시지)
     */
    public onProductDetailsResult(result: string, data: string) {
        console.log("onProductDetailsResult called with result:", result, "data:", data);

        if (!this._productListCallback) {
            console.warn('Product details received but no callback was set.');
            return;
        }
        console.log("onProductDetailsResult 1");
        console.log("onProductDetailsResult 1.5: ", data.trim());
        console.log("onProductDetailsResult 2: ", data.trim().length);
        // 데이터가 존재하고 유효한 JSON 형태라면 성공으로 처리
        if (data && data.trim().length > 0) {
            try {
                console.log("onProductDetailsResult 3");
                // data가 이미 배열 형태인지 확인
                let productList: ProductDetails[];

                // data가 문자열로 감싸진 JSON인지 확인
                if (typeof data === 'string' && data.startsWith('[')) {
                    console.log("onProductDetailsResult 4");
                    productList = JSON.parse(data);
                } else if (typeof data === 'string') {
                    console.log("onProductDetailsResult 5");
                    // 단일 객체인 경우 배열로 감싸기
                    const singleProduct = JSON.parse(data);
                    productList = [singleProduct];
                } else {
                    console.log("onProductDetailsResult 6");
                    // 이미 객체인 경우
                    productList = Array.isArray(data) ? data : [data];
                }

                console.log("onProductDetailsResult 7");
                console.log("Parsed product list:", productList);
                this.ProductList = productList;
                this._productListCallback('success', this.ProductList);
            } catch (e) {
                console.error('Failed to parse product details JSON', e);
                console.error('Raw data:', data);
                this._productListCallback('error', 'json_parse_failed');
            }
        } else {
            console.log("onProductDetailsResult 10");
            console.error('No data received or empty data');
            this._productListCallback('error', data || 'no_data');
        }

        console.log("onProductDetailsResult 8");
        this._productListCallback = null;
    }
}
