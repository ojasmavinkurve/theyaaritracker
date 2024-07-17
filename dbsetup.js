const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://ojamavinkurve:q8E0qOoKpNkI8V2m@cluster0.y924tv6.mongodb.net/theyaaritracker?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error: ', err);
});

module.exports = mongoose;