require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

const jwt = require("jsonwebtoken");

let corsOptions = {
    origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

const db = require("./app/models");
db.mongoose
    .connect(db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Connected to database!");
    })
    .catch(err => {
        console.log("Unable to connect database", err);
        process.exit();
    });


app.get("/", (req, res) => {
    res.json({message: "Welcome to my application"});
});

app.get('/api', (req, res) => {
    res.json({
        msg: "Welcome to NodeJS JWT Authentication Tutorial"
    });
});

function verifyToken(req, res, next){
    
    //Request header with authorization key
    const bearerHeader = req.headers['authorization'];
    
    //Check if there is  a header
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        
        //Get Token arrray by spliting
        const bearerToken = bearer[1];
        req.token = bearerToken;
        //call next middleware
        next();
    }else{
        res.sendStatus(403);
    }
}

app.get('/token', (req, res) => {
    const user = {
        username: "jwt-auth-token-generate",
    }
    jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60 * 60 }, (err, token) => {
        res.json({token});
    });
});

app.all('/api/*', verifyToken, (req, res, next) => {
    jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, authData)=>{
        if(err){
            res.status(403).send(err);
        }else{
            next();
        }
    });
});

require("./app/routes/turorial.routes")(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})