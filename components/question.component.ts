import { Input, Output, EventEmitter } from '@angular/core';
import { GenericComponent } from '@sharedComponents/generic.component';

import { QuestionnaireService } from '@appSharedServices/questionnaire.service';
import { MiscellaneousService } from '@sharedServices/miscellaneous.service';

export class QuestionComponent extends GenericComponent {

    public showResults = false;

    @Input() question: any;
    @Input() questionnaire: any;
    @Input() editable: boolean = true;
    @Input() showAnswers: boolean = false;
    @Output() change: EventEmitter<string> = new EventEmitter<string>();

    constructor(public questionnaireService: QuestionnaireService, public miscellaneousService: MiscellaneousService){
        super(miscellaneousService);
    }

    ngOnInit(){
    }

    canEdit(){
        return this.question.edit && this.editable;
    }

    toggleEdit(){
        this.question.edit = !this.question.edit;
        this.question.showAnswers = this.question.edit;
    }

    newAnswer(question: any){
        this.question.showAnswers = true;      
        this.question.edit = true;      
        this.questionnaireService.newAnswer(question);  
    }

    deleteAnswer(question: any, answer: any){
        this.questionnaireService.deleteAnswer(question, answer);
        this.changed();
    }

    deleteQuestion(questionnaire: any, question: any){
        this.questionnaireService.deleteQuestion(questionnaire, question);
        this.changed();        
    }

    changed(){
        this.change.emit(this.question);
    }

    newQuestion(questionnaire: any, insertAfterQuestion: any = null){
        this.questionnaireService.newQuestion(questionnaire, insertAfterQuestion);
    }    

    setFavorite(question: any, favorite: boolean){
        if (question){
            question.favorite = favorite;
            this.change.emit(this.question);
        }
    }
}