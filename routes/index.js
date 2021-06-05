const express=require('express');
const router=express.Router();
const userModule=require('../modules/users');
const billModel=require('../modules/meter_details');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const { body, validationResult } = require('express-validator');


//Local Strorage
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('../scratch');
  }


// MiddleWare
function checkloginuser(req,res,next){
    var userToken=localStorage.getItem('userToken');
    try {
        if(req.session.userID){
            var decoded = jwt.verify(userToken, 'Login Token');

        }else{

            res.redirect('/login');
        }
      } catch(err) {
      }
      next();
}

function checkusername(req,res,next){
    var uname=req.body.acc;
    var checkexitusername=userModule.findOne({AccountNo:uname});
    checkexitusername.exec((err,data)=>{
        if(err) throw err;
        if(data){
            return res.render('signup',{title:"SignUp",msg:'Account No. Already Exist'});
        }
        next();
    });
};
function checkAccount(req,res,next){
    var uname=req.body.acc;
    var checkexitusername=userModule.findOne({ $or: [ {AccountNo:uname},{ PhoneNo:uname}]});
    checkexitusername.exec((err,data)=>{
        if(err) throw err;
        if(data){
            return res.render('usersignupdetails',{title:"SignUp",msg:'Your Account is Verified',record:data});
        }else{
            return res.render('usersignup',{title:"SignUp",msg:'This AccountNo is not in our DataBase'});
        }
        next();
    });
};


//EndPoints

//Home
router.get('/',function(req,res,next){
    var loggedin=localStorage.getItem('LoginUser');
    res.render('home',{title:"Customer_home",login:loggedin,msg:''});
});



//Login
router.get('/login',function(req,res,next){
    var loggedin=localStorage.getItem('LoginUser');
    if(req.session.userID){
        res.redirect('/dashboard')
    }else{
        res.render('login',{title:"Login",msg:''});

    }
});

router.post('/login',function(req,res,next){
    var username=req.body.acc;
    var password=req.body.psw;
    var checkUser=userModule.findOne({AccountNo:username});
    checkUser.exec((err,data)=>{
        if(err) throw err;
        if(data!=null||data!=undefined){
           var name=data.Name;
           var getUserID=data.password._id;
           var getPasword=data.password;
           if(bcrypt.compareSync(password,getPasword)){
              var token = jwt.sign({ userId: getUserID }, 'Login Token');
              localStorage.setItem('userToken', token);
              localStorage.setItem('LoginUser', name);
              req.session.userID=username;
              res.redirect('/dashboard');
            }else{
                 res.render('login',{title:"Login",msg:'Invalid Password'});
            }
        }else{
            res.render('login',{title:"Login",msg:'Invalid Account No.'});
        }
    });
});




router.get('/dashboard',function(req,res,next){
    var loggedin=localStorage.getItem('LoginUser');
    var user=userModule.find({Name:loggedin});
    user.exec((err,data)=>{
        if(err) throw err;
        var meter_data=billModel.find({AccountNo:data[0].AccountNo});
        meter_data.exec((err,meterdata)=>{
            if(err) throw err;
            res.render('dashboard',{title:"Customer Deatails",login:loggedin,msg:'',errors:'',record:data[0],meter:meterdata[0]});
        });
    });
});



//Signup
router.get('/signup',function(req,res,next){
    var loggedin=localStorage.getItem('LoginUser');
    if(req.session.userID){
        res.redirect('/dashboard')
    }else{
      res.render('signup',{title:"SignUp",msg:''});
    }
});

router.post('/signup',checkusername,function(req,res,next){
    var username=req.body.acc;
    var phone=req.body.phone;
    var name=req.body.name;
    var address=req.body.address;
    var password=req.body.psw;
    var cpassword=req.body.cpsw;

if(password!=cpassword){
    res.render('signup',{title:"SignUp",msg:'Password Not Matched'});
    }
else{
    password= bcrypt.hashSync(req.body.psw,5);
      var userDetails=new userModule({
        AccountNo:username,
        Name:name,
        PhoneNo:phone,
        Address:address,
        password:password,

    });

     userDetails.save((err,data)=>{
        if(err) throw err;
        res.render('signup',{title:"SignUp",msg:'User Register Sucessfully and Please login to continue'});
    })
}

});




