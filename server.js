const formidable = require('formidable');
const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
const fs = require('fs');
const mongourl = 'mongodb+srv://msh:Aogh110021@cluster0.96xry.mongodb.net/OPEN UNIVERSITY?retryWrites=true&w=majority';
const dbName = 'Assignment';
const client = new MongoClient(mongourl);

	const users = new Array(
		{name: 'demo', password: ''},
		{name: 'student', password: ''}
	);

	var doc = {};

	const findRestaurants = (db, callback) => {
		let cursor = db.collection('restaurants').find().limit(100);
		cursor.toArray((err,docs) => {
			assert.equal(err,null);
			callback(docs);
		});
	};

	const findDocuments = (db,details, callback) => {
		let cursor = db.collection('restaurants').find({"restaurant_id": Number(details) }).limit(10);
		cursor.forEach((doc) => {
		console.log(JSON.stringify(doc));
		callback(doc);	
		});	
	};

	const findMap = (db,map, callback) => {
		let cursor = db.collection('restaurants').find({"restaurant_id": Number(map) }).limit(10);
		cursor.forEach((doc) => {
		console.log(JSON.stringify(doc));
		callback(doc);	
		});
	}
	const findSearch = (db, data, callback) =>{
		let cursor = {};
		if(data.name !== "" && data.borough !== "" && data.cusine !== ""){
			cursor = db.collection('restaurants').find({"name": data.name, "borough": data.borough, "cusine": data.cusine});
		} else if (data.name !== "" && data.borough !== ""){
			cursor = db.collection('restaurants').find({"borough": data.borough, "name": data.name});
		} else if (data.name !== "" && data.cusine !== ""){
			cursor = db.collection('restaurants').find({"name": data.name, "cusine": data.cusine});
		} else if (data.cusine !== "" && data.borough !== ""){
			cursor = db.collection('restaurants').find({"borough": data.borough, "cusine": data.cusine});
		} else if(data.name !== ""){
			cursor = db.collection('restaurants').find({"name": data.name});
		} else if(data.borough !== ""){
			cursor = db.collection('restaurants').find({"borough": data.borough});
		} else if(data.cusine !== ""){
			cursor = db.collection('restaurants').find({"cusine": data.cusine});
		} else {
			cursor = db.collection('restaurants').find();
		}
		cursor.toArray((err,docs) => {
			assert.equal(err,null);
			callback(docs);
		});
	}	

	const insertDocument = (db, doc, callback) => {
		db.collection('restaurants').
		insertOne(doc, (err, results) => {
			assert.equal(err,null);
			console.log(`Inserted document(s): ${results.insertedCount}`);
	
		});
	}

	const findNumber = (db, callback) => {
		let cursor = db.collection('number').find('number').limit(10)
		cursor.toArray((err,docs) => {
			assert.equal(err,null);
			callback(docs);
		});
	};
	

	const updateNumber = (db, doc) => {
		db.collection('number').
		updateOne({"_id": ObjectID("5fe86d3030eccddfcfdb64a2")},
					{$set: {"number" : Number(doc)				
					}}
					,(err, results) => {
						assert.equal(err, null);
						console.log(results);
						if (results.result.nModified == 1) {
							console.log('Update Succeed!');
							} else {
							console.log(doc);
							}
						
		});
	};

	const updateDocument = (db, doc) => {
		db.collection('restaurants').
		updateOne({"restaurant_id": doc.restaurant_id},
					{$set: {"name" : doc.name,
					"borough" : doc.borough,
					"cusine" : doc.cusine,
					"photo" : doc.photo,
					"photo_minitype" : doc.photo_minitype,
					"address" : {
						"street": doc.address.street,
						"building": doc.address.building,
						"zipcode": doc.address.zipcode,
						"coord": doc.address.coord
					}
					}}
					,(err, results) => {
						assert.equal(err, null);
						console.log(results);
						if (results.result.nModified == 1) {
							console.log('Update Succeed!');
							} else {
							console.log(doc);
							}
						
		});

	};

	const deleteRestaurants = (db, doc, callback) =>{
		db.collection('restaurants').deleteOne(
			{"restaurant_id": doc.restaurant_id}, 
			(err, results) => {
				assert.equal(err, null);
				console.log(results);
				callback(results);
			}
		);
	};

	const updateRating = (db, doc) => {
		db.collection('restaurants').
		update({"restaurant_id": Number(doc.restaurant_id)},
					{$push: {"grades" : {
						"user": doc.grades.user,
						"score": doc.grades.score
					}
					}}
					,(err, results) => {
						assert.equal(err, null);
						console.log(results);
						if (results.result.nModified == 1) {
							console.log('Update Succeed!');
							} else {
							console.log(doc);
							}
						
		});

	};

	app.set('view engine','ejs');
	const SECRETKEY = 'COMPS381FProjectAssignment';
	app.use(session({
  		name: 'loginSession',
  		keys: [SECRETKEY]
	}));

	process.on('unhandledRejection', (reason, p) => {
		console.error('Unhandled Rejection at:', p, 'reason:', reason)
		process.exit(1)
  	});

	// support parsing of application/json type post data
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	app.get('/', (req,res) => {
		doc = {};
		console.log(req.session);
		if (!req.session.authenticated) {    // user not logged in!
			res.redirect('/login');
		}else{
			client.connect((err) => {
				assert.equal(null,err);
				console.log("Connected successfully to server");
				const db = client.db(dbName);
				findRestaurants(db,(restaurants) => {
				//console.log("Disconnected MongoDB server");
					res.render('menu',{name:req.session.username, restaurants: restaurants});

				});
			});
		}
	});

	app.get('/login', (req,res) => {
		res.status(200).render('login',{});
	});

	app.post('/login', (req,res) => {
		users.forEach((user) => {
			if (user.name == req.body.name && user.password == req.body.password) {
				// correct user name + password
				// store the following name/value pairs in cookie session
				req.session.authenticated = true;        // 'authenticated': true
				req.session.username = req.body.name;	 // 'username': req.body.name		
			}
		});
		res.redirect('/');
	});

	app.get('/logout', (req,res) => {
		req.session = null;   // clear cookie-session
		res.redirect('/');
	});

	app.get('/showdetails', (req,res) => {
		const db = client.db(dbName);
		findDocuments(db,req.query.id,(details) => {
			res.render('details',{c: details});
		})
	});

	app.get('/createPage', (req,res) => {
		const db = client.db(dbName);
		findNumber(db,(number) => {		
			console.log(number);
			res.status(200).render('create', {ids: number});
		})	
	});


	app.post('/create', (req,res) => {
		doc={};		
		const form = new formidable.IncomingForm();
    	form.parse(req, (err, fields, files) => {
        	if (files.photoUpload && files.photoUpload.size > 0) {
            	fs.readFile(files.photoUpload.path, (err,data) => {
					assert.equal(err,null);
					doc['restaurant_id'] = Number(fields.restaurant_id);
					doc['name'] = fields.name;
					doc['borough'] = fields.borough;
					doc['cusine'] = fields.cusine;
                	doc['photo'] = new Buffer.from(data).toString('base64');
					doc['photo_minitype'] = files.photoUpload.type;
					doc['address'] = {
						"street": fields.street,
						"building": fields.building,
						"zipcode": fields.zipcode,
						"coord": fields.coord
					};
					doc['grades']= [];
					doc['owner'] = req.session.username;					
				console.log("Connected successfully to server");
				const db = client.db(dbName);						
				insertDocument(db, doc);
				updateNumber(db, fields.restaurant_id);
				});
			res.render('createSuccess');                  
        	} else {
            	res.render('createFail');
        	}
		});	
	});

	app.get('/showMap', (req,res) => {	
		const db = client.db(dbName);
		findMap(db,req.query.id,(map) => {	
			res.render('map',{map: map, zoom:req.query.zoom ? req.query.zoom : 15});
		})
	});

	app.get('/updatepage', (req,res) => {
		const db = client.db(dbName);
		findDocuments(db,req.query.id,(details) => {
			if (req.session.username == details.owner){
				res.render('update_ejs',{c: details});
			}else{				
				res.status(200).render('updateFail');
			}
		})	
	});
	
	app.post('/update', (req,res) => {
		doc = {};
		const form = new formidable.IncomingForm();
		form.parse(req, (err, fields, files) => {
			if (files.photoUpload && files.photoUpload.size > 0) {
				fs.readFile(files.photoUpload.path, (err,data) => {
					assert.equal(err,null);
					doc['restaurant_id'] = Number(fields.restaurant_id);
						doc['name'] = fields.name;
						doc['borough'] = fields.borough;
						doc['cusine'] = fields.cusine;
                        doc['photo'] = new Buffer.from(data).toString('base64');
						doc['photo_minitype'] = files.photoUpload.type;
						doc['address'] = {
							"street": fields.street,
							"building": fields.building,
							"zipcode": fields.zipcode,
							"coord": fields.coord
						};
						doc['grades']= [],
						doc['owner'] = req.session.username;	
					console.log("Connected successfully to server");
							const db = client.db(dbName);							
							updateDocument(db, doc);
				}); 
					res.render('updateSuccess');				
			}else{
				res.render('updateFail');
			}
		});	   
	});

	app.get('/delete', (req,res) => {
		var theowner={};
		const db = client.db(dbName);
		findDocuments(db,req.query.id,(docs) => {	
			if (req.session.username == docs.owner){
				deleteRestaurants(db, docs, (results) => {
					res.status(200).render('delete_ejs');				
				})
			}else{
				console.log(theowner);
				res.status(200).render('wrongUser');
			}
		})
	});

	app.get('/ratingpage', (req,res) => {		
			const db = client.db(dbName);		
			findDocuments(db,req.query.id, (docs) => {
				let rated = false;
				if(doc.grades == null){
					docs.grades.forEach(function(doc) {	
						if (req.session.username == doc.user){
							rated = true;
							console.log('You already rated!');
						
						} 	
					});
				}
				if (rated == false){		
					res.status(200).render('rating_ejs', {name:req.session.username, restaurants: docs, });
				}else{
					res.render('ratingFail');
				}
			});
	
	});

	app.post('/ratingCreate', (req,res) => {
		doc={};
		const form = new formidable.IncomingForm();
		form.parse(req, (err, fields, files) => {
				assert.equal(err,null);
				doc['restaurant_id'] = fields.restaurant_id;
				doc['grades'] = {
					"user": fields.name,
					"score": fields.score
				};				
				const db = client.db(dbName);
				updateRating(db, doc);
				res.render('ratingSuccess');
		
		});
	});

	app.get('/searchPage', (req,res) => {		
		
		res.render('searchPage');
			
	});

	app.post('/search', (req,res) => {
		var data = {};
		const db = client.db(dbName);
		const form = new formidable.IncomingForm();
		form.parse(req, (err, fields) => {
			assert.equal(err,null);
			data['name'] = fields.name;
			data['borough'] = fields.borough;
			data['cusine'] = fields.cusine;
			findSearch(db, data, (cursor) => {
				res.render('doneSearchPage',{restaurants: cursor});

			}) ;
		});		
	});

	app.listen(process.env.PORT || 8099);