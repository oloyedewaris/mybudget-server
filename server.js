const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mongoKey = require("./config/keys");
const users = require("./routes/users");
const auth = require("./middleWare/auth");


const app = express();

//Using Middlewares
app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV === "production") {
  app.enable('trust proxy');
  app.use(function (req, res, next) {
    if (req.secure) {
      next();
    } else {
      res.redirect('https://' + req.headers.host + req.url);
    }
  });
}

//Config  mongodb
const db = mongoKey.mongoURI;

//Connect to mongodb
mongoose
  .connect(db, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log("Mongodb is connected"))
  .catch(err => console.log(err));

//use routes
app.get("/", (req, res) => res.send('Server working'));
app.post("/api/user/login", users.loginUser);
app.post("/api/user/register", users.registerUser);
app.patch("/api/user/update", auth, users.updateUser);

const port = process.env.PORT || 5000;

// listen to port
app.listen(port, () => {
  console.log(`Port is working at ${port}`);
});
