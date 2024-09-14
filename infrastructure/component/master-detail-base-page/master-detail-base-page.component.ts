import { Component, Input } from "@angular/core";
import { MetroBaseDto } from "../../domain/metro-base.dto";
import { BasePageComponent } from "../base-page.component";
import { MetroMasterDetailBaseService } from "../../service/metro-master-detail-base.service";
import { NgComponentOutlet } from "@angular/common";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { TextBoxComponentComponent } from "../form/text-box-component/text-box-component.component";
import { DropDownComponent } from "../form/drop-down-component/drop-down-component.component";
import { QuestionModalComponent } from "../question-modal/question-modal.component";
import { LoadingSpinnerComponent } from "../loading-spinner/loading-spinner.component";
import { ColumnProperty, DtoProperties } from "../../domain/dto-properties";
import { MetroFormControl } from "../../domain/metro-form-control";
import { finalize } from "rxjs";
import { DetailDto } from "../../domain/detail-dto";
import { MetroDetailDataGridComponent } from "../metro-detail-data-grid/metro-detail-data-grid.component";
import { DetailBaseModalComponent } from "../detail-base-modal/detail-base-modal.component";
import { DtoActionType } from "../../domain/enum/dto-action-type";
import { ServiceResult } from "../../domain/service-result";
import { MasterDetailDto } from "../../domain/master-detail-dto";
import { CheckBoxComponent } from "../form/check-box-component/check-box-component.component";

@Component({
    selector: 'app-master-detail-base-page',
    standalone: true,
    imports: [
        NgComponentOutlet, ReactiveFormsModule,
        TextBoxComponentComponent, DropDownComponent,
        QuestionModalComponent, LoadingSpinnerComponent,
        MetroDetailDataGridComponent, DetailBaseModalComponent,
        CheckBoxComponent],
    templateUrl: './master-detail-base-page.component.html',
    styleUrl: './master-detail-base-page.component.css'
})
export abstract class MasterDetailBasePageComponent<TMaster extends MetroBaseDto, TDetail extends MetroBaseDto, TDetail2 extends MetroBaseDto | undefined, TDetail3 extends MetroBaseDto | undefined> extends BasePageComponent<TMaster> {
    private static readonly editableTypes = ['string', 'number', 'datetime', 'bool', 'enum'];
    detailServiceResult?: DetailDto<TDetail>[];
    detail2ServiceResult?: DetailDto<TDetail2>[];
    detail3ServiceResult?: DetailDto<TDetail3>[];
    masterProperties!: DtoProperties;
    detailProperties: DtoProperties = { title: "", columns: [] };
    detail2Properties?: DtoProperties = undefined;
    detail3Properties?: DtoProperties = undefined;
    selectedDetailTab: number = 1;
    loading: boolean = false;
    showDetailModal: boolean = false;
    selectedDetailDto?: DetailDto<TDetail>;
    selectedDetail2Dto?: DetailDto<TDetail2>;
    selectedDetail3Dto?: DetailDto<TDetail3>;
    @Input()
    id?: any;

    detailForm!: FormGroup;
    detailFormValueChanged: boolean = false;
    formControls: MetroFormControl[] = [];
    constructor(service: MetroMasterDetailBaseService<TMaster, TDetail, TDetail2, TDetail3>) {
        super(service);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.detailForm = new FormGroup([]);
        this.masterProperties = this.getMasterProperties();

        let columnProperties = this.getDetailProperties();
        Object.assign(this.detailProperties, columnProperties);
        this.detailProperties.columns?.forEach(column => {
            Object.assign(column, column.detailListOptions);
        });

        let column2Properties = this.getDetail2Properties();
        if (column2Properties) {
            this.detail2Properties = { title: "", columns: [] };
            Object.assign(this.detail2Properties, column2Properties);
            this.detail2Properties.columns?.forEach(column => {
                Object.assign(column, column.detailListOptions);
            });
        }

        let column3Properties = this.getDetail3Properties();
        if (column3Properties) {
            this.detail3Properties = { title: "", columns: [] };
            Object.assign(this.detail3Properties, column3Properties);
            this.detail3Properties.columns?.forEach(column => {
                Object.assign(column, column.detailListOptions);
            });
        }

        this.masterProperties.columns = this.masterProperties.columns?.filter(col => MasterDetailBasePageComponent.editableTypes.includes(col.type));
        this.masterProperties.columns?.forEach(column => {
            let control = new FormControl();
            if (column.disabled || column.readonly)
                control.disable();
            let newColumn: ColumnProperty = new ColumnProperty();
            Object.assign(newColumn, column);
            if (this.id)
                Object.assign(newColumn, column.editOptions);
            else
                Object.assign(newColumn, column.insertOptions);
            let metroFormControl = new MetroFormControl({ column: newColumn, control: control });
            this.detailForm.addControl(newColumn.name, control);
            this.formControls.push(metroFormControl);
        });

        this.detailForm.valueChanges.subscribe(value => {
            if (!this.detailFormValueChanged)
                this.detailFormValueChanged = true;
        });

        if (this.id)
            this.fetch(this.id);
    }

