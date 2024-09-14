import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { ServiceResult } from '../../domain/service-result';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'MetroWorkFlowModalComponent',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './metro-work-flow-modal.component.html',
  styleUrl: './metro-work-flow-modal.component.css'
})
export class MetroWorkFlowModalComponent {
  @Input() steps?: any[];
  @Input() selectedRow?: any;
  description?: string;
  @Output() modalListSelected = new EventEmitter<any>();
  @Output() modalListCanceled = new EventEmitter();
  private _serviceResult$?: Observable<ServiceResult<any[]>>;
  get serviceResult$() {
    return this._serviceResult$;
  };
  @Input() set serviceResult$(value: Observable<ServiceResult<any[]>> | undefined) {
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
  serviceResult?: ServiceResult<any[]>;
  loading: boolean = false;

  itemClicked(item: any) {
    this.selectedRow = item;
  }

  itemSelected() {
    if ((this.selectedRow?.stepId ?? -1) >= 0)
      this.modalListSelected.emit([this.selectedRow.stepId, this.description]);
  }

  canceledSelection() {
    this.selectedRow = undefined;
    this.modalListCanceled.emit();
  }
}
