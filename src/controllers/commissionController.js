const dotenv = require("dotenv")
const axios = require('axios');
const xml2js = require('xml2js');
const mysql =require("mysql2");
const { selectTotalAgentCommissionsGeneratedByDate } = require("../utils/checkCommission");


dotenv.config();

class CommissionController {


    static async deductCommission() {
        try {
            const commissions = await selectTotalAgentCommissionsGeneratedByDate();
            let commissionMap = {};
    
            // Accumulate total commissions per USERNAME
            commissions.forEach(comm => {
                const username = comm.USERNAME;
    
                if (!commissionMap[username]) {
                    commissionMap[username] = {
                        USERNAME: comm.USERNAME,
                        FULL_NAME: comm["FULL NAME"],
                        TOTAL_COMM: 0
                    };
                }
    
                // Add the commission to the user's total commission
                commissionMap[username].TOTAL_COMM += parseFloat(comm["TOTAL COMM"]);
            });
    
            // Process each user who has a total commission >= 500
            for (const username in commissionMap) {
                if (commissionMap[username].TOTAL_COMM >= 500) {
                    const amountToDeduct = 100; // Amount to deduct from the commission
    
                    // Deduct the commission
                    const updatedTotalComm = commissionMap[username].TOTAL_COMM - amountToDeduct;
    
                    // Build the SOAP request body
                    const soapRequest = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pay="http://payments.webservices.cyclos.strohalm.nl/">
                        <soapenv:Header/>
                        <soapenv:Body>
                            <pay:doPayment>
                                <params>
                                    <fromMemberPrincipalType>USER</fromMemberPrincipalType>
                                    <fromMember>${username}</fromMember>
                                    <toMemberPrincipalType>USER</toMemberPrincipalType>
                                    <toMember>userfee</toMember>
                                    <amount>${amountToDeduct}</amount>
                                    <description>Ledger Fee Payment</description>
                                    <transferTypeId>109</transferTypeId>
                                </params>
                            </pay:doPayment>
                        </soapenv:Body>
                    </soapenv:Envelope>`;
    
                    // Make the SOAP request
                    try {
                        const response = await axios.post(process.env.CORE_URL+'/services/payment', soapRequest, {
                            headers: {
                                'Content-Type': 'text/xml',
                                'SOAPAction': ''
                            }
                        });
    
                        // Optionally parse the XML response if needed
                        xml2js.parseString(response.data, (err, result) => {
                            if (err) {
                                console.error('Error parsing SOAP response:', err);
                            } else {
                                console.log(`SOAP response for ${username}:`, result);
                            }
                        });
    
                        console.log(`Deducted ${amountToDeduct} from ${username}'s commission and sent to ledger fee account.`);
    
                    } catch (error) {
                        console.error(`Error processing payment for ${username}:`, error.message);
                    }
                }
            }
           // console.log(`Deducteda ${amountToDeduct} from ${username}'s commission and sent to ledger fee account.`);
            // Respond with the updated commission list
            // let newCommList = Object.values(commissionMap).filter(user => user.TOTAL_COMM >= 5);
            // return res.json(newCommList);
    
        } catch (err) {
            console.error('Error message:', err.message);
            console.error('Error stack:', err.stack);
            //res.status(500).json({ error: 'Failed to retrieve commissions.', details: err.message });
        }
    }
    

}
module.exports = CommissionController;