import { Injectable } from '@angular/core';
import { Toolbox } from 'bdt105toolbox/dist';
import { Http } from '@angular/http';
import { MiscellaneousService } from '@sharedServices/miscellaneous.service';

@Injectable()
export class QuestionnaireService {

    private questionnairesLocalStorageKey = "questionnaires";
    private toolbox: Toolbox = new Toolbox();

    private data: any;

    private questionnairesCount = 0;
    private loadCount = 0;

    private sortKey = "title";

    public lastError: string;

    constructor(private http: Http, public miscellaneousService: MiscellaneousService) {
    }

    private saveToLocalStorage(questionnaire: any, forever: boolean = true) {
        let qs = this.toolbox.readFromStorage(this.questionnairesLocalStorageKey);
        if (!qs) {
            qs = [];
        }
        if (questionnaire) {
            qs.push(questionnaire);
        }
        this.toolbox.writeToStorage(this.questionnairesLocalStorageKey, qs, forever);
    }

    private loadFromLocalStorage() {
        return this.toolbox.readFromStorage(this.questionnairesLocalStorageKey);
    }

    private cleanLocalStorage() {
        this.toolbox.removeFromStorage(this.questionnairesLocalStorageKey);
    }

    loadFiles(callbackSuccess: Function, callbackFailure: Function) {
        let url = this.miscellaneousService.configuration().common.saveApiBaseUrl;
        let user = this.miscellaneousService.getCurrentUser();
        let directory = user.email.toUpperCase();
        console.log("data url", url);
        let body = { "directory": directory };
        this.http.post(url, body).subscribe(
            (data: any) => callbackSuccess(data),
            (error: any) => callbackFailure(error)
        );
    }

    loadQuestionnaire(callbackSuccess: Function, callbackFailure: Function, id: string) {
        let url = this.miscellaneousService.configuration().common.saveApiBaseUrl;
        let user = this.miscellaneousService.getCurrentUser();
        let directory = user.email.toUpperCase();
        console.log("data url", url);
        let body = { "directory": directory, "fileName": id + ".json" };
        this.http.post(url, body).subscribe(
            (data: any) => callbackSuccess(data),
            (error: any) => callbackFailure(error)
        );
    }

    public filterQuestionnaires(questionnaires: any, type: string, showDisabled: boolean, searchTerm: string) {
        if (questionnaires) {
            if (type) {
                questionnaires = this.toolbox.filterArrayOfObjects(questionnaires, "type", type, true, true, true, false);
            }
            if (searchTerm) {
                questionnaires = this.toolbox.filterArrayOfObjects(questionnaires, "title", searchTerm, false, false, false, true);
            }
            if (showDisabled != null && !showDisabled) {
                questionnaires = this.toolbox.extractFromArray(questionnaires, "disabled", showDisabled, true);
            }
            questionnaires = this.toolbox.sortArrayOfObjects(questionnaires, this.sortKey);
        }
        return questionnaires;
    }

    private successLoadQuestionnaire(data: any, callbackSuccess: Function, fileName: string, type: string, showDisabled: boolean, searchTerm: string) {
        if (data) {
            let questionnaire = JSON.parse(data._body);
            questionnaire.fileName = fileName;

            this.data.push(questionnaire);
            this.saveToLocalStorage(this.data);

            if (this.data.length == this.questionnairesCount) {
                this.data = this.filterQuestionnaires(this.data, type, showDisabled, searchTerm);
                callbackSuccess(this.data);
            }
        }
    }

    private failureLoadQuestionnaire(error: any, callbackFailure: Function) {
        console.log(error);
        if (callbackFailure) {
            callbackFailure(error);
        }
    }

    private successLoadQuestionnaires(data: any, callbackSuccess: Function, callbackFailure: Function, type: string, showDisabled: boolean, searchTerm: string) {
        if (data) {
            let questionnaireIds = JSON.parse(data._body);
            this.questionnairesCount = questionnaireIds.length;
            this.cleanLocalStorage();
            for (var i = 0; i < questionnaireIds.length; i++) {
                let id = questionnaireIds[i].replace(".json", "");
                this.loadQuestionnaire(
                    (data: any) => this.successLoadQuestionnaire(data, callbackSuccess, id + ".json", type, showDisabled, searchTerm),
                    (error: any) => this.failureLoadQuestionnaire(error, callbackFailure),
                    id);
            }
        }
    }

    private failureLoadQuestionnaires(error: any, callbackSuccess: Function, callbackFailure: Function, type: string, showDisabled: boolean, searchTerm: string) {
        console.log(error);
        let qs = this.loadFromLocalStorage();
        if (qs) {
            qs = this.filterQuestionnaires(qs, type, showDisabled, searchTerm);
            this.lastError = "DATA_FROM_LOCAL";
            callbackSuccess(qs);
        } else {
            this.lastError = "NO_DATA_FROM_LOCAL";
            if (callbackFailure) {
                callbackFailure(error);
            }
        }
    }

