require("dotenv").config();
// const MONGO_URI = process.env.MONGO_URI;
// const MONGO_URI =
const mongoose = require("mongoose");
mongoose.connect(MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
	console.log("Connected to MongoDB");
});

const postSchema = new mongoose.Schema({
	_id: String,
	topic: String,
	stamp: String,
	time: String,
	text: String,
});

const Post = mongoose.model("Post", postSchema);

createPost = (data) => {
	let newPost = new Post({
		_id: data.id,
		topic: data.topic,
		stamp: data.stamp,
		time: data.time,
		text: data.text,
	});
	newPost.save(function (err, post) {
		if (err) {
			console.log("Error uploading to mongoDB.");
		}
		console.log("Uploaded new post to mongoDB");
	});
};

exports.createPost = createPost;
