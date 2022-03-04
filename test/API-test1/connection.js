
import mysql  from 'mysql';

var mysqlConnection = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: "Qwerty@12345!",
    database: "cloud",
    multipleStatements: true,
})

mysqlConnection.connect((err)=>{
    if(err){
        console.log('Not conneced!',err);
    }else{
        console.log('Conneced!');
    }
})

export default mysqlConnection;