    loadQuestionnaires(callbackSuccess: Function, callbackFailure: Function, type: string = null, showDisabled: boolean = null, searchTerm: string = null) {
        this.questionnairesCount = 0;
        this.loadCount = 0;
        this.lastError = null;
        this.data = null;
        this.data = [];
        this.loadFiles(
            (data: any) => this.successLoadQuestionnaires(data, callbackSuccess, callbackFailure, type, showDisabled, searchTerm),
            (error: any) => this.failureLoadQuestionnaires(error, callbackSuccess, callbackFailure, type, showDisabled, searchTerm)
        );
    }

    newQuestionnaire(type: string) {
        let id = this.toolbox.getUniqueId();
        let date = this.toolbox.dateToDbString(new Date());
        let owner = this.miscellaneousService.getCurrentUser().email;
        let q = {
            "owner": owner,
            "type": type,
            "modificationDate": date,
            "creationDate": date,
            "score": null,
            "startDate": null,
            "endDate": null,
            "id": id,
            "title": "",
            "questions": [],
            "edit": true,
            "showQuestions": true,
            "disabled": false
        };
        return q;
    }

    newQuestion(questionnaire: any = null, index: number = 0) {
        let id = this.toolbox.getUniqueId();
        let na = this.newAnswer();
        let q = {
            "id": (questionnaire ? questionnaire.id + "_" : "") + id,
            "type": "text",
            "questionLabel": "",
            "answerLabelOk": "",
            "answerLabelNok": "",
            "question": "",
            "detail": "",
            "answers": [na],
            "point": 1,
            "edit": true,
            "editable": true,
            "showAnswers": true,
            "showDetail": true
        };
        if (questionnaire) {
            if (!questionnaire.questions) {
                questionnaire.questions = [];
            }
            questionnaire.questions.splice(index, 0, q);
        }
        return q;
    }

    newQuestionAfterQuestion(questionnaire: any, question: any = null) {
        if (question) {
            let i = this.toolbox.findIndexArrayOfObjects(questionnaire.questions, "id", question.id);
            if (i >= 0) {
                this.newQuestion(questionnaire, i + 1);
            }
        } else {
            this.newQuestion();
        }
    }

    newAnswer(question: any = null) {
        let id = this.toolbox.getUniqueId();
        let a = {
            "id": id,
            "answer": "",
            "detail": "",
            "correct": true,
            "correctDistance": 0,
            "point": 1
        };
        if (question) {
            if (!question.answers) {
                question.answers = [];
            }
            question.answers.push(a);
        }
        return a;
    }

    deleteQuestion(questionnaire: any, question: any) {
        let index = this.toolbox.findIndexArrayOfObjects(questionnaire.questions, "id", question.id);
        if (index >= 0) {
            questionnaire.questions.splice(index, 1);
        }
    }

    private removeQuestionnaire(questionnaires: any, questionnaire: any) {
        let index = this.toolbox.findIndexArrayOfObjects(questionnaires, "id", questionnaire.id);
        if (index >= 0) {
            questionnaires.splice(index, 1);
        }
    }

    private successDeleteQuestionnaire(data: any, questionnaires: any, questionnaire: any) {
        this.removeQuestionnaire(questionnaires, questionnaire);
    }

    private failureDeleteQuestionnaire(data: any) {
        console.log("Unable to delete questionnaire");
    }

    deleteQuestionnaire(questionnaires: any, questionnaire: any) {
        if (questionnaire.fileName) {
            let url = this.miscellaneousService.configuration().common.saveApiBaseUrl;
            let user = this.miscellaneousService.getCurrentUser();
            let directory = user.email.toUpperCase();
            console.log("data url", url);
            let options =
                {
                    "body": { "directory": directory, "fileName": questionnaire.fileName }
                }
            this.http.delete(url, options).subscribe(
                (data: any) => this.successDeleteQuestionnaire(data, questionnaires, questionnaire),
                (error: any) => this.failureDeleteQuestionnaire(error)
            );
        } else {
            this.removeQuestionnaire(questionnaires, questionnaire)
        }
    }

    deleteAnswer(question: any, answer: any) {
        let index = this.toolbox.findIndexArrayOfObjects(question.answers, "id", answer.id);
        if (index >= 0) {
            question.answers.splice(index, 1);
        }
    }

