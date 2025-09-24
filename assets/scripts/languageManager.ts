import { _decorator, Component, director, Node, resources, TextAsset } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('languageManager')
export class languageManager extends Component {

    private languageDic: Map<string, Map<string, string>> = new Map();
    private languageArray: string[] = [];
    private filePath: string = "CartoonDefense - language"; // TSV 파일 경로
    public currentLanguage: string = "Korean";
    public isLoaded: boolean = false;


    // 싱글톤 인스턴스
    private static _instance: languageManager = null;

    public static get Instance(): languageManager {
        if (!languageManager._instance) {
            // 자동으로 인스턴스 생성
            const node = new Node('LanguageManager');
            languageManager._instance = node.addComponent(languageManager);
            languageManager._instance.loadLanguage();
            // 씬 전환 시에도 유지되도록 설정
            director.addPersistRootNode(node);
        }
        return languageManager._instance;
    }

    onLoad() {
        // 싱글톤 인스턴스 설정
        if (languageManager._instance === null) {
            languageManager._instance = this;
        } else if (languageManager._instance !== this) {
            console.warn("languageManager 인스턴스가 이미 존재합니다. 중복된 languageManager를 제거합니다.");
            this.node.destroy();
            return;
        }
    }
    start() {

    }


    loadLanguage() {
        this.currentLanguage = navigator.language.includes("ko") ? "Korean" : "English";
        console.log("LanguageManager LoadTSV1");
        const alternatePrefix = "29ffkkdjel_";
        const alternateList: string[] = [];

        // TSV 파일 로드
        resources.load(this.filePath, TextAsset, (err, textAsset) => {
            if (err || !textAsset) {
                console.error("언어 파일 로드 실패:", err);
                return;
            }

            let wholeText = textAsset.text;
            let alternateCount = 0;

            console.log("LanguageManager load: " + wholeText);
            // 처리: 따옴표를 특수 접두어로 대체
            if (wholeText.includes("\"")) {
                let inspectStartIndex = 0;
                let quoteIndex = 0;
                let isQuoteOn = false;

                while ((quoteIndex = wholeText.indexOf("\"", inspectStartIndex)) >= 0) {
                    isQuoteOn = !isQuoteOn;
                    inspectStartIndex = quoteIndex;
                    const quoteEndIndex = wholeText.indexOf("\"", inspectStartIndex + 1);
                    const quotation = wholeText.substring(quoteIndex, quoteEndIndex);
                    wholeText = wholeText.substring(0, quoteIndex) +
                        wholeText.substring(quoteEndIndex + 1);
                    const replacement = `${alternatePrefix}${alternateCount}`;
                    wholeText = wholeText.substring(0, quoteIndex) +
                        replacement +
                        wholeText.substring(quoteIndex);
                    alternateCount++;
                    alternateList.push(quotation);
                }
            }

            // 줄 단위로 텍스트를 분리
            const arrayString = wholeText.split("\n");
            let index = 0;
            // console.log("arrayString: " + arrayString.length);
            for (const line of arrayString) {
                const filteredLine = line;
                // 탭으로 분리하여 각 열의 값을 가져옴
                const values = filteredLine.split('\t');
                // console.log("filteredLine: " + filteredLine);

                if (index === 0) {
                    for (const str of values) {
                        if (str && str.trim() !== "" && !this.languageDic.has(str)) {
                            const dic = new Map<string, string>();
                            const key = str.replace(/\r?\n/g, "");
                            console.log("language key: " + key);
                            this.languageDic.set(key, dic);
                        }
                    }
                    this.languageArray = values;
                } else {
                    for (let i = 1; i < this.languageArray.length; i++) {
                        const str = values[i];
                        if (!this.languageArray[i] || this.languageArray[i].trim() === "") {
                            continue;
                        }

                        const languageMap = this.languageDic.get(this.languageArray[i]);
                        if (languageMap && !languageMap.has(values[0])) {
                            languageMap.set(values[0], str);
                        }
                    }
                }
                index++;
            }
            this.isLoaded = true;
            // console.log("LanguageManager LoadTSV3");
        });

    }

    update(deltaTime: number) {

    }

    /**
     * 특정 언어의 텍스트를 가져옵니다.
     * @param key 텍스트 키
     * @param language 언어 코드 (기본값: "Korean")
     * @returns 번역된 텍스트
     */
    public static getText(key: string, language: string = "Korean"): string {


        const languageMap = languageManager.Instance.languageDic.get(language);

        if (languageMap) {
            return languageMap.get(key) || key; // 키가 없으면 원본 키 반환
        }
        return key;
    }

    /**
     * 현재 사용 가능한 언어 목록을 반환합니다.
     * @returns 언어 코드 배열
     */
    getAvailableLanguages(): string[] {
        return Array.from(this.languageDic.keys());
    }

    /**
     * 특정 언어의 모든 텍스트 키를 반환합니다.
     * @param language 언어 코드
     * @returns 텍스트 키 배열
     */
    getKeysForLanguage(language: string): string[] {
        const languageMap = this.languageDic.get(language);
        if (languageMap) {
            return Array.from(languageMap.keys());
        }
        return [];
    }

    /**
     * 언어 데이터가 로드되었는지 확인합니다.
     * @returns 로드 완료 여부
     */
    isLanguageLoaded(): boolean {
        return this.languageDic.size > 0;
    }
}


