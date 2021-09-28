import React from 'react';
import {Modal, CloseButton, Container, Row, Col} from 'react-bootstrap'


class QuestionDetail extends React.Component{
    constructor(options){
        super(options);
        this.nearConnection = options.nearConnection;
        this.state = {
            title: "",
            description: "",
            answers: [],
            show: false
        }
    }

    componentDidMount(){
        this.props.onRef(this)
    }

    close(){
        this.setState({
            show: false
        })
    }

    async show(id){
        var question = await this.nearConnection.quesiton(id)
        var answers = question.answers
        for(var i=0;i<answers.length;i++){
            var decodedContent = this.nearConnection.decodeContent(answers[i].contentForQuestioner)
            answers[i].content = `${decodedContent}`==='undefined'? 'no answer':decodedContent
        }
        this.setState({
            show: true,
            title: question.title,
            description: question.content,
            answers: question.answers
        })
    }

    render(){
        return (
            <Modal show={this.state.show}>
                <Modal.Header>
                  <Modal.Title>question detail</Modal.Title>
                  <CloseButton onClick={()=>{this.close()}}/>
                </Modal.Header>
                <Modal.Body>
                  <div className="form-group">
                    <div className="col-sm-13">
                      <b><label className="control-label col-sm-13" for="fname">{this.state.title}</label></b>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="col-sm-13">
                      <label className="control-label col-sm-13" for="fname">{this.state.description}</label>
                    </div>
                  </div>
                  {
                    this.state.answers.map((answer, index)=>{
                      return (
                        <Container fluid className="text-left">
                          <Row>
                            <Col className="flow-left"><b>{answer.replier}</b></Col>
                            <Col className="flow-right"><b>{answer.answered? 'answered':'unanswered'}</b></Col>
                          </Row>
                          <Row>
                            <Col>{answer.content}</Col>
                          </Row>
                        </Container>
                      )
                    })
                  }
                </Modal.Body>
              </Modal>)
    }
}

export default QuestionDetail;