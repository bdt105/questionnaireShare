import { GenericComponent } from '@sharedComponents/generic.component';

import { QuestionnaireService } from '@appSharedServices/questionnaire.service';
import { MiscellaneousService } from '@sharedServices/miscellaneous.service';
import { Router } from '@angular/router';

export class QuestionnairesComponent extends GenericComponent {

    public showSearch: any;
    public searchTerm: any;

    public questionnaires: any;
    public error: any;

    public importQuestionnaires = false;
    public exportQuestionnaires = false;
    public overWriteImport = false;

    public questionnairesToImport: string;
    public questionnairesToExport: string;

    public filterType: string;
    public showDisabled: boolean;

    public sortKey: string ="title";

    constructor(public questionnaireService: QuestionnaireService, public miscellaneousService: MiscellaneousService, public router: Router){
            super(miscellaneousService);
    }

    ngOnInit(){
        this.filterType = "questionnaire";
        this.showDisabled = false;   
        this.load();
    }

    private successLoad(data: any){
        this.questionnaires = data;
    }

    private failureLoad(error: any){
        this.error = error;
    }

    load(){  
        this.questionnaireService.loadQuestionnaires(
            (data: any) => this.successLoad(data), 
            (error: any) => this.failureLoad(error), this.filterType, this.showDisabled);
    }

    newQuestionnaire(){
        let q = this.questionnaireService.newQuestionnaire("questionnaire");
        if (!this.questionnaires){
            this.questionnaires = [];
        }
        this.questionnaires.push(q);
    }

    filter(type: string = null, showDisabled: boolean = null){
        this.filterType = type;
        this.showDisabled = (showDisabled == null ? true : showDisabled);
        this.load();
    }

    toggleSearch(): any {
        this.router.navigate(['/search/']);
    }

}