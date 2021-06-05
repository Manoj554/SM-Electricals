const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/MyDatabase',{useNewUrlParser:true, useCreateIndex:true,useUnifiedTopology: true });
const conn=mongoose.connection;

const meterSchema=new mongoose.Schema({
    AccountNo:{
        type:String,
        required:true,
        index:{
            unique:true,
        }
    },
    MeterNo:{
        type:String,
        required:true,
        index:{
            unique:true,
        }
    },
    CurrentReading:{
        type:Number,
        required:true,
    },
    CurrentBill:{
        type:String,
        required:true,
    },
    LastRechageAmount:{
        type:String,
        required:true
    },
    Balance:{
        type:String,
        required:true
    },
});

const metermodel=mongoose.model('Users_Billing_Details',meterSchema);

module.exports=metermodel;
