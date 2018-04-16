import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, ModalController } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { JobDetailsPage } from '../job-details/job-details';
import { StatsPage } from '../stats/stats';
import { EditJobPage } from '../edit-job/edit-job';

@IonicPage()
@Component({
  selector: 'page-my-jobs',
  templateUrl: 'my-jobs.html',
})
export class MyJobsPage {
  data: any;
  jobs: any;
  users: any;
  myJobs: any = [];
  myAppliedJobs: any = [];
  jobsViewed: any = [];
  suspendedJobs: any = [];
  profile: any;
  postedJobs: any; 
  myJobsSegment: string = 'applied';
  
  constructor(public navCtrl: NavController,public ionEvents: Events,
    public dataProvider: DataProvider, public modalCtrl: ModalController,
    public navParams: NavParams) {
    this.profile = JSON.parse(localStorage.getItem("user"));
    this.getAllAppliedJobs();  
    this.getAllUsers();
  }
  
  ionViewDidLoad() { 
    this.dataProvider.presentLoading();
    this.getAllAppliedJobs();
    this.getAllUsers();  
    this.getMyPostedJobs();
    this.ionEvents.subscribe("user:applied", (res) => {
      this.getAppliedJobs(res);  
    }); 

    //====Candidate ===
    this.getViewedJobs();
    this.dataProvider.dismissLoading();
  }

  mapJobs(jobs, aJobs){
    let list = [];
    if(this.profile.type === "Candidate"){
      jobs.forEach(job => {
        aJobs.forEach(aJob => {
          if(job.job_id == aJob.job_id_fk && aJob.user_id_fk == this.profile.user_id){
            list.push(job);
          }
        }); 
      });
      return list;
    }
    else if(this.profile.type === "Recruiter"){
      jobs.forEach(job => {
        aJobs.forEach(aJob => {
          if(job.job_id == aJob.job_id_fk && aJob.recruiter_id_fk == this.profile.user_id){
            list.push(job);
          }
        }); 
      });
      return list;
    }

  }

//  Recruiter
  getMyPostedJobs(){
    let list = [];
    this.dataProvider.loadJobs().then(res => {
      this.jobs = res;
      res.forEach(job => {
        if(job.user_id_fk == this.profile.user_id){
          job.viewedUsers = this.countJobViews(job);
          job.appliedUsers = this.countApplied(job);
          list.push(job);
        }
      });
      this.postedJobs = list;
    })
  }

  countJobViews(job){
    let views;
    let vJobs = [];
    let users = [];
    this.dataProvider.loadViewedJobs().then(res => {
      views = res;
      views.forEach(vJob => {
        if(job.job_id == vJob.job_id_fk){
          vJobs.push(vJob)
        }
      });
      if(this.users){
        this.users.forEach(user => {
          vJobs.forEach(vUsa => {
            if(vUsa.user_id_fk == user.user_id){
              users.push(user);
            }
          })
        });
      }
    });
    return users;
  }

  countApplied(job){
    let aJobs = [];
    let users = [];
    this.dataProvider.loadAppliedJobs().then(res => {
      res.forEach(aJob => {
        if(job.job_id == aJob.job_id_fk){
          aJobs.push(aJob)
        }
      });
      if(aJobs){
        aJobs.forEach(aUser => {
          if(this.users){
            this.users.forEach(user => {
              if(aUser.user_id_fk == user.user_id){
                users.push(user);
              }
            });
          }else{
            this.dataProvider.loadUsers().then(res => {
              this.users = res;
              this.users.forEach(user => {
                if(aUser.user_id_fk == user.user_id){
                  users.push(user);
                }
              });
            })
          }
        });
      }
      job.appliedUsers = users;
      return job;
    });
    return job;
  }

  getAllAppliedJobs(){
    this.dataProvider.loadJobs().then(allJobs => {
      this.jobs = allJobs;
      this.dataProvider.loadAppliedJobs().then(appliedJob => {
        this.myAppliedJobs = this.mapJobs(allJobs, appliedJob);
      });
    })
  }

  getAllUsers(){
    this.dataProvider.loadUsers().then(res => {
      this.users = res;
    })
  }

  getAppliedJobs(res){
    this.dataProvider.loadJobs().then(all => {
      this.jobs = all;
      this.myAppliedJobs = this.mapJobs(all, res);
    })
  } 
  
  jobDetails(job){
    if(this.profile.type === "Candidate"){
      this.navCtrl.push(JobDetailsPage, {job:job});
    }else{
      this.navCtrl.push(StatsPage, {job:job});
    }
  }
 
  editJobDetails(job){
    let filter = this.modalCtrl.create(EditJobPage, { job:job });
    filter.onDidDismiss(job => {
      console.log(job); //publish event
    });
    filter.present();
  }

  //======== CANDIDATE =========

  getViewedJobs(){
    let views = [];
    this.dataProvider.loadViewedJobs().then(res => {
      let results;
      results = res;
      let activeJobs = [];
      let suspendedJobs = [];
      results.forEach(job => {
        if(job.user_id_fk == this.profile.user_id){
          views.push(job);
        } 
      });
      this.dataProvider.loadJobs().then(jobs => {
        jobs.forEach(job => {
          views.forEach(jView => {
            if(job.job_id === jView.job_id_fk && jView.status === 'Active'){
              activeJobs.push(job);
            }
            else if(job.job_id === jView.job_id_fk && jView.status === 'Suspended'){
              suspendedJobs.push(job);
            }
          });
        });
      }).then(() => {
        this.jobsViewed = activeJobs;
        this.suspendedJobs = suspendedJobs;
      });
    });
  }

  closeSlide(slider) {
    slider.close();
  }

  shareJob(slider, job) {
    this.dataProvider.shareJobActionSheet(job, this.profile);
    this.closeSlide(slider);
  }

  viewJobDetails(job) {
    this.navCtrl.push(JobDetailsPage, {job:job});
  }

  updateViewJobsStatus(slider, job, status) {
    this.dataProvider.presentLoading();
    let data = {
      status: status,
      job_id_fk: job.job_id,
      user_id_fk: this.profile.user_id,
    }
    this.dataProvider.postData(data, "updateJobViewStatus").then(res => {
      this.dataProvider.dismissLoading();
      let results;
      results = res;
      this.getViewedJobs();
      this.closeSlide(slider);
    }).catch(err => {
      this.dataProvider.dismissLoading();
      console.log(err);
    })
  }

}
