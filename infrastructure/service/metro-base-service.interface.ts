import { Observable } from "rxjs";
import { RequestParams } from "../domain/request-params";
import { ServiceResult } from "../domain/service-result";
import { MetroBaseDto } from "../domain/metro-base.dto";
import { SystemWorkFlowRecordDto } from "../domain/system-work-flow-record.dto";

export interface IMetroBaseService<TDto extends MetroBaseDto> {
    getList(requst?: RequestParams): Observable<ServiceResult<TDto[]>>;
    remove(id: any): Observable<ServiceResult>;
    getById(id: any): Observable<ServiceResult<any>>;
    add(dto: any): Observable<ServiceResult>;
    update(dto: any): Observable<ServiceResult>;
    getSteps(id: any): Observable<ServiceResult<any>>;
    getRecords(id: any): Observable<ServiceResult<SystemWorkFlowRecordDto[]>>;
    workFlowConfirm(id: any, stepId: number, description: string): Observable<ServiceResult<any>>;
    printRequest(reportId: number, request: RequestParams | undefined, id: number | undefined): Observable<string>;
}