import { Component, EventEmitter, Inject, InjectionToken, Input, OnInit, Output } from '@angular/core';
import { MetroDataGridComponent } from '../../metro-data-grid/metro-data-grid.component';
import { MetroBaseDto } from '../../../domain/metro-base.dto';
import { FormBaseComponentComponent } from '../form-base-component/form-base-component.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MetroFormControl } from '../../../domain/metro-form-control';
import { IMetroBaseService } from '../../../service/metro-base-service.interface';
import { MetroModalListComponent } from './metro-modal-list.component';
import { DtoProperties } from '../../../domain/dto-properties';
import { RequestParams } from '../../../domain/request-params';
import { Observable } from 'rxjs';
import { ServiceResult } from '../../../domain/service-result';

const serviceInjector = new InjectionToken<(requestParamPart?: Partial<RequestParams>) => Observable<ServiceResult<MetroBaseDto[]>>>('serviceInjector');

@Component({
  selector: 'app-metro-lookup',
  standalone: true,
  imports: [ReactiveFormsModule, ReactiveFormsModule, MetroModalListComponent],
  templateUrl: './metro-lookup.component.html',
  styleUrl: './metro-lookup.component.css'
})
export abstract class MetroLookupComponent extends FormBaseComponentComponent {
  showModalList: boolean = false;
  properties!: DtoProperties;
  @Input() lookupSelected?: (fc: MetroFormControl, selectedItem: any) => void;
  constructor(@Inject(serviceInjector) protected getList?: (requestParamPart?: Partial<RequestParams>) => Observable<ServiceResult<MetroBaseDto[]>>) {
    super();
  }

  override ngOnInit(): void {
    this.metroFormControl.control.disable({ emitEvent: false });
    this.properties = this.getProperties();
  }

  getProperties(): DtoProperties {
    throw new Error("getProperties() is not implemented.");
  }

  itemSelected(selectedItem: any) {
    let value = undefined;
    if (selectedItem)
      value = this.getValue(selectedItem, this.metroFormControl.column?.lookup?.field);
    this.metroFormControl.control.setValue(value);
    this.lookupSelected?.(this.metroFormControl, selectedItem);
    this.showModalList = false;
  }

  modalListCanceledSelection() {
    this.showModalList = false;
  }

  modalListSelected(selectedItem: any) {
    if (selectedItem)
      this.itemSelected(selectedItem);
    else
      this.modalListCanceledSelection();
  }

  onSearchClick() {
    this.showModalList = true;
  } 

}