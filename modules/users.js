const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/MyDatabase',{useNewUrlParser:true, useCreateIndex:true,useUnifiedTopology: true });
const conn=mongoose.connection;

const userSchema=new mongoose.Schema({
    AccountNo:{
        type:String,
        required:true,
        index:{
            unique:true,
        }
    },
    Name:{
        type:String,
        required:true,
    },
    PhoneNo:{
        type:Number,
        required:true,
    },
    Address:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
});

const usermodel=mongoose.model('Electricity Users',userSchema);

module.exports=usermodel;
