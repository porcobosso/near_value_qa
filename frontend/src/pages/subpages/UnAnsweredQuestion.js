import React from 'react';
import * as nearAPI from 'near-api-js'
import {Table, Container, Row, Col} from 'react-bootstrap'

const ListLimit = 5

class UnAnsweredQuestion extends React.Component{
    constructor(options){
        super(options);
        this.nearConnection = options.nearConnection;
        this.showAnswerQuestion=options.showAnswerQuestion;
        this.state = {
            signedIn: false,
            unAnsweredQuestion: []
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
            unAnsweredQuestion: []
        })
    }

    async refresh(){
        this.setState({
          unAnsweredQuestion: await this.nearConnection.unAnsweredQuestion(ListLimit)
        })
    }

    render(){
        return (
          <div className="card">
            <article className="card-group-item">
              <header className="card-header">
              <Container>
                  <Row>
                    <Col xs={4}><h6 className="title">UnAnswered Questions</h6></Col>
                    <Col xs={4}></Col>
                    <Col xs={2}></Col>
                    <Col xs={2}></Col>
                  </Row>
                </Container>
              </header>
              <div className="filter-content">
                <Table hover>
                  <tbody>
                    {
                      this.state.unAnsweredQuestion.map((item, index) => {
                        return (
                          <tr>
                            <td>
                              <Container fluid className="text-left">
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
                                  <button
                                    className="btn btn-outline-secondary flow-right"
                                    onClick={() => this.showAnswerQuestion(item.questionId, item.questionTitle, item.questionContent, item.questionLock)}>
                                    answer
                                  </button>
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

export default UnAnsweredQuestion;