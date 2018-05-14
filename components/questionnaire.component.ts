import { Input, Output, EventEmitter } from '@angular/core';
import { GenericComponent } from '@sharedComponents/generic.component';

import { QuestionnaireService } from '@appSharedServices/questionnaire.service';
import { MiscellaneousService } from '@sharedServices/miscellaneous.service';

export class QuestionnaireComponent extends GenericComponent {

    public error: any;

    public __questionnaire: any;
    private __id: any;

    public showSearch = false;

    @Input() questionnaires: any;
    @Input() showQuestions: boolean;

    @Input() set questionnaire(value: any) {
        this.__questionnaire = value;
        if (this.__questionnaire) {
            this.__id = this.__questionnaire.id;
        }
    };

    @Input() set id(value: string) {
        this.__id = value;
    };

    get questionnaire(): any {
        return this.__questionnaire;
    };

    get id(): string {
        return this.__id;
    };

    @Output() deleted: EventEmitter<any> = new EventEmitter<any>();
    @Output() viewed: EventEmitter<any> = new EventEmitter<any>();
    @Output() saved: EventEmitter<any> = new EventEmitter<any>();
    @Output() favorited: EventEmitter<any> = new EventEmitter<any>();
    @Output() grouped: EventEmitter<any> = new EventEmitter<any>();
    @Output() filtered: EventEmitter<any> = new EventEmitter<any>();
    @Output() loaded: EventEmitter<any> = new EventEmitter<any>();

    constructor(public questionnaireService: QuestionnaireService, public miscellaneousService: MiscellaneousService) {
        super(miscellaneousService);
    }

    ngOnInit() {
    }

    private successLoad(data: any) {
        if (data && data._body) {
            this.__questionnaire = this.toolbox.parseJson(data._body);
            this.questionnaireService.cleanQuestionnaire(this.__questionnaire);
        } else {
            this.__questionnaire = [];
        }
        this.loaded.emit(this.__questionnaire);
    }

    private failureLoad(error: any) {
        this.error = error;
    }

    load(id: string) {
        this.questionnaireService.loadQuestionnaire(
            (data: any) => this.successLoad(data),
            (error: any) => this.failureLoad(error), id);
    }

    refresh(){
        if (this.questionnaire && this.questionnaire.id){
            this.load(this.questionnaire.id);
        }
    }

    newQuestion() {
        let q: any = this.questionnaireService.newQuestion(this.__questionnaire);
        q.showDetail = true;
        this.showQuestions = true;
    }

    private successSave(data: any) {
        this.saved.emit(data);
        console.log("success save", data);
    }

    private failureSave(error: any) {
        this.saved.emit(error);
        console.log("failure save", error);
    }

    save() {
        this.questionnaireService.saveQuestionnaire(
            (data: any) => this.successSave(data),
            (error: any) => this.failureSave(error), this.__questionnaire);
    }

    toggleEdit() {
        this.__questionnaire.edit = !this.__questionnaire.edit;
        //questionnaire.showQuestions = questionnaire.edit;
    }

    delete() {
        this.questionnaireService.deleteQuestionnaire(this.questionnaires, this.__questionnaire);
        this.deleted.emit(this.__questionnaire);
    }

    view() {
        this.viewed.emit(this.__questionnaire);
    }

    toggleGroup() {
        this.__questionnaire.showGroup = !this.__questionnaire.showGroup;
        this.save();
        this.grouped.emit(this.__questionnaire);

    }

    toggleFavorite() {
        this.__questionnaire.favoriteQuestions = !this.__questionnaire.favoriteQuestions;
        this.save();
        this.favorited.emit(this.__questionnaire);

    }

    filterQuestions(searchTerm: string) {
        if (searchTerm) {
            let qs = [];
            qs.push(this.__questionnaire);
            this.__questionnaire.questions = this.questionnaireService.searchInQuestionsAndAnswers(qs, searchTerm);
        } else {
            this.refresh();
        }
        this.filtered.emit({"searchTerm": searchTerm});
    }

}