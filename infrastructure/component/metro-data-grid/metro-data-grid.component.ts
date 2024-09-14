import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { MetroBaseDto } from '../../domain/metro-base.dto';
import { ServiceResult } from '../../domain/service-result';
import { ColumnProperty, DtoProperties } from '../../domain/dto-properties';
import { Observable, finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ColumnAction } from '../../domain/column-action';
import { FilterMethod, RequestPaging, RequestParams, SortMethod } from '../../domain/request-params';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MetroFormControl } from '../../domain/metro-form-control';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { NgxMaskPipe } from 'ngx-mask';
import { ConfigService } from '../../service/config.service';
import { JalaliPipe } from '../../pipe/jalali.pipe';
import { MilionPipe } from '../../pipe/milion.pipe';

@Component({
  selector: 'app-metro-data-grid',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, LoadingSpinnerComponent, NgxMaskPipe, JalaliPipe, MilionPipe],
  templateUrl: './metro-data-grid.component.html',
  styleUrl: './metro-data-grid.component.css'
})
export class MetroDataGridComponent<Dto extends MetroBaseDto> implements OnInit {

  protected configService = inject(ConfigService);
  private _serviceResult$?: Observable<ServiceResult<Dto[]>>;
  get serviceResult$() {
    return this._serviceResult$;
  };
  @Input() set serviceResult$(value: Observable<ServiceResult<Dto[]>> | undefined) {
    if (value)
      this.loading = true;
    this._serviceResult$ = value;
    this.serviceResult$
      ?.pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe((data) => {
        this.serviceResult = data;
      });
  };
  @Input() properties!: DtoProperties;
  @Input() showTools?: boolean = true;
  @Input() selectedRow?: Dto;
  @Input() hasWorkFlow: boolean = false;
  @Input() getRowColor?: (dto: Dto) => undefined | string;
  @Input() requestParamPart!: Partial<RequestParams>;
  @Output() selectedRowChange = new EventEmitter<Dto>();
  @Output() onAdd = new EventEmitter();
  @Output() onRemove = new EventEmitter();
  @Output() onEdit = new EventEmitter();
  @Output() onFetch = new EventEmitter<Partial<RequestParams>>();
  @Output() onWorkFlow = new EventEmitter();
  @Output() onWorkFlowRecords = new EventEmitter();
  @Output() onPrint = new EventEmitter();
  @Output() onExcel = new EventEmitter();
  serviceResult?: ServiceResult<Dto[]>;
  showFilters?: boolean = true;
  loading: boolean = false;

  filterForm!: FormGroup;
  formControls: MetroFormControl[] = [];

  get columns() {
    return this.properties?.columns?.filter(c => (c.visible ?? true) === true);
  }

  private fetch() {
    this.onFetch.emit(this.requestParamPart);
  }

  refresh() {
    if (!this.requestParamPart.paging)
      this.requestParamPart.paging = new RequestPaging({ pageNumber: 1, pageSize: this.configService.environment.defaultPageSize });
    this.requestParamPart.paging.pageNumber = 1;
    this.fetch();
  }

  add() {
    this.onAdd.emit();
  }

  remove() {
    let col = this.properties.columns?.find(c => c.isKey === true);
    if (this.selectedRow)
      this.onRemove.emit(this.getValue(this.selectedRow as any, col?.name ?? 'id'));
  }

  edit() {
    console.log(this.selectRow);
    let col = this.properties.columns?.find(c => c.isKey === true);
    if (this.selectedRow)
      this.onEdit.emit(this.getValue(this.selectedRow as any, col?.name ?? 'id'));
  }

  workFlow() {
    let col = this.properties.columns?.find(c => c.isKey === true);
    if (this.selectedRow)
      this.onWorkFlow.emit(this.getValue(this.selectedRow as any, col?.name ?? 'id'));
  }

  workFlowRecords() {
    let col = this.properties.columns?.find(c => c.isKey === true);
    if (this.selectedRow)
      this.onWorkFlowRecords.emit(this.getValue(this.selectedRow as any, col?.name ?? 'id'));
  }

