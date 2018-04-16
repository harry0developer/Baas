import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditJobPage } from './edit-job';

@NgModule({
  declarations: [
    EditJobPage,
  ],
  imports: [
    IonicPageModule.forChild(EditJobPage),
  ],
})
export class EditJobPageModule {}
