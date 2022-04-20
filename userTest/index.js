const express = require("express");
var mysql = require('mysql'); 
var bodyParser = require('body-parser')
const app =express();

app.use(express.json())

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'tserendorj0330',
  database : 'userdb'
});

connection.connect((err)=>{
  if(err) throw err;
  console.log("sql connected..");
})

app.get('/createtable', (req, res)=>{
  let sql = 'CREATE TABLE users( id int AUTO_INCREMENT , RoleID int, LastName varchar(255), FirstName varchar(255), Address varchar(255), Pwd varchar(255), Email varchar(255), PRIMARY KEY(id))'
  connection.query(sql, (err, data)=>{
    if(err) throw err;
    console.log(data);
    res.send("table created");
  });
});
app.get('/showtables', (req, res)=>{
  let sql = 'SELECT * FROM users'
  connection.query(sql, (err, data)=>{
    if(err) throw err;
    console.log(data);
    res.send("users");
  });
});

app.post('/insertData', (req, res)=>{
  console.log(req.body)
    let data = {
      RoleID: req.body.RoleID,
      LastName : req.body.LastName,
      FirstName: req.body.FirstName,
      Email: req.body.Email,
      Pwd: req.body.Pwd
    };
    let sql = `INSERT INTO users SET ? `;
    connection.query(sql, data, (err, result)=>{
          if(err) throw err;
          console.log(result);
          res.send("inserting data");    
    });

});

app.post('/updateuser/:id', (req, res)=>{
  console.log(req.params.id);
    let id = req.params.id ;
    let userData = req.body;
  
    let sql = `UPDATE users SET ? WHERE id = ${id} `;
    connection.query(sql, userData, (err, result)=>{
          if(err) throw err;
          console.log(result);
          res.send("update data");    
    });

});
app.delete('/deleteuser/:id', (req, res)=>{
  console.log(req.params.id);
    let id = req.params.id ;
  
    let sql = `DELETE FROM users WHERE id = ${id} `;
    connection.query(sql, (err, result)=>{
          if(err) throw err;
          console.log(result);
          res.send("delete user");    
    });

})



//wished suplier

app.get('/wishlist/wishedsupliers', (req, res)=>{
  if (!req.headers.user_id) {
    return res.send({ "error": "Authorization key is required." })
}
  const userId =req.headers.user_id;

  if(userId == 1){
    try{
      connection.query('SELECT * FROM wishlist w JOIN suplier s ON s.ID = w.SuplierID WHERE w.isActive = 1 AND w.UserID=?', userId, (err, result)=>{
               if(err){
                 return res.send({"error": "db error"})
                }else if(result.length > 0){
                  let suplierWishList = []
                  for(i=0; i<result.length; i++){
                    suplierWishList.push({
                      id: result[i].SuplierID,
                      name:result[i].SuplierName,
                      created_date: result[i].CreatedDate
                    });
                  } 
                  res.send({
                    code: 200,
                    data: suplierWishList
                  });
                }else return res.status(205).send({
                  code:200,
                  data: []
                })
               
      })
    }catch(err){
      console.log(err)}
  }else return res.status(205).send({error: "Authentication failed"})
})

//add suplier and remove

app.post("/wishList/addSuplier", function(req, res, next){

  if (!req.headers.user_id) {
    return res.send({ "error": "Authorization key is required." })
}
  const userId =req.headers.user_id;
  const suplier_id = req.body.SuplierID;

  if(userId == 1){
    connection.query("SELECT * FROM wishlist WHERE UserID=? AND SuplierID =?", [userId, suplier_id], function(err, result){
        console.log(result)
      if(err){
          return res.send({"error": "db error1"})
        }else if(result.length > 0){
          if(result[0].isActive == 0){
          connection.query("UPDATE wishlist SET UpdatedDate=SYSDATE(), isActive=1 WHERE ID =?",[result[0].ID], (error, result)=>{
            if(err){
              return res.send({"error":"db error"})
            }else{
              return res.send({
                "code": 200,
                "message":"Барааг амжилттай заслаа"
              });
            }
          })
        }else if(result[0].isActive == 1) return res.send({ "error": "product already added"}) 
      } else{
          connection.query("INSERT INTO wishlist(`UserID`,`SuplierID`,`CreatedDate`,`isActive`) VALUES (?,?,SYSDATE(),1)", [userId, suplier_id], (err, result)=>{
            if (err) {
              return res.send({ "error": "db error" }) 
          } else {     
              res.send({
                  "code": 200,
                  "message": "Барааг амжилттай хадгаллаа"
              });
          }
          })
        }
  })
}else res.send("userid error")
});

//remove

app.put("/wishList/removeSuplier", function(req, res, next){

  if (!req.headers.user_id) {
    return res.send({ "error": "Authorization key is required." })
}
  const userId =req.headers.user_id;
  const suplier_id = req.body.SuplierID;

  if(userId == 1){
    connection.query("SELECT * FROM wishlist WHERE isActive = 1 AND SuplierID =? AND UserID=?", [suplier_id, userId], function(err, result){
        if(err){
          return res.send({"error": "db error1"})
        }else if(result.length > 0){
          connection.query("UPDATE wishlist SET UpdatedDate=SYSDATE(), isActive=0 WHERE ID =?",[result[0].ID], (error, result)=>{
            if(err){
              return res.send({"error":"db error"})
            }else{
               res.send({
                "code": 200,
                "message": "Хадгалсан барааг устгалаа"
              });
            }
          })
        }else  return res.status(205).send({error: "wishedsuplier not found for the user"});
    });
  }else return res.status(205).send({error: "Authentication failed"});
});





const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