    cleanQuestionnaire(questionnaire: any) {
        delete (questionnaire.edit);
        delete (questionnaire.questionsToImport);
        delete (questionnaire.showAnswers);
        delete (questionnaire.showQuestions);
        delete (questionnaire.showSearch);
        if (questionnaire.questions) {
            for (var j = 0; j < questionnaire.questions.length; j++) {
                delete (questionnaire.questions[j].edit);
                delete (questionnaire.questions[j].showAnswers);
                delete (questionnaire.questions[j].showDetail);
                if (questionnaire.questions[j].answers) {
                    for (var k = 0; k < questionnaire.questions[j].answers.length; k++) {
                        if (questionnaire.questions[j].answers[k].answer == "") {
                            questionnaire.questions[j].answers.splice(k, 1);
                        }
                    }
                }
            }
        }
    }

    private successSave(data: any, callbackSuccess: Function){
        this.lastError = null;
        if (callbackSuccess){
            callbackSuccess(data);
        }
    }

    private failureSave(error: any, callbackFailure: Function){
        this.lastError = "NO_DATA_SAVED";
        if (callbackFailure){
            callbackFailure(error);
        }        
    }

    saveQuestionnaire(callbackSuccess: Function, callbackFailure: Function, questionnaire: any) {
        if (questionnaire) {
            questionnaire.modificationDate = this.toolbox.dateToDbString(new Date());
            let q = this.toolbox.cloneObject(questionnaire);
            this.cleanQuestionnaire(q);
            let url = this.miscellaneousService.configuration().common.saveApiBaseUrl;
            let user = this.miscellaneousService.getCurrentUser();
            let directory = user.email.toUpperCase();
            let fileName = q.id + ".json";
            let body = { "directory": directory, "fileName": fileName, "content": JSON.stringify(q) };
            this.http.put(url, body).subscribe(
                (data: any) => this.successSave(data, callbackSuccess),
                (error: any) => this.failureSave(error, callbackFailure)
            );
        }
    }

    importQuestionsCsv(questionnaire: any, questionsToImport: string) {
        // Format questionLabel|answerLabelOk|answerLabelNok|detail|question1|answer1|answer2|answerN|..|
        if (questionsToImport && questionsToImport.length > 0) {
            let lines = questionsToImport.split("\n");
            for (var l = 0; l < lines.length; l++) {
                var qs = lines[l].split("|");
                let q = this.newQuestion();
                q.questionLabel = qs[0];
                q.answerLabelOk = qs[1];
                q.answerLabelNok = qs[2];
                q.detail = qs[3];
                q.question = qs[4];
                for (var i = 5; i < qs.length; i++) {
                    if (qs[i]) {
                        let a = this.newAnswer();
                        a.answer = qs[i];
                        q.answers.push(a);
                    }
                }
                questionnaire.questions.push(q);
            }
        }
    }

    checkQuestion(question: any, answer: string, exactMatching: boolean) {
        question.status = false;
        for (var i = 0; i < question.answers.length; i++) {
            if (!question.correctDistance || question.correctDistance == 0) {
                if (answer) {
                    if (this.toolbox.compareString(answer, question.answers[i].answer, false, false, exactMatching, false)) {
                        question.status = question.answers[i].correct;
                        break;
                    }
                }
            }
        }
        question.checked = true;
    }


    importQuestionnaire(questionnaire: any, questionnaires: any) {
        if (questionnaires && questionnaire) {
            this.setQuestionnaireIds(questionnaire);
            questionnaires = questionnaires.concat(questionnaire);
            let fake = (data: any) => {

            }
            this.saveQuestionnaire(fake, fake, questionnaire);
        }
        return questionnaires;
    }

    setQuestionnaireIds(questionnaire: any) {
        if (questionnaire) {
            questionnaire.id = this.toolbox.getUniqueId();
            if (questionnaire.questions) {
                for (var j = 0; j < questionnaire.questions.length; j++) {
                    questionnaire.questions[j].id = this.toolbox.getUniqueId();
                    if (questionnaire.questions[j].answers) {
                        for (var k = 0; k < questionnaire.questions[j].answers.length; k++) {
                            questionnaire.questions[j].answers[k].id = this.toolbox.getUniqueId();
                        }
                    }
                }
            }
        }
    }

