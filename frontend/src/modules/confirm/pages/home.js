import React from 'react'
import * as nearAPI from 'near-api-js'

const ContractName = 'contract003.testnet';
const { utils } = nearAPI;

export default class Home extends React.Component {

    constructor(options){
        super(options);
        this.state = {
            authResult : ""
        }
        let transactionHashes = this.getTransactionHashes()
        this._initNear().then(() => {
            if(transactionHashes==""){
                this.authRequest()
            }else{
                this.getTransactionStatus(transactionHashes)
            }
        });
    }
    
    async getTransactionStatus(hax){
        const provider = new nearAPI.providers.JsonRpcProvider(
            "https://archival-rpc.testnet.near.org"
          );
        const result = await provider.txStatus(hax, this._accountId);
        if('SuccessValue' in result['status']){
            window.opener.actionAfterConfirm({
                hover: {
                    show: true,
                    closeable: true,
                    message: 'add question success',
                    hax: hax
                }
            })
            window.close()
        }else{
            window.opener.actionAfterConfirm({
                hover: {
                    show: true,
                    closeable: true,
                    message: 'add question failed',
                    hax: hax
                }
            })
            window.close()
        }
    }

    getTransactionHashes(){
        let search = window.location.search
        if(search === ''){
            return ""
        }
        search = search.substring(1)
        let params = search.split("&")
        for(var i=0;i<params.length;i++){
            let param = params[i].split("=")
            if(param[0]==="transactionHashes"){
                return param[1]
            }
        }
        return ""
    }

    async _initNear() {
        const nearConfig = {
          networkId: 'default',
          nodeUrl: 'https://rpc.testnet.near.org',
          contractName: ContractName,
          walletUrl: 'https://wallet.testnet.near.org',
        };
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
          viewMethods: ['questionCount', 'answerCount','showQuestion', 'showAnswer', 'listMyAskedQuestions', 'listUnAnsweredQuestions', 'listAnsweredQuestions', 'listAllRelQuestions'],
          changeMethods: ['createQuestion', 'answerQuestion', 'claimReward'],
        });
        this._keySource = null
        if (this._accountId) {
          const _accessKey = await this._account.getAccessKeys();
          for(var i=0;i<_accessKey.length;i++){
            if(_accessKey[i].access_key.permission==='FullAccess') continue;
            if(_accessKey[i].access_key.permission.FunctionCall.receiver_id===ContractName){
              this._keysource = _accessKey[i].public_key;
              break;
            }
          }
        }
      }

    async authRequest(){
        var info = this.parentInfo()
        console.log(info)
        const totalNear = info['near']
        await this._contract.createQuestion({
            id: info['id'],
            title:info['title'],
            content:info['content'],
            repliers: info['repliers'],
            moneys: info['moneys'],
            lock: info['lock']
        }, 30000000000000, utils.format.parseNearAmount(`${totalNear}`))
    }

    parentInfo(){
        var infoDiv = window.opener.document.getElementById("jsonForAddQuestion")
        return JSON.parse(infoDiv.innerText)
    }

    render(){
        return (
            <div id="authResult">{this.state.authResult}
            </div>
        )
    }
}