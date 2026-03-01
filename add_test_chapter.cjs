const mongoose = require('mongoose');
const uri = "mongodb://127.0.0.1:27017/csca_secure";

const chapter = {
    title: "Test Video Lecture",
    description: "This is a test lecture to verify video playback and PDF visibility.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Rickroll for testing
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPreview: true,
    order: 1
};

mongoose.connect(uri).then(async () => {
    const db = mongoose.connection.db;
    const courses = await db.collection("courses").find({}).toArray();
    if (courses.length > 0) {
        const courseId = courses[0]._id;
        await db.collection("courses").updateOne(
            { _id: courseId },
            { $set: { chapters: [chapter] } }
        );
        console.log(`Added test chapter to course: ${courses[0].title}`);
    } else {
        console.log("No courses found to update.");
    }
    process.exit(0);
});
