import { Input, Output, EventEmitter } from '@angular/core';
import { GenericComponent } from '@sharedComponents/generic.component';
import { Router } from '@angular/router';

import { QuestionnaireService } from '@appSharedServices/questionnaire.service';
import { MiscellaneousService } from '@sharedServices/miscellaneous.service';

export class QuestionnaireComponent extends GenericComponent {

    public error: any;

    public __questionnaire: any;
    private __id: any;

    public showSearch = false;

    @Input() questionnaires: any;
    @Input() showQuestions: boolean;

    @Input() set questionnaire(value: any){
        this.__questionnaire = value;
        if(this.__questionnaire){
            this.__id = this.__questionnaire.id;
        }
    };

    @Input() set id(value: string){
        this.__id = value;
    };

    get questionnaire(): any{
        return this.__questionnaire;
    };    

    get id(): string{
        return this.__id;
    };    

    @Output() deleted: EventEmitter<string> = new EventEmitter<string>();

    constructor(public router: Router, public questionnaireService: QuestionnaireService, public miscellaneousService: MiscellaneousService){
        super(miscellaneousService);
    }

    ngOnInit(){
    }

    private successLoad(data: any){
        if (data && data._body){
            this.__questionnaire = this.toolbox.parseJson(data._body);
            this.questionnaireService.cleanQuestionnaire(this.__questionnaire);
        }else{
            this.__questionnaire = [];
        }
    }

    private failureLoad(error: any){
        this.error = error;
    }

    load(id: string){
        this.questionnaireService.loadQuestionnaire(
            (data: any) => this.successLoad(data), 
            (error: any) => this.failureLoad(error), id);
    }

    newQuestion(questionnaire: any){
        this.questionnaireService.newQuestion(questionnaire);
        this.showQuestions = true;
    }

    private successSave(data: any){
        console.log("success save", data);
    }

    private failureSave(error: any){
        console.log("failure save", error);
    }

    save(){
        this.questionnaireService.saveQuestionnaire(
            (data: any) => this.successSave(data), 
            (error: any) => this.failureSave(error), this.__questionnaire);
    }

    edit(questionnaire: any){
        questionnaire.edit = !questionnaire.edit;
        //questionnaire.showQuestions = questionnaire.edit;
    }

    delete(questionnaire: any){
        this.questionnaireService.deleteQuestionnaire(this.questionnaires, questionnaire);  
        this.deleted.emit(questionnaire); 
    }    

    seeSeparatly(){
        this.router.navigate(["/questionnaire/" + this.__questionnaire.id]);
    }

    toggleGroup(){
        this.__questionnaire.showGroup = !this.__questionnaire.showGroup;
        this.save();
    }

    toggleFavorite(){
        this.__questionnaire.favoriteQuestions = !this.__questionnaire.favoriteQuestions;
        this.save();
    }
    
}