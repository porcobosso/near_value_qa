import React from 'react';

class HeadBanner extends React.Component{
    constructor(options){
        super(options);
        this.nearConnection = options.nearConnection;
        this.refreshAll = options.refreshAll;
        this.state = {
            numOfQuestion: 0,
            numOfAnswer: 0,
            signedIn: false,
            accountId: null
        }
        // refresh every 10 minutes
        setInterval(this.refresh(),600000)
    }

    componentDidMount(){
        this.props.onRef(this)
    }

    loginRefresh(){
        this.setState({
            signedIn: !!this.nearConnection._accountId,
            accountId: this.nearConnection._accountId
        })
        this.refresh()
    }

    async logOut() {
        this.nearConnection.logOut()
        this.setState({
          signedIn: false,
          accountId: null
        })
        this.refreshAll()
      }

    // question answer num in header banner
    async refresh(){
        this.setState({
            numOfQuestion: await this.nearConnection.numOfQuestion(),
            numOfAnswer: await this.nearConnection.numOfAnswer()
        })
    }

    render(){
        return (
            <div className="row text-center distance-top">
                <div className="col">
                    <div className="counter">
                    <i className="fa fa-quora fa-2x"></i>
                    <p className="count-text">{this.state.numOfQuestion}</p>
                    </div>
                </div>
                <div className="col">
                    <div className="counter">
                    <i className="fa fa-pencil fa-2x"></i>
                    <p className="count-text ">{this.state.numOfAnswer}</p>
                    </div>
                </div>
                <div className="col">
                    <div className="counter">
                    <p className="count-user">{this.state.signedIn? this.state.accountId:' '}</p>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={!this.state.signedIn? () => this.nearConnection.requestSignIn(): ()=>this.logOut()}>
                        {!this.state.signedIn? 'sign in':'sign out'}
                    </button>
                    </div>
                </div>
            </div>
        )
    }
}

export default HeadBanner;