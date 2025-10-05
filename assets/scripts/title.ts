import { _decorator, Component, director, InstanceMaterialType, Label, Node } from 'cc';
import { languageManager } from './languageManager';
import { dataManager } from './dataManager';
import { saveData } from './saveData';
import { gameManager } from './gameManager';
import { serverManager } from './serverManager';
import { iapManager } from './ui/iapManager';
const { ccclass, property } = _decorator;

@ccclass('title')
export class title extends Component {
    @property(Label)
    public lblLoading: Label;

    maxLoadingCount: number = 0;
    loadingCount: number = 0;

    languageLoaded: boolean = false;
    isLoadingGameScene: boolean = false;
    isDataLoaded: boolean = false;

    start() {
        gameManager.Instance.isTitleLoaded = true;
        console.log("title loaded");
        this.maxLoadingCount = 2; // 1 for language, 1 for saveData
        this.maxLoadingCount += dataManager.Instance.maxLoadingCount;
        let id = saveData.Instance.data._id;
        let stage = saveData.Instance.data.highestStage;
        console.log("id: " + id);
        dataManager.Instance.init();

        this.loadPlayerData(id);
    }
    async loadPlayerData(id: string) {
        let response = await serverManager.Instance.loadPlayerData(id);
        if (response.success) {
            console.log("loadPlayerData success");
            saveData.Instance.data.fromJSON(response.data);
            this.isDataLoaded = true;
        }
        else {
            console.log("loadPlayerData failed");
        }
    }

    update(deltaTime: number) {
        if (!this.languageLoaded) {
            if (languageManager.Instance && languageManager.Instance.isLoaded) {
                this.languageLoaded = true;
                this.loadingCount++;
            }
        }

        if (this.isLoadingGameScene) {

        }
        else {
            let extraLoadingCount = dataManager.Instance.loadingCount;
            extraLoadingCount += saveData.Instance.isLoaded ? 1 : 0;
            let loadingpercent = (this.loadingCount + extraLoadingCount) / this.maxLoadingCount * 100;
            let strLoading = "loading .. (" + loadingpercent.toFixed(2) + "%)";
            this.lblLoading.string = strLoading;

            if (this.maxLoadingCount <= this.loadingCount + extraLoadingCount && this.isDataLoaded) {
                this.isLoadingGameScene = true;
                director.loadScene("game");
            }
        }

    }
}

