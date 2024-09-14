import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBaseComponentComponent } from '../form-base-component/form-base-component.component';
import { ReactiveFormsModule } from '@angular/forms';
import { KeyValue, KeyValuePipe } from '@angular/common';
import { ClickOutsideDirective } from '../../../directive/click-outside.directive';

@Component({
  selector: 'app-drop-down-component',
  standalone: true,
  imports: [ReactiveFormsModule, ReactiveFormsModule, KeyValuePipe, ClickOutsideDirective],
  templateUrl: './drop-down-component.component.html',
  styleUrls: [
    '../form-base-component/form-base-component.component.css',
    './drop-down-component.component.css'
  ]
})
export class DropDownComponent extends FormBaseComponentComponent {
  isMenuOpened: boolean = false;
  toggleMenu(): void {
    if (!(this.metroFormControl.column?.readonly || this.metroFormControl.column?.disabled))
      this.isMenuOpened = !this.isMenuOpened;
  }

  clickedOutside(): void {
    this.isMenuOpened = false;
  }

  isValidEnumMember(option: KeyValue<string, string | number>) {
    return !isNaN(Number(option.key));
  }

  onSelected(option: KeyValue<string, string | number> | undefined) {
    this.metroFormControl.control.setValue(option?.key);
    this.isMenuOpened = false;
  }

  getEnumValueByKey(key: any) {
    if (key === true || key === 'true')
      key = 1;
    else if (key === false || key === 'false')
      key = 0;
    return this.metroFormControl.column?.enum?.[key] ?? "نامشخص";
  }

}
