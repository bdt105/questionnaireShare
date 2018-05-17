import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GenericComponent } from '@sharedComponents/generic.component';

import { QuestionnaireService } from '@appSharedServices/questionnaire.service';
import { MiscellaneousService } from '@sharedServices/miscellaneous.service';

export class SearchComponent extends GenericComponent {

    public lastError: string;
    private questionnaires: any;
    private __searchTerm;
    private __filterType;
    private __showDisabled;

    public questionsSearch: any;
    public error: any;

    public loading = false;

    @Input() set searchTerm(value: string) {
        this.__searchTerm = value;
    }

    get searchTerm() {
        return this.__searchTerm;
    }

    @Input() set filterType(value: string) {
        this.__filterType = value;
    }

    get filterType() {
        return this.__filterType;
    }

    @Input() set showDisabled(value: boolean) {
        this.__showDisabled = value;
    }

    @Output() searched: EventEmitter<any> = new EventEmitter<any>();

    get showDisabled() {
        return this.__showDisabled;
    }

    constructor(public miscellaneousService: MiscellaneousService, public questionnaireService: QuestionnaireService) {
        super(miscellaneousService);
    }

    private successLoad(data: any): any {
        this.questionnaires = data;
        this.lastError = this.questionnaireService.lastError;
        this.filter();
        this.loading = false;
    }

    private failureLoad(error: any): any {
        this.lastError = this.questionnaireService.lastError;        
        console.log(error);
        this.loading = false;        
    }

    private loadInternal(callbackSuccess: Function, callbackFailure: Function) {
        this.loading = true
        this.questionnaireService.loadQuestionnaires(
            (data: any) => callbackSuccess(data),
            (error: any) => callbackFailure(error), this.__filterType, this.__showDisabled
        );
    }

    public load() {
        this.loadInternal(
            (data: any) => this.successLoad(data),
            (error: any) => this.failureLoad(error));
    }

    private successLoadSearch(data: any): any {
        this.successLoad(data);
        this.filter();

    }

    public filter(){
        this.questionsSearch = null;
        this.questionsSearch = [];
        if (this.questionnaires && this.__searchTerm) {
            this.questionsSearch = this.questionnaireService.searchInQuestionsAndAnswers(this.questionnaires, this.__searchTerm);
            this.searched.emit(this.questionsSearch);
        }
        this.loading = false;                
        
    }

    public search() {
        this.loading = false;                        
        if (!this.questionnaires){
            this.loadInternal(
                (data: any) => this.successLoadSearch(data),
                (error: any) => this.failureLoad(error));
        }else{
            this.filter();
        }
    }

    updateQuestion(question: any) {
        if (question && question.questionnaireId) {
            let questionnaire = this.questionnaireService.getQuestionnaireById(this.questionnaires, question.questionnaireId);
            if (questionnaire) {
                this.questionnaireService.updateQuestion(questionnaire, question);
                let fake = (data: any) => {

                }
                this.questionnaireService.saveQuestionnaire(fake, fake, questionnaire);
            }
        }
    }

    getCount(){
        return this.questionsSearch ? this.questionsSearch.length : null;
    }

}