import { DtoProperties } from "./dto-properties";

export abstract class MetroBaseDto {

  public getValue(colName: string) {
    return (this as any) ? (this as any)[colName] : undefined;
  }  
}
