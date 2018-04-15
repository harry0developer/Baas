<?php
// if (isset($_SERVER['HTTP_ORIGIN'])) {
//     header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
//     header('Access-Control-Allow-Credentials: true');
//     header('Access-Control-Max-Age: 86400');    // cache for 1 day
// }
// // Access-Control headers are received during OPTIONS requests
// if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
//     if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
//         header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         
//     if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
//         header("Access-Control-Allow-Headers:        {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
//     exit(0);
// }
require 'config.php';
require 'Slim/Slim.php';
// require_once('phpmailer/class.phpmailer.php');
// require_once('phpmailer/class.smtp.php');
require_once('mailer/PHPMailerAutoload.php');
// require 'PHPMailer.php';
\Slim\Slim::registerAutoloader();
$app = new \Slim\Slim();
 
$app->post('/getUsers','getUsers'); 
$app->post('/getExperiences','getExperiences');  
$app->post('/getSkills','getSkills');  
$app->post('/getEducation','getEducation');  
$app->post('/getJobs','getJobs'); 
$app->post('/login','login');  
$app->post('/sendOTP','sendOTP');  
$app->post('/signup','signup');  
$app->post('/addJob','addJob');  
$app->post('/addToAppointments','addToAppointments');  
$app->post('/getAppointments','getAppointments');   
$app->post('/newRatings','newRatings');   
$app->post('/updateRatings','updateRatings');   
$app->post('/getRaters','getRaters');   
$app->post('/getAppliedJobs','getAppliedJobs');   
$app->post('/getViewedJobs','getViewedJobs');   
$app->post('/addJobToApplicants','addJobToApplicants');   
$app->post('/addToJobViews','addToJobViews');   
$app->post('/removeJobFromApplicants','removeJobFromApplicants');   
$app->post('/removeUserFromAppointments','removeUserFromAppointments');
$app->post('/updateJobViewStatus','updateJobViewStatus');   
$app->post('/uploadProfilePicture','uploadProfilePicture');
$app->post('/updatePictureUrl','updatePictureUrl');   

$app->run();

/*========= UPLOAD PROFILE PIC =============*/
function uploadProfilePicture(){

    $temp = explode(".", $_FILES["file"]["name"]);
    $newfilename = $newfilename = sha1(uniqid(mt_rand(), true)) . '.' .end($temp);
    if(move_uploaded_file($_FILES["file"]["tmp_name"],  "uploads/users/".$newfilename)){
        echo $newfilename; 
    }else{
        echo '{"error":"Proifile picture upload failed"}';
    }

}

