var express = require('express')
var path = require('path')
var mysql = require('mysql')
// var compression = require('compression')

var app = express()
var bodyParser = require('body-parser')

var connectionOptions = {
  host: '127.0.0.1',
  user: 'adsite',
  password: 'adsite',
  database: 'adsite'
}

app.use(bodyParser.urlencoded({extended: true}))

// app.use(compression())

// serve our static stuff like index.css
app.use(express.static(path.join(__dirname, 'static')))

// send all requests to index.html so browserHistory works
app.get('/a', function (req, res) {
  res.sendFile(path.join(__dirname, 'static', 'a.html'))
})

app.get('/b', function (req, res) {
  res.sendFile(path.join(__dirname, 'static', 'b.html'))
})

app.post('/order', function (req, res) {
  let name = req.body.name;
  let address = req.body.address;
  let phone = req.body.phone;
  console.log("name: ", name, "addr: ", address, "phone: ", phone);

  let sql = "INSERT INTO user_order(name, phone, address) VALUES(?,?,?)";
  let params = [name, phone, address];

  let connection = mysql.createConnection(connectionOptions);

  let insertSuccess = true;

  connection.connect();
  connection.query(sql, params, function(err, result) {
    if (err) {
      console.log("mysql err:", err);
      insertSuccess = false;
      res.send(JSON.stringify({"status": "error"}))
      return;
    }
    console.log("result:", result);
    res.send(JSON.stringify({"status": "ok"}))
  });
  connection.end();
});

app.get('/get-order', function (req, res) {
  let sql = "SELECT * from user_order";

  let connection = mysql.createConnection(connectionOptions);
  let orders = null;
  connection.connect();
  connection.query(sql, function(err, result) {
    if (err) {
      console.log("mysql err:", err);
      res.send("empty")
    } else {
      orders = result.map(function(order) {
        let date = new Date(order.date).toISOString().replace(/T/, ' ').replace(/\..+/, '')
        return [order.name, date, order.phone, order.address].join(",")
      });
      console.log("get order result:", result, orders);
      res.type('csv')
      res.send(orders.join("\n"))
    }
  });
  connection.end();

});

var PORT = process.env.PORT || 8080
app.listen(PORT, function() {
  console.log('Production Express server running at http://localhost:' + PORT)
})
