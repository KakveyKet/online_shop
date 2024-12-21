const express = require('express');
const router = express.Router();
const dynamicCrudController = require('../Controller/crudController');
const upload = require('../upload/upload');  // Assuming 'upload' is your file upload middleware

// Define dynamic routes for any collection
router.route('/:collection')
    .get((req, res) => {
        const controller = dynamicCrudController(req.params.collection);
        if (!controller) return res.status(400).json({ error: 'Invalid collection' });
        controller.getAll(req, res);
    })
    .post(upload.single('profileImage'), (req, res) => {  // Add upload middleware for POST
        const controller = dynamicCrudController(req.params.collection);
        if (!controller) return res.status(400).json({ error: 'Invalid collection' });

        // If a file was uploaded, add its path to the request body
        if (req.file) {
            req.body.profileImage = req.file.path;  // Assuming 'path' is where the image is stored
        }

        controller.create(req, res);
    });

router.route('/:collection/:id')
    .get((req, res) => {
        const controller = dynamicCrudController(req.params.collection);
        if (!controller) return res.status(400).json({ error: 'Invalid collection' });
        controller.getOne(req, res);
    })
    .put(upload.single('profileImage'), async (req, res) => {
        const controller = dynamicCrudController(req.params.collection);
        if (!controller) return res.status(400).json({ error: 'Invalid collection' });

        // If a file is uploaded, include the file path in the request body
        if (req.file) {
            req.body.profileImage = req.file.path; // Or use the file URL if you're storing it remotely
        }

        controller.update(req, res);
    })
    .patch((req, res) => {
        const controller = dynamicCrudController(req.params.collection);
        if (!controller) return res.status(400).json({ error: 'Invalid collection' });
        controller.update(req, res);
    }) // Implement the PATCH method as needed
    .delete((req, res) => {
        const controller = dynamicCrudController(req.params.collection);
        if (!controller) return res.status(400).json({ error: 'Invalid collection' });
        controller.delete(req, res);
    });

module.exports = router;
