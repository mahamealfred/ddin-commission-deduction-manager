const dbConnect = require("../db/config");


const selectTotalAgentCommissionsGeneratedByDate=async()=>{
    const currentDate = new Date().toISOString().split('T')[0];
    const dateObject = new Date(currentDate);
   // Add one day (24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
   dateObject.setDate(dateObject.getDate() + 1);
  const nextDate = dateObject.toISOString().split('T')[0];
    const query = `
        SELECT t.date, aa.owner_name as 'USERNAME', mm.name as 'FULL NAME', coalesce((t.amount)) as 'TOTAL COMM'
        FROM transfers t
        INNER JOIN accounts a on a.id = t.from_account_id
        INNER JOIN accounts aa on aa.id = t.to_account_id
        INNER JOIN users u on u.username = a.owner_name
        INNER JOIN users uu on uu.username = aa.owner_name
        INNER JOIN members m on m.id = u.id
        INNER JOIN members mm on mm.id = uu.id
        WHERE (t.date BETWEEN ? AND ?)
        AND t.type_id IN(67, 63, 71, 59, 45, 34, 89);
    `;

    try {
        const [results] = await dbConnect.query(query,[currentDate,nextDate]);
        if (!results.length) {
            console.warn('No results found for the specified query.');
        }
        return results;
    } catch (err) {
        console.error('Error executing query:', err.message);
        throw err;
    }
};




module.exports= {selectTotalAgentCommissionsGeneratedByDate}