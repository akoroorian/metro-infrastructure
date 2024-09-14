import { Pipe, PipeTransform } from "@angular/core";
import moment from 'jalali-moment';

@Pipe({
  name: 'jalali',
  standalone: true
})
export class JalaliPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    let MomentDate = moment(value);
    if (MomentDate.isAfter(moment('1900-01-01')))
      return MomentDate.locale('fa').format(args ?? 'YYYY/M/D - h:m:s');
    else
      return undefined;
  }
}
