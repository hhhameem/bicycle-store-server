const express = require("express");
const app = express();
var cors = require("cors");
const { MongoClient, CURSOR_FLAGS } = require("mongodb");
ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const port = process.env.PORT || 5000;

//midleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mol88.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("cycleStore");
    const userCollection = database.collection("users");
    const productCollection = database.collection("products");
    const orderCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");

    //get user role
    app.get("/user", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      let isAdmin = false;
      if (result?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //user info save(POST) for email registration
    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    });

    //user info save(PUT) for google
    app.put("/user", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    //product info save(POST)
    app.post("/product", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.json(result);
    });

    //(GET) all product info
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.json(result);
    });

    //(GET) single product info
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.json(result);
    });

    //(POST) Order Details save
    app.post("/saveorder", async (req, res) => {
      orderDetails = req.body;
      const result = await orderCollection.insertOne(orderDetails);
      res.json(result);
    });

    //(GET) All Orders Or Single user Orders
    app.get("/orders", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const cursor = orderCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });

    //(PUT) Update Order Status
    app.put("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: req.body.status,
        },
      };
      const result = await orderCollection.updateOne(query, updateDoc);
      res.json(result);
    });

    //(DELETE) DELETE product
    app.delete("/deleteproduct/:id", async (req, res) => {
      const productId = req.params.id;
      console.log(productId);
      const query = { _id: ObjectId(productId) };
      const result = await productCollection.deleteOne(query);
      res.json(result);
    });

    //(DELETE) DELETE Order
    app.delete("/deleteorder/:id", async (req, res) => {
      const productId = req.params.id;
      console.log(productId);
      const query = { _id: ObjectId(productId) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });

    //(PUT) Make Admin
    app.put("/makeadmin", async (req, res) => {
      const email = req.body.email;
      console.log(email);
      const query = { email: email };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.json(result);
    });

    //(POST) Review save
    app.post("/review", async (req, res) => {
      reviewDetails = req.body;
      console.log(reviewDetails);
      const result = await reviewCollection.insertOne(reviewDetails);
      res.json(result);
    });

    //(GET) Show All Review
    app.get("/review", async (req, res) => {
      const cursor = reviewCollection.find();
      const result = await cursor.toArray();
      res.json(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
