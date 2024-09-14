import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ServiceConfig } from '../domain/ServiceConfig';
import { MetroBaseDto } from '../domain/metro-base.dto';
import { ServiceResult } from '../domain/service-result';
import { HandleError, HttpErrorHandler } from '../webapi/http-error-handler.service';
import { RequestParams } from '../domain/request-params';
import { Observable, catchError, retry } from 'rxjs';
import { MasterDetailDto } from '../domain/master-detail-dto';
import { IMetroBaseService } from './metro-base-service.interface';
import { ConfigService } from './config.service';
import { SystemWorkFlowRecordDto } from '../domain/system-work-flow-record.dto';

@Injectable({
  providedIn: 'root'
})
export abstract class MetroMasterDetailBaseService<TMaster extends MetroBaseDto, TDetail extends MetroBaseDto, TDetail2 extends MetroBaseDto | undefined, TDetail3 extends MetroBaseDto | undefined> implements IMetroBaseService<TMaster> {
  private readonly resourceEndpoint: string;
  private readonly apiUrl: string;
  protected readonly reportUrl: string;
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly httpErrorHandler: HttpErrorHandler = inject(HttpErrorHandler);
  private handleError!: HandleError;
  private getRetryCount: number;
  configService = inject(ConfigService);

  constructor(config: ServiceConfig) {
    this.apiUrl = this.configService.environment.apiUrl.endsWith("/") ? this.configService.environment.apiUrl : this.configService.environment.apiUrl + "/";
    this.reportUrl = this.configService.environment.reportUrl.endsWith("/") ? this.configService.environment.reportUrl : this.configService.environment.reportUrl + "/";
    this.resourceEndpoint = `${this.apiUrl}${config.resourceEndpoint}`;
    this.getRetryCount = this.configService.environment.getRetryCount;
    this.handleError = this.httpErrorHandler.createHandleError(config.resourceEndpoint);
  }

  public getList(requst?: RequestParams) {
    const options = requst ?
      { params: new HttpParams().set('params', JSON.stringify(requst)) } : {};

    return this.httpClient.get<ServiceResult<TMaster[]>>(this.resourceEndpoint, options)
      .pipe(
        retry(this.getRetryCount),
        catchError(this.handleError<ServiceResult<TMaster[]>>('get list')),
      );
  }

  public getById(id: any) {
    return this.httpClient.get<ServiceResult<MasterDetailDto<TMaster, TDetail, TDetail2, TDetail3>>>(`${this.resourceEndpoint}/${id}`)
      .pipe(
        retry(this.getRetryCount),
        catchError(this.handleError<ServiceResult<MasterDetailDto<TMaster, TDetail, TDetail2, TDetail3>>>('get:id')),
      );
  }

  public getSteps(id: any): Observable<ServiceResult> {
    return this.httpClient.get<ServiceResult>(`${this.resourceEndpoint}/wf/${id}/steps`)
      .pipe(
        retry(this.getRetryCount),
        // tap((data) => { if (data.isSuccess) this.messageService.send({ type: QuestionChoiceType.normal, text: data.message ?? "دریافت رکورد موفق" }) }),
        catchError(this.handleError<ServiceResult>('getSteps:id')),
      );
  }

  public getRecords(id: any): Observable<ServiceResult<SystemWorkFlowRecordDto[]>> {
    return this.httpClient.get<ServiceResult<SystemWorkFlowRecordDto[]>>(`${this.resourceEndpoint}/wf/${id}/records`)
      .pipe(
        retry(this.getRetryCount),
        // tap((data) => { if (data.isSuccess) this.messageService.send({ type: QuestionChoiceType.normal, text: data.message ?? "دریافت رکورد موفق" }) }),
        catchError(this.handleError<ServiceResult<SystemWorkFlowRecordDto[]>>('getRecords:id')),
      );
  }

  public workFlowConfirm(id: any, stepId: number, description: string) {
    return this.httpClient.post<ServiceResult>(`${this.resourceEndpoint}/wf/${id}/confirm`, { stepId: stepId, description: description })
      .pipe(
        // tap((data) => { if (data.isSuccess) this.messageService.send({ type: QuestionChoiceType.normal, text: data.message ?? "افزودن موفق" }) }),
        catchError(this.handleError<ServiceResult>('post')),
      );
  }

  public add(dto: MasterDetailDto<TMaster, TDetail, TDetail2, TDetail3>) {
    return this.httpClient.post<ServiceResult>(this.resourceEndpoint, dto)
      .pipe(
        catchError(this.handleError<ServiceResult>('post')),
      );
  }

  public update(dto: MasterDetailDto<TMaster, TDetail, TDetail2, TDetail3>) {
    return this.httpClient.put<ServiceResult>(this.resourceEndpoint, dto)
      .pipe(
        catchError(this.handleError<ServiceResult>('put')),
      );
  }

  public remove(id: any) {
    return this.httpClient.delete<ServiceResult>(`${this.resourceEndpoint}/${id}`)
      .pipe(
        catchError(this.handleError<ServiceResult>('delete')),
      );
  }

  public printRequest(reportId: number, request: RequestParams | undefined = undefined, id: number | undefined) {
    var params = { reportId: reportId, params: { id: id, params: { filtering: request?.filtering } } }
    return this.httpClient.post<string>(`${this.reportUrl}home/reportrequest`, params)
      .pipe(
        // tap((data) => { if (data.isSuccess) this.messageService.send({ type: QuestionChoiceType.normal, text: data.message ?? "افزودن موفق" }) }),
        catchError(this.handleError<string>('post')),
      );
  }
}
