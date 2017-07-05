export default {
  url:
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/mern-starter"
};
