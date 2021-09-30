import React from 'react';
import {Table, Container, Row, Col} from 'react-bootstrap'

const ListLimit = 5

class AskedQuestion extends React.Component{
    constructor(options){
        super(options);
        this.nearConnection = options.nearConnection;
        this.showQuestionDetail = options.showQuestionDetail
        this.showAddQuestion = options.showAddQuestion
        this.state = {
            signedIn: false,
            askedQuestion: []
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
            askedQuestion: []
        })
    }

    async refresh(){
        this.setState({
            askedQuestion: await this.nearConnection.askedQustion(ListLimit)
        })
    }

    render(){
        return (
            <div className="card">
              <article className="card-group-item">
                <header className="card-header">
                  <Container>
                    <Row>
                      <Col xs={4}><h6 className="title">Asked Questions</h6></Col>
                      <Col xs={4}></Col>
                      <Col xs={2}></Col>
                      <Col xs={2}>{this.state.signedIn? (<button
                        className="btn btn-outline-secondary flow-right"
                        onClick={()=>{this.showAddQuestion()}}>
                        add question
                      </button>):""}
                      </Col>
                    </Row>
                  </Container>
                </header>
                <div className="filter-content">
                  <Table>
                    <tbody>
                      {
                        this.state.askedQuestion.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>
                                <Container>
                                  <Row>
                                    <Col xs={5}><a onClick={()=>this.showQuestionDetail(item.id)}>{item.title}</a></Col>
                                    <Col xs={7}><a>{item.content}</a></Col>
                                  </Row>
                                </Container>
                              </td>
                            </tr>
                          )})
                      }
                    </tbody>
                  </Table>
                </div>
              </article>
            </div>)
    }
}

export default AskedQuestion;