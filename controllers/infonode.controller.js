const InfoNode = require('../models/infonode.model');

//Simple version, without validation or sanitation
exports.test = function (req, res) {
    res.send('Greetings from the Test controller!');
};

//-CRUD
//--CREATE
exports.infonode_create = function (req, res, next) {
    let infonode = new InfoNode(
        {
            id: req.body.id,
            name: req.body.name,
            target: req.body.target,
            category: req.body.category
        }
    );

    infonode.save(function (err) {
        if (err) {
            return next(err);
        }
        res.send('InfoNode Created successfully');
    });
};

//--READ
exports.infonode_details = function (req, res) {
    InfoNode.findById(req.params.id, function (err, infonode) {
        if (err) return next(err);
        res.send(infonode);
    });
};

//--UPDATE
exports.infonode_update = function (req, res) {
    InfoNode.findByIdAndUpdate(req.params.id, {$set: req.body}, function (err, infonode) {
        if (err) return next(err);
        res.send('InfoNode '+  infonode.name + ' updated!');
    });
};

//--DELETE
exports.infonode_delete = function (req, res) {
    InfoNode.findByIdAndRemove(req.params.id, function (err) {
        if (err) return next(err);
        res.send('Deleted successfully!');
    })
};