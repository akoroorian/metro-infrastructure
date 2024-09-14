import { Component, Input } from '@angular/core';
import { MetroBaseDto } from '../../domain/metro-base.dto';
import { MetroBaseService } from '../../service/metro-base.service';
import { ColumnProperty, DtoProperties } from '../../domain/dto-properties';
import { finalize } from 'rxjs';
import { BasePageComponent } from '../base-page.component';
import { NgComponentOutlet } from '@angular/common';
import { TextBoxComponentComponent } from '../form/text-box-component/text-box-component.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MetroFormControl } from '../../domain/metro-form-control';
import { DropDownComponent } from '../form/drop-down-component/drop-down-component.component';
import { QuestionModalComponent } from '../question-modal/question-modal.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { CheckBoxComponent } from '../form/check-box-component/check-box-component.component';
import { ServiceResult } from '../../domain/service-result';
import { FileUploadcomponent } from '../form/file-upload-component/file-upload.component';
import { DateBoxComponentComponent } from '../form/date-box-component/date-box-component.component';

@Component({
  selector: 'app-detail-base-page',
  standalone: true,
  imports: [NgComponentOutlet, ReactiveFormsModule, TextBoxComponentComponent, DateBoxComponentComponent, DropDownComponent, QuestionModalComponent, LoadingSpinnerComponent, CheckBoxComponent, FileUploadcomponent],
  templateUrl: './detail-base-page.component.html',
  styleUrl: './detail-base-page.component.css'
})
export abstract class DetailBasePageComponent<TDto extends MetroBaseDto> extends BasePageComponent<TDto> {
  private static readonly editableTypes = ['string', 'number', 'datetime', 'bool', 'enum', 'file'];
  properties!: DtoProperties;
  loading: boolean = false;
  @Input()
  id?: any;
  serviceResult?: ServiceResult<TDto>;
  detailForm!: FormGroup;
  detailFormValueChanged: boolean = false;
  formControls: MetroFormControl[] = [];

  constructor(service: MetroBaseService<TDto>) {
    super(service);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.detailForm = new FormGroup([]);
    this.properties = this.getProperties();
    this.properties.columns = this.properties.columns?.filter(col => DetailBasePageComponent.editableTypes.includes(col.type));
    this.properties.columns?.forEach(column => {
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
      .subscribe((data) => {
        this.serviceResult = data;
        if (data.result)
          this.formControls.forEach(formControl => {
            formControl.control.setValue(this.getValue(data.result, formControl.column?.name))
          });
        this.detailFormValueChanged = false;
      });
  }

  override hasUnsavedChanges(): boolean {
    return this.detailFormValueChanged;
  }

  getProperties(): DtoProperties {
    throw new Error("getProperties() is not implemented.");
  }

  getValue(item: TDto | undefined, propName: string | undefined) {
    return (item as any) && (propName) ? (item as any)[propName] : undefined;
  }

  getColSpanClass(fc: MetroFormControl) {
    return `grid-column: span ${fc.column?.span} / span ${fc.column?.span}`;
  }

  lookupSelected = (fc: MetroFormControl, selectedItem: any) => {
    this.formControls.forEach(control => {
      if (fc !== control &&
        control.column?.name && fc.column?.lookup?.related?.includes(control.column?.name)) {
        let value = this.getValue(selectedItem, control.column.lookup?.field);
        control.control.setValue(value);
      }
    });
  };

  fileUploaded = (fc: MetroFormControl, fileResult: any) => {
    this.formControls.forEach(control => {
      if (fc !== control &&
        control.column?.name && fc.column?.lookup?.related?.includes(control.column?.name)) {
        let value = this.getValue(fileResult, control.column.lookup?.field);
        control.control.setValue(value);
      }
    });
  }

  submit() {
    var item = this.detailForm.getRawValue();
    if (this.id)
      this.service.update(item).subscribe((data) => {
        if (data.isSuccess) {
          this.detailFormValueChanged = false;
          this.back();
        }
      });
    else
      this.service.add(item).subscribe((data) => {
        if (data.isSuccess) {
          this.detailFormValueChanged = false;
          this.back();
        }
      });

  }
}
