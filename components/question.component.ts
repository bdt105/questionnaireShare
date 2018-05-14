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
    @Input() showLabel: boolean = true;
    @Input() showCustomAnswer: boolean = false;
    @Output() changed: EventEmitter<string> = new EventEmitter<string>();
    @Output() saved: EventEmitter<string> = new EventEmitter<string>();

    constructor(public questionnaireService: QuestionnaireService, public miscellaneousService: MiscellaneousService) {
        super(miscellaneousService);
    }

    ngOnInit() {
    }

    canEdit() {
        return this.question.edit && this.editable;
    }

    toggleEdit() {
        this.question.edit = !this.question.edit;
        this.question.showAnswers = this.question.edit;
    }

    toggleAnswers() {
        this.question.showAnswers = !this.question.showAnswers
    }

    toggleEditAnswer(answer: any) {
        answer.edit = !answer.edit;
    }

    newAnswer() {
        this.question.showAnswers = true;
        this.question.edit = true;
        this.questionnaireService.newAnswer(this.question);
    }

    deleteAnswer(answer: any) {
        this.questionnaireService.deleteAnswer(this.question, answer);
        this.change();
    }

    delete() {
        this.questionnaireService.deleteQuestion(this.questionnaire, this.question);
        this.change();
    }

    private change() {
        let successCallback = () => {
            this.saved.emit(this.question);
        }
        let failureCallback = () => {
            // this.changed.emit(this.question);
        }
        this.questionnaireService.saveQuestionnaire(successCallback, failureCallback, this.questionnaire);
        this.changed.emit(this.question);
    }

    newQuestion(insertAfterQuestionIndex: any = null) {
        this.questionnaireService.newQuestion(this.questionnaire, insertAfterQuestionIndex);
    }

    newQuestionAfterQuestion(question: any) {
        this.questionnaireService.newQuestionAfterQuestion(this.questionnaire, question);
    }

    setFavorite(favorite: boolean) {
        this.question.favorite = favorite;
        this.change();
    }

    toggleFavorite() {
        this.question.favorite = !this.question.favorite;
        this.change();
    }
}