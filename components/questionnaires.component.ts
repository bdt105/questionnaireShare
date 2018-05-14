import { GenericComponent } from '@sharedComponents/generic.component';

import { QuestionnaireService } from '@appSharedServices/questionnaire.service';
import { MiscellaneousService } from '@sharedServices/miscellaneous.service';
import { Output, EventEmitter, Input } from '@angular/core';

export class QuestionnairesComponent extends GenericComponent {

    public showSearch: any;

    public questionnaires: any;
    public error: any;

    public importQuestionnaires = false;
    public exportQuestionnaires = false;
    public overWriteImport = false;

    public questionnairesToImport: string;
    public questionnairesToExport: string;

    public __filterType: string;
    public showDisabled: boolean;

    public sortKey: string ="title";

    private __searchTerm: string;

    @Input() set searchTerm(value: string){
        this.__searchTerm = value;
    }

    get searchTerm(): string{
        return this.__searchTerm;
    }

    @Input() set filterType(value: string){
        this.__filterType = value;
        this.load();
    }

    get filterType(): string{
        return this.__filterType;
    }

    @Output() loaded: EventEmitter<any> = new EventEmitter<any>();
    @Output() filtered: EventEmitter<any> = new EventEmitter<any>();
    @Output() newed: EventEmitter<any> = new EventEmitter<any>();
    @Output() imported: EventEmitter<any> = new EventEmitter<any>();
    
    constructor(public questionnaireService: QuestionnaireService, public miscellaneousService: MiscellaneousService){
        super(miscellaneousService);
    }

    ngOnInit(){
        this.__filterType = "questionnaire";
        this.showDisabled = false;   
        this.load();
    }

    private successLoad(data: any){
        this.questionnaires = data;
        this.loaded.emit(this.questionnaires);
    }

    private failureLoad(error: any){
        this.error = error;
        let fake: any = [];
        this.loaded.emit(fake);        
    }

    load(){ 
        this.questionnaireService.loadQuestionnaires(
            (data: any) => this.successLoad(data), 
            (error: any) => this.failureLoad(error), this.__filterType, this.showDisabled, this.searchTerm);
    }

    newQuestionnaire(){
        let q: any = this.questionnaireService.newQuestionnaire("questionnaire");
        if (!this.questionnaires){
            this.questionnaires = [];
        }
        this.questionnaires.push(q);
        this.newed.emit(q);
        return q;
    }

    filter(type: string = null, showDisabled: boolean = null){
        this.__filterType = type;
        this.showDisabled = (showDisabled == null ? true : showDisabled);
        this.load();
        this.filtered.emit({"__filterType": this.__filterType, "showDisabled": this.showDisabled, "searchTerm": this.searchTerm});                
    }

    filterTest(){
        this.filter('test', this.showDisabled);
        this.filtered.emit({"__filterType": 'test', "showDisabled": this.showDisabled});                
    }

    filterQuestionnaire(){
        this.filter('questionnaire', this.showDisabled);
        this.filtered.emit({"__filterType": 'questionnaire', "showDisabled": this.showDisabled});                
    }

    toggleFilterDisabled(){
        this.filter(this.__filterType, !this.showDisabled);
    }

    delete(questionnaire: any){
        this.questionnaireService.deleteQuestionnaire(this.questionnaires, questionnaire);
    }

    import(){
        // TODO
        this.imported.emit({});                
    }

}