//========= UPDATE USER PROFILE PIC URL ======
function updatePictureUrl(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());

    $email = $data->email; 
    $picture = $data->url;

    try { 

        $email_check = preg_match('~^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.([a-zA-Z]{2,4})$~i', $email);
        
        if ( strlen(trim($email))>0 && $email_check>0)
        {
            $db = getDB();
            $userData = '';
            $sql = "SELECT user_id FROM Users WHERE email=:email";
            $stmt = $db->prepare($sql);
            $stmt->bindParam("email", $email,PDO::PARAM_STR);
            $stmt->execute();
            $mainCount=$stmt->rowCount();
            if($mainCount==1)
            {  
                $sql1="UPDATE Users SET picture=:picture WHERE email=:email";

                $stmt1 = $db->prepare($sql1);
                $stmt1->bindParam("email", $email,PDO::PARAM_STR);
                $stmt1->bindParam("picture", $picture,PDO::PARAM_STR);
                 
                $stmt1->execute();
                $userData=internalUserDetails($email);
            }  
            $db = null;
            if($userData){
                $userData = json_encode($userData);
                echo '{"data": ' .$userData . '}';
            }else {
               echo '{"error":{"text":"Email '.$email.' already registered"}}';
            }
        }
        else{
            echo '{"error":{"text":"Enter valid data"}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

/* ### internal Username Details ### */
function internalUserDetails($input) {
    
    try {
        $db = getDB();
        $sql = "SELECT * FROM Users WHERE email=:input";
        $stmt = $db->prepare($sql);
        $stmt->bindParam("input", $input,PDO::PARAM_STR);
        $stmt->execute();
        $usernameDetails = $stmt->fetch(PDO::FETCH_OBJ);
        $usernameDetails->token = apiToken($usernameDetails->user_id);
        $db = null;
        return $usernameDetails;
        
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
    
}
   
function login() { 
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $email = $data->email; 
    $password = $data->password;
    try { 
        $email_check = preg_match('~^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.([a-zA-Z]{2,4})$~i', $email);
        $password_check = preg_match('~^[A-Za-z0-9!@#$%^&*()_]{6,20}$~i', $password);
        
        if (strlen(trim($password))>0 && strlen(trim($email))>0 && $password_check>0 && $email_check>0)
        {
            $db = getDB();
            $user = '';
            $sql = "SELECT user_id FROM Users WHERE email=:email and password=:password";
            $stmt = $db->prepare($sql);
            $stmt->bindParam("email", $email,PDO::PARAM_STR);
            $password=hash('sha256',$data->password);
            $stmt->bindParam("password", $password,PDO::PARAM_STR);
            $stmt->execute();
            $mainCount=$stmt->rowCount();
            $created=time();
            if($mainCount==1)
            { 
                $user = userData($email);  
                if($user){
                    $user = json_encode($user);
                    echo '{"data": ' .$user . '}';
                }else {
                   echo '{"error":{"text":"Email '.$email.' already registered"}}';
                }
            }else{
                echo '{"error":{"text":"Email '.$email.' not registered"}}';
            }
            $db = null;
            
        }
        else{
            echo '{"error":{"text":"Enter valid data"}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function signup(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $firstname=$data->firstname;
    $lastname=$data->lastname;
    $dob=$data->dob;
    $race=$data->race;
    $nationality=$data->nationality;
    $id_number=$data->id_number;
    $gender=$data->gender;
    $title=$data->title;
    $disability=$data->disability;
    $criminal=$data->criminal;
    $crime_type=$data->crime_type;
    $disability_type=$data->disability_type;
    $type=$data->type;
    $email=$data->email;
    $password=$data->password;
    $phone=$data->phone;
    $address=$data->address;
    try { 
        $email_check = preg_match('~^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.([a-zA-Z]{2,4})$~i', $email);
        $password_check = preg_match('~^[A-Za-z0-9!@#$%^&*()_]{6,20}$~i', $password);
        
        if (strlen(trim($password))>0 && strlen(trim($email))>0 && $password_check>0 && $email_check>0)
        {
            $db = getDB();
            $userData = '';
            $sql = "SELECT user_id FROM Users WHERE email=:email";
            $stmt = $db->prepare($sql);
            $stmt->bindParam("email", $email,PDO::PARAM_STR);
            $stmt->execute();
            $mainCount=$stmt->rowCount();
            $created=time();
            if($mainCount==0)
            {  
                $sql1="INSERT INTO Users(firstname, lastname, dob, race, nationality, id_number, gender, title, disability, criminal, crime_type, disability_type, type, email, password, phone, address) 
                    VALUES (:firstname, :lastname, :dob, :race, :nationality, :id_number, :gender, :title, :disability, :criminal, :crime_type, :disability_type, :type, :email, :password, :phone, :address )";
 
                $stmt1 = $db->prepare($sql1);
                $stmt1->bindParam("firstname", $firstname,PDO::PARAM_STR);
                $stmt1->bindParam("lastname", $lastname,PDO::PARAM_STR);
                $stmt1->bindParam("dob", $dob,PDO::PARAM_STR);
                $stmt1->bindParam("race", $race,PDO::PARAM_STR);
                $stmt1->bindParam("nationality", $nationality,PDO::PARAM_STR);
                $stmt1->bindParam("id_number", $id_number,PDO::PARAM_STR);
                $stmt1->bindParam("gender", $gender,PDO::PARAM_STR);
                $stmt1->bindParam("title", $title,PDO::PARAM_STR);
                $stmt1->bindParam("disability", $disability,PDO::PARAM_STR);
                $stmt1->bindParam("criminal", $criminal,PDO::PARAM_STR);
                $stmt1->bindParam("crime_type", $crime_type,PDO::PARAM_STR);
                $stmt1->bindParam("disability_type", $disability_type,PDO::PARAM_STR);
                $stmt1->bindParam("type", $type,PDO::PARAM_STR);
                $stmt1->bindParam("email", $email,PDO::PARAM_STR);
                $password=hash('sha256',$password);
                $stmt1->bindParam("password", $password,PDO::PARAM_STR);
                $stmt1->bindParam("phone", $phone,PDO::PARAM_STR);
                $stmt1->bindParam("address", $address,PDO::PARAM_STR);
                $stmt1->execute();
                $userData=userData($email);
            }
            $db = null;
            if($userData){
                $userData = json_encode($userData);
                echo '{"data": ' .$userData . '}';
            }else {
               echo '{"error":{"text":"Email '.$email.' already registered"}}';
            }
        }
        else{
            echo '{"error":{"text":"Enter valid data"}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function updateRatings(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody()); 
 
    $rating_id = $data->rating_id;
    $rate = $data->rate;
    $date_rated = $data->date_rated;
    try { 
        if ( strlen(trim($rating_id))>0 )
        { 
            $db = getDB();
            $ratings = '';
            //UPDATE `Ratings` SET `rating_id`=[value-1],`rater_id`=[value-2],`user_id`=[value-3],`rate`=[value-4],`date_rated`=[value-5] WHERE 1
            $sql1="UPDATE Ratings SET rate=:rate, date_rated=:date_rated WHERE rating_id=:rating_id";
            $stmt1 = $db->prepare($sql1);
            $stmt1->bindParam("rating_id", $rating_id,PDO::PARAM_STR);
            $stmt1->bindParam("rate", $rate,PDO::PARAM_STR); 
            $stmt1->bindParam("date_rated", $date_rated,PDO::PARAM_STR); 
            $stmt1->execute();
            
            $ratings=getMyRaters();
            $db = null;
            if($ratings){
                $ratings = json_encode($ratings);
                echo '{"data": ' .$ratings . '}';
            }else {
               echo '{"error":{"text":"There are no raters yet."}}';
            }
         
        }else{
            echo '{"error":"Parameters not aligned"}';
        }
    }catch(PDOException $e) {
        echo '{"error":'. $e->getMessage() .'}';
    }
} 
function newRatings(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody()); 
 
    $rater_id = $data->rater_id;
    $user_id = $data->user_id;
    $rate = $data->rate;
    $date_rated = $data->date_rated;
    try { 
        if ( strlen(trim($rater_id))>0 && strlen(trim($user_id))>0 )
        { 
            $db = getDB();
            $ratings = ''; 
            $sql1="INSERT INTO Ratings(rater_id, user_id, rate, date_rated)
                VALUES(:rater_id, :user_id, :rate, :date_rated)";
            $stmt1 = $db->prepare($sql1);
            $stmt1->bindParam("rater_id", $rater_id,PDO::PARAM_STR);
            $stmt1->bindParam("user_id", $user_id,PDO::PARAM_STR);
            $stmt1->bindParam("rate", $rate,PDO::PARAM_STR); 
            $stmt1->bindParam("date_rated", $date_rated,PDO::PARAM_STR); 
            $stmt1->execute();
            
            $ratings=getMyRaters();
            $db = null;
            if($ratings){
                $ratings = json_encode($ratings);
                echo '{"data": ' .$ratings . '}';
            }else {
               echo '{"error":{"text":"There are no raters yet."}}';
            }
         
        }else{
            echo '{"error":"Parameters not aligned"}';
        }
    }catch(PDOException $e) {
        echo '{"error":'. $e->getMessage() .'}';
    }
} 
function getMyRaters(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    try {
        $ratings = '';
        $db = getDB();
        $sql = "SELECT * FROM Ratings WHERE 1";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $ratings = $stmt->fetchAll(PDO::FETCH_OBJ);
       
        $db = null;
        return $ratings;
        // echo '{"data": ' . json_encode($user) . '}';
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addToAppointments(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody()); 
 
    $user_id_fk = $data->user_id_fk;
    $employer_id_fk = $data->employer_id_fk;
    $status = $data->status;
    $last_update = $data->last_update;
    try { 
        if (  strlen(trim($employer_id_fk))>0 && strlen(trim($user_id_fk))>0 )
        { 
            $db = getDB();
            $apz = '';
            $sql1="INSERT INTO Appointments(user_id_fk, employer_id_fk, status, last_update)
                VALUES(:user_id_fk, :employer_id_fk, :status, :last_update)";
            $stmt1 = $db->prepare($sql1);
            $stmt1->bindParam("employer_id_fk", $employer_id_fk,PDO::PARAM_STR);
            $stmt1->bindParam("user_id_fk", $user_id_fk,PDO::PARAM_STR);
            $stmt1->bindParam("status", $status,PDO::PARAM_STR); 
            $stmt1->bindParam("last_update", $last_update,PDO::PARAM_STR); 
            $stmt1->execute();
            
            $apz=getMyAppointments($employer_id_fk);
            $db = null;
            if($apz){
                $apz = json_encode($apz);
                echo '{"data": ' .$apz . '}';
            }else {
               echo '{"error":{"text":"You have no appointments yet."}}';
            }
         
        }else{
            echo '{"error":"Parameters not aligned"}';
        }
    }catch(PDOException $e) {
        echo '{"error":'. $e->getMessage() .'}';
    }
} 
 
function getMyAppointments($id){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    try {
        $appointments = '';
        $db = getDB();
        $sql = "SELECT * FROM Appointments WHERE employer_id_fk='$id'";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $appointments = $stmt->fetchAll(PDO::FETCH_OBJ);
       
        $db = null;
        return $appointments;
        // echo '{"data": ' . json_encode($user) . '}';
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}


function addToJobViews(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody()); 
 
    $user_id_fk = $data->user_id_fk;
    $job_id_fk = $data->job_id_fk;
    $date_viewed = $data->date_viewed;
    $status = $data->status;
    try { 
        if (  strlen(trim($user_id_fk))>0 && strlen(trim($job_id_fk))>0 )
        { 
            $db = getDB();
            $views = ''; 
            $sql1="INSERT INTO JobViews(user_id_fk, job_id_fk, date_viewed, status)
                VALUES(:user_id_fk, :job_id_fk, :date_viewed, :status)";
            $stmt1 = $db->prepare($sql1);
            $stmt1->bindParam("job_id_fk", $job_id_fk,PDO::PARAM_STR);
            $stmt1->bindParam("user_id_fk", $user_id_fk,PDO::PARAM_STR);
            $stmt1->bindParam("date_viewed", $date_viewed,PDO::PARAM_STR); 
            $stmt1->bindParam("status", $status,PDO::PARAM_STR); 
            $stmt1->execute();
            
            $views=getAllDataFromTable('JobViews', $user_id_fk);
            $db = null;
            if($views){
                $views = json_encode($views);
                echo '{"data": ' .$views . '}';
            }else {
               echo '{"error":{"text":"You have not view a job yet."}}';
            }
         
        }else{
            echo '{"error":"Parameters not aligned"}';
        }
    }catch(PDOException $e) {
        echo '{"error":'. $e->getMessage() .'}';
    }
} 


function updateJobViewStatus(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody()); 
 
    $job_id_fk = $data->job_id_fk;
    $user_id_fk = $data->user_id_fk;
    $status = $data->status;
    try { 
        if (  strlen(trim($user_id_fk))>0 && strlen(trim($job_id_fk))>0 )
        { 
            $db = getDB();
            $views = ''; 
            $sql1="UPDATE JobViews SET status=:status WHERE user_id_fk=:user_id_fk and job_id_fk=:job_id_fk";
            $stmt1 = $db->prepare($sql1);
            $stmt1->bindParam("job_id_fk", $job_id_fk,PDO::PARAM_STR);
            $stmt1->bindParam("user_id_fk", $user_id_fk,PDO::PARAM_STR);
            $stmt1->bindParam("status", $status,PDO::PARAM_STR); 
            $stmt1->execute();
            
            $views=getAllDataFromTable('JobViews', $user_id_fk);
            $db = null;
            if($views){
                $views = json_encode($views);
                echo '{"data": ' .$views . '}';
            }else {
               echo '{"error":{"text":"You have not view a job yet."}}';
            }
         
        }else{
            echo '{"error":"Parameters not aligned"}';
        }
    }catch(PDOException $e) {
        echo '{"error":'. $e->getMessage() .'}';
    }
} 

function getAllDataFromTable($tableName, $id){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    try {
        $res = '';
        $db = getDB();
        $sql = "SELECT * FROM $tableName WHERE 1";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
       
        $db = null;
        return $res;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addJob(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    
    $db = getDB();
    $jobData = '';
    $title=$data->title; //graphic design
    $type=$data->type; //full-time or part-time
    $tagline=$data->tagline; //amazing designer needed
    $category=$data->category; //Plumber, Welder
    $description=$data->description; // full desc
    $salary=$data->salary; //200 p/w
    $skills=$data->skills; //painting, carpentre
    $experience=$data->experience; //1-2 years
    $date_created=$data->date_created; //today date
    $address=$data->address; //address
    $lat=$data->lat; //lat,lng
    $lng=$data->lng; //lat,lng
    $user_id_fk=$data->user_id; //user_id_fk
 
    try {  
        $sql1="INSERT INTO Jobs (title, type, category, tagline, description, salary,skills, experience date_created, address, lat, lng, user_id_fk) 
            VALUES (:title, :type, :category, :tagline, :description, :salary, :skills, :experience :date_created, :address, :lat, :lng, :user_id_fk)";
        $stmt1 = $db->prepare($sql1);
        $stmt1->bindParam("title", $title,PDO::PARAM_STR);
        $stmt1->bindParam("type", $type,PDO::PARAM_STR);
        $stmt1->bindParam("tagline", $tagline,PDO::PARAM_STR);
        $stmt1->bindParam("category", $category,PDO::PARAM_STR);
        $stmt1->bindParam("description", $description,PDO::PARAM_STR);
        $stmt1->bindParam("salary", $salary,PDO::PARAM_STR);
        $stmt1->bindParam("skills", $skills,PDO::PARAM_STR);
        $stmt1->bindParam("experience", $experience,PDO::PARAM_STR);
        $stmt1->bindParam("date_created", $date_created,PDO::PARAM_STR);
        $stmt1->bindParam("address", $address,PDO::PARAM_STR);
        $stmt1->bindParam("lat", $lat,PDO::PARAM_STR);
        $stmt1->bindParam("lng", $lng,PDO::PARAM_STR);
        $stmt1->bindParam("user_id_fk", $user_id_fk,PDO::PARAM_STR);
        $stmt1->execute();
        $jobData=getUserJobs($user_id_fk);
        
        $db = null;
        if($jobData){
            $jobData = json_encode($jobData);
            echo '{"data": ' .$jobData . '}';
        }else {
           echo '{"error":{"text":"You have not posted any job yet."}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function removeJobFromApplicants(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    
    $db = getDB();
    $jobData = '';
    $user_id_fk = $data->user_id_fk;
    $job_id_fk = $data->job_id_fk;
    $employer_id_fk = $data->employer_id_fk;
 
    try { 
        $sql1 = "DELETE FROM Applicants WHERE job_id_fk=:job_id_fk AND user_id_fk=:user_id_fk";
        $stmt1 = $db->prepare($sql1);
        $stmt1->bindParam("user_id_fk", $user_id_fk,PDO::PARAM_STR);
        $stmt1->bindParam("job_id_fk", $job_id_fk,PDO::PARAM_STR);
       
        $stmt1->execute();
        $jobData = getAllApplicants();
        
        $db = null;
        if($jobData){
            $jobData = json_encode($jobData);
            echo '{"data": ' .$jobData . '}';
        }else {
           echo '{"data": ' . json_encode([]) . '}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function removeUserFromAppointments(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    
    $db = getDB();
    $appointments = '';
    $user_id_fk = $data->user_id_fk;
    $employer_id_fk = $data->employer_id_fk;
 
    try { 
        $sql1 = "DELETE FROM Appointments WHERE employer_id_fk=:employer_id_fk AND user_id_fk=:user_id_fk";
        $stmt1 = $db->prepare($sql1);
        $stmt1->bindParam("user_id_fk", $user_id_fk,PDO::PARAM_STR);
        $stmt1->bindParam("employer_id_fk", $employer_id_fk,PDO::PARAM_STR);
       
        $stmt1->execute();
        $appointments = getAllAppointments();
        
        $db = null;
        if($appointments){
            $appointments = json_encode($appointments);
            echo '{"data": ' .$appointments . '}';
        }else {
           echo '{"data": ' . json_encode([]) . '}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addJobToApplicants(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    
    $db = getDB();
    $jobData = '';
    $user_id_fk = $data->user_id_fk;
    $job_id_fk = $data->job_id_fk;
    $employer_id_fk = $data->employer_id_fk;
    $date_applied = $data->date_applied; 
 
    try { 
        $sql1 = "INSERT INTO Applicants(user_id_fk, job_id_fk, employer_id_fk, date_applied)
        VALUES(:user_id_fk, :job_id_fk, :employer_id_fk, :date_applied)";
        $stmt1 = $db->prepare($sql1);
        $stmt1->bindParam("user_id_fk", $user_id_fk,PDO::PARAM_STR);
        $stmt1->bindParam("job_id_fk", $job_id_fk,PDO::PARAM_STR);
        $stmt1->bindParam("employer_id_fk", $employer_id_fk,PDO::PARAM_STR);
        $stmt1->bindParam("date_applied", $date_applied,PDO::PARAM_STR);
       
        $stmt1->execute();
        $jobData=getApplicantsById($user_id_fk);
        
        $db = null;
        if($jobData){
            $jobData = json_encode($jobData);
            echo '{"data": ' .$jobData . '}';
        }else {
           echo '{"error":{"text":"You have not applied for a job yet."}}';
        }
    }
    catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getAllApplicants(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    try {
         
        $applicantz = '';
        $db = getDB();
        $sql = "SELECT * FROM Applicants WHERE 1";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $applicantz = $stmt->fetchAll(PDO::FETCH_OBJ);
       
        $db = null;
        return $applicantz;
       
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getAllAppointments(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    try {
         
        $applicantz = '';
        $db = getDB();
        $sql = "SELECT * FROM Appointments WHERE 1";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $applicantz = $stmt->fetchAll(PDO::FETCH_OBJ);
       
        $db = null;
        return $applicantz;
       
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getApplicantsById($id){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    try {
        $jobs = '';
        $db = getDB();
        $sql = "SELECT * FROM Applicants WHERE user_id_fk='$id'";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $jobs = $stmt->fetchAll(PDO::FETCH_OBJ);
       
        $db = null;
        return $jobs;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function sendOTP(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody()); 
    $digits = 5;
    $otp = rand(pow(10, $digits-1), pow(10, $digits)-1);
 
    $email = $data->email;
    try { 
        $email_check = preg_match('~^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.([a-zA-Z]{2,4})$~i', $email); 
        
        if (  strlen(trim($email))>0  && $email_check>0)
        {
            $db = getDB();
            $data = '';
            $sql = "SELECT user_id FROM Users WHERE email=:email";
            $stmt = $db->prepare($sql);
            $stmt->bindParam("email", $email,PDO::PARAM_STR);
            $stmt->execute();
            $mainCount=$stmt->rowCount();
            if($mainCount==0)
            {
                $mail = new PHPMailer;
                //$mail->SMTPDebug = 3;                               // Enable verbose debug output
                $mail->isSMTP();                                      // Set mailer to use SMTP
                $mail->Host = 'smtp.gmail.com';                         // Specify main and backup SMTP servers
                $mail->SMTPAuth = true;                               // Enable SMTP authentication
                $mail->Username = 'pimpmapza@gmail.com';                 // SMTP username
                $mail->Password = 'cychedelic';                           // SMTP password
                $mail->SMTPSecure = 'tls';                            // Enable TLS encryption, `ssl` also accepted
                $mail->Port = 587;                                    // TCP port to connect to
                $mail->From = 'info@gmail.com';
                $mail->FromName = 'AppName'; 
                $mail->addAddress($email, 'Test User');     // Add a recipient
                $mail->Subject = 'OTP: '.$otp;
                $mail->Body    = "Hello<br>" ."Thank you for registering an account with us. Use this code to confirm your email address with us. <b>OTP Code: ". $otp. "</b> ";
                $mail->AltBody = "OTP Code ".$otp;
                if(!$mail->send()) {
                    echo '{"error":'. $mail->ErrorInfo .'}';
                } else { 
                    echo '{"data":'.$otp.'}';
                }
            }else{
                echo '{"error":"Email already registered"}';
            }
        }else{
            echo '{"error":"Incorrect email address format"}';
        }
    }catch(PDOException $e) {
        echo '{"error":'. $e->getMessage() .'}';
    }
} 
function getUserJobs($id){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    try {
        $jobs = '';
        $db = getDB();
        $sql = "SELECT * FROM Jobs WHERE user_id_fk='$id'";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $jobs = $stmt->fetchAll(PDO::FETCH_OBJ);
       
        $db = null;
        return $jobs;
        // echo '{"data": ' . json_encode($user) . '}';
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
    
}
function userData($email){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    try {
        $user = '';
        $db = getDB();
        $sql = "SELECT * FROM Users WHERE email='$email'";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_OBJ);
       
        $db = null;
        // echo '{"data": ' . json_encode($user) . '}';
       return $user;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
    
}
 
function loadEmployerAppointments(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    $appointer_id=$data->user_id;
    try {
         
        $users = '';
        $db = getDB();
        $sql = "SELECT * FROM Appointments WHERE appointer_id=appointer_id";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo '{"data": ' . json_encode($users) . '}';
       
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function loadEmployeeAppointments(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    $appointed_id=$data->user_id;
    try {
         
        $users = '';
        $db = getDB();
        $sql = "SELECT * FROM Appointments WHERE appointed_id=appointed_id";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo '{"data": ' . json_encode($users) . '}';
       
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getViewedJobs(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    try {
         
        $jobs = '';
        $db = getDB();
        $sql = "SELECT * FROM JobViews WHERE 1";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $jobs = $stmt->fetchAll(PDO::FETCH_OBJ);
       
        $db = null;
        echo '{"data": ' . json_encode($jobs) . '}';
       
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getUsers(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    try {
         
        $users = '';
        $db = getDB();
        $sql = "SELECT * FROM Users WHERE 1";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_OBJ);
       
        $db = null;
        echo '{"data": ' . json_encode($users) . '}';
       
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getRaters(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    try {
         
        $raters = '';
        $db = getDB();
        $sql = "SELECT * FROM Ratings WHERE 1";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $raters = $stmt->fetchAll(PDO::FETCH_OBJ);
       
        $db = null;
        echo '{"data": ' . json_encode($raters) . '}';
       
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getAppointments(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    try {
        $appointments = '';
        $db = getDB();
        $sql = "SELECT * FROM Appointments WHERE 1";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $appointments = $stmt->fetchAll(PDO::FETCH_OBJ);
       
        $db = null;
        echo '{"data": ' . json_encode($appointments) . '}';
       
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getExperiences(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    try {
         
        $experience = '';
        $db = getDB();
        $sql = "SELECT * FROM Experiences WHERE 1";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $experience = $stmt->fetchAll(PDO::FETCH_OBJ);
       
        $db = null;
        echo '{"data": ' . json_encode($experience) . '}';
       
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getEducation(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    try {
         
        $education = '';
        $db = getDB();
        $sql = "SELECT * FROM Education WHERE 1";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $education = $stmt->fetchAll(PDO::FETCH_OBJ);
       
        $db = null;
        echo '{"data": ' . json_encode($education) . '}';
       
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getSkills(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    try {
         
        $skills = '';
        $db = getDB();
        $sql = "SELECT * FROM Skills WHERE 1";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $skills = $stmt->fetchAll(PDO::FETCH_OBJ);
       
        $db = null;
        echo '{"data": ' . json_encode($skills) . '}';
       
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getAppliedJobs(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    try {
         
        $ajobs = '';
        $db = getDB();
        $sql = "SELECT * FROM Applicants WHERE 1";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $ajobs = $stmt->fetchAll(PDO::FETCH_OBJ);
       
        $db = null;
        echo '{"data": ' . json_encode($ajobs) . '}';
       
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getJobs(){
    $request = \Slim\Slim::getInstance()->request();
    $data = json_decode($request->getBody());
   
    try {
         
        $jobs = '';
        $db = getDB();
        $sql = "SELECT * FROM Jobs WHERE 1";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $jobs = $stmt->fetchAll(PDO::FETCH_OBJ);
       
        $db = null;
        echo '{"data": ' . json_encode($jobs) . '}';
       
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
?> 