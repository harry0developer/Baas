import { Component } from '@angular/core';
import { DataProvider } from '../../providers/data/data';
import { IonicPage, NavController, NavParams, Events, ModalController, ActionSheetController } from 'ionic-angular';
import { EditProfilePage } from '../edit-profile/edit-profile';

@IonicPage()
@Component({
  selector: 'page-user-details',
  templateUrl: 'user-details.html',
})
export class UserDetailsPage {
    
  data:any = []; 
  profile: any; //me
  user: any; //current viewed profile
  page: string;
  ratings: any; 
  applied: boolean; 
  
  constructor(public navCtrl: NavController, public dataProvider: DataProvider, public actionSheetCtrl: ActionSheetController,
    public ionEvents: Events, public navParams: NavParams, public modalCtrl: ModalController) {
  }

  ionViewDidLoad() { 
    this.page = this.navParams.get('page');
    this.profile = JSON.parse(localStorage.getItem('user'));
    this.user = this.navParams.get('user');
    this.page = "Employer";
    this.hasBeenHired(this.user);
    console.log(this.user);
  }
 
  offerUserEmployment(user){
    this.dataProvider.presentLoading("Please wait...");
    let data = { 
      employer_id_fk: this.profile.user_id, 
      user_id_fk: user.user_id,
      status: "Job offered", //"Job Rejected" , "Job Accepted"
      last_update: this.dataProvider.getDate()
    }
    this.dataProvider.postData(data, 'addToAppointments').then(res => {
      let result
      result = res;
      if(result && result.data){
        this.dataProvider.dismissLoading();
        this.dataProvider.appointments = null;
        this.ionEvents.publish("appointments:updated", result.data);
        this.hasBeenHired(user);
        this.dataProvider.presentToast("Appointment has been made successfully");
      }else{
        this.dataProvider.dismissLoading();
        this.dataProvider.presentAlert("Job offer Failed", result.error);
      }
    }).catch(err => {
      console.log(err);
    })

  }

  removeUserEmployment(user){
    this.dataProvider.presentLoading("Please wait...");
    let data = { 
      employer_id_fk: this.profile.user_id, 
      user_id_fk: user.user_id,
      status: "Job offered", 
      last_update: this.dataProvider.getDate()
    }
    this.dataProvider.postData(data, 'removeUserFromAppointments').then(res => {
      this.dataProvider.dismissLoading();
      let results;
      results = res;
      if(results && results.data){
        this.dataProvider.appointments = null;
        this.ionEvents.publish("appointments:updated", results.data);
        this.applied = !this.applied;
        this.dataProvider.presentToast("Appointment has been cancelled");
      } 
      else{ 
          console.log(res);
      }
    }).catch(err => {
      this.dataProvider.dismissLoading();
      console.log(err);
    })
  }

  hasBeenHired(user){ 
    this.dataProvider.loadAppointments().then(appointments => {
      console.log(appointments);
      appointments.forEach(app => {
        if(app.user_id_fk === user.user_id && app.employer_id_fk === this.profile.user_id){
          this.applied = true;
          console.log("You have appointed this user: ");
        }
      }); 
    }).catch(err => {
      console.log(err);
    });
  }

  confirmWithdrawAppointment(user) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'You are about to cancel appointment',
      buttons: [
        {
          text: 'Cancel Appointment',
          role: 'destructive',
          handler: () => {
            this.removeUserEmployment(user);
          }
        },
        {
          text: 'Keep Appointment',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
 
    actionSheet.present();
  }
 
}
