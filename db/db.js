// const mongoose = require('mongoose')

// mongoose.connect(process.env.MONGODB_URL, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false
// }).then(() => console.log('DB Connected!'))
// .catch(err => {
// console.log(`DB Connection Error: ${err.message}`);
// });

const url = "mongodb+srv://levien98ha:vien09071998@cluster0.otlkn.mongodb.net/<rentroom>?retryWrites=true&w=majority";
const mongoose = require('mongoose')
const connectionParams={
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true 
}
mongoose.connect(url,connectionParams).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));


