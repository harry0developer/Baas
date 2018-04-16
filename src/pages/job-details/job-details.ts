import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, ActionSheetController } from 'ionic-angular';
import * as moment from 'moment';
import { DataProvider } from '../../providers/data/data';

@IonicPage()
@Component({
  selector: 'page-job-details',
  templateUrl: 'job-details.html',
})
export class JobDetailsPage {
  job: any;
  user: any; 
  post_time: string;
  profile: any;
  jobs: any;
  jobsApplied: any;
  applied: boolean;
  hasViewed: boolean = false;
  didView: boolean;
  viewedJobs: any;
  countViews: number = 0;
  countShared: number = 0;
  countApplied: number;
  constructor(public navCtrl: NavController, public ionEvent: Events, public actionSheetCtrl: ActionSheetController,
    public dataProvider: DataProvider, public navParams: NavParams) { 
    this.applied = false;
  }
    
  ionViewDidLoad(){
    this.job = this.navParams.get('job');
    this.profile = JSON.parse(localStorage.getItem("user"));
    this.hasApplied();
    this.post_time = moment(this.job.date_created, "YYYYMMDD").fromNow();  
    this.didView = false;
    this.hasViewedJob();
  }

  
  applyNow(job){
    this.dataProvider.presentLoading("Please wait...");
    let data = {
      user_id_fk: this.profile.user_id,
      job_id_fk: job.job_id, 
      employer_id_fk: job.user_id_fk,
      date_applied: this.dataProvider.getDate()
    }
    this.dataProvider.postData(data, 'addJobToApplicants').then(res => {
      this.dataProvider.dismissLoading();
      let results;
      results = res;
      if(results && results.data){
        this.dataProvider.appliedJobs = null;
        this.ionEvent.publish("user:applied", results.data);
        this.dataProvider.presentToast("You have successfully applied for this job");
        this.hasApplied();
        console.log(res);
      }else{
        this.dataProvider.presentToast("Oops, Something went wrong");
        console.log(res);
      }
    }).catch(err => {
      this.dataProvider.dismissLoading();
      console.log(err);
    })
  }


  deleteApplication(job){
    let data = { 
      user_id_fk: this.profile.user_id,
      employer_id_fk: job.user_id_fk,
      job_id_fk: job.job_id
    }
    console.log(data);
  }

  withdrawApplication(job){
    this.dataProvider.presentLoading("Please wait...");
    let data = { 
      user_id_fk: this.profile.user_id,
      employer_id_fk: job.user_id_fk,
      job_id_fk: job.job_id
    }
    this.dataProvider.postData(data, 'removeJobFromApplicants').then(res => {
      this.dataProvider.dismissLoading();
      let results;
      results = res;
      if(results && results.data){
        this.dataProvider.appliedJobs = null;
        this.ionEvent.publish("user:applied", results.data);
        this.countAppliedUsers(results.data);
        this.applied = !this.applied;
        this.dataProvider.presentToast("Your application has been removed successfully");
      } 
      else{ 
          console.log(res);
      }
    }).catch(err => {
      this.dataProvider.dismissLoading();
      console.log(err);
    })
  }
  
  countAppliedUsers(list){
    let counter = 0;
    list.forEach(job => {
      if(job.job_id_fk == this.job.job_id){
        counter++;
      }
    });

    this.countApplied = counter;
  }

  hasApplied(){ 
    this.dataProvider.loadAppliedJobs().then(res => {
      this.jobsApplied = res;
      this.countAppliedUsers(res);
      res.forEach(aJob => {
        if(aJob.job_id_fk == this.job.job_id && this.profile.user_id == aJob.user_id_fk){
          this.applied = true;
          console.log("You applied for "+ this.job.title);
        }
      });
    });
  }
 
 hasViewedJob(){
  this.dataProvider.loadViewedJobs().then(res => {
    this.viewedJobs = res;
    if(res && this.viewedJobs.length > 0){
      this.countJobViews(this.viewedJobs);
      for(let i=0; i<this.viewedJobs.length; i++){
        if(res[i].job_id_fk == this.job.job_id && this.profile.user_id == res[i].user_id_fk){
          this.didView = true;
        }
      }
      if(!this.didView){
        this.addToViewedHelper();
      }
    }
    else{
      this.addToViewedHelper();
    }
  })
 }

  countJobViews(viewed){
    let count = 0;
    viewed.forEach(v => {
      if(v.job_id_fk == this.job.job_id){
        count++;
      }
    });
    this.countViews = count;
  }

  addToViewedHelper(){
    let data = {
      user_id_fk: this.profile.user_id,
      job_id_fk: this.job.job_id,
      date_viewed: this.dataProvider.getDate(),
      status: 'Active'
    }
    this.dataProvider.postData(data, "addToJobViews").then(res => {
      let results;
      results = res;
      this.viewedJobs = results.data;
      this.countJobViews(results.data);
    })
  }
  


  getSkills(skills){
    return skills.split(',');
  }

  confirmWithdrawApplication(job) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'You are about to withdraw job application',
      buttons: [
        {
          text: 'Withdraw Application',
          role: 'destructive',
          handler: () => {
            this.withdrawApplication(job);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
 
    actionSheet.present();
  }
 
  shareJob(job) {
    const state = this.dataProvider.shareJobActionSheet(job, this.profile);
    console.log(state);
  }

}
