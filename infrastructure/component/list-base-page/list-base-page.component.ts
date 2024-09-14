import { MessageService } from './../../service/message.service';
import { MetroFormControl } from './../../domain/metro-form-control';
import { Component, Inject, InjectionToken, OnInit, Type, inject } from '@angular/core';
import { MetroBaseDto } from '../../domain/metro-base.dto';
import { MetroDataGridComponent } from '../metro-data-grid/metro-data-grid.component';
import { ServiceResult } from '../../domain/service-result';
import { ColumnProperty, DtoProperties } from '../../domain/dto-properties';
import { Observable, finalize } from 'rxjs';
import { RequestFiltering, RequestPaging, RequestParams } from '../../domain/request-params';
import { BasePageComponent } from '../base-page.component';
import { QuestionModalComponent } from '../question-modal/question-modal.component';
import { QuestionChoiceType } from '../../domain/enum/question-choice-type';
import { IMetroBaseService } from '../../service/metro-base-service.interface';
import { MetroModalListComponent } from '../form/metro-lookup/metro-modal-list.component';
import { ConfigService } from '../../service/config.service';
import { MetroWorkFlowModalComponent } from '../metro-work-flow-modal/metro-work-flow-modal.component';
import { SystemWorkFlowRecordDto } from '../../domain/system-work-flow-record.dto';
import { NgComponentOutlet } from '@angular/common';
import { MetroPrintModalComponent } from '../metro-modal/metro-print-modal.component';

const serviceInjector = new InjectionToken<IMetroBaseService<MetroBaseDto>>('serviceInjector');

@Component({
  selector: 'app-list-base-page',
  standalone: true,
  imports: [MetroDataGridComponent, QuestionModalComponent, MetroModalListComponent, MetroWorkFlowModalComponent, NgComponentOutlet, MetroPrintModalComponent],
  templateUrl: './list-base-page.component.html',
  styleUrl: './list-base-page.component.css'
})
export abstract class ListBasePageComponent<TDto extends MetroBaseDto> extends BasePageComponent<TDto> implements OnInit {



  private configService = inject(ConfigService);
  private static readonly listableTypes = ['string', 'number', 'datetime', 'bool', 'enum', 'action', 'file'];
  showPrint: boolean = false;
  isShownModalList: boolean = false;
  isShownModalWorkFlow: boolean = false;
  serviceResult$?: Observable<ServiceResult<TDto[]>>;
  workflowStepServiceResult$?: Observable<ServiceResult<any[]>>;
  properties!: DtoProperties;
  modalTitle?: string;
  modalProperties?: DtoProperties;
  // modalService?: IMetroBaseService<MetroBaseDto>;
  modalDefaultRequestFiltering?: Partial<RequestFiltering>;
  requestParamPart: Partial<RequestParams> = { paging: new RequestPaging({ pageNumber: 1, pageSize: this.configService.environment.defaultPageSize }) };
  selectedId?: number;
  hasWorkFlow: boolean = false;
  repRequestId?: string;
  protected headerViewComponent: Type<any> | undefined = undefined;
  protected footerViewComponent: Type<any> | undefined = undefined;
  constructor(@Inject(serviceInjector) service: IMetroBaseService<TDto>) {
    super(service);
  }

  protected messageService = inject(MessageService);

  override ngOnInit(): void {
    super.ngOnInit();
    this.properties = this.getProperties();
    let cols = this.properties.columns?.filter(col => ListBasePageComponent.listableTypes.includes(col.type));
    this.properties.columns = [];
    cols?.forEach(column => {
      let newColumn: ColumnProperty = new ColumnProperty();
      Object.assign(newColumn, column);
      Object.assign(newColumn, column.listOptions);
      this.properties.columns?.push(newColumn);
    });

    this.fetch(this.requestParamPart);
  }

  getProperties(): DtoProperties {
    throw new Error("getProperties() is not implemented.");
  }

  getRowColor(dto: TDto): string | undefined {
    return undefined;
  }

