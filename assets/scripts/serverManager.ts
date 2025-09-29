import { _decorator, Component, director, Node, sys } from 'cc';
import { saveData } from './saveData';
const { ccclass, property } = _decorator;

// API 응답 인터페이스
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// 서버 설정 인터페이스
export interface ServerConfig {
    baseUrl: string;
    apiKey?: string;
    timeout: number;
    retryCount: number;
}

@ccclass('serverManager')
export class serverManager extends Component {
    // 싱글톤 인스턴스
    private static _instance: serverManager = null;

    // 테스트 모드 설정
    private isTestMode: boolean = false; // 테스트 모드 활성화/비활성화
    private port: number = 8117;
    private domain: string = "1506games.com";

    // 서버 설정
    private config: ServerConfig = {
        baseUrl: this.isTestMode ? "http://localhost:" + this.port : "http://" + this.domain + ":" + this.port,
        apiKey: "",
        timeout: 10000, // 10초
        retryCount: 3
    };

    // 연결 상태
    private isConnected: boolean = false;
    private isConnecting: boolean = false;

    // WebSocket 연결
    private websocket: WebSocket | null = null;
    private wsUrl: string = this.isTestMode ? "ws://localhost:" + this.port + "/ws" : "wss://" + this.domain + ":" + this.port + "/ws";
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectDelay: number = 3000; // 3초
    private currentTime: Date = new Date();
    private timePassedFromSetTime: number = 0;

    public static get Instance(): serverManager {
        if (!serverManager._instance) {
            // 자동으로 인스턴스 생성
            const serverManagerNode = new Node('serverManager');
            serverManager._instance = serverManagerNode.addComponent(serverManager);

            // 씬 전환 시에도 유지되도록 설정
            director.addPersistRootNode(serverManagerNode);
        }
        return serverManager._instance;
    }

    onLoad() {
        // 싱글톤 인스턴스 설정
        if (serverManager._instance === null) {
            serverManager._instance = this;
        } else if (serverManager._instance !== this) {
            console.warn("serverManager 인스턴스가 이미 존재합니다. 중복된 serverManager를 제거합니다.");
            this.node.destroy();
            return;
        }
    }

    start() {
        this.initializeServer();
    }

    update(deltaTime: number) {
        this.timePassedFromSetTime += deltaTime;
    }

    /**
     * 서버 초기화
     */
    private initializeServer(): void {
        console.log("서버 매니저 초기화");
        // 서버 연결 테스트
        // this.testConnection();
    }

    /**
     * 서버 연결 테스트
     */
    private async testConnection(): Promise<void> {
        try {
            this.isConnecting = true;
            const response = await this.get("/time");
            this.isConnected = response.success;
            console.log("서버 연결 상태:", this.isConnected ? "연결됨" : "연결 실패");
        } catch (error) {
            console.error("서버 연결 테스트 실패:", error);
            this.isConnected = false;
        } finally {
            this.isConnecting = false;
        }
    }

    public log(message: string): void {
        console.log("log: ", message);
        let pData = saveData.Instance.data;
        let msg = pData.nickname + "," + pData.idx + "," + message;
        this.post("/log", msg);
    }

    /**
     * 테스트 모드 설정
     * @param testMode 테스트 모드 여부
     */
    public setTestMode(testMode: boolean): void {
        this.isTestMode = testMode;
        this.updateServerUrls();
        console.log("테스트 모드 설정:", this.isTestMode ? "활성화" : "비활성화");
    }

    /**
     * 테스트 모드 상태 확인
     * @returns 테스트 모드 여부
     */
    public getTestMode(): boolean {
        return this.isTestMode;
    }

    /**
     * 서버 URL 업데이트 (테스트 모드에 따라)
     */
    private updateServerUrls(): void {
        this.config.baseUrl = this.isTestMode ? "http://localhost:3000" : "http://" + this.domain + ":" + this.port;
        this.wsUrl = this.isTestMode ? "ws://localhost:3000/ws" : "wss://" + this.domain + ":" + this.port + "/ws";
        console.log("서버 URL 업데이트:", {
            http: this.config.baseUrl,
            websocket: this.wsUrl
        });
    }

    /**
     * 서버 설정 업데이트
     * @param newConfig 새로운 서버 설정
     */
    public updateConfig(newConfig: Partial<ServerConfig>): void {
        this.config = { ...this.config, ...newConfig };
        console.log("서버 설정 업데이트:", this.config);
    }

