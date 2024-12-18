const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
const { username, accessToken } = req.session?.authorization || {};

  // Check if username and accessToken exist in the session
  if (!username || !accessToken) {
    return res.status(401).json({ message: "Unauthorized: Please log in." });
  }

  // Verify the access token if it's there
  jwt.verify(accessToken, 'access', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token." });
    }
    // If token is valid, pass the decoded data to the next middleware/route handler
    req.user = decoded;  // Optionally, you can attach user info to the request
    next();
  });
});
 
const PORT =5001;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
