const express =require("express")
const { selectTotalAgentCommissionsGeneratedByDate } = require("../utils/checkCommission.js");
const commissionController =require("../controllers/commissionController.js");

const router=express.Router();

router.get('/',commissionController.deductCommission);

module.exports=router