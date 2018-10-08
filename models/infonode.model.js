const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let InfoNodeSchema = new Schema({
    id: {type: Number, required: true},
    name: {type: String, required: true, max: 100},
    target: {type: Number, required: false},
    category:{type: String, required: false}
});


// Export the model
var InfoNode = mongoose.model('InfoNode', InfoNodeSchema); 
module.exports = InfoNode;