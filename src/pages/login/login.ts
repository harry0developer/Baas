import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams, Events } from 'ionic-angular';
import { SignupPage } from '../signup/signup';
import { DataProvider } from '../../providers/data/data';
import { JobsPage } from '../jobs/jobs';
import { CandidatesPage } from '../candidates/candidates';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  data: any = {email: "", password:""}; 
  profile: any;
  constructor(public navCtrl: NavController, public dataProvider:DataProvider, public modalCtrl: ModalController, 
    public ionEvents: Events, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.dataProvider.presentLoading("Logging in...");
    this.profile = JSON.parse(localStorage.getItem('user'));
    if(this.profile != null){
      this.dataProvider.dismissLoading();
      this.ionEvents.publish("user:loggedIn", this.profile);
      localStorage.setItem('user', JSON.stringify(this.profile));
      if(this.profile.type === "Recruiter"){
        this.navCtrl.setRoot(CandidatesPage);
      }
      else{
        this.navCtrl.setRoot(JobsPage)
      }
    }else{
      this.dataProvider.dismissLoading();
    }
  }

  login(){
    this.dataProvider.presentLoading("Logging in...");
    let res; 
    this.data.lastSeen = this.dataProvider.getDate();
    this.dataProvider.postData(this.data,'login').then((result) => {
      res = result;
      if(res && res.error){
        this.dataProvider.dismissLoading();
        this.dataProvider.presentAlert("Login Failed", "Email and Password do not match");
      }else{
        this.dataProvider.dismissLoading();
        localStorage.setItem('user', JSON.stringify(res.data));
        this.ionEvents.publish("user:loggedIn", res.data);
        if(res.data.type === "Recruiter"){
          this.navCtrl.setRoot(CandidatesPage);
        }
        else{
          this.navCtrl.setRoot(JobsPage)
        }
      }
    }).catch(err => {
      console.log(err);
      this.dataProvider.dismissLoading();
    })
  }

  signup(){ 
    this.navCtrl.setRoot(SignupPage);
  }

  forgotPassword(){
    this.navCtrl.setRoot(ForgotPasswordPage);
  }

}