    /**
     * GET 요청
     * @param endpoint API 엔드포인트
     * @param params 쿼리 파라미터
     * @returns API 응답
     */
    public async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
        return this.request<T>("GET", endpoint, null, params);
    }

    /**
     * POST 요청
     * @param endpoint API 엔드포인트
     * @param data 전송할 데이터
     * @returns API 응답
     */
    public async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>("POST", endpoint, data);
    }

    /**
     * PUT 요청
     * @param endpoint API 엔드포인트
     * @param data 전송할 데이터
     * @returns API 응답
     */
    public async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>("PUT", endpoint, data);
    }

    /**
     * DELETE 요청
     * @param endpoint API 엔드포인트
     * @returns API 응답
     */
    public async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>("DELETE", endpoint);
    }

    /**
     * HTTP 요청 실행
     * @param method HTTP 메서드
     * @param endpoint API 엔드포인트
     * @param data 전송할 데이터
     * @param params 쿼리 파라미터
     * @returns API 응답
     */
    private async request<T = any>(
        method: string,
        endpoint: string,
        data?: any,
        params?: Record<string, any>
    ): Promise<ApiResponse<T>> {
        const url = this.buildUrl(endpoint, params);
        console.log("raw data:", data);
        data = serverManager.encrypt(data, serverManager.getKey());
        console.log("encrypted data:", data);
        const options: any = {
            method: method,
            headers: {
                'Content-Type': 'text/plain',
            },
            body: data
        };

        // API 키가 있으면 헤더에 추가
        if (this.config.apiKey) {
            options.headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }

        // POST, PUT 요청인 경우 데이터 추가
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = typeof data === "string" ? data : JSON.stringify(data);
        }
        console.log("options:", options);

        try {
            console.log(`${method} 요청:`, url, data);

            const response = await this.fetchWithTimeout(url, options, this.config.timeout);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            console.log("응답:", response.body);
            // const result = await response.json();
            const result = await response.text();
            console.log(`${method} 응답:`, result);

            return {
                success: true,
                data: result as T
            };
        } catch (error) {
            console.error(`${method} 요청 실패:`, error);
            return {
                success: false,
                error: error.message || '요청 실패'
            };
        }
    }
    static getKey(): string {
        return "secKeyalksjdflkajsflk7alkdjfaa4k";
    }
    static encrypt(text: string, key: string): string {
        let result = "";
        for (let i = 0; i < text.length; i++) {
            const c = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(c);
        }
        return btoa(result); // 브라우저/코코스에서 동작
    }

    // Base64 디코딩 후 다시 XOR
    static decrypt(text: string, key: string): string {
        const decoded = atob(text);
        return serverManager.rawEncrypt(decoded, key); // XOR만 수행
    }

    // XOR만 하는 내부 함수
    private static rawEncrypt(text: string, key: string): string {
        let result = "";
        for (let i = 0; i < text.length; i++) {
            const c = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(c);
        }
        return result;
    }

    /**
     * 타임아웃이 있는 fetch 요청
     * @param url 요청 URL
     * @param options 요청 옵션
     * @param timeout 타임아웃 (밀리초)
     * @returns Promise<Response>
     */
    private async fetchWithTimeout(url: string, options: any, timeout: number): Promise<Response> {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('요청 타임아웃'));
            }, timeout);

            fetch(url, options)
                .then(response => {
                    clearTimeout(timeoutId);
                    resolve(response);
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    reject(error);
                });
        });
    }

    /**
     * URL 빌드
     * @param endpoint API 엔드포인트
     * @param params 쿼리 파라미터
     * @returns 완성된 URL
     */
    private buildUrl(endpoint: string, params?: Record<string, any>): string {
        let url = `${this.config.baseUrl}${endpoint}`;

        if (params) {
            const queryString = Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');
            url += `?${queryString}`;
        }

        return url;
    }
    public getCurrentTime(): Date {
        return new Date(this.currentTime.getTime() + this.timePassedFromSetTime);
    }
    public setCurrentTime(time: Date): void {
        this.currentTime = time;
        this.timePassedFromSetTime = time.getTime();
    }

    /**
     * 연결 상태 확인
     * @returns 연결 상태
     */
    public getConnectionStatus(): boolean {
        return this.isConnected;
    }

    /**
     * 연결 중 상태 확인
     * @returns 연결 중 상태
     */
    public isConnectingToServer(): boolean {
        return this.isConnecting;
    }

    // ========== WebSocket 관련 메서드들 ==========

    /**
     * WebSocket 연결
     */
    public connectWebSocket(): void {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            console.log("WebSocket이 이미 연결되어 있습니다.");
            return;
        }

        try {
            this.websocket = new WebSocket(this.wsUrl);
            this.setupWebSocketEvents();
            console.log("WebSocket 연결 시도:", this.wsUrl);
        } catch (error) {
            console.error("WebSocket 연결 실패:", error);
            this.scheduleReconnect();
        }
    }

    /**
     * WebSocket 이벤트 설정
     */
    private setupWebSocketEvents(): void {
        if (!this.websocket) return;

        this.websocket.onopen = (event) => {
            console.log("WebSocket 연결됨");
            this.isConnected = true;
            this.reconnectAttempts = 0;
        };

        this.websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            } catch (error) {
                console.error("WebSocket 메시지 파싱 실패:", error);
            }
        };

        this.websocket.onclose = (event) => {
            console.log("WebSocket 연결 종료:", event.code, event.reason);
            this.isConnected = false;
            this.websocket = null;

            if (event.code !== 1000) { // 정상 종료가 아닌 경우
                this.scheduleReconnect();
            }
        };

        this.websocket.onerror = (error) => {
            console.error("WebSocket 오류:", error);
            this.isConnected = false;
        };
    }

    /**
     * WebSocket 메시지 처리
     * @param data 받은 메시지 데이터
     */
    private handleWebSocketMessage(data: any): void {
        console.log("WebSocket 메시지 수신:", data);

        // 메시지 타입에 따른 처리
        switch (data.type) {
            case 'ping':
                this.sendWebSocketMessage({ type: 'pong' });
                break;
            case 'game_update':
                this.handleGameUpdate(data);
                break;
            case 'player_data':
                this.handlePlayerData(data);
                break;
            default:
                console.log("알 수 없는 메시지 타입:", data.type);
        }
    }

    /**
     * WebSocket 메시지 전송
     * @param message 전송할 메시지
     */
    public sendWebSocketMessage(message: any): void {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(message));
        } else {
            console.warn("WebSocket이 연결되지 않았습니다.");
        }
    }

    /**
     * WebSocket 연결 종료
     */
    public disconnectWebSocket(): void {
        if (this.websocket) {
            this.websocket.close(1000, "정상 종료");
            this.websocket = null;
        }
    }

    /**
     * 재연결 스케줄링
     */
    private scheduleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log("최대 재연결 시도 횟수에 도달했습니다.");
            return;
        }

        this.reconnectAttempts++;
        console.log(`${this.reconnectDelay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            this.connectWebSocket();
        }, this.reconnectDelay);
    }

    // ========== 게임 관련 API 메서드들 ==========

    /**
     * 플레이어 데이터 저장
     * @param playerData 플레이어 데이터
     * @returns API 응답
     */
    public async savePlayerData(playerData: any): Promise<ApiResponse> {
        return this.post("/saveuser", playerData);
    }

    public async createPlayerData(nick: string): Promise<ApiResponse> {
        return this.post("/createuser", nick);
    }

    /**
     * 플레이어 데이터 로드
     * @param playerId 플레이어 ID
     * @returns API 응답
     */
    public async loadPlayerData(playerId: string): Promise<ApiResponse> {
        console.log("플레이어 데이터 로드:", playerId);
        return this.post("/getuser", { userId: playerId });
    }

    /**
     * 게임 점수 업데이트
     * @param scoreData 점수 데이터
     * @returns API 응답
     */
    public async updateScore(scoreData: any): Promise<ApiResponse> {
        return this.post("/game/score", scoreData);
    }

    /**
     * 리더보드 조회
     * @param limit 조회할 개수
     * @returns API 응답
     */
    public async getLeaderboard(limit: number = 10): Promise<ApiResponse> {
        return this.get("/game/leaderboard", { limit });
    }

    /**
     * 게임 설정 로드
     * @returns API 응답
     */
    public async loadGameSettings(): Promise<ApiResponse> {
        return this.get("/game/settings");
    }

    /**
     * 게임 업데이트 처리
     * @param data 게임 업데이트 데이터
     */
    private handleGameUpdate(data: any): void {
        console.log("게임 업데이트 수신:", data);
        // 게임 업데이트 로직 구현
    }

    /**
     * 플레이어 데이터 처리
     * @param data 플레이어 데이터
     */
    private handlePlayerData(data: any): void {
        console.log("플레이어 데이터 수신:", data);
        // 플레이어 데이터 처리 로직 구현
    }

    // ========== 정적 메서드들 (어디서든 접근 가능) ==========

    /**
     * GET 요청 (정적 메서드)
     * @param endpoint API 엔드포인트
     * @param params 쿼리 파라미터
     * @returns API 응답
     */
    public static async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
        return serverManager.Instance.get<T>(endpoint, params);
    }

    /**
     * POST 요청 (정적 메서드)
     * @param endpoint API 엔드포인트
     * @param data 전송할 데이터
     * @returns API 응답
     */
    public static async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return serverManager.Instance.post<T>(endpoint, data);
    }

    /**
     * PUT 요청 (정적 메서드)
     * @param endpoint API 엔드포인트
     * @param data 전송할 데이터
     * @returns API 응답
     */
    public static async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return serverManager.Instance.put<T>(endpoint, data);
    }

    /**
     * DELETE 요청 (정적 메서드)
     * @param endpoint API 엔드포인트
     * @returns API 응답
     */
    public static async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        return serverManager.Instance.delete<T>(endpoint);
    }

    /**
     * 서버 설정 업데이트 (정적 메서드)
     * @param newConfig 새로운 서버 설정
     */
    public static updateConfig(newConfig: Partial<ServerConfig>): void {
        serverManager.Instance.updateConfig(newConfig);
    }

    /**
     * 연결 상태 확인 (정적 메서드)
     * @returns 연결 상태
     */
    public static getConnectionStatus(): boolean {
        return serverManager.Instance.getConnectionStatus();
    }

    /**
     * WebSocket 연결 (정적 메서드)
     */
    public static connectWebSocket(): void {
        serverManager.Instance.connectWebSocket();
    }

    /**
     * WebSocket 메시지 전송 (정적 메서드)
     * @param message 전송할 메시지
     */
    public static sendWebSocketMessage(message: any): void {
        serverManager.Instance.sendWebSocketMessage(message);
    }

    /**
     * WebSocket 연결 종료 (정적 메서드)
     */
    public static disconnectWebSocket(): void {
        serverManager.Instance.disconnectWebSocket();
    }

    /**
     * 플레이어 데이터 저장 (정적 메서드)
     * @param playerData 플레이어 데이터
     * @returns API 응답
     */
    public static async savePlayerData(playerData: any): Promise<ApiResponse> {
        return serverManager.Instance.savePlayerData(playerData);
    }

    /**
     * 플레이어 데이터 로드 (정적 메서드)
     * @param playerId 플레이어 ID
     * @returns API 응답
     */
    public static async loadPlayerData(playerId: string): Promise<ApiResponse> {
        return serverManager.Instance.loadPlayerData(playerId);
    }

    /**
     * 게임 점수 업데이트 (정적 메서드)
     * @param scoreData 점수 데이터
     * @returns API 응답
     */
    public static async updateScore(scoreData: any): Promise<ApiResponse> {
        return serverManager.Instance.updateScore(scoreData);
    }

    /**
     * 리더보드 조회 (정적 메서드)
     * @param limit 조회할 개수
     * @returns API 응답
     */
    public static async getLeaderboard(limit: number = 10): Promise<ApiResponse> {
        return serverManager.Instance.getLeaderboard(limit);
    }

    /**
     * 게임 설정 로드 (정적 메서드)
     * @returns API 응답
     */
    public static async loadGameSettings(): Promise<ApiResponse> {
        return serverManager.Instance.loadGameSettings();
    }

    /**
     * 테스트 모드 설정 (정적 메서드)
     * @param testMode 테스트 모드 여부
     */
    public static setTestMode(testMode: boolean): void {
        serverManager.Instance.setTestMode(testMode);
    }

    /**
     * 테스트 모드 상태 확인 (정적 메서드)
     * @returns 테스트 모드 여부
     */
    public static getTestMode(): boolean {
        return serverManager.Instance.getTestMode();
    }

    onDestroy() {
        if (serverManager._instance === this) {
            serverManager._instance = null;
        }
    }

}


