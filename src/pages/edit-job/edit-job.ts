import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { AutocompletePage } from '../autocomplete/autocomplete';

@IonicPage()
@Component({
  selector: 'page-edit-job',
  templateUrl: 'edit-job.html',
})
export class EditJobPage {
  data:any = {
    title: '',
    category: '',
    skills: '',
    type: '',
    experience: '',
    salary: '',
    frequency: '',
    address: '',
    lat: '',
    lng: '',
    description: '',
  };
  categories: any = [];  
  skills: any = [];
  address;
  profile: any;
  job: any = {};
  
  constructor(public navCtrl: NavController,private dataProvider: DataProvider, public viewCtrl: ViewController,
    public modalCtrl: ModalController, public navParams: NavParams) {
      
    }
    
    ionViewDidLoad() {
      this.dataProvider.getCategories().then(res => {
        this.categories = res;
      });
      
      this.profile = JSON.parse(localStorage.getItem("user"));
      
      this.job = this.navParams.get("job");
      
      console.log(this.data);
      this.data = {
        title: this.job.title,
        category: this.job.category,
        skills: this.job.skills.split(","),
        type: this.job.type,
        experience: this.job.experience,
        salary: this.job.salary,
        frequency: this.job.frequency,
        address: this.job.address,
        lat: this.job.lat,
        lng: this.job.lng,
        description: this.job.description,
      };
      this.skills = this.job.skills.split(',');
  }
 
  dismiss(){
    this.viewCtrl.dismiss();
  } 

  selectedCategory(cat){
    this.categories.forEach(cate => {
      if(cate.name == cat){
        this.skills = cate.skills;
      }
    });
  }
 
  updateJobDetails(){
    this.dataProvider.presentLoading("Please wait...");
    let res;  
 
    if(this.data && this.data.skills ){
      this.data.skills = this.data.skills.toString();
    }
    this.data.date_created = this.dataProvider.getDate();
    this.data.user_id = this.profile.user_id;
    this.data.job_id = this.job.job_id;

   
    this.dataProvider.postData(this.data, "updateJobDetails").then((result) => {
      res = result;
      if(res && res.error){
        this.dataProvider.dismissLoading();
        this.dataProvider.presentAlert("Updating job failed", res.error.text);
      }else{ 
        this.dataProvider.dismissLoading();
        this.viewCtrl.dismiss(res.data);
      }
    }).catch(err => {
      console.log(err);
      this.dataProvider.dismissLoading();
    })
  }


  showAddressModal () {
    let modal = this.modalCtrl.create(AutocompletePage);
    modal.onDidDismiss(data => {
      if(data){
        this.data.address = data.address;
        this.data.lat = data.lat;
        this.data.lng = data.lng;
      }
    });
    modal.present();
  }  

}
