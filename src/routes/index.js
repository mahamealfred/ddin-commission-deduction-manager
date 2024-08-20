const express =require("express");
const commissionRoute=require("./commission.routes")
const  router=express.Router();

//authentication
 router.use('/api/v1/commissionation-generated',commissionRoute);


module.exports= router

