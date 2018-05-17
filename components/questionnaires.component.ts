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
    public __showDisabled: boolean;

    public sortKey: string ="title";

    public lastError: string;

    public loading = false;

    private __searchTerm: string;

    @Input() set searchTerm(value: string){
        this.__searchTerm = value;
    }

    get searchTerm(): string{
        return this.__searchTerm;
    }

    @Input() set filterType(value: string){
        this.__filterType = value;
    }

    get filterType(): string{
        return this.__filterType;
    }

    @Input() set showDisabled(value: boolean){
        this.__showDisabled = value;
    }

    get showDisabled(): boolean{
        return this.__showDisabled;
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
        this.lastError = this.questionnaireService.lastError; 
        this.loading = false;
               
        this.loaded.emit(this.questionnaires);
    }

    private failureLoad(error: any){
        this.error = error;
        this.loading = false;
        
        let fake: any = [];
        this.lastError = this.questionnaireService.lastError;        
        this.loaded.emit(fake);        
    }

    load(){ 
        this.loading = true;
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
        this.__showDisabled = (showDisabled == null ? true : showDisabled);
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

    toggleNoFilter(){
        this.filter(null, null);
    }

    delete(questionnaire: any){
        this.questionnaireService.deleteQuestionnaire(this.questionnaires, questionnaire);
    }

    import(){
        // TODO
        this.imported.emit({});                
    }

    public getFilterCaption() {
        let caption = this.__filterType ? this.translate(this.__filterType): "";

        if (this.__showDisabled) {
            caption += (caption ? ", " : "") + this.translate("disabled shown");
        }
        return caption;
    }     

}