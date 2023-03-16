const ErrorResponse = require('../utils/errorResponse')
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');

// @desc    GET all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps =asyncHandler(async(req,res,next) =>{
    let query;

    // Copy req.query
    const reqQuery = {...req.query};

    //Fileds to exculde 
    const removeFields = ['select','sort','page','limit'];

    //Loop over removeFields and delete them from record
    removeFields.forEach(param=> delete reqQuery[param]);

    // create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt,$gte,etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    //Finding resource
    query = Bootcamp.find(JSON.parse(queryStr)).populate({
        path:'courses',
        select:'minimumSkill tuition'
    });

    // select field
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // sort fields
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }
    else{
        query = query.sort('createdAt'-1);
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit,10) || 25;
    const startIndex = (page-1)*limit;
    const endIndex = page*limit;
    const total = await Bootcamp.countDocuments();
    
    query=query.skip(startIndex).limit(limit);
    
    // executin query
    const bootcamps = await query;

    // Pagination result
    const pagination = {};
    if(endIndex<total){
        pagination.next={
            page : page+1,
            limit
        }
    }
    if(startIndex>0){
        pagination.prev={
            page:page-1,
            limit
        }
    }

    res.status(200).json({success:true,count:bootcamps.length ,pagination,data:bootcamps});
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
        await bootcamp.remove();
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