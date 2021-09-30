import React from 'react'
import NearConnection from '../../../pages/NearConnection';


export default class Home extends React.Component {

    constructor(options){
        super(options);
        this.state = {
            authResult : ""
        }
        let transactionHashes = this.getTransactionHashes()
        this.nearConnection = new NearConnection()

        this.nearConnection.init().then(() => {
            if(transactionHashes==""){
                this.authRequest()
            }else{
                this.actionAfterConfirm(transactionHashes)
            }
        });
    }
    
    async actionAfterConfirm(hax){
        const result = await this.nearConnection.getTransactionStatus(hax)
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

    async authRequest(){
        var info = this.parentInfo()
        const totalNear = info['near']
        await this.nearConnection.createQuestion(info, totalNear)
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