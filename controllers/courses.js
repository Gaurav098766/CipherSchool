const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');


// @desc    GET all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public

exports.getCourses = asyncHandler(async(req,res,next)=>{
    let query;

    // get courses by specific bootcampID
    if(req.params.bootcampId){
        query = Course.find({bootcamp:req.params.bootcampId})
    }
    // get all courses irrespective of bootcampID
    else{
        // query = Course.find().populate('bootcamp'); // to get all info bootcamp
        query  = Course.find().populate({ // to get specific info of a bootcamp
            path:'bootcamp',
            select:'name description'
        })
    }

    const courses = await query;

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    })
})

// @desc    GET single course
// @route   GET /api/v1/courses/:id
// @access  Public

exports.getCourse = asyncHandler(async(req,res,next)=>{
    const course = await Course.findById(req.params.id).populate({
        path:'bootcamp',
        select:'name description'
    })

    if(!course){
        return next(
           new ErrorResponse(`No course with the id of ${req.params.id}`,404)
        )
    }
    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc    Add course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private

exports.addCourse = asyncHandler(async(req,res,next)=>{
    req.body.bootcamp =  req.params.bootcampId;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if(!bootcamp){
        return next(
           new ErrorResponse(`No course with the id of ${req.params.bootcampId}`,404)
        )
    }

    const course = await Course.create(req.body)
    res.status(200).json({
        success: true,
        data: course
    })
})

