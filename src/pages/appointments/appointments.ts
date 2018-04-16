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

  recAppointments: any;
  canAppointments: any;

  recruiterAppointments: any = [];
  candidateAppointments: any = [];
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
            this.recruiterAppointments.push(aUser);
          }
        }
        if(this.profile.type === 'Candidate'){
          if( aUser.user_id_fk == this.profile.user_id){
            this.candidateAppointments.push(aUser);
          }
        }
      })
    }).then(() => {
      this.dataProvider.dismissLoading();
      this.dataProvider.loadUsers().then(users => {
        this.users = users;
        this.recruiterAppointments && this.recruiterAppointments.length > 0 ? this.mapUserWithAppointments(users, this.recruiterAppointments) : this.mapUserWithAppointments(users, this.candidateAppointments)
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
      this.mapUserWithAppointments(this.users, res);
    });

  }
 

  mapUserWithAppointments(users, app){
    this.recAppointments = [];
    this.canAppointments = [];
    app.map(aUser => {
      users.map(user => {
        if(aUser.employer_id_fk === user.user_id){ //Candidate
          // let usa = Object.assign({}, user, aUser);
          this.canAppointments.push(user);
        }
        else if(aUser.user_id_fk === user.user_id){ //recruiter
          // let usa = Object.assign({}, user, aUser);
          this.recAppointments.push(user);
        }
      })
    }); 
  }

  viewUserProfile(user){
    this.navCtrl.push(UserDetailsPage, {user: user, page: 'AppointmentsPage'});
  }

}
