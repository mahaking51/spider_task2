const express=require('express');
const bodyParser=require('body-parser');
const app=express();
const mongoose=require('mongoose');
const request=require("request");
let name;
var logged=false;
let match=true;

mongoose.connect('mongodb://localhost:27017/testdb', {useNewUrlParser: true})

const userSchema= new mongoose.Schema({
    username:String,
    pwd:String,
    following:Array,
    followers:Array
})
const logSchema=new mongoose.Schema({
    name:String,
    statement:Array
})
const storySchema=new mongoose.Schema({
    name:String,
    head:String,
    cont:String,
    time:String
})

const Story =new mongoose.model('story',storySchema);
const User =new mongoose.model('user',userSchema);
const Log=new mongoose.model('log',logSchema);
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.get('/',function(req,res){
    
    Story.find({},function(err,arr){
        res.render('home',{condition:false,name:name,articles:arr});
    })
})
app.get('/home/:name',function(req,res){
    src="https://ui-avatars.com/api/?name="+req.params.name+"&rounded=true&bold=true&size=45&background=ededed&color=272727"
    link='/userpage/'+req.params.name;
    Story.find({},function(err,arr){
        res.render('home',{condition:true,name:req.params.name,dp:src,link:link,articles:arr});
    })
})
app.get('/signup',function(req,res){
res.render('signup',{})
}) 
//after signed in
app.get('/visit/:username/:name',function(req,res){
    

    src="https://ui-avatars.com/api/?name="+req.params.name+"&rounded=true&bold=true&size=128&background=ededed&color=272727"
    mainUser=req.params.username;
    Story.find({name:req.params.name},function(err,arr){
        res.render('userpage',{name: req.params.name,url:src,user:mainUser,cond:false,condFollow:true,recent:arr,condsearch:false});
    })
})
//before signing in
app.get('/visit/:runn',function(req,res){
    var follower,followin;
    un=req.params.runn
    let p=[];
    run=0
    let recent;
    src="https://ui-avatars.com/api/?name="+req.params.runn+"&rounded=true&bold=true&size=128&background=ededed&color=272727"
    Story.find({name:req.params.runn},function(err,arr){
     res.render('userpage',{name: un,url:src,cond:false,condFollow:false,recent:arr,condsearch:false});        
    })
    
})
app.get('/users',function(req,res){
    a=[];
    User.find({},function(err,arr){
        if(err){
            console.log(err);
        }
        else{
            for(var i=0;i<arr.length;i++){
                var obj={
                    userName:arr[i].username,
                    password:arr[i].pwd
                }
                a.push(obj);
            }
            res.send(a);
        }
    })
});
app.get('/stories',function(req,res){
    a=[]
    Story.find({},function(err,arr){
        if(err){
            console.log(err);
        }
        else{
            for(var i=0;i<arr.length;i++){
                var obj={
                    title:arr[i].head,
                    author:arr[i].name,
                    story:arr[i].cont,
                    time:arr[i].time
                }
            a.push(obj);
            }
            res.send(a);
        }
        
    })
})
app.get('/follow',function(req,res){
    a=[]
    User.find({},function(err,arr){
        if(err){
            console.log(err);
            
        }
        else{
            for(var i=0;i<arr.length;i++){
                var obj={
                    name:arr[i].username,
                    followings:arr[i].following,
                    follower:arr[i].followers
                }
                a.push(obj);
            }
            res.send(a);
        }

    })
})
app.get('/change',function(req,res){
    a=[]
    Story.find({},function(err,arr){
        if(err){
            console.log(err);
        
        }
        else{
            for(var i=0;i<arr.length;i++){
                var obj={
                    name:arr[i].name
                }
                a.push(obj);
            }
            res.send(a)
        }
    })
})
app.get('/signin',function(req,res){
    res.render('signin',{found:match});
})
app.get('/userpage/:User',function(req,res){
    var un=req.params.User;
    var follower,followin;
    let s=[];
    src="https://ui-avatars.com/api/?name="+un+"&rounded=true&bold=true&size=128&background=ededed&color=272727"
    Log.find({name:req.params.User},function(err,a){
        for(var i=0;i<a.length;i++){
            s.push(a[i].statement.join(' '));
        }
        if(err){
            console.log(err);
            
        }
        else{
            Story.find({name:un},function(err,arr){
                res.render('userpage',{name:un,url:src,cond:true,condFollow:false,recent:arr,followers:follower,following:followin,notes:s,condsearch:true});
            })        
        }
    })
    
    
   
});

