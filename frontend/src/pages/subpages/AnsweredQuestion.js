import React from 'react';
import * as nearAPI from 'near-api-js'
import {Table, Container, Row, Col} from 'react-bootstrap'

const ListLimit = 10
const { utils } = nearAPI;

class AnsweredQuestion extends React.Component{
    constructor(options){
        super(options);
        this.nearConnection = options.nearConnection;
        this.controlHover = options.controlHover;
        this.refreshAll = options.refreshAll;
        this.state = {
            signedIn: false,
            totalClaimable: 0,
            answeredQuestion: []
        }
    }

    componentDidMount(){
        this.props.onRef(this)
    }

    loginRefresh(){
        this.setState({
            signedIn: !!this.nearConnection._accountId
        })
        this.refresh()
    }

    logoutRefresh(){
        this.setState({
            signedIn: false,
            answeredQuestion: []
        })
    }

    async refresh(){
        this.setState({
          answeredQuestion: await this.nearConnection.answeredQuestion(ListLimit),
          totalClaimable: await this.nearConnection.totalClaimable()
        })
    }

    async claim(id){
      this.controlHover({
        show: true,
        message: "claim reward",
        hax: "",
        closeable: false
      })
      let result = await this.nearConnection.claim(id)
      if(result!=='success'){
        this.controlHover({
          show: true,
          message: "claimed failed",
          hax: "",
          closeable: true
        })
        console.log(result)
      }else{
        this.controlHover({
          show: true,
          message: "reward claimed",
          hax: "",
          closeable: true
        })
        this.refreshAll()
      }
    }
  
    async claimAll(){
      this.controlHover({
        show: true,
        message: "claim reward",
        hax: "",
        closeable: false
      })
      let result = await this.nearConnection.claimAll()
      if(result!=='success'){
        this.controlHover({
          show: true,
          message: "claimed failed",
          hax: "",
          closeable: true
        })
        console.log(result)
      }else{
        this.controlHover({
          show: true,
          message: "reward claimed",
          hax: "",
          closeable: true
        })
        this.refreshAll()
      }
    }

    render(){
        return (
          <div className="card">
            <article className="card-group-item">
              <header className="card-header">
                <Container>
                  <Row>
                    <Col xs={4}><h6 className="title">Answered Questions</h6></Col>
                    <Col xs={4}></Col>
                    <Col xs={2}>{this.state.signedIn? (<span className="badge badge-light round">
                      {this.state.totalClaimable} Near
                    </span>):""}
                    </Col>
                    <Col xs={2}>{this.state.signedIn&&this.state.totalClaimable>0? (<button
                      className="btn btn-outline-secondary flow-right"
                      onClick={()=>{this.claimAll()}}>
                      claim all
                      </button>):""}
                    </Col>
                  </Row>
                </Container>
              </header>
              <div className="filter-content">
                <Table hover>
                  <tbody>
                  {
                    this.state.answeredQuestion.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>
                            <Container fluid className="text-left justify-content-center">
                              <Row>
                                <Col xs={4}>{item.questionTitle}</Col>
                                <Col xs={4}>
                                  <span className="badge badge-light round">
                                    <i className="fa fa-user">-</i>
                                    {item.questioner}
                                  </span>
                                </Col>
                                <Col xs={2}>
                                  <span className="badge badge-light round">
                                    {utils.format.formatNearAmount(item.reward)} Near
                                  </span>
                                </Col>
                                <Col xs={2}>
                                  {
                                    item.claimed||utils.format.formatNearAmount(item.reward)<=0? "":(
                                      <button
                                        className="btn btn-outline-secondary flow-right"
                                        onClick={() => this.claim(item.questionId)}>
                                        claim
                                      </button>
                                    )
                                  }
                                </Col>
                              </Row>
                              <Row>
                                <Col>
                                  Description:
                                </Col>
                                <Col xs={10}>
                                  {item.questionContent}
                                </Col>
                              </Row>
                              <Row>
                                <Col>
                                  Answer:
                                </Col>
                                <Col xs={10}>
                                  {this.nearConnection.decodeContent(item.contentForReplier)}
                                </Col>
                              </Row>
                            </Container>
                          </td>
                        </tr>
                      );
                    })
                  }
                  </tbody>
                </Table>
              </div>
            </article>
          </div>)
    }
}

export default AnsweredQuestion;