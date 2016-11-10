//
// 이 파일은 사용하지 않습니다.
// 참고용으로 첨부합니다.
//

var Observable = require("FuseJS/Observable");
var Camera = require("FuseJS/Camera");
var CameraRoll = require("FuseJS/CameraRoll");
var ImageTools = require("FuseJS/ImageTools");  
var Uploader = require("Uploader");

var print = debug_log;

var exports = module.exports;

var uploadUrl = 'http://192.168.0.169:3000/upload';

//  These observables will be used to display an image and its information

var imagePath = exports.imagePath = Observable();
var imageName = exports.imageName = Observable();
var imageSize = exports.imageSize = Observable();

//  This is used to keep the last image displayed as a base64 string in memory
var lastImage = exports.lastImage = Observable();

//  When we receive an image object we want to display, we call this
var displayImage = function(image)
{
  imagePath.value = image.path;
  imageName.value = image.name;
  imageSize.value = image.width + "x" + image.height;
  return new Promise(function(resolve, reject) {
      setTimeout(function() {
        ImageTools.getImageFromBase64(image).then(
          function(b64)
          {
            lastImage = b64;
          }
        );
        resolve(image);
      }, 1000);
  });
}

/*
    1. Take an unscaled "raw" picture
    2. Pass the picture into ImageTools.resize to scale and then crop it to 320x320
    3. Publish the scaled image to the device cameraroll
    4. Display the final image
*/

__image = null;

function sendImage()
{
  return new Promise(function(resolve, reject) {
        setTimeout(function() {

            return Uploader.send(__image.path, uploadUrl).then(function(response) {
              console.log("upload complete.");
              console.log(JSON.stringify(response));
              //var r = JSON.parse(response);
              //console.log(r.Success);
            });
    

            resolve();
        }, 1000);
    }); 
}

exports.takePicture = function()
{
  Camera.takePicture().then(
    function(image) {
      var args = { desiredWidth:320, desiredHeight:320 , mode:ImageTools.SCALE_AND_CROP, performInPlace:true };
 
      ImageTools.resize(image, args).then(
        function(image) {

          __image = image;
          
          //CameraRoll.publishImage(image);
          displayImage(image);

          return sendImage();
       

        }
      ).catch(
        function(reason) {
          console.log("Couldn't resize image: " + reason);
        }
      );
    }
  ).catch(
    function(reason){
      console.log("Couldn't take picture: " + reason);
    }
  );
};

exports.sendPicture = function()
{
  sendImage();
};



exports.selectImage = function()
{
  CameraRoll.getImage().then(
    function(image)
    {
      console.log("received image: "+image.path+", "+image.width+"/"+image.height);
      
          displayImage(image);
          
          return new Promise(function(resolve, reject) {
              setTimeout(function() {

                  return Uploader.send(image.path, uploadUrl).then(function(response) {
                    console.log("upload complete.");
                    console.log(JSON.stringify(response));
                    //var r = JSON.parse(response);
                    //console.log(r.Success);
                  });
          

                  resolve();
              }, 1000);
          });   


    }
  ).catch(
    function(reason){
      console.log("Couldn't get image: "+reason);
    }
  );
};


/*
  1. Take an unscaled "raw" picture
  2. Crop the image with a rectangle and save the result to a new file.
  3. Display the new image.
*/

exports.takeCroppedPicture = function()
{
  Camera.takePicture().then(
    function(image)
    {
      var options = { x: 20, y:20, width:320, height:320 };
      ImageTools.crop(image, options).then(
        function(image)
        {
          displayImage(image);
        }
      );
    }
  );
}

/*
  1. Take an aspect-corrected 100x100 resized image
  2. Get the image bytes as an arraybuffer
  3. Pass the image bytes back in to create a new image from them
  4. Display the returned image
*/

exports.takeSmallPicture = function()
{
  Camera.takePicture(100, 100).then(
    function(image) {
      ImageTools.getBufferFromImage(image).then(
        function(buffer) {
          ImageTools.getImageFromBuffer(buffer).then(
            function(image) {
              displayImage(image);
            }
          )
        }
      )
    }
  ).catch(
    function(reason){
      console.log("Couldn't take picture: "+reason);
    }
  );
}

/*
  1. Spawn a dialog to fetch an image from the camera roll
  2. Display the image
*/
exports.uploadImage = function()
{
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            return Uploader.send(image.path, uploadUrl).then(function(response) {
              console.log("upload complete.");
              console.log(JSON.stringify(response));
              //var r = JSON.parse(response);
              //console.log(r.Success);
            });
    

            resolve();
        }, 0);
    });
}




/*
  Bounce the last displayed image via base64 and display the reloaded image
*/
exports.b64Test = function()
{
  ImageTools.getImageFromBase64(lastImage).then(
    function(image){
           displayImage(image);

          return Uploader.send(image.path, uploadUrl).then(function(response) {
            console.log("upload complete.");
            console.log(JSON.stringify(response));
            //var r = JSON.parse(response);
            //console.log(r.Success);
          });


    }
  );
};