//UserSignUp
router.get('/user_signup',function(req,res,next){
    var loggedin=localStorage.getItem('LoginUser');
    if(req.session.userID){
        res.redirect('/dashboard')
    }else{
      res.render('usersignup',{title:"SignUp",msg:''});
    }
});

router.post('/Check_User',(req,res,next)=>{
    var uname=req.body.acc;
    var checkexitusername=userModule.findOne({AccountNo:uname});
    checkexitusername.exec((err,data)=>{
        if(err) throw err;
        if(data){
            res.render('usersignupdetails',{title:"SignUp",msg:'Your Account is Verified',record:data});
        }else{
            res.render('usersignup',{title:"SignUp",msg:'This AccountNo is not in our DataBase'});
        }
    });

});

router.post('/user_signup',function(req,res,next){
    var AccountNo=req.body.acc;
    var phone=req.body.phone;
    var name=req.body.name;
    var address=req.body.address;
    var password=req.body.psw;
    // var cpassword=req.body.cpsw;
    
    password= bcrypt.hashSync(req.body.psw,5);
    var id=userModule.findOne({AccountNo:AccountNo});
    id.exec((err,data)=>{
        if(err) throw err;
        var Update_user=userModule.findByIdAndUpdate(data._id,{
            password:password,
        });
            Update_user.exec((err,data1)=>{
            if(err) throw err;
            res.redirect('/login');
        });
    });
});




//meterdetails entry
router.get('/meterdetails_entry',function(req,res,next){
      res.render('meter',{title:"Meter",msg:''});
});

router.post('/meterdetails_entry',function(req,res,next){
    var AccountNo=req.body.acc;
    var MeterNo=req.body.MeterNo;
    var CurrentReading=req.body.cr;
    var CurrentBill=req.body.cb;
    var LastRechageAmount=req.body.lra;

    var userDetails=new billModel({
        AccountNo:AccountNo,
        MeterNo:MeterNo,
        CurrentReading:CurrentReading,
        CurrentBill:CurrentBill,
        LastRechageAmount:LastRechageAmount,
        Balance:parseFloat(LastRechageAmount)-parseFloat(CurrentBill),

    });

     userDetails.save((err,data)=>{
        if(err) throw err;
        res.render('meter',{title:"meter",msg:'Data Successfully Saved'});
    });
});


//Logout
router.get('/logout',function(req,res,next){

    req.session.destroy(function(err) {
        if(err){
            res.redirect('/');

        }
      })
    localStorage.removeItem('userToken');
    localStorage.removeItem('LoginUser');
    res.redirect('/');
});


//Provider Section
router.get('/provider',function(req,res,next){
    res.render('provider',{title:"Provider",msg:''});

});


router.get('/customerdetails',function(req,res,next){
    var getdetails=userModule.find({});
    getdetails.exec((err,data)=>{
        if(err) throw err;
        res.render('customerdetails',{title:"Customer Details",msg:'',records:data});
    });
});
router.get('/meterdetails',function(req,res,next){
    var getdetails=billModel.find({});
    getdetails.exec((err,data)=>{
        if(err) throw err;
        res.render('meterdetails',{title:"Meter Details",msg:'',records:data});
    });
});

router.get('/customerdetails/delete/:id',function(req,res,next){
    var passCat_id=req.params.id;
    var passdelete=userModule.findByIdAndDelete(passCat_id);
    passdelete.exec((err,data)=>{
        if(err) throw err;
        res.redirect('/customerdetails');
    });
});

router.get('/meterdetails/:id',function(req,res,next){
    var passCat_id=req.params.id;
    var passdelete=billModel.findByIdAndDelete(passCat_id);
    passdelete.exec((err,data)=>{
        if(err) throw err;
        res.redirect('/meterdetails');
    });
});

module.exports=router;