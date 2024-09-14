import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBaseComponentComponent } from '../form-base-component/form-base-component.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import moment from 'jalali-moment';

@Component({
  selector: 'app-date-box-component',
  standalone: true,
  imports: [ReactiveFormsModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './date-box-component.component.html',
  styleUrls: [
    '../form-base-component/form-base-component.component.css',
    './date-box-component.component.css'
  ]
})
export class DateBoxComponentComponent extends FormBaseComponentComponent {

  @ViewChild("input") input!: ElementRef;
  jalaliValue?: string;

  override ngOnInit(): void {
    super.ngOnInit();
    this.metroFormControl.control.valueChanges.subscribe((value) => {
      this.input.nativeElement.value = this.getJalaliValue(value);
    });
  }

  getJalaliValue(date: any) {
    let MomentDate = moment(date);
    return MomentDate.isAfter(moment('1900-01-01')) ? MomentDate.locale('fa').format('YYYY/MM/DD') : undefined;
  }

  onValueChaged($event: any) {
    let MomentDate = moment(this.input.nativeElement.value, 'jYYYY/jMM/jDD');
    this.metroFormControl.control.setValue(MomentDate.toDate(), { emitEvent: false });
  }
}
