import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBaseComponentComponent } from '../form-base-component/form-base-component.component';
import { ReactiveFormsModule } from '@angular/forms';
import { KeyValue, KeyValuePipe } from '@angular/common';
import { ClickOutsideDirective } from '../../../directive/click-outside.directive';

@Component({
  selector: 'app-check-box-component',
  standalone: true,
  imports: [ReactiveFormsModule, ReactiveFormsModule, KeyValuePipe, ClickOutsideDirective],
  templateUrl: './check-box-component.component.html',
  styleUrls: [
    '../form-base-component/form-base-component.component.css',
    './check-box-component.component.css'
  ]
})
export class CheckBoxComponent extends FormBaseComponentComponent {
  isValidEnumMember(option: KeyValue<string, string | number>) {
    return !isNaN(Number(option.key));
  }

  onSelected(option: KeyValue<string, string | number> | undefined) {
    if (!(this.metroFormControl.column?.readonly || this.metroFormControl.column?.disabled)) {
      if (this.metroFormControl.column?.type == "bool") {
        let value = option?.key == "1" ? true : false;
        this.metroFormControl.control.setValue(value);
      }
      else
        this.metroFormControl.control.setValue(option?.key);
    }
  }

  getEnumKey(key: any) {
    if (key === true || key === 'true')
      key = 1;
    else if (key === false || key === 'false')
      key = 0;
    return key;
  }

  getEnumValueByKey(key: any) {
    key = this.getEnumKey(key);
    return this.metroFormControl.column?.enum?.[key] ?? "نامشخص";
  }

}