app.post('/',function(req,res){
user=new User({
    username:req.body.userName.split(" ").join(''),
    pwd:req.body.password,
    followers:[],
    following:[]
});
User.find({username:req.body.userName},function(err,arr){
   
    if(!(arr.length>1)){
        logged=true;
        user.save();
    }
    
})
res.redirect('signin')
})
app.post('/signin',function(req,res){
name=req.body.userName;
match=true
User.find({username:name},function(err,arr){
    if(err){
        console.log(err);
    }
    else{
        if(arr.length>0){
            if(arr[0].pwd===req.body.password){
                res.redirect('/userpage/'+name);  
                logged=true;      
            }
            else{
                match=false;
                res.redirect('/signin');
            }
        }
        else{
            match=false;

            res.redirect('/signin');

        }
        
    }
})
    
})
//
app.post('/follow',function(req,res){
followUser=req.body.submit
followUser=followUser.split(',')
st1=["You followed",followUser[0]];
st2=[followUser[1],'followed you'];
logs=new Log({
    name:followUser[1],
    statement:st1
}) 
logs.save();
logs1=new Log({
    name:followUser[0],
    statement:st2
})
logs1.save();
User.updateOne({username:followUser[1]},{$push:{followers:followUser[0]}},function(err,suc){
    if(err){
        console.log(err);
        
    }
    else{
        console.log(suc);
        
    }
});
User.updateOne({username:followUser[0]},{$push:{following:followUser[1]}},function(err,suc){
    if(err){
        console.log(err);

    }
    else{
        console.log(suc);

    }
});
res.redirect('/visit/'+followUser[1]+'/'+followUser[0]);
})

app.post('/modify',function(req,res){
    console.log(req.body.submit);
    
    a=req.body.submit.split(',');
    now =new Date();
    const options = {  year: 'numeric', month: 'short', day: 'numeric' };

    s=now.toLocaleDateString(undefined,options)+" "+now.toLocaleTimeString();
    Story.updateOne({name:a[0],head:a[1]},{cont:req.body.contentupdate,time:s},function(err,succ){
        if(err){
            console.log(err);
            
        }
        else{
            console.log(succ);
            
        }
    })
    res.redirect('/home/'+a[0]);
})
app.post('/delete',function(req,res){
    a=req.body.submit.split(',');
    console.log(a);
    
    Story.deleteOne({name:a[0],head:a[1]},function(err,succ){
        if(err){
            console.log(err);
        }
        else{
            console.log(succ);
            
        }
    })
    res.redirect('/home/'+a[0]);
})
app.post('/editprofile',function(req,res){
    User.find({username:req.body.editname},function(err,arr){
        if(arr.length>1){
            res.redirect("/userpage/"+req.body.submit);
        }
        else{
            User.updateOne({username:req.body.submit},{username:req.body.editname,pwd:req.body.editpwd},function(err,succ){
                if(err){
                    console.log(err);
                    
                }
                else{
                    console.log(succ);
                    
                }
            })
            Story.updateOne({name:req.body.submit},{name:req.body.editname},function(err,succ){
                if(err){
                    console.log(err);
                    
                }
                else{
                    console.log(succ);
                    
                }
            })
            
            User.find({following:{$elemMatch:{$in:req.body.submit}}},function(err,arr){
                for(var i=0;i<arr.length;i++){
                User.update({following:{$elemMatch:{$in:req.body.submit}}},{$set:{"following.$":req.body.editname}},function(err,succ){
                    if(err){
                        console.log(err);
                        
                    }
                    else{
                        console.log(succ);
                        
                    }
                })
                Log.update({name:req.body.submit},{name:req.body.editname},function(err,succ){
                    if(err){
                        console.log(err);
                        
                    }
                    else{
                        console.log(succ);
                        
                    }
                })
                Log.update({statement:{$elemMatch:{$in:req.body.submit}}},{$set:{"statement.$":req.body.editname}},function(err,succ){
                    if(err){
                        console.log(err);
                        
                    }
                    else{
                        console.log(succ);
                        
                    }
                })
                }
            })
            res.redirect('/userpage/'+req.body.editname);
            
        
        }
    })
})
app.post('/userpage',function(req,res){
    User.updateOne({username:name},{sentMsg:req.body.message,sentMem:req.body.members},function(err){
        if(err){
            console.log(err);
        }
    });
    memb=req.body.members.split(',');
    
    for(var i=0;i<memb.length;i++){
    User.updateOne({username:memb[i]},{recMsg:req.body.message,recMem:name},function(err){
        if(err){
            console.log(err);
        }
    });
    }
    res.redirect('/userpage');
})
app.post('/publish',function(req,res){
    now =new Date();
    const options = {  year: 'numeric', month: 'short', day: 'numeric' };

    s=now.toLocaleDateString(undefined,options)+" "+now.toLocaleTimeString();
    story=new Story({
        name:req.body.submit,
        head:req.body.heading,
        cont:req.body.content,
        time:s
    })
    story.save();
    res.redirect('/home/'+req.body.submit);
})
app.listen(3000,function(){
    console.log("server started in port 3000");
    
})