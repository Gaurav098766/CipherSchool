const express = require('express');
const {
getBootcamp,
getBootcamps,
createBootcamp,
updateBootcamp,
deleteBootcamp,
getBootcampsInRadius,
bootcampPhotoUpload
} =require('../controllers/bootcamps')

const advancedResults = require('../middleware/advancedResults');
const Bootcamp = require('../models/Bootcamp');

// Include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

//Re-route into other reosurse routers
router.use('/:bootcampId/courses', courseRouter); 

router.route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius)

router.route('/:id/photo').put(bootcampPhotoUpload);


router.route('/')
  .get(advancedResults(Bootcamp,'courses'),getBootcamps)
  .post(createBootcamp)

router.route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp)

module.exports = router;