  gotoPage(pageNumber: number) {
    if (!this.requestParamPart.paging)
      this.requestParamPart.paging = new RequestPaging({ pageNumber: 1, pageSize: this.configService.environment.defaultPageSize });
    this.requestParamPart.paging.pageNumber = pageNumber;
    this.fetch();
  }

  gotoPrevPage() {
    if (this.requestParamPart.paging && this.requestParamPart.paging.pageNumber && (this.requestParamPart.paging.pageNumber ?? 0) > 1)
      this.gotoPage(this.requestParamPart.paging.pageNumber - 1);
  }

  gotoNextPage() {
    if (this.requestParamPart.paging && this.requestParamPart.paging.pageNumber)
      this.gotoPage(this.requestParamPart.paging.pageNumber + 1);
  }

  onFilter(event: any) {
    if (event.keyCode === 13) {
      this.requestParamPart.filtering = { conditions: [] };
      let filterValue = this.filterForm.getRawValue();
      this.formControls.forEach(fc => {
        if (fc.column?.name) {
          let value = this.getValue(filterValue, fc.column?.name);
          if (value) {
            let filterCondition = { propertyName: fc.column?.name, propertyValue: value, method: fc.column?.type == "string" ? FilterMethod.Contains : FilterMethod.Equal };
            this.requestParamPart.filtering?.conditions.push(filterCondition);
          }
        }
      });
      this.refresh();
    }
  }

  sortColumn(colName: string) {
    if (!this.requestParamPart.sorting)
      this.requestParamPart.sorting = { conditions: [] };
    var sortCondition = this.requestParamPart.sorting.conditions.find(c => c.propertyName === colName);
    if (sortCondition) {
      if (sortCondition.method === SortMethod.Aascending)
        sortCondition.method = SortMethod.Descending;
      else {
        let sortConditionIndex = this.requestParamPart.sorting.conditions.indexOf(sortCondition);
        this.requestParamPart.sorting.conditions.splice(sortConditionIndex, 1);
      }
    }
    else {
      sortCondition = { propertyName: colName, method: SortMethod.Aascending };
      this.requestParamPart.sorting.conditions.push(sortCondition);
    }
    this.fetch();
  }

  setShowFilters(showFilters: boolean) {
    if (!showFilters) {
      this.filterForm.reset();
    }
    this.showFilters = showFilters;
  }

  isSorted(colName: string, sortMethod: number) {
    if (!this.requestParamPart.sorting)
      return false;
    return this.requestParamPart.sorting.conditions.find(c => c.propertyName === colName && c.method === sortMethod)
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

  getPageCount() {
    let recordCount = (this.serviceResult?.count ?? 0);
    if (this.requestParamPart.paging && this.requestParamPart.paging.pageSize) {
      return Math.ceil(recordCount / this.requestParamPart.paging.pageSize);
    }
    else return 0;
  }

  getPageNumbers() {
    let pageCount = this.getPageCount();
    var set = new Set();
    if (!this.requestParamPart.paging?.pageNumber)
      return set;
    let pageNumber = this.requestParamPart.paging?.pageNumber;

    if (pageNumber > 2)
      set.add(1);

    if (pageNumber > 3)
      set.add("<");

    if (pageNumber > 1)
      set.add(pageNumber - 1);

    set.add(pageNumber);

    if (pageNumber + 1 < pageCount)
      set.add(pageNumber + 1);

    if (pageNumber + 2 < pageCount)
      set.add(">");

    if (pageNumber < pageCount)
      set.add(pageCount);
    return set;
  }

  selectRow(item: Dto) {
    console.log(this.selectRow);
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

  onAction(e: ColumnAction, item: Dto) {
    e.func(item);
  }

  print() {
    let col = this.properties.columns?.find(c => c.isKey === true);
    if (this.selectedRow)
      this.onPrint.emit(this.getValue(this.selectedRow as any, col?.name ?? 'id'));
  }

  excel() {
    let col = this.properties.columns?.find(c => c.isKey === true);
    if (this.selectedRow)
      this.onExcel.emit(this.getValue(this.selectedRow as any, col?.name ?? 'id'));
  }

  getTableRowColor(item: Dto) {
    return this.getRowColor ? this.getRowColor(item) : undefined;
  }
}
