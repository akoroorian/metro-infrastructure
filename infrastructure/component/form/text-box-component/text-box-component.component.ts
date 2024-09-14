import { Component } from '@angular/core';
import { FormBaseComponentComponent } from '../form-base-component/form-base-component.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-text-box-component',
  standalone: true,
  imports: [ReactiveFormsModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './text-box-component.component.html',
  styleUrls: [
    '../form-base-component/form-base-component.component.css',
    './text-box-component.component.css'
  ]
})
export class TextBoxComponentComponent extends FormBaseComponentComponent {
}
