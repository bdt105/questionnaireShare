import { Input, Output, EventEmitter } from '@angular/core';
import { GenericComponent } from '@sharedComponents/generic.component';

import { QuestionnaireService } from '@appSharedServices/questionnaire.service';
import { MiscellaneousService } from '@sharedServices/miscellaneous.service';

export class QuestionsComponent extends GenericComponent {

    public showResults = false;
    protected __favoriteOnly: boolean = false;
    protected __questions: any;
    protected __questionsFiltered: any;

    @Input() set favoriteOnly(value: boolean){
        this.__favoriteOnly = value;
        if (this.__favoriteOnly){
            this.__questionsFiltered = this.toolbox.filterArrayOfObjects(this.__questions, "favorite", true);        
        }else{
            this.__questionsFiltered = this.__questions;        
        }
    }

    @Input() questionnaire: any;
    @Input() editable: boolean = true;
    @Input() group: boolean = false;

    @Input() set questions(value: any){
        this.__questions = value;
        this.__questionsFiltered = this.__questions;        
    }

    get questions():any{
        return this.__questionsFiltered;
    }

    @Output() change: EventEmitter<string> = new EventEmitter<string>();

    constructor(public questionnaireService: QuestionnaireService, public miscellaneousService: MiscellaneousService){
            super(miscellaneousService);
    }

    ngOnInit(){
    }

    changed(){
        this.change.emit(this.questions);
    }
    
}