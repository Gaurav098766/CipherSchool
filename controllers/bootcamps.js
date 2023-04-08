const path = require('path');
const ErrorResponse = require('../utils/errorResponse')
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');

// @desc    GET all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps =asyncHandler(async(req,res,next) =>{
    res.status(200).json(res.advancedResults);
}) 

// @desc    GET single bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp =asyncHandler(async(req,res,next) =>{
    const bootcamp = await Bootcamp.findById(req.params.id);
    if(!bootcamp){
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404)
        );
    }
    res.status(200).json({success:true,data:bootcamp});
}) 

// @desc    GET single bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.createBootcamp =asyncHandler(async(req,res,next) =>{
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({
            success:true,
            data:bootcamp
        })   
})


// @desc    Update bootcamps
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp =asyncHandler(async(req,res,next) =>{
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });
        if(!bootcamp){
            return next(
                new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404)
            );
        }
        res.status(200).json({ sucess: true, data:bootcamp});
})


// @desc    delete bootcamps
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp =asyncHandler(async(req,res,next)=>{
    const bootcamp = await Bootcamp.findById(req.params.id);
        if(!bootcamp){
            return next(
                new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404)
            );
        }
        await bootcamp.deleteOne();
        res.status(200).json({ sucess: true ,data:{}});
})


// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zip/:distance
// @access  Private
exports.getBootcampsInRadius =asyncHandler(async(req,res,next) =>{
   const {zipcode ,distance} = req.params;
    
    //Get lan/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    //Calc radius using radians
    //divide dist by radius of earth
    // Earth Radius = 3963 mi / 6378 km
    const radius = distance/3963;
    
    const bootcamps = await Bootcamp.find({
        location:{$geoWithin :{$centerSphere:[[lng,lat], radius]}}
    }) 

    res.status(200).json({
        success:true,
        count: bootcamps.length,
        data: bootcamps
    })
})

// @desc    upload photo for bootcamps
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload =asyncHandler(async(req,res,next)=>{
    const bootcamp = await Bootcamp.findById(req.params.id);
        if(!bootcamp){
            return next(
                new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404)
            );
        }
        
        if(!req.files){
            return next(
                new ErrorResponse(`Please Upload a file`,400)
            )
        }
        // res.status(200).json({ sucess: true ,data:{}});
        const file = req.files.file;


        // MAKE sure the file is photo
        if(!file.mimetype.startsWith('image')){
            return next(
                new ErrorResponse(`Please upload image file`,400)
            );
        }

        //Check file size
        if(!file.size > process.env.MAX_FILE_UPLOAD){
            return next(    
                new ErrorResponse(`Please upload a image size less than ${process.env.MAX_FILE_UPLOAD}`,400)
            );
        }

        // Create custom filename
        file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

        file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`,async err=>{
            if(err){
                console.error(err);
                return next(new ErrorResponse(`Problem with file upload`,500));
            }

            await Bootcamp.findByIdAndUpdate(req.param.id,{
                photo:file.name
            })

            res.status(200).json({
                status: true,
                data: file.name
            })
        })
    })