import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { UserDetailsPage } from '../user-details/user-details';

@IonicPage()
@Component({
  selector: 'page-appointments',
  templateUrl: 'appointments.html',
})
export class AppointmentsPage {
  appointmentSegment: string = 'offered';
  profile: any;
  users: any;
  appointments: any = [];
  myAppointments: any = [];
  uploads: string = '';
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public dataProvider: DataProvider, public ionEvents: Events) {  
      this.profile = JSON.parse(localStorage.getItem('user'));  
      this.uploads = this.dataProvider.getMediaLink();
    }
    
  ionViewDidLoad() {
    this.dataProvider.presentLoading();
    this.dataProvider.loadAppointments().then(res => {
      res.map(aUser =>  {
        if(this.profile.type === 'Recruiter'){
          if( aUser.employer_id_fk == this.profile.user_id){
            this.appointments.push(aUser);
          }
        }else if(this.profile.type === 'Candidate'){
          if( aUser.user_id_fk == this.profile.user_id){
            this.myAppointments.push(aUser);
          }
        }
      })
    }).then(() => {
      this.dataProvider.dismissLoading();
      this.dataProvider.loadUsers().then(res => {
        this.mapUserWithAppointments(res, this.myAppointments);
      }).catch(err => {
        this.dataProvider.dismissLoading();
        console.log(err);
      });
    })
    .catch(err => {
      this.dataProvider.dismissLoading();
      console.log(err);
    });

    this.ionEvents.subscribe('appointments:updated', (res) => {
      this.appointments = res;
      this.myAppointments = res;
      console.log(res);
    });

  }

  mapUserWithAppointments(users, app){
    app.map(aUser => {
      users.map(user => {
        if(aUser.employer_id_fk == user.user_id && aUser.user_id_fk == this.profile.user_id){ //Candidate
          let usa = Object.assign({}, user, aUser);
          this.myAppointments.push(usa);
        }
        else if(aUser.user_id_fk == user.user_id && aUser.employer_id_fk == this.profile.user_id){ //recruiter
          let usa = Object.assign({}, user, aUser);
          this.appointments.push(usa);
        }
      })
    })
  }

  viewUserProfile(user){
    this.navCtrl.push(UserDetailsPage, {user: user, page: 'AppointmentsPage'});
  }

}