    searchInQuestionsAndAnswers(questionnaires: any, search: string) {
        let ret = [];
        if (questionnaires && search) {
            for (var i = 0; i < questionnaires.length; i++) {
                let questionnaire = questionnaires[i];
                if (questionnaire.questions) {
                    for (var j = 0; j < questionnaire.questions.length; j++) {
                        if (questionnaire.questions[j].question && this.toolbox.compareString(questionnaire.questions[j].question, search, false, false, false, true)) {
                            let q = this.toolbox.cloneObject(questionnaire.questions[j]);
                            q.foundType = "question";
                            q.questionnaireTitle = questionnaire.title;
                            q.questionnaireId = questionnaire.id;
                            q.questionnaireType = questionnaire.type;
                            ret.push(q);
                        }
                        if (questionnaire.questions[j].questionLabel && this.toolbox.compareString(questionnaire.questions[j].questionLabel, search, false, false, false, true)) {
                            let q = this.toolbox.cloneObject(questionnaire.questions[j]);
                            q.questionnaireTitle = questionnaire.title;
                            q.questionnaireId = questionnaire.id;
                            q.questionnaireType = questionnaire.type;
                            q.foundType = "questionLabel";
                            ret.push(q);
                        }
                        if (questionnaire.questions[j].answers) {
                            for (var k = 0; k < questionnaire.questions[j].answers.length; k++) {
                                if (questionnaire.questions[j].answers[k] && this.toolbox.compareString(questionnaire.questions[j].answers[k].answer, search, false, false, false, true)) {
                                    let q = this.toolbox.cloneObject(questionnaire.questions[j]);
                                    q.questionnaireTitle = questionnaire.title;
                                    q.questionnaireId = questionnaire.id;
                                    q.questionnaireType = questionnaire.type;
                                    q.foundType = "answer";
                                    ret.push(q);
                                }
                            }
                        }
                    }
                }
            }
        }
        return ret;
    }

    updateQuestion(questionnaire: any, question: any) {
        if (questionnaire && question) {
            for (var j = 0; j < questionnaire.questions.length; j++) {
                if (questionnaire.questions[j].id == question.id) {
                    questionnaire.questions.splice(j, 1, question);
                    return;
                }
            }
        }
    }

    getQuestionnaireById(questionnaires: any, id: string) {
        return this.toolbox.searchElementSpecial(questionnaires, "id", id);
    }

    getScore(questions: any) {
        var score: any = {};
        if (questions) {
            score.scoreOk = 0;
            score.scoreNok = 0;
            for (var i = 0; i < questions.length; i++) {
                if (questions[i].checked) {
                    if (questions[i].status) {
                        score.scoreOk++;
                    } else {
                        score.scoreNok++;
                    }
                }
            }
            score.pourcentage = Math.round(score.scoreOk / questions.length * 100);
            score.messagePourcentage = score.scoreOk + '/' + questions.length + ' (' + score.pourcentage + '%)';
        }
        return score;
    }

    generateQuestions(questionnaires: any, randomQuestions: boolean, jeopardy: boolean, nbQuestion: number, favoriteQuestionsOnly: boolean) {
        let questions = [];
        for (var i = 0; i < questionnaires.length; i++) {
            if (questionnaires[i].test) {
                for (var j = 0; j < questionnaires[i].questions.length; j++) {
                    let q = this.toolbox.cloneObject(questionnaires[i].questions[j]);
                    q.questionnaireTitle = questionnaires[i].title;
                    questions.push(q);
                }
            }
        }
        if (favoriteQuestionsOnly) {
            questions = this.toolbox.filterArrayOfObjects(questions, "favorite", true);
        }
        if (randomQuestions) {
            questions = this.toolbox.shuffleArray(questions);
        }
        if (nbQuestion != -1 && nbQuestion) {
            questions = questions.splice(0, nbQuestion);
        }
        if (jeopardy) {
            questions = this.generateJeopardy(questions);
        }

        return questions;
    }

    generateJeopardy(questions: any) {
        let res = [];
        if (questions) {
            for (var i = 0; i < questions.length; i++) {
                if (questions[i].answers) {
                    for (var j = 0; j < questions[i].answers.length; j++) {
                        let q = this.toolbox.cloneObject(questions[i]);
                        if (questions[i].answers[j].answer) {
                            q.question = questions[i].answers[j].answer;
                            q.answers = [];
                            let a = this.newAnswer();
                            a.answer = questions[i].question;
                            q.answers.push(a);
                            res.push(q);
                        }
                    }
                }
            }
        }
        return res;
    }


    isQuestionEmpty(question: any) {
        if (!question.questionLabel && !question.question && !question.detail) {
            if (question.answers && question.answers.length > 0) {
                if (question.answers.length == 1) {
                    return this.isAnswerEmpty(question.answers[0]);
                }
            } else {
                return true;
            }
        }
        return false;
    }

    isAnswerEmpty(answer: any) {
        if (!answer.answer && !answer.detail && answer.correctDistance == 0 && answer.point == 1) {
            return true;
        }
        return false;
    }

    isQuestionnaireEmpty(questionnaire: any) {
        return !questionnaire.title && (!questionnaire.questions || questionnaire.questions.length == 0);
    }

    importQuestion(question: string, questionnaire: any, position: number) {
        if (questionnaire && question && this.toolbox.isJson(question)) {
            let q = JSON.parse(question);
            q.id = this.toolbox.getUniqueId();
            questionnaire.questions.splice(position, 0, q);
            let fake = (data: any) => { }
            this.saveQuestionnaire(fake, fake, questionnaire);
        }
    }

}
