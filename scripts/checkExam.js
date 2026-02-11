import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exam from '../models/Exam.js';

dotenv.config();

const checkLatestExam = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const exam = await Exam.findOne().sort({ createdAt: -1 });
        if (!exam) {
            console.log('No exams found');
        } else {
            console.log('Latest Exam:', exam.title);
            console.log('Exam ID:', exam._id);
            console.log('Questions Count:', exam.questions.length);
            console.log('Questions:', JSON.stringify(exam.questions, null, 2));
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkLatestExam();
