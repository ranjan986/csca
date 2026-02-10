
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exam from '../models/Exam.js'; // Adjust path if needed
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
dotenv.config({ path: join(__dirname, '../.env') });

const exams = [
    "CSCA A+ Certification Exams",
    "CSCA Cloud+ Certification Exam",
    "CSCA CloudNetX Certification Exam",
    "CSCA Cybersecurity Analyst (CySA+) Certification Exam",
    "CSCA Data+ Certification Exam",
    "CSCA DataAI Certification Exam",
    "CSCA DataSys+ Certification Exam",
    "CSCA Linux+ Certification Exam",
    "CSCA Network+ Certification Exam",
    "CSCA PenTest+ Certification Exam",
    "CSCA Project+ Certification Exam",
    "CSCA Security+ Certification Exam",
    "CSCA SecurityX Certification Exam",
    "CSCA Server+ Certification Exam",
    "CSCA Tech+ Certification Exam"
];

const sampleQuestions = [
    {
        questionText: "What is the primary function of a network firewall?",
        options: [
            "To speed up internet connectivity",
            "To monitor and control incoming/outgoing network traffic",
            "To physically block intruders from entering a server room",
            "To store backup copies of sensitive data"
        ],
        correctAnswer: "To monitor and control incoming/outgoing network traffic",
        marks: 1
    },
    {
        questionText: "Which term describes a fraudulent attempt to obtain sensitive information by disguising as a trustworthy entity in electronic communication?",
        options: [
            "Bluejacking",
            "Phishing",
            "Skimming",
            "Spamming"
        ],
        correctAnswer: "Phishing",
        marks: 1
    },
    {
        questionText: "What does SSL (Secure Sockets Layer) primarily provide?",
        options: [
            "Automatic virus removal",
            "High-speed data transfer",
            "Encrypted communication between a web server and a browser",
            "Physical security for network hardware"
        ],
        correctAnswer: "Encrypted communication between a web server and a browser",
        marks: 1
    },
    {
        questionText: "In cybersecurity, what does the 'CIA Triad' stand for?",
        options: [
            "Centralized Intelligence Agency",
            "Confidentiality, Integrity, and Availability",
            "Code, Infrastructure, and Application",
            "Click, Install, and Activate"
        ],
        correctAnswer: "Confidentiality, Integrity, and Availability",
        marks: 1
    },
    {
        questionText: "An exploit that takes advantage of a software vulnerability that is unknown to the vendor is called a:",
        options: [
            "Brute force attack",
            "SQL injection",
            "Zero-day exploit",
            "Ransomware"
        ],
        correctAnswer: "Zero-day exploit",
        marks: 1
    },
    {
        questionText: "Which of these is the most secure method for Multi-Factor Authentication (MFA)?",
        options: [
            "SMS-based codes",
            "Security questions (e.g., 'Mother's maiden name')",
            "Hardware security keys (e.g., YubiKey)",
            "A shared password among team members"
        ],
        correctAnswer: "Hardware security keys (e.g., YubiKey)",
        marks: 1
    },
    {
        questionText: "What is the main goal of a 'Denial of Service' (DoS) attack?",
        options: [
            "To steal credit card information",
            "To make a machine or network resource unavailable to its intended users",
            "To decrypt highly sensitive passwords",
            "To install Bitcoin mining software on a server"
        ],
        correctAnswer: "To make a machine or network resource unavailable to its intended users",
        marks: 1
    },
    {
        questionText: "What is the purpose of 'Salting' in password hashing?",
        options: [
            "To make passwords easier to remember",
            "To increase the speed of the hashing algorithm",
            "To prevent 'Rainbow Table' attacks by adding unique data to each password",
            "To obscure the length of the original password"
        ],
        correctAnswer: "To prevent 'Rainbow Table' attacks by adding unique data to each password",
        marks: 1
    },
    {
        questionText: "Which protocol is considered the secure alternative to Telnet?",
        options: [
            "HTTP",
            "SSH (Secure Shell)",
            "FTP",
            "SMTP"
        ],
        correctAnswer: "SSH (Secure Shell)",
        marks: 1
    },
    {
        questionText: "What is 'Social Engineering' in the context of security?",
        options: [
            "The process of building social media networks",
            "Manipulating people into divesting confidential information",
            "A method for optimizing server hardware",
            "Writing code for social interaction features"
        ],
        correctAnswer: "Manipulating people into divesting confidential information",
        marks: 1
    }
];

const seedExams = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Clear existing exams
        await Exam.deleteMany({});
        console.log('Existing exams cleared');

        const examDocs = exams.map(title => ({
            title,
            description: `Official ${title} from CSCA.`,
            duration: 60, // 60 minutes
            totalQuestions: sampleQuestions.length,
            category: "Certification",
            price: 199, // Placeholder price
            isActive: true,
            questions: sampleQuestions
        }));

        await Exam.insertMany(examDocs);
        console.log('Exams Seeded Successfully');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedExams();
