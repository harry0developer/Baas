import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { JobsPage } from '../pages/jobs/jobs';
import { AppointmentsPage } from '../pages/appointments/appointments';
import { TermsPage } from '../pages/terms/terms';
import { LoginPage } from '../pages/login/login';
// import { SetupPage } from '../pages/setup/setup';
import { MyJobsPage } from '../pages/my-jobs/my-jobs'; 
import { CandidatesPage } from '../pages/candidates/candidates';

// import { ProfilePage } from '../pages/profile/profile';
import { DataProvider } from '../providers/data/data';
import { ProfilePage } from "../pages/profile/profile";
import { UploadImageProvider } from '../providers/upload-image/upload-image';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoginPage;

  pages: Array<{title: string, component: any}>;
  pages2: any = {}; 
  profile: any;
  uploads: string = '';
  constructor(public platform: Platform, public statusBar: StatusBar, public uploadImageProvider: UploadImageProvider,
    public ionEvents: Events, public splashScreen: SplashScreen, public dataProvider: DataProvider) {
    this.initializeApp();
  
    this.ionEvents.subscribe("user:loggedIn", (res) => {
      this.profile = res;
    });

    this.pages2 = {
      jobsPage: JobsPage,
      candidatesPage:CandidatesPage,
      profilePage: ProfilePage,
      appointmentPage: AppointmentsPage,
      myJobsPage: MyJobsPage,
      termsPage: TermsPage,
      loginPage: LoginPage
    } 

  }

  initializeApp() {

    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.profile = JSON.parse(localStorage.getItem('user'));
      // this.dataProvider.getLocation();
      this.uploads = this.dataProvider.getMediaLink();
      
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }

  loadProfile(page,user){
    this.nav.setRoot(page.component);
  }

  logout(){
    localStorage.removeItem('user');
    this.nav.setRoot(LoginPage);
  }
  
  pathForImage(path) {
    this.uploadImageProvider.pathForImage(path);
  }

}
