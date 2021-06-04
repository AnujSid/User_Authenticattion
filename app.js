var express  =require("express"),
	mongoose =require("mongoose"),
	passport=require("passport"),
	User=require("./models/user"),
	path = require('path'),
	localStrategy=require("passport-local").Strategy,  
	passportLocalMongoose=require("passport-local-mongoose"),
	methodOverride = require('method-override'),
        app=express();	
const url="mongodb+srv://anujsid596:mother1234@cluster0.kpmeh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"||"mongodb://localhost:27017/auth_user";
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
	console.log("connected");
})
.catch((err)=>{
	console.log("disconnected");
})

app.set('views',path.join(__dirname,'views'));
app.set("view engine","ejs");

app.use(methodOverride('_method'))
app.use(express.urlencoded({extended:true}));
app.use(require("express-session")({
	secret:"Anuj",
	resave:false,
	saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
	res.render("home");
})

app.get("/secret",isLoggedIn,async function(req,res){
	const users= await User.find({});
    res.render("secret",{users});
})

app.get("/register",function(req,res){
	res.render("register");
});

app.post("/register",function(req,res){
	User.register(new User({username:req.body.username,email:req.body.email,address:req.body.address}),req.body.password,function(err,user){
		if(err){
			console.log(err);
		}else{
			passport.authenticate("local")(req,res,function(){
				res.redirect("/secret");
			})
		}
	})
}) 

app.get("/login",function(req,res){
	res.render("login");
})

app.post("/login",passport.authenticate("local",{
	successRedirect:"/secret",
	failureRedirect:"/login"
}),function(req,res){
})

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
})

app.get("/:id",function(req,res){
	User.findById(req.params.id,function(err,foundUser){
		res.render("show",{user:foundUser});
	})
})

app.get("/:id/edit",async function(req,res){
	var user=await User.findById(req.params.id);
	res.render("edit",{user});
}) 

app.put("/:id",async function(req,res){
	var user=await User.findByIdAndUpdate(req.params.id,req.body);
	res.redirect("/"+req.params.id);
})

app.delete("/:id", async function(req,res){
	var user=await User.findByIdAndDelete(req.params.id);
	res.redirect("/secret");
})

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

app.listen(process.env.PORT||3000,function(){
	console.log("server started");
})
