import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ColumnProperty, DtoProperties } from '../../domain/dto-properties';
import { NgComponentOutlet } from '@angular/common';
import { TextBoxComponentComponent } from '../form/text-box-component/text-box-component.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MetroFormControl } from '../../domain/metro-form-control';
import { DropDownComponent } from '../form/drop-down-component/drop-down-component.component';
import { QuestionModalComponent } from '../question-modal/question-modal.component';
import { ActivatedRoute } from '@angular/router';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { DetailDto } from '../../domain/detail-dto';
import { DtoActionType } from '../../domain/enum/dto-action-type';
import { CheckBoxComponent } from '../form/check-box-component/check-box-component.component';
import { QuestionChoiceType } from '../../domain/enum/question-choice-type';
import { Observable, bindCallback, map } from 'rxjs';

@Component({
  selector: 'app-detail-base-modal',
  standalone: true,
  imports: [NgComponentOutlet, ReactiveFormsModule, TextBoxComponentComponent, DropDownComponent, QuestionModalComponent, LoadingSpinnerComponent, CheckBoxComponent],
  templateUrl: './detail-base-modal.component.html',
  styleUrl: './detail-base-modal.component.css'
})
export class DetailBaseModalComponent implements OnInit {
  private static readonly editableTypes = ['string', 'number', 'datetime', 'bool', 'enum'];
  @Input() properties!: DtoProperties;
  loading: boolean = false;
  @Input() detailDto?: DetailDto<any>;
  @Output() onSubmit = new EventEmitter<DetailDto<any>>();
  @Output() onBack = new EventEmitter();

  detailForm!: FormGroup;
  detailFormValueChanged: boolean = false;
  formControls: MetroFormControl[] = [];
  route: ActivatedRoute = inject(ActivatedRoute);
  protected question = { showQuestion: false, question: "", choices: [{ id: 0, choice: "", type: QuestionChoiceType.normal }], callBack: (choiceId: number) => { } };

  ngOnInit(): void {
    this.detailForm = new FormGroup([]);
    this.properties.columns = this.properties.columns?.filter(col => DetailBaseModalComponent.editableTypes.includes(col.type));
    this.properties.columns?.forEach(column => {
      let control = new FormControl();
      if (column.disabled || column.readonly)
        control.disable();
      let newColumn: ColumnProperty = new ColumnProperty();
      Object.assign(newColumn, column);
      if (this.detailDto)
        Object.assign(newColumn, column.editOptions);
      else
        Object.assign(newColumn, column.insertOptions);
      let metroFormControl = new MetroFormControl({ column: newColumn, control: control });
      this.detailForm.addControl(newColumn.name, control);
      this.formControls.push(metroFormControl);
    });

    if (this.detailDto)
      this.formControls.forEach(formControl => {
        formControl.control.setValue(this.getValue(this.detailDto?.dtl, formControl.column?.name))
      });

    this.detailFormValueChanged = false;

    this.detailForm.valueChanges.subscribe(value => {
      if (!this.detailFormValueChanged)
        this.detailFormValueChanged = true;
    });
  }

  back() {
    if (this.hasUnsavedChanges()) {
      this.confirmToLeave()
        .subscribe((choice) => {
          if (choice === true)
            this.onBack.emit();
        });
    }
    else
      this.onBack.emit();
  }

  hasUnsavedChanges(): boolean {
    return this.detailFormValueChanged;
  }

  confirmToLeave(): Observable<boolean> {
    return this.askQuestionObservable("آیا از خروج بدون ذخیره تغییرات اطمینان دارید؟", [{ id: 1, choice: "بله", type: QuestionChoiceType.normal }, { id: 2, choice: "خیر", type: QuestionChoiceType.error }])
      .pipe(map(choiceId => choiceId === 1));
  }

  getValue(item: any | undefined, propName: string | undefined) {
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
    var item = this.detailForm.getRawValue();
    if (this.detailDto)
      Object.assign(this.detailDto, { action: DtoActionType.Update, dtl: item });
    // this.detailDto = { action: DtoActionType.Update, dtl: item };
    else
      this.detailDto = { action: DtoActionType.Insert, dtl: item };
      this.detailFormValueChanged = false;
      this.onSubmit.emit(this.detailDto);
  }

  private askQuestion = (question: string, choices: { id: number, choice: string, type: QuestionChoiceType }[], callBack: (choiceId: number) => void) => {
    this.question = { showQuestion: true, question: question, choices: choices, callBack: callBack };
  }

  askQuestionObservable(question: string, choices: { id: number, choice: string, type: QuestionChoiceType }[]): Observable<number> {
    const boundCallbackFunction = bindCallback(this.askQuestion);
    return boundCallbackFunction(question, choices);
  }

  onChoosed(choiceId: number) {
    this.question.showQuestion = false;
    this.question.callBack(choiceId);
  }
}
