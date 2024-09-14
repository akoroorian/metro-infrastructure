import { QuestionChoiceType } from './../../../domain/enum/question-choice-type';
import { Component, Input, inject } from '@angular/core';
import { FormBaseComponentComponent } from '../form-base-component/form-base-component.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { FileService } from '../../../service/file.Service';
import { MetroFormControl } from '../../../domain/metro-form-control';
import { ServiceResult } from '../../../domain/service-result';
import { MessageService } from '../../../service/message.service';

@Component({
  selector: 'app-file-upload-component',
  standalone: true,
  imports: [ReactiveFormsModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './file-upload.component.html',
  styleUrls: [
    '../form-base-component/form-base-component.component.css',
    './file-upload.component.css'
  ]
})
export class FileUploadcomponent extends FormBaseComponentComponent {
  fileName?: string;
  @Input() fileUploaded?: (fc: MetroFormControl, uploadResult: any) => void;
  protected fileService = inject(FileService);

  protected messageService = inject(MessageService);

  onFileSelected(event: any) {
    const file: File = event.target?.files[0];
    if (file) {
      this.fileName = file.name;
      this.fileService.post(file)
        ?.subscribe({
          next: (serviceResult: ServiceResult<any>) => {
            let value = undefined;
            if (serviceResult?.isSuccess) {
              value = this.getValue(serviceResult.result, this.metroFormControl.column?.lookup?.field);
            }
            // else {
            //   this.messageService.send({ type: QuestionChoiceType.normal, text: serviceResult.message ?? "" });

            // }
            this.metroFormControl.control.setValue(value);
            this.fileUploaded?.(this.metroFormControl, serviceResult.result);
          }, error: (error) => {
            // Handle the error here, e.g., show a toast
            this.messageService.send({ type: QuestionChoiceType.error, text: error.error.message ?? "" });
          }
        });
    }
  }
}

