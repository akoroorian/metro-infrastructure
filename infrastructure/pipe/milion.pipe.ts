import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'milion',
  standalone: true
})
export class MilionPipe implements PipeTransform {
  transform(value: number): number {
    return Math.ceil(value / 1000000);
  }
}