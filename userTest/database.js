// var mysql      = require('mysql');
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : 'Tseegii@0330',
//   database : 'userdb'
// });
 
// connection.connect();
 
// connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });
 
// connection.end();

router.post('/api/wishlist/add', function (req, res, next) {

    if (!req.headers.ebazaar_token) {
        return res.send({ "error": "Authorization key is required." })
    }
    const tkn = req.headers.ebazaar_token;
    const user = JSON.parse(token.decrypt(tkn));
    const userid = user.user_id;
    const {product_id} = req.body;
    if (user.eb_key === token.eb_key) { 
    db.query( "SELECT * FROM wishlist WHERE ProductID =? AND UserID=?", [product_id, userid],
        function (err, result) {
            if (err) {
                return res.send({ "error": "db error" }) 
            } else if (result.length > 0) {
                if (result[0].isActive == 0){
                    db.query("UPDATE wishlist SET CreatedDate=SYSDATE(), isActive=1 WHERE ID =?", 
                    [result[0].ID], (error, result) => {
                        if (err) {
                            return res.send({ "error": "db error" }) 
                        } else {
                        return res.send({
                                "code": 200,
                                "message": "Барааг амжилттай заслаа"
                            });
                        }
                    })
                } else if (result[0].isActive == 1) return res.send({ "error": "product already added" })        
            } else {
                db.query("INSERT INTO wishlist(`UserID`,`ProductID`,`CreatedDate`,`isActive`) VALUES (?,?,SYSDATE(),1)",
                [userid, product_id], (err, result) => {         
                    if (err) {
                        return res.send({ "error": "db error" }) 
                    } else {     
                        res.send({
                            "code": 200,
                            "message": "Барааг амжилттай хадгаллаа"
                        });
                    }
                });
            }
        });
     } else return res.status(205).send({error: "Authentication failed"}); 
});





router.get('/api/wishlist/wishedproducts', (req, res) => {

    if (!req.headers.ebazaar_token) {
        return res.send({ "error": "Authorization key is required." })
    }
    const tkn = req.headers.ebazaar_token;
    const user = JSON.parse(token.decrypt(tkn));
    const userid = user.user_id;
    console.log(userid)
    if (user.eb_key === token.eb_key) {
        try {
            db.query( "SELECT p.*, pp.DefaultPrice FROM wishlist w JOIN products p ON p.ProductID = w.ProductID JOIN productprice pp ON p.ProductID = pp.ProductID WHERE w.isActive = 1 AND w.UserID=?", userid, (err, result) => {
                if (err) {
                    return res.send({ "error": "db error" }) 
                }
                else if (result.length > 0) {
                    let wishlist = []
                    for (i = 0; i < result.length; i++) {
                        wishlist.push({
                            id: result[i].ProductID,
                            category_id: result[i].ProductGroupID,
                            name: result[i].ProductName,
                            bar_code: result[i].BarCode,
                            in_case: result[i].inCase,
                            image: result[i].ProductImage, //JSON
                            sku: result[i].SKU,
                            supplier_id: result[i].SupplierID,
                            description: result[i].ProductDescription,
                            priority: result[i].ProductPriority,
                            created_date: result[i].CreatedDate,
                            brand: result[i].BrandID,
                            price: result[i].DefaultPrice
                        });
                    }
                    res.send({
                        code: 200,
                        data: wishlist
                    });
                } else return res.status(205).send({
                    code: 200,
                    data: []
                }); 
            });
        } catch(err) {
            console.log(err)
        }
    } else return res.status(205).send({error: "Authentication failed"}); 
});

/**
 * Таалагдсан бүтээгдэхүүнийг 
 * хадгалах, устгах
 */


router.put('/api/wishlist/remove', function (req, res, next) {

    if (!req.headers.ebazaar_token) {
        return res.send({ "error": "Authorization key is required." })
    }
    const tkn = req.headers.ebazaar_token;
    const user = JSON.parse(token.decrypt(tkn));
    const userid = user.user_id;
    const {product_id} = req.body;
    if (user.eb_key === token.eb_key) { 
    db.query( "SELECT * FROM wishlist WHERE isActive = 1 AND ProductID =? AND UserID=?", [product_id, userid],function (err, result) {
        if (err) {
            return res.send({ "error": "db error" }) 
        } else if (result.length > 0) {
                db.query("UPDATE wishlist SET UpdatedDate=SYSDATE(), isActive=0 WHERE ID =?", 
                [result[0].ID], (error, result) => {
                    if (err) {
                        return res.send({ "error": "db error" }) 
                    } else {
                        res.send({
                            "code": 200,
                            "message": "Хадгалсан барааг устгалаа"
                        });
                    }
                })
            }  else return res.status(205).send({error: "wishedproduct not found for the user"}); 
        });
     } else return res.status(205).send({error: "Authentication failed"}); 
});

module.exports = router;

const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);