    fetch(id: any) {
        this.loading = true;
        this.service.getById(id)
            .pipe(
                finalize(() => { this.loading = false; })
            )
            .subscribe((data: ServiceResult<MasterDetailDto<TMaster, TDetail, TDetail2, TDetail3>>) => {
                if (data.result)
                    this.formControls.forEach(formControl => {
                        formControl.control.setValue(this.getValue(data.result?.master, formControl.column?.name))
                    });
                this.detailServiceResult = data.result?.details;
                this.detail2ServiceResult = data.result?.details2;
                this.detail3ServiceResult = data.result?.details3;
                this.detailFormValueChanged = false;
            });
    }

    override hasUnsavedChanges(): boolean {
        return this.detailFormValueChanged
            || this.detailServiceResult?.some(x => x.action != DtoActionType.None) === true
            || this.detail2ServiceResult?.some(x => x.action != DtoActionType.None) === true
            || this.detail3ServiceResult?.some(x => x.action != DtoActionType.None) === true;
    }

    getMasterProperties(): DtoProperties {
        throw new Error("getMasterProperties() is not implemented.");
    }

    getDetailProperties(): DtoProperties {
        throw new Error("getDetailProperties() is not implemented.");
    }

    getDetail2Properties(): DtoProperties | undefined {
        return undefined;
    }

    getDetail3Properties(): DtoProperties | undefined {
        return undefined;
    }

    getValue(item: any, propName: string | undefined) {
        return item && propName ? item[propName] : undefined;
    }

    getColSpanClass(fc: MetroFormControl) {
        return `grid-column: span ${fc.column?.span} / span ${fc.column?.span}`;
    }

    lookupSelected = (fc: MetroFormControl, selectedItem: any) => {
        this.formControls.forEach(control => {
            if (fc !== control && control.column?.lookup?.type === fc.column?.lookup?.type && control.column?.name && fc.column?.lookup?.related?.includes(control.column?.name)) {
                let value = this.getValue(selectedItem, control.column.lookup?.field);
                control.control.setValue(value);
            }
        });
    };

    submit() {
        let item = this.detailForm.getRawValue();
        let mstDtlItem = { master: item, details: this.detailServiceResult, details2: this.detail2ServiceResult, details3: this.detail3ServiceResult };

        if (this.id)
            this.service.update(mstDtlItem).subscribe((data) => {
                if (data.isSuccess) {
                    this.detailFormValueChanged = false;
                    this.detailServiceResult?.forEach(x => x.action = DtoActionType.None);
                    this.detail2ServiceResult?.forEach(x => x.action = DtoActionType.None);
                    this.detail3ServiceResult?.forEach(x => x.action = DtoActionType.None);
                    this.back();
                }
            });
        else
            this.service.add(mstDtlItem).subscribe((data) => {
                if (data.isSuccess) {
                    this.detailFormValueChanged = false;
                    this.detailServiceResult?.forEach(x => x.action = DtoActionType.None);
                    this.detail2ServiceResult?.forEach(x => x.action = DtoActionType.None);
                    this.detail3ServiceResult?.forEach(x => x.action = DtoActionType.None);
                    this.back();
                }
            });
    }

    edit(detailDto: DetailDto<any>) {
        switch (this.selectedDetailTab) {
            case 1:
                this.selectedDetailDto = detailDto;
                break;
            case 2:
                this.selectedDetail2Dto = detailDto;
                break;
            case 3:
                this.selectedDetail3Dto = detailDto;
                break;
        }
        this.showDetailModal = true;
    }

    submitDetailModal(detailDto: DetailDto<any>) {
        if (detailDto?.action == DtoActionType.Insert)
            switch (this.selectedDetailTab) {
                case 1:
                    this.detailServiceResult?.push(detailDto);
                    break;
                case 2:
                    this.detail2ServiceResult?.push(detailDto);
                    break;
                case 3:
                    this.detail3ServiceResult?.push(detailDto);
                    break;
            }
        this.showDetailModal = false;
    }

    backDetailModal() {
        this.showDetailModal = false;
    }

    remove(detailDto: DetailDto<any>) {
        if (detailDto?.action == DtoActionType.Insert) {
            switch (this.selectedDetailTab) {
                case 1:
                    let index = this.detailServiceResult?.indexOf(detailDto);
                    this.detailServiceResult?.splice(index!, 1);
                    break;
                case 2:
                    index = this.detail2ServiceResult?.indexOf(detailDto);
                    this.detail2ServiceResult?.splice(index!, 1);
                    break;
                case 3:
                    index = this.detail3ServiceResult?.indexOf(detailDto);
                    this.detail3ServiceResult?.splice(index!, 1);
                    break;
            }
        }
        else
            detailDto.action = DtoActionType.Delete;
    }

    add() {
        switch (this.selectedDetailTab) {
            case 1:
                this.selectedDetailDto = undefined;
                break;
            case 2:
                this.selectedDetail2Dto = undefined;
                break;
            case 3:
                this.selectedDetail3Dto = undefined;
                break;
        }
        this.showDetailModal = true;
    }

    selectedDetailTabChanged(tabNubmber: number) {
        this.selectedDetailTab = tabNubmber;
    }
}