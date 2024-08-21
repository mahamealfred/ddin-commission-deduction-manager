const express=require("express")
const cors=require("cors")
const cron = require('node-cron');
const dotenv=require("dotenv")
const routes=require("./src/routes/index.js")
const dbConection=require("./src/db/config.js");
const { selectTotalAgentCommissionsGeneratedByDate } = require("./src/utils/checkCommission.js");
const { deductCommission } = require("./src/controllers/commissionController.js");

dotenv.config();
const app = express();
const PORT = process.env.PORT;

//loading middlewares
app.use(express.json());
app.use(cors({credentials: true, origin: ['https://xpay.ddin.rw','http://localhost:3000','http://localhost:3001','https://xxpay.netlify.app','https://xpaytest.netlify.app','https://xpaydashboard.netlify.app']}));
app.enable('trust proxy');

//loading routes
app.use(routes);

// Schedule the task to run every day at 11:59 PM
cron.schedule('25 11 * * *', () => {
  console.log('Running the commission deduction task...');
 // deductCommission();
 deductCommission()
});

app.listen(PORT, () => {
   dbConection
  // comm()
    console.log(`Server is listening on port:${PORT}`);
  });
