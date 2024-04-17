const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://bogdan:o6POhKDDqxRgrz3w@cluster0.qjyufua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log('mongoDB succ :)')
    })
    .catch(() => {
        console.log('mongoDB fail :(')
    });
const ShortURLSchema = mongoose.Schema(
    {
        original_url: {
            type: String,
            required: true
        },
        short_url: Number
    }
)
const ShortURLModel = mongoose.model("ShortURLMODEL", ShortURLSchema);

module.exports = ShortURLModel;