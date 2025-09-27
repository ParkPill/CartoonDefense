import { _decorator, Component, EditBox, Node } from 'cc';
import { popupBase } from '../popupBase';
import { serverManager } from '../../serverManager';
import { saveData } from '../../saveData';
const { ccclass, property } = _decorator;

@ccclass('pnlCreateUser')
export class pnlCreateUser extends popupBase {
    @property(EditBox)
    editBoxNickname: EditBox = null;
    start() {

    }

    update(deltaTime: number) {

    }
    public onOkClick() {
        let nick = this.editBoxNickname.string;
        if (nick === "") {
            console.log("nickname is empty");
            return;
        }
        if (!this.isCurseOrSpecialCharInNickname(nick)) {
            console.log("nickname is curse or special char");
            return;
        }
        this.createPlayerData(nick);
        // this.close();
    }
    isCurseOrSpecialCharInNickname(nick: string) {
        // 욕설 및 특수문자 검사
        // 특수문자 포함 여부 확인
        let specialCharRegex = /[^a-zA-Z0-9가-힣]/;
        if (specialCharRegex.test(nick)) {
            return false;
        }
        // 욕설 리스트 (간단 예시, 실제로는 더 많은 단어를 추가해야 함)
        const curseWords = [
            "fuck", "shit", "bitch", "asshole", "개새끼", "씨발", "좆", "병신", "ㅄ", "ㅅㅂ", "ㅂㅅ", "ㅄ", "fuckyou"
        ];
        // Reserved names
        const reservedNames = [
            "admin", "system", "root", "guest", "test", "admin123", "admin1234", "admin12345", "admin123456", "admin1234567", "admin12345678", "admin123456789", "Guest"
        ];
        let lowerNick = nick.toLowerCase();
        for (let i = 0; i < curseWords.length; i++) {
            if (lowerNick.includes(curseWords[i])) {
                return false;
            }
        }
        for (let i = 0; i < reservedNames.length; i++) {
            if (lowerNick.includes(reservedNames[i])) {
                return false;
            }
        }
        return true;
    }
    async createPlayerData(nick: string) {
        let response = await serverManager.Instance.createPlayerData(nick);

        if (response.success) {
            saveData.Instance.data.nickname = nick;
            saveData.Instance.data._id = response.data;
            // console.log("_id saving: ", saveData.Instance.data._id);
            saveData.Instance.save();
            this.close();
        }
        else {
            console.log("createPlayerData failed", response.error);
        }
    }
}