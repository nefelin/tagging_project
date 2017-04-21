
//Proper use var smth = New ImageManager(path of json for metadata);

//Something feels inelegent about relationship between dom elements and data
//Rethink structure

console.log('Loaded ImageManager.js');

function ImageManager(dataFile){
	this.path = dataFile;
	this.data = null;
	this.imgLib = [];
	this.classAllAs = "imgLib"; //All images generated for dom get this class

	
//ALL INITIALIZATION -------

	//Try to open metadata file. If none is found creates a blank object
	var req = new XMLHttpRequest();
	req.open("GET",dataFile,false);
	req.send(null);
	var shouldFail = req.responseText;

	console.log(req.status);
	if (req.status>400){
		console.log('No metadata found! \nCreating blank...');
		this.data = {};
	}
	else {
		console.log('Found tags.json, attempting to parse');
		this.data = JSON.parse(req.responseText);
	}


	//Get file list
	var req = new XMLHttpRequest();
	req.open("GET","./indexer.php",false);
	req.send(null);
	var imageFiles = [];
	var response = JSON.parse(req.responseText);
	for (key in response){
		imageFiles.push(response[key]); 
	}

	//If file doesn't have entry, create blank entry.
	var entryCount = 0;
	for (file of imageFiles){
		if (this.data[file]==undefined){
			this.data[file]={tags:[]};
			entryCount++;
		}
	}
	console.log('Created ' + entryCount + " new entries");

	//Conversely if the file an entry is based on is not present, delete that entry
	entryCount = 0;
	for (entry in this.data){
		if (imageFiles.indexOf(entry)==-1){
			delete this.data[entry];
			entryCount++
		}

	}
	console.log('Deleted ' + entryCount + " entries for missing files");

	//Create a DOM represented array of images that can be requested and filtered by tag
	for (let file in this.data) {
		var newIMG = document.createElement("IMG");

		newIMG.src = file;

		newIMG.classList.add(this.classAllAs); 

		for (tag of this.data[file].tags){
			newIMG.classList.add(tag);  //Causes errors if spaces are allowed in tags
		} //add a class for each tag prefaced by tag_
		
		this.imgLib.push(newIMG);
	}



//FUNCTIONS --------------



	//Function to write metadata in memory to this.path requires presence of writeJSON.php
	this.saveData = function (){
		//Nightmare figuring out that PHP Post doesn't like JSON POSTs. Must use php://input

		var xhr = new XMLHttpRequest();
		xhr.open('POST', 'writeJSON.php');
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onload = () => { //Unbound allows direct use of this (this.path)
		    if (xhr.status === 200) {
		        console.log('Success writing' + this.path);

		     
		    }
		};
		xhr.send(JSON.stringify({
		    path: this.path,
		    data: JSON.stringify(this.data)
		}));
	}

	//Is it over-worked to write getter interface that just returns dom objects meeting certain filter criteria
	//or is it better to let the user manage that and give minimal interface for DOM collection?
	
	this.hasTag = function(image, tag){
		if (tag == '') {console.log('Error in ImageManager.tag, no tags passed');return true;}
		if (this.data[image.getAttribute('src')].tags.indexOf(tag)==-1)
			return false;
		else return true;
	}

	//Write tag + untag functions that updates metadata and as well as classing the dom object
	//An  question for me is whether this should take the filename for the img or the DOM object
	//Went with DOM object cause it makes the calls simpler.
	this.tag = function (imgList, tagList){
		//Accept both string and array as arguments
		if (tagList == '') {console.log('Error in ImageManager.tag, no tags passed');return 0;}
		tagList = [].concat(tagList);

		for (i = 0;i<tagList.length;i++){ //Accept only space free strings.
			if (tagList[i].indexOf(' ') >= 0) {
				console.log('ImageManager.tag() removed "' + tagList[i] + '" from arguments due to whitespace.')
				tagList.splice(i,1);				
			}
		}

		for (i = 0;i<imgList.length;i++) {
			for (tag of tagList){
				let fileName = imgList[i].getAttribute('src');
				if (this.data[fileName].tags.indexOf(tag)==-1){
					this.data[fileName].tags.push(tag);
				}
				/*else {
					console.log(fileName + " already tagged as " + tag);
				}*/

			}
		}
		this.saveData(); //Save changes to file

	}

	this.untag = function(imgList, tagList){//Not yet implemented
		tagList = [].concat(tagList); //Accept both string and array as arguments
		if (tagList[0]='*') { 					//accept * to clear all tags
			for (i = 0;i<imgList.length;i++) {
				let fileName = imgList[i].getAttribute('src');
				this.data[fileName].tags = []
			}

		}

	}

	//tagSet generated dynamically, used to populate menu.
	this.tagSet = function() {
		var results = new Set();
		for (entry in this.data){
			for (tag of this.data[entry].tags){
				results.add(tag);
			}
		}
		return Array.from(results).sort();
	}




}
