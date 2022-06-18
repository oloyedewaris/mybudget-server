const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// login function
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  // backend Validations
  if (!email || !password)
    return res.status(400).json("Please enter all fields");

  //Check for existing user
  User.findOne({ email })
    .then(user => {
      if (!user) return res.status(400).json("email not found");
      //Compare user's password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (!isMatch) return res.status(400).json("Invalid password");

        //Sign a jwt token
        jwt.sign({ id: user._id }, "secrete", { expiresIn: 36000000 }, (err, token) => {
          if (err) throw err;
          return res.status(200).json({ token, user });
        });
      });
    })
    .catch(err => res.status(500).json({ success: false, msg: "Failed, internal server error", err }))
};

// register function
exports.registerUser = (req, res) => {
  const { currency, name, email, password } = req.body;

  //Converting javascript date to human understandable
  const d = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const weeks = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
  const date = `${weeks[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;

  // backend validation
  if (!currency || !name || !email || !password)
    return res.status(400).json("Please enter all fields");
  if (password.length < 6)
    return res.status(400).json("Password should be up to six characters");

  //Check for existing user
  User.findOne({ email }).then(user => {
    if (user) return res.status(400).json("Email already exist");

    //Create a new user
    const newUser = new User({
      name,
      email,
      currency,
      password,
      registeredAt: date
    });

    //Hash the user's password
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save()
          .then(user => {
            jwt.sign({ id: user._id }, "secrete", { expiresIn: 36000000 },
              (err, token) => {
                if (err) throw err;
                res.status(201).json({ token, user })
              }
            );
          })
          .catch(err => res.status(500).json({ msg: "Failed, internal server error", err }));
      });
    });
  }).catch(err => res.status(500).json({ msg: "Failed, internal server error", err }));
};

// update function
exports.updateUser = (req, res) => {
  const { email, password, budget, balanceData } = req.body;

  // backend Validations
  if (!email || !password || !budget || !balanceData)
    return res.status(400).json("Please enter all fields");

  //Check for existing user
  User.findOne({ email })
    .then(user => {
      if (!user) return res.status(400).json("email not found");
      //Compare user's password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (!isMatch) return res.status(400).json("Invalid password");
        User.findOneAndUpdate(
          { email },
          { $set: { budget, balanceData } },
          { new: true, upsert: true },
          (err, user) => {
            if (err) return res.status(400).json({ err, msg: 'an error occured' })
            return res.status(200).json({ user });
          }
        )
      });
    })
    .catch(err => res.status(500).json({ success: false, msg: "Failed, internal server error", err }))
};