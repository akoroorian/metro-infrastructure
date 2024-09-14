import { Component, EventEmitter, Input, OnInit, Output, input } from '@angular/core';
import { MetroBaseDto } from '../../domain/metro-base.dto';
import { ColumnProperty, DtoProperties } from '../../domain/dto-properties';
import { CommonModule } from '@angular/common';
import { ColumnAction } from '../../domain/column-action';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MetroFormControl } from '../../domain/metro-form-control';
import { NgxMaskPipe } from 'ngx-mask';
import { DetailDto } from '../../domain/detail-dto';
import { DtoActionType } from '../../domain/enum/dto-action-type';
import { JalaliPipe } from '../../pipe/jalali.pipe';

@Component({
  selector: 'app-metro-detail-data-grid',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgxMaskPipe, JalaliPipe],
  templateUrl: './metro-detail-data-grid.component.html',
  styleUrl: './metro-detail-data-grid.component.css'
})
export class MetroDetailDataGridComponent<Dto extends MetroBaseDto | undefined> implements OnInit {
  private _detailServiceResult?: DetailDto<Dto>[];
  get detailServiceResult() {
    return this._detailServiceResult;
  };
  @Input() set detailServiceResult(value: DetailDto<Dto>[] | undefined) {
    this._detailServiceResult = value;
  };
  // @Input() serviceResult$?: Observable<ServiceResult<Dto[]>>;
  @Input() properties!: DtoProperties;
  @Input() showTools?: boolean = true;
  @Input() selectedRow?: DetailDto<Dto>;
  @Output() selectedRowChange = new EventEmitter<any>();
  @Output() onAdd = new EventEmitter();
  @Output() onRemove = new EventEmitter();
  @Output() onEdit = new EventEmitter<DetailDto<Dto>>();

  filterForm!: FormGroup;
  formControls: MetroFormControl[] = [];
  dtoActionType = DtoActionType;

  get columns() {
    return this.properties?.columns?.filter(c => (c.visible ?? true) === true);
  }

  add() {
    this.onAdd.emit();
  }

  remove() {
    if (this.selectedRow)
      this.onRemove.emit(this.selectedRow);
  }

  edit() {
    if (this.selectedRow)
      this.onEdit.emit(this.selectedRow);
  }

  getValue(item: Dto, propName: string) {
    return (item as any) ? (item as any)[propName] : undefined;
  }

  getEnumValueByKey(col: ColumnProperty, key: any) {
    if (key === true || key === 'true')
      key = 1;
    else if (key === false || key === 'false')
      key = 0;
    return col.enum?.[key] ?? "نامشخص";
  }

  selectRow(item: DetailDto<Dto>) {
    if (this.selectedRow === item)
      return;
    this.selectedRow = item;
    this.selectedRowChange.emit(item);
  }

  getColWidthClass(col: ColumnProperty) {
    return `width:${col.width}px`;
  }

  ngOnInit(): void {
    this.filterForm = new FormGroup([]);
    this.columns?.forEach(column => {
      let control = new FormControl();
      let metroFormControl = new MetroFormControl({ column: column, control: control });
      this.filterForm.addControl(column.name, control);
      this.formControls.push(metroFormControl);
    });
  }

  onAction(e: ColumnAction, item: DetailDto<Dto>) {
    e.func(item);
  }

  getRowColor(item: any): string {
    // Replace `verificationStatusField` with the actual field name
    const status = item.verificationStatusField;

    switch (status) {
      case 0: // Pending
        return 'bg-yellow-100'; // Example color for Pending
      case 1: // Reject
        return 'bg-red-100'; // Example color for Reject
      case 2: // Accept
        return 'bg-green-100'; // Example color for Accept
      default:
        return 'bg-white'; // Default color
    }
  }

}
