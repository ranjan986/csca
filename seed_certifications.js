import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Certification from './models/Certification.js';

dotenv.config();

const certificationsData = [
    // Red / Offensive Security
    {
        id: 'cvs-apt',
        title: 'CVS-APT',
        subtitle: 'Advanced Penetration Tester',
        code: 'CVS-APT',
        level: 'Advanced',
        description: "Master advanced penetration testing techniques to identify and exploit vulnerabilities in complex environments.",
        category: 'Red / Offensive',
        color: 'from-primary-600 to-primary-950',
        popular: true,
        price: 499,
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200',
    },
    {
        id: 'cvs-wapt',
        title: 'CVS-WAPT',
        subtitle: 'Web Application Penetration Tester',
        code: 'CVS-WAPT',
        level: 'Professional',
        description: "Specialize in securing web applications by learning to find and fix critical web vulnerabilities like SQLi and XSS.",
        category: 'Red / Offensive',
        color: 'from-primary-500 to-primary-800',
        price: 449,
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200',
    },
    {
        id: 'cvs-mapt',
        title: 'CVS-MAPT',
        subtitle: 'Mobile Application Penetration Tester',
        code: 'CVS-MAPT',
        level: 'Professional',
        description: "Learn to assess and secure mobile applications on both Android and iOS platforms against modern threats.",
        category: 'Red / Offensive',
        color: 'from-primary-700 to-primary-900',
        price: 449,
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200',
    },
    {
        id: 'cvs-rto',
        title: 'CVS-RTO',
        subtitle: 'Red Team Operations',
        code: 'CVS-RTO',
        level: 'Expert',
        description: "Execute full-scope red team operations, simulating real-world adversaries to test an organization's detection and response capabilities.",
        category: 'Red / Offensive',
        color: 'from-primary-800 to-black',
        price: 599,
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=1200',
    },

    // Blue / Defensive Security
    {
        id: 'cvs-soc',
        title: 'CVS-SOC',
        subtitle: 'SOC Analyst Professional',
        code: 'CVS-SOC',
        level: 'Professional',
        description: "Become a skilled SOC Analyst capable of monitoring, detecting, and responding to security incidents in real-time.",
        category: 'Blue / Defensive',
        color: 'from-primary-600 to-primary-900',
        popular: true,
        price: 449,
        image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=1200',
    },
    {
        id: 'cvs-tmdr',
        title: 'CVS-TMDR',
        subtitle: 'Threat Monitoring & Detection Response',
        code: 'CVS-TMDR',
        level: 'Advanced',
        description: "Specialize in proactive threat hunting and advanced detection strategies to neutralize sophisticated attacks.",
        category: 'Blue / Defensive',
        color: 'from-primary-500 to-primary-800',
        price: 499,
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1200',
    },
    {
        id: 'cvs-dfir',
        title: 'CVS-DFIR',
        subtitle: 'Digital Forensics & Incident Response',
        code: 'CVS-DFIR',
        level: 'Advanced',
        description: "Acquire the skills to investigate cybercrimes, analyze digital evidence, and manage security incidents effectively.",
        category: 'Blue / Defensive',
        color: 'from-primary-600 to-primary-800',
        price: 499,
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200',
    },
    {
        id: 'cvs-map',
        title: 'CVS-MAP',
        subtitle: 'Malware Analysis Professional',
        code: 'CVS-MAP',
        level: 'Expert',
        description: "Deep dive into reverse engineering and malware analysis to understand and mitigate malicious software threats.",
        category: 'Blue / Defensive',
        color: 'from-primary-700 to-primary-900',
        price: 549,
        image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1200',
    },

    // Cloud & DevSecOps
    {
        id: 'csca-cpcs',
        title: 'CSCA-CPCS',
        subtitle: 'Certified Cloud Security Specialist',
        code: 'CSCA-CPCS',
        level: 'Professional',
        description: "Secure cloud infrastructure and services. Master the best practices for cloud security architecture and compliance.",
        category: 'Cloud & DevSecOps',
        color: 'from-primary-500 to-primary-700',
        price: 399,
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200',
    },
    {
        id: 'csca-cpdso',
        title: 'CSCA-CPDSO',
        subtitle: 'Certified DevSecOps Professional',
        code: 'CSCA-CPDSO',
        level: 'Professional',
        description: "Integrate security into the DevOps pipeline. Learn to automate security checks and maintain agility in development.",
        category: 'Cloud & DevSecOps',
        color: 'from-primary-600 to-primary-800',
        price: 399,
        image: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?q=80&w=1200',
    },

    // AI & Emerging Tech
    {
        id: 'cvs-aisec',
        title: 'CVS-AISEC',
        subtitle: 'AI Security Professional',
        code: 'CVS-AISEC',
        level: 'Cutting Edge',
        description: "Pioneer the field of AI security. Understand the risks associated with AI systems and how to secure them against adversarial attacks.",
        category: 'AI & Emerging Tech',
        color: 'from-primary-600 to-primary-900',
        price: 499,
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200',
    },

    // Governance / ISO
    {
        id: 'csca-cpisli',
        title: 'CSCA-CPISLI',
        subtitle: 'Certified ISO 27001 Lead Implementer',
        code: 'CSCA-CPISLI',
        level: 'Management',
        description: "Lead the implementation of an Information Security Management System (ISMS) based on ISO/IEC 27001 standards.",
        category: 'Governance / ISO',
        color: 'from-primary-700 to-primary-950',
        price: 599,
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200',
    },
    {
        id: 'csca-cpisla',
        title: 'CSCA-CPISLA',
        subtitle: 'Certified ISO 27001 Lead Auditor',
        code: 'CSCA-CPISLA',
        level: 'Auditor',
        description: "Master the principles and practices of auditing an ISMS. Prepare for and conduct internal and external audits.",
        category: 'Governance / ISO',
        color: 'from-primary-800 to-black',
        price: 599,
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200',
    },
];

const seedData = async () => {
    try {
        await connectDB();

        await Certification.deleteMany();
        console.log('Cleared existing certifications.');

        await Certification.insertMany(certificationsData);
        console.log('Successfully seeded certifications!');

        process.exit();
    } catch (error) {
        console.error('Error with data seeding:', error);
        process.exit(1);
    }
};

seedData();