  add() {
    this.router.navigate(["detail"], { relativeTo: this.activatedRoute })
  }

  remove = (id: any) => {
    this.selectedId = id;
    this.askQuestionObservable("آیا از حذف این ردیف اطمینان دارید؟", [{ id: 1, choice: "بله", type: QuestionChoiceType.normal }, { id: 2, choice: "خیر", type: QuestionChoiceType.error }])
      .subscribe((choiceId) => {
        if (choiceId === 1)
          return this.service.remove(id)
            ?.subscribe(
              {
                next: (serviceResult: ServiceResult<any>) => {
                  if (serviceResult?.isSuccess) {
                    this.fetch(this.requestParamPart);
                  }

                }, error: (error) => {
                  // Handle the error here, e.g., show a toast
                  this.messageService.send({ type: QuestionChoiceType.error, text: error.errror.message ?? "" });
                }
              }
            //   (result) => {
            //   if (result.isSuccess)
            //     this.fetch(this.requestParamPart);
            // }

          );
        else
          return;
      });
  }

  edit(id: any) {
    this.selectedId = id;
    this.router.navigate(["detail", id], { relativeTo: this.activatedRoute })
  }

  fetch(requestParamPart: Partial<RequestParams>,) {
    this.requestParamPart = requestParamPart;
    const requestParams = new RequestParams(this.requestParamPart);
    this.serviceResult$ = this.service.getList(requestParams);
  }

  workFlow(id: any) {
    this.selectedId = id;
    this.isShownModalWorkFlow = true;
    this.workflowStepServiceResult$ = this.service.getSteps(id);
  }

  workflowStepSelected(workFlowStep: any) {
    this.isShownModalWorkFlow = false;
    this.service.workFlowConfirm(this.selectedId!, workFlowStep[0], workFlowStep[1])
      .pipe(
        finalize(() => {
          this.fetch(this.requestParamPart);
        })
      )
      .subscribe();
  }

  workflowStepCanceledSelection() {
    this.isShownModalWorkFlow = false;
  }

  showModalList(modalProperties: DtoProperties, modalGetMethod: (requestParamPart?: Partial<RequestParams>) => Observable<ServiceResult<MetroBaseDto[]>>, title: string | undefined = undefined, modalDefaultRequestFiltering: Partial<RequestFiltering> | undefined = undefined) {
    this.modalTitle = title ?? modalProperties.title;
    this.modalProperties = modalProperties;
    this.modalGetMethod = modalGetMethod;
    this.modalDefaultRequestFiltering = modalDefaultRequestFiltering;
    this.isShownModalList = true;
  }

  showWorkFlowRecords(id: number) {
    this.modalTitle = "سوابق گردش کار";
    this.modalProperties = SystemWorkFlowRecordDto.getProperties();
    this.modalGetMethod = () => {
      return this.service.getRecords(id);
    };
    this.isShownModalList = true;
  }

  modalGetMethod?: (requestParamPart?: Partial<RequestParams>) => Observable<ServiceResult<SystemWorkFlowRecordDto[]>>;

  modalListCanceledSelection() {
    this.isShownModalList = false;
  }

  closePrintModal() {
    this.showPrint = false;
  }

  override hasUnsavedChanges(): boolean {
    return false;
  }

  print(id: number) {
    this.selectedId = id;
    if (this.properties.reportId) {
      this.service.printRequest(this.properties.reportId, this.requestParamPart, this.selectedId).subscribe(
        (result) => {
          this.repRequestId = result;
          this.showPrint = true;
        }
      );
    }
  }

  excel(id: number) {
    this.selectedId = id;
    if (this.properties.reportId) {
      this.service.printRequest(this.properties.reportId, this.requestParamPart, this.selectedId).subscribe(
        (result) => {
          this.repRequestId = result;
          const anchor = document.createElement('a');
          anchor.href = `${this.configService.environment.reportUrl}\excel?id=${this.repRequestId}`;
          anchor.target = '_blank';
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
        }
      );
    }
  }
}
