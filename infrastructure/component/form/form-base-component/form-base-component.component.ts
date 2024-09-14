import { Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MetroFormControl } from '../../../domain/metro-form-control';

@Component({
  selector: 'app-form-base-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-base-component.component.html',
  styleUrl: './form-base-component.component.css'
})
export class FormBaseComponentComponent implements OnInit {
  @Input()
  metroFormControl!: MetroFormControl;

  ngOnInit(): void {
  }

  getValue(item: any | undefined, propName: string | undefined) {
    return (item as any) && (propName) ? (item as any)[propName] : undefined;
  }

}
