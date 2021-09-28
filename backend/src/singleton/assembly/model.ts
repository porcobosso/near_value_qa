import { PersistentMap, PersistentSet } from "near-sdk-core"
import { AccountId, Amount } from "../../utils"

@nearBindgen
export class Answer{
    replier: AccountId

    reward: Amount
    claimed: bool
    answered: bool

    contentForQuestioner: string
    contentForReplier: string

    constructor(replier:AccountId, reward:Amount){
        this.replier=replier
        this.reward=reward
        this.claimed=false
        this.answered=false
        this.contentForQuestioner=""
        this.contentForReplier=""
    }
}

@nearBindgen
export class AnswerInfo{
    questionId: string
    questionTitle: string
    questionContent: string
    questioner: AccountId
    replier: AccountId
    contentForQuestioner: string
    contentForReplier: string
    questionLock:string
    reward: Amount|null
    claimed: bool
    answered: bool

    constructor(question:Question,
        replier:AccountId){
            this.questionId = question.id
            this.questionTitle = question.title
            this.questionContent = question.content
            this.questioner = question.questioner
            this.questionLock = question.lock
            
            this.replier = replier
            var answer = question.answers.get(replier)
            this.contentForQuestioner = answer? answer.contentForQuestioner:""
            this.contentForReplier = answer? answer.contentForReplier:""
            this.reward = answer? answer.reward: null
            this.claimed = answer? answer.claimed: false
            this.answered = answer? answer.answered: false
        }
}

@nearBindgen
export class Question{
    id: string
    title: string
    content: string
    questioner: AccountId
    replierStr: string
    answers: PersistentMap<AccountId, Answer>
    lock: string

    constructor(id:string,title:string,content:string,
        questioner:AccountId,replierStr:string,lock:string){
            this.id=id
            this.title=title
            this.content=content
            this.questioner=questioner
            this.replierStr=replierStr
            this.answers=new PersistentMap<AccountId, Answer>(`A_${id}`)
            this.lock=lock
        }

    addAnswer(answer:Answer):void{
        this.answers.set(answer.replier, answer)
    }
}

@nearBindgen
export class QuestionDetail{
    id: string
    title: string
    content: string
    questioner: AccountId
    answers: Array<AnswerInfo>

    constructor(question:Question){
        this.id = question.id
        this.title = question.title
        this.content = question.content
        this.questioner = question.questioner
        var repliers:string[] = question.replierStr.split(",")
        this.answers = new Array<AnswerInfo>(repliers.length)
        for(var i=0;i<repliers.length;i++){
            this.answers[i] = new AnswerInfo(question, repliers[i])
        }
    }
}