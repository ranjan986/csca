const mongoose = require('mongoose');
const uri = "mongodb://127.0.0.1:27017/csca_secure";
mongoose.connect(uri).then(async () => {
    const db = mongoose.connection.db;
    const courses = await db.collection("courses").find({}).toArray();
    console.log("--- COURSES ---");
    console.log(JSON.stringify(courses.map(c => ({
        id: c._id,
        title: c.title,
        price: c.price,
        chapterCount: c.chapters?.length || 0,
        chapters: c.chapters
    })), null, 2));

    const enrollments = await db.collection("enrollments").find({}).toArray();
    console.log("--- ENROLLMENTS ---");
    console.log(JSON.stringify(enrollments, null, 2));

    const users = await db.collection("users").find({}).toArray();
    console.log("--- USERS ---");
    console.log(JSON.stringify(users.map(u => ({
        id: u._id,
        email: u.email,
        role: u.role
    })), null, 2));

    process.exit(0);
});
