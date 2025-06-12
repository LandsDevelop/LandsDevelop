const mongoose = require('mongoose');

mongoose.connect(
  'mongodb+srv://bsriman3885:TBj34xwPYV16KFQh@cluster0.o0wfog.mongodb.net/findland?retryWrites=true&w=majority&appName=Cluster0',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));