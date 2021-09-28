import * as nearAPI from 'near-api-js'

const { utils } = nearAPI;
const ContractName = 'contract003.testnet';
const nearConfig = {
    networkId: 'default',
    nodeUrl: 'https://rpc.testnet.near.org',
    contractName: ContractName,
    walletUrl: 'https://wallet.testnet.near.org',
};

const cryptico = require('cryptico')

class NearConnection{
    constructor(){
        this._keySource = null
        this._rsakey = null
        this._publickey = null
    }

    async init(){
        const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
        // near connection
        const near = await nearAPI.connect(Object.assign({ deps: { keyStore } }, nearConfig));
        this._keyStore = keyStore;
        this._nearConfig = nearConfig;
        this._near = near;

        this._walletConnection = new nearAPI.WalletConnection(near, ContractName);
        this._accountId = this._walletConnection.getAccountId();
        this._account = this._walletConnection.account();

        this._contract = new nearAPI.Contract(this._account, ContractName, {
        viewMethods: ['claimAmount', 'questionCount', 'answerCount','showQuestion', 'showAnswer', 'listMyAskedQuestions', 'listUnAnsweredQuestions', 'listAnsweredQuestions', 'listAllRelQuestions'],
        changeMethods: ['createQuestion', 'answerQuestion', 'claimReward', 'claimAll'],
        });
        if (this._accountId) {
            const _accessKey = await this._account.getAccessKeys();
            for(var i=_accessKey.length-1;i>=0;i--){
                if(_accessKey[i].access_key.permission==='FullAccess') continue;
                if(_accessKey[i].access_key.permission.FunctionCall.receiver_id===ContractName){
                this._keysource = _accessKey[i].public_key;
                this._rsakey = cryptico.generateRSAKey(this._keysource, 1024)
                this._publickey = cryptico.publicKeyString(this._rsakey)
                break;
                }
            }
        }
    }

    async requestSignIn(){
        const appTitle = 'NEAR value quora';
        await this._walletConnection.requestSignIn(
            ContractName,
            appTitle
        )
    }

    async logOut(){
        this._walletConnection.signOut();
        this._accountId = null;
        this._keySource = null;
    }

    // get question num
    async numOfQuestion(){
        try {
            let num = await this._contract.questionCount({});
        return num
        } catch (error) {}
        return 0
    }

    // get answer num
    async numOfAnswer(){
        try {
            let num = await this._contract.answerCount({})
            return num
        } catch (error) {}
        return 0
    }

    // get user asked question
    async askedQustion(limit){
        if(!!this._accountId){
            try {
                let questions = await this._contract.listMyAskedQuestions({user:this._accountId, limit:limit})
                return questions
            } catch (error) {}
        }
        return []
        l
    }

    // get user answered question
    async unAnsweredQuestion(limit){
        if(!!this._accountId){
            try {
                let questions = await this._contract.listUnAnsweredQuestions({user:this._accountId, limit:limit})
            return questions
            } catch (error) {}
        }
        return []
    }

    // get user un-answered question
    async answeredQuestion(limit){
        if(!!this._accountId){
            try {
                let questions = await this._contract.listAnsweredQuestions({user:this._accountId, limit:limit})
                return questions
            } catch (error) {}
        }
        return []
    }

    // get total claimable amount
    async totalClaimable(){
        try {
            let claimable = await this._contract.claimAmount({
                user: this._accountId
            })
            return utils.format.formatNearAmount(claimable)
        } catch (error) {
            return 0   
        }
    }

    async claim(id){
        try {
            await this._contract.claimReward({
                questionId: id
            })
            return 'success';
        } catch (error) {
            return `${error}`;
        }
    }

    async claimAll(){
        try {
            await this._contract.claimAll({}, 50000000000000)
            return 'success';
        } catch (error) {
            return `${error}`;
        }
    }

    // get question detail
    async quesiton(id){
        var question = await this._contract.showQuestion({id:id})
        return question
    }

    async answerQuestion(id, qlock, content){
        content = escape(content)
        let contentForQuestioner = cryptico.encrypt(content, qlock).cipher
        let contentForReplier = cryptico.encrypt(content, this._publickey).cipher
        let result = await this._contract.answerQuestion({
            questionId: id,
            contentForQuestioner:contentForQuestioner,
            contentForReplier: contentForReplier
        })
        return result
    }

    decodeContent(s){
        var content = cryptico.decrypt(s, this._rsakey).plaintext
        return unescape(content)
    }
}

export default NearConnection;
