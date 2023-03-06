//initilization
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//middleware
app.use(express.json());
//Cors
const corsOptions = {origin: "*",credentials: true,  optionSuccessStatus: 200,};
//access-control-allow-credentials:true
app.use(cors(corsOptions)); // Use this after the variable declaration


//port
const port = process.env.PORT || "8000";

//database connection
mongoose
  .connect(
    "mongodb+srv://Rajeswari:raje1992@cluster1.wm1nl.mongodb.net/limat",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then((db) => console.log("DB Connected"))
  .catch((err) => console.log(err));

//listen app
app.get("/", (req, res) => {
  res.send("server running sucessfully....hahahah..");
});
app.listen(port, () => {
  console.log(`server running at port no ${port} `);
});

//model 1
const blogSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
});
const model = mongoose.model("Register", blogSchema);

//Routes of  Model 1

//Register
app.post("/register", async (req, res) => {
  try {
    let existinguser = await model.findOne({ email: req.body.email });
    if (existinguser) {
      return res.status(400).json("user already exist in DB");
    }
    let hash = await bcrypt.hash(req.body.password, 10);
    const data2 = new model({
      name: req.body.name,
      email: req.body.email,
      password: hash,
    });
    const data3 = await data2.save();
    res.json(data3);
  } catch (err) {
    res.status(400).json(err);
  }
});

//login
app.post("/login", async (req, res) => {
  try {
    const userpassword = await model.findOne({ email: req.body.email });
    if (!userpassword) {
      return res.status(400).json("Email not exist in DB");
    }
    const validpassword = await bcrypt.compare(
      req.body.password,
      userpassword.password
    );
    if (!validpassword) {
      return res.status(400).json("Password not valid");
    }
    const webtoken = jwt.sign({ email: userpassword.email }, "Rakhan"); //secret key ,its like a ID card

    res.header("auth", webtoken).send(webtoken);
  } catch (err) {
    res.status(400).json(err);
  }
});

const validateuser = (req, res, next) => {
  var token = req.header("auth");
  req.token = token;
  next();
};

app.get("/get", validateuser, async (req, res) => {
  jwt.verify(req.token, "Raje", async (err, data) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const data2 = await model.find().select(["-password"]);
      res.json(data2);
    }
  });
});

//model 2
const blogSchemamodel = mongoose.Schema({
  photo: {
    type: String,
    require: true,
  },
  project: {
    type: String,
    require: true,
  },
  location: {
    type: String,
    require: true,
  },
  year: {
    type: Number,
    require: true,
  },
  logo:{
    type:String,
    require:true
  }
  
});
const model1 = mongoose.model("project", blogSchemamodel);

//Routes of model 2

//creating new project
app.post("/post", async (req, res) => {
  console.log("Inside post function");
  const data = new model1({
    photo: req.body.photo,
    project: req.body.project,
    location: req.body.location,
    year: req.body.year,
    logo:req.body.logo
  });
  const data1 = await data.save();
  res.json(data1);
});


//get all the projects
app.get("/data", async (req, res) => {
  try {
    const data2 = await model1.find();
    res.json(data2);
  } catch (err) {
    res.send("Error" + err);
  }
});

//get particular projects
app.get("/:id", async (req, res) => {
  try {
    const data1 = await model1.findById(req.params.id);
    res.json(data1);
  } catch (err) {
    res.send("Error" + err);
  }
});

//update projects
app.put("/update/:id", (req, res) => {
  let upid = req.params.id;
  let upphotos = req.body.photo;
  let upproject = req.body.project;
  let upyear = req.body.year;
  let uplocation = req.body.location;
  let uplogo=req.body.logo;
  
  model1.findOneAndUpdate(
    { _id: upid },
    {
      $set: {
        photo: upphotos,
        project: upproject,
        location: uplocation,
        year: upyear,
        logo:uplogo
        
      },
    },
    { new: true }
  )
  .then(updatedDocument => {
      if (updatedDocument === null) {
          return res.send("nothing found");
      }
      res.send(updatedDocument);
  })
  .catch(err => {
      console.log(err);
      res.send("ERROR");
  });
});

//delete particular projects
// app.delete("/delete/:id", (req, res) => {
//   let deleteid = req.params.id;
//   model1.findOneAndDelete({ _id: deleteid }, (err, data) => {
//     if (err) {
//       res.send("ERROR");
//     } else {
//       if (data == null) {
//         res.send("Wrong Id");
//       } else {
//         res.json("Deleted");
//       }
//     }
//   });
// });

app.delete("/delete/:id", (req, res) => {
  let deleteid = req.params.id;
  model1.findOneAndDelete({ _id: deleteid })
  .then(deletedDocument => {
      if (deletedDocument === null) {
          return res.send("Wrong Id");
      }
      res.json("Deleted");
  })
  .catch(err => {
      console.log(err);
      res.send("ERROR");
  });
});


//model 4
const contactmodel = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  message: {
    type: String,
    require: true,
  },
});
const contact = mongoose.model("contact", contactmodel);
//Routes of model 4
//contact
app.post("/contact", async (req, res) => {
  const data = new contact({
    name: req.body.name,
    message: req.body.message,
  });
  const data1 = await data.save();
  res.json(data1);
});
