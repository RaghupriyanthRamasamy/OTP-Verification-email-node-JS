const express = require("express");
const path = require("path");
const otpGenerator = require("otp-generator");
var store = require("store");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

const elasticemail = require("elasticemail");

const client = elasticemail.createClient({
  username: "Raghupriyanth",
  apiKey:
    "F1F8BA21F4670F65A837E50A7D801239CE92200117955BF1BE53B07BD5132A02D34595B9C83A4259DEA4314C47AAA16F",
});

const generateOtp = () => {
  return otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

const sendEmail = (toEmail, otp) => {
  let msg = {
    from: "raghupriyanth@gmail.com",
    from_name: "Raghupriyanth",
    to: toEmail,
    subject: "Verify your account for the localhost project",
    body_text: `Verify your account: OTP for sigin is ${otp} Have a great day happy learning!!`,
  };
  client.mailer.send(msg, function (err, result) {
    if (err) {
      return console.error(err);
    }
    console.log(result);
  });
};

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  store.set(req.body.Useremail, req.body);
  console.log(store.get(req.body.Useremail));
  res.redirect("/signin");
});

app.get("/signin", (req, res) => {
  res.render("signin");
});

app.post("/signin", (req, res) => {
  console.log("req.body", req.body);
  console.log("store.get", store.get(req.body.Useremail));
  let user = store.get(req.body.Useremail);
  if (user) {
    if (
      user.Useremail === req.body.Useremail &&
      user.password === req.body.password
    ) {
      res.redirect(`/emailotp/${user.Useremail}`);
    } else {
      res.redirect("signin");
    }
  } else {
    res.redirect("signin");
  }
});

app.get("/emailotp/:id", (req, res) => {
  const { id } = req.params;
  console.log(store.get(id));
  if (store.get(id)) {
    let otp = generateOtp();
    store.set(`${id}_otp`, otp);
    sendEmail(id, otp);
    res.render("EmailOtp", { id });
  } else {
    res.send("Something wrong");
  }
});

app.post("/emailotp/:id", (req, res) => {
  const { id } = req.params;
  let otp = store.get(`${id}_otp`);
  console.log(otp);
  if (otp) {
    if (otp === req.body.otp) {
      res.redirect("/welcome");
    } else {
      res.send("Wrong otp");
    }
  } else {
    res.send("Something wrong");
  }
});

app.get("/welcome", (req, res) => {
  res.render("welcome");
});

app.listen(3000, () =>
  console.log("App starts listing on http://localhost:3000")
);
