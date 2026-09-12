import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedCore, seedUser } from "./lib/seed-core";
import { requireDatabaseUrl } from "./lib/require-database-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }) });

/** รหัสผ่านทุกบัญชีตัวอย่าง */
export const DEV_PASSWORD = "Passw0rd!vibe";

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PROD !== "1") {
    console.error("[seed] ปฏิเสธ: NODE_ENV=production — ใช้ npm run db:bootstrap แทน");
    process.exit(1);
  }
  const core = await seedCore(prisma, { tenantCode: "DEMO", nameTh: "องค์กรตัวอย่าง", nameEn: "Sample Organization" });
  const hash = await bcrypt.hash(DEV_PASSWORD, 12);
  const users = [
    { email: "admin@app.local", name: "ผู้ดูแลสูงสุด", roles: ["SUPER_ADMIN"] },
    { email: "staff@app.local", name: "เจ้าหน้าที่", roles: ["STAFF"] },
    { email: "viewer@app.local", name: "ผู้ดู", roles: ["VIEWER"] },
    { email: "lockme@app.local", name: "บัญชีทดสอบล็อก", roles: ["VIEWER"] },
    { email: "forced@app.local", name: "บัญชีบังคับเปลี่ยนรหัส", roles: ["VIEWER"], mustChangePassword: true },
  ];
  for (const u of users) {
    await seedUser(prisma, core.tenantId, { ...u, passwordHash: hash, roleIds: u.roles.map((c) => core.roleIds[c]) });
  }

  // Seed News Categories
  const catAcademic = await prisma.newsCategory.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "academic" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      nameTh: "ข่าววิชาการและอบรม",
      nameEn: "Academic & Training",
      slug: "academic",
      sortOrder: 1,
    },
  });

  const catActivity = await prisma.newsCategory.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "activities" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      nameTh: "กิจกรรมและพัฒนานักศึกษา",
      nameEn: "Student Activities",
      slug: "activities",
      sortOrder: 2,
    },
  });

  // Seed Initial News Articles
  await prisma.newsArticle.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "welcome-freshmen-2026" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      categoryId: catActivity.id,
      titleTh: "ขอเชิญนิสิตใหม่เข้าร่วมกิจกรรมปฐมนิเทศ ประจำปีการศึกษา 2569",
      titleEn: "Orientation Day for Freshmen Academic Year 2026",
      slug: "welcome-freshmen-2026",
      summaryTh: "คณะการจัดการและเทคโนโลยีสารสนเทศ ขอต้อนรับนิสิตใหม่ทุกท่านเข้าสู่รั้วมหาวิทยาลัย พร้อมร่วมกิจกรรมปฐมนิเทศสร้างสายสัมพันธ์",
      summaryEn: "Faculty of Management & IT warmly welcomes all freshman students to the university and orientation ceremony.",
      contentTh: `ขอต้อนรับนิสิตใหม่ ประจำปีการศึกษา 2569 เข้าสู่รั้วคณะการจัดการและเทคโนโลยีสารสนเทศ\n\nกำหนดการจัดกิจกรรม:\n- วันจันทร์ที่ 15 มิถุนายน 2569\n- เวลา 08.30 - 16.30 น.\n- ณ อาคารหอประชุมใหญ่ ชั้น 3\n\nการแต่งกาย: เครื่องแบบนิสิตถูกระเบียบ`,
      contentEn: `Welcome freshmen students to the academic year 2026!\n\nSchedule:\n- Monday, June 15, 2026\n- 08:30 - 16:30 hrs.\n- Main Auditorium, 3rd Floor\n\nDress code: Student Uniform`,
      coverImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
      status: "PUBLISHED",
      isPinned: true,
      publishedAt: new Date(),
    },
  });

  await prisma.newsArticle.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "ai-vibe-coding-seminar" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      categoryId: catAcademic.id,
      titleTh: "เปิดรับสมัครอบรมเชิงปฏิบัติการ: ยุคใหม่ของการพัฒนาซอฟต์แวร์ด้วย Vibe Coding และ AI",
      titleEn: "Hands-on Workshop: Modern Software Engineering with Vibe Coding & AI",
      slug: "ai-vibe-coding-seminar",
      summaryTh: "เรียนรู้แนวคิดสถาปัตยกรรม Modular Monolith และการใช้ AI Agent ในการสร้างเว็บแอปพลิเคชันระดับองค์กร",
      summaryEn: "Learn Modular Monolith architecture and how to build enterprise applications with AI coding assistants.",
      contentTh: `ขอเชิญคณาจารย์ บุคลากร และนิสิตเข้าร่วมการสัมมนาเชิงปฏิบัติการ\n\nหัวข้อการบรรยาย:\n1. ทำความเข้าใจ Modular Monolith vs Microservices\n2. การออกแบบ Domain-Driven Boundaries\n3. เทคนิค Pair Programming กับ Advanced AI Agents\n\nผู้สนใจสามารถลงทะเบียนได้ฟรี ไม่มีค่าใช้จ่าย`,
      contentEn: `Invitation for faculty members, staff, and students to attend the hands-on seminar.\n\nTopics:\n1. Understanding Modular Monolith vs Microservices\n2. Designing Domain-Driven Boundaries\n3. Pair Programming techniques with AI Agents`,
      coverImageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop",
      status: "PUBLISHED",
      isPinned: true,
      publishedAt: new Date(),
    },
  });

  // Seed Departments
  const deptIT = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "IT" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      nameTh: "ภาควิชาเทคโนโลยีสารสนเทศ",
      nameEn: "Department of Information Technology",
      code: "IT",
      sortOrder: 1,
    },
  });

  const deptManagement = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "MGMT" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      nameTh: "ภาควิชาการจัดการและบริหารธุรกิจ",
      nameEn: "Department of Management & Business Administration",
      code: "MGMT",
      sortOrder: 2,
    },
  });

  // Seed Staff Members
  await prisma.staffMember.createMany({
    data: [
      {
        tenantId: core.tenantId,
        departmentId: deptIT.id,
        prefixTh: "ผศ.ดร.",
        prefixEn: "Asst. Prof. Dr.",
        firstNameTh: "สมชาย",
        lastNameTh: "เทคโนโลยีเจริญ",
        firstNameEn: "Somchai",
        lastNameEn: "Techjaroen",
        academicPosition: "ผู้ช่วยศาสตราจารย์",
        adminPosition: "คณบดี",
        email: "dean.fms@mcu.ac.th",
        phone: "035-248-101",
        roomNumber: "ห้อง 401 อาคารเรียนรวม",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
        sortOrder: 1,
        isActive: true,
      },
      {
        tenantId: core.tenantId,
        departmentId: deptIT.id,
        prefixTh: "ดร.",
        prefixEn: "Dr.",
        firstNameTh: "อนันต์",
        lastNameTh: "ปัญญาประดิษฐ์",
        firstNameEn: "Anan",
        lastNameEn: "Panyapradit",
        academicPosition: "อาจารย์ประจำ",
        adminPosition: "หัวหน้าภาควิชาเทคโนโลยีสารสนเทศ",
        email: "anan.it@mcu.ac.th",
        phone: "035-248-102",
        roomNumber: "ห้อง 405 อาคารเรียนรวม",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
        sortOrder: 2,
        isActive: true,
      },
      {
        tenantId: core.tenantId,
        departmentId: deptManagement.id,
        prefixTh: "รศ.",
        prefixEn: "Assoc. Prof.",
        firstNameTh: "ศิริพร",
        lastNameTh: "บริหารดี",
        firstNameEn: "Siriporn",
        lastNameEn: "Borihandee",
        academicPosition: "รองศาสตราจารย์",
        adminPosition: "รองคณบดีฝ่ายวิชาการ",
        email: "siriporn.m@mcu.ac.th",
        phone: "035-248-103",
        roomNumber: "ห้อง 402 อาคารเรียนรวม",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
        sortOrder: 3,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // Seed Education Levels
  await prisma.educationLevel.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "CERTIFICATE" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "CERTIFICATE",
      nameTh: "ระดับประกาศนียบัตร",
      nameEn: "Certificate",
      sortOrder: 1,
    },
  });

  await prisma.educationLevel.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "BACHELOR" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "BACHELOR",
      nameTh: "ระดับปริญญาตรี",
      nameEn: "Bachelor's Degree",
      sortOrder: 2,
    },
  });

  // Seed Curriculums
  await prisma.curriculum.createMany({
    data: [
      {
        tenantId: core.tenantId,
        code: "IT-2569",
        degreeLevel: "BACHELOR",
        nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาเทคโนโลยีสารสนเทศ",
        nameEn: "Bachelor of Science in Information Technology",
        degreeTh: "วท.บ. (เทคโนโลยีสารสนเทศ)",
        degreeEn: "B.Sc. (Information Technology)",
        revisionYear: 2569,
        totalCredits: 128,
        studyYears: 4,
        tuitionFee: "16,500 บาท / ภาคการศึกษา",
        descriptionTh: "มุ่งเน้นการพัฒนา Full-stack Web/Mobile Application, Cloud Computing, AI Integration และสถาปัตยกรรมซอฟต์แวร์ระดับองค์กร",
        descriptionEn: "Focuses on Full-stack Web/Mobile Development, Cloud Computing, AI Integration, and Enterprise Software Architecture.",
        careerPaths: ["Full-stack Developer", "Cloud Engineer", "System Analyst", "AI Prompt Engineer"],
        syllabusFileUrl: "https://example.com/syllabus/it-2569.pdf",
        isOpenAdmission: true,
        isActive: true,
      },
      {
        tenantId: core.tenantId,
        code: "DBA-2569",
        degreeLevel: "BACHELOR",
        nameTh: "หลักสูตรบริหารธุรกิจบัณฑิต สาขาวิชาการจัดการนวัตกรรมดิจิทัล",
        nameEn: "Bachelor of Business Administration in Digital Innovation Management",
        degreeTh: "บธ.บ. (การจัดการนวัตกรรมดิจิทัล)",
        degreeEn: "B.B.A. (Digital Innovation Management)",
        revisionYear: 2569,
        totalCredits: 124,
        studyYears: 4,
        tuitionFee: "15,000 บาท / ภาคการศึกษา",
        descriptionTh: "บูรณาการศาสตร์การบริหารธุรกิจร่วมกับเครื่องมือและแพลตฟอร์มดิจิทัลสมัยใหม่ เพื่อก้าวสู่การเป็นผู้ประกอบการและผู้บริหารยุคใหม่",
        descriptionEn: "Integrates modern business administration with digital tools and platforms for next-generation entrepreneurs.",
        careerPaths: ["Digital Product Manager", "Business Analyst", "Tech Entrepreneur", "Digital Marketer"],
        syllabusFileUrl: "https://example.com/syllabus/dba-2569.pdf",
        isOpenAdmission: true,
        isActive: true,
      },
      {
        tenantId: core.tenantId,
        code: "CERT-2568",
        degreeLevel: "CERTIFICATE",
        nameTh: "หลักสูตรประกาศนียบัตรวิชาชีพชั้นสูง สาขาวิชาเทคโนโลยีสารสนเทศและการสื่อสารดิจิทัล",
        nameEn: "High Vocational Certificate in Information Technology and Digital Communication",
        degreeTh: "ปวส. (เทคโนโลยีสารสนเทศและการสื่อสารดิจิทัล)",
        degreeEn: "Dip. in Info. Tech. & Digital Comm.",
        revisionYear: 2568,
        totalCredits: 84,
        studyYears: 2,
        tuitionFee: "12,000 บาท / ภาคการศึกษา",
        descriptionTh: "มุ่งเน้นการปฏิบัติการทางวิชาชีพด้านการพัฒนาระบบสารสนเทศ และการประยุกต์ใช้เทคโนโลยีดิจิทัลในองค์กร",
        descriptionEn: "Focuses on hands-on practical skills in information system development and applied digital technologies.",
        careerPaths: ["Junior Software Developer", "Network Support Technician", "IT Support Specialist"],
        syllabusFileUrl: "https://example.com/syllabus/cert-2568.pdf",
        isOpenAdmission: true,
        isActive: true,
      },
      {
        tenantId: core.tenantId,
        code: "255018511040027",
        degreeLevel: "BACHELOR",
        nameTh: "หลักสูตรพุทธศาสตรบัณฑิต",
        nameEn: "Bachelor of Arts Program in Buddhist Studies",
        degreeTh: "พุทธศาสตรบัณฑิต (พธ.บ.)",
        degreeEn: "Bachelor of Arts (B.A.)",
        revisionYear: 2560,
        totalCredits: 140,
        studyYears: 4,
        tuitionFee: "14,000 บาท / ปีการศึกษา (ภาคการศึกษาละ 7,000 บาท)",
        descriptionTh: "เป็นหลักสูตรที่มุ่งสร้างความรู้ความเข้าใจและมีทักษะการประยุกต์ใช้หลักธรรมทางพระพุทธศาสนา โดยมีการสอนทั้งทฤษฎีและหลักการปฏิบัติด้านพระพุทธศาสนา เสริมสร้างศักยภาพให้นิสิตทั้งพระภิกษุสามเณรและคฤหัสถ์สามารถนำความรู้ด้านพุทธศาสนาไปประยุกต์ใช้บูรณาการกับศาสตร์สมัยใหม่แขนงต่าง ๆ เพื่อพัฒนาตนเอง องค์กร และสังคม",
        descriptionEn: "A comprehensive program designed to cultivate profound understanding and practical application of Buddhist doctrines, integrating traditional Buddhist wisdom with modern multidisciplinary sciences.",
        careerPaths: [
          "บุคลากรทางการศึกษา (ครู, อาจารย์, นักวิชาการศึกษา)",
          "นักวิชาการศาสนา",
          "อนุศาสนาจารย์ (ทหาร, ตำรวจ)",
          "เจ้าหน้าที่กรมราชทัณฑ์",
          "เจ้าหน้าที่กรมสุขภาพจิต",
          "เจ้าหน้าที่ฝึกอบรมและพัฒนาทรัพยากรมนุษย์",
          "นักสังคมสงเคราะห์ฟื้นฟูและพัฒนาจิตใจ",
        ],
        syllabusFileUrl: "https://example.com/syllabus/buddhist-studies-2560.pdf",
        isOpenAdmission: true,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  const buddhistCurriculum = await prisma.curriculum.findFirst({
    where: { tenantId: core.tenantId, code: "255018511040027" },
  });
  if (buddhistCurriculum) {
    await prisma.curriculumMajor.deleteMany({
      where: { curriculumId: buddhistCurriculum.id },
    });
    await prisma.curriculumMajor.createMany({
      data: [
        {
          curriculumId: buddhistCurriculum.id,
          code: "BUD-01",
          nameTh: "สาขาวิชาพระพุทธศาสนา",
          nameEn: "Buddhism",
          degreeTh: "พุทธศาสตรบัณฑิต (พระพุทธศาสนา)",
          degreeEn: "Bachelor of Arts (Buddhism)",
          descriptionTh: "มุ่งเน้นการศึกษาหลักพุทธธรรม ปรัชญาเถรวาท พระไตรปิฎก และวรรณคดีทางพระพุทธศาสนา เพื่อประยุกต์ใช้ในการเผยแผ่และการพัฒนาสังคม",
          descriptionEn: "Focuses on Buddhist doctrines, Theravada philosophy, Tipitaka, and Buddhist literature.",
          careerPaths: [
            "พระธรรมทูตทั้งในประเทศและต่างประเทศ",
            "ครูสอนวิชาพระพุทธศาสนาและจริยธรรมในสถานศึกษา",
            "นักวิชาการทางพระพุทธศาสนา",
            "บุคลากรทางการศึกษาและวัฒนธรรม",
            "นักพัฒนาชุมชนและสังคมสงเคราะห์",
            "นักเขียน นักแปล และบรรณาธิการวารสารทางศาสนา",
            "ผู้บริหารองค์กรทางศาสนาและมูลนิธิ",
          ],
          sortOrder: 1,
          isActive: true,
        },
        {
          curriculumId: buddhistCurriculum.id,
          code: "PHI-02",
          nameTh: "สาขาวิชาปรัชญา",
          nameEn: "Philosophy",
          degreeTh: "พุทธศาสตรบัณฑิต (ปรัชญา)",
          degreeEn: "Bachelor of Arts (Philosophy)",
          descriptionTh: "มุ่งเน้นการศึกษาตรรกศาสตร์ ปรัชญาตะวันออกและตะวันตก จริยศาสตร์ ญาณวิทยา และการคิดเชิงวิพากษ์ เพื่อเสริมสร้างทักษะการคิดวิเคราะห์อย่างมีเหตุผลและรอบด้าน",
          descriptionEn: "Focuses on logic, Eastern and Western philosophy, ethics, epistemology, and critical thinking.",
          careerPaths: [
            "นักวิชาการทางปรัชญาและศาสนา",
            "อาจารย์และครูสอนวิชาปรัชญา จริยศาสตร์ และสังคมศาสตร์",
            "นักวิเคราะห์นโยบายและแผน",
            "นักเขียน นักวิจารณ์ และคอลัมนิสต์",
            "นักวิจัยทางสังคมศาสตร์และมนุษยศาสตร์",
            "บุคลากรด้านทรัพยากรบุคคลและการพัฒนาองค์กร",
          ],
          sortOrder: 2,
          isActive: true,
        },
      ],
    });
  }


  
  // Seed Resources for Reservations
  const rRoom1 = await prisma.resource.upsert({
    where: { id: 'a0000000-0000-0000-0000-000000000101' },
    update: {},
    create: {
      id: 'a0000000-0000-0000-0000-000000000101',
      tenantId: core.tenantId,
      resourceType: 'ROOM',
      nameTh: 'ห้องประชุมวิชาการ 101',
      nameEn: 'Academic Meeting Room 101',
      capacity: 30,
      location: 'ชั้น 1 อาคารเรียนรวมและอำนวยการ',
      details: 'พร้อมระบบ Projector, ไมโครโฟนไร้สาย 4 ตัว, ระบบ Video Conference',
      imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=800&auto=format&fit=crop',
      isActive: true,
    },
  });

  await await prisma.resource.upsert({
    where: { id: 'a0000000-0000-0000-0000-000000000201' },
    update: {},
    create: {
      id: 'a0000000-0000-0000-0000-000000000201',
      tenantId: core.tenantId,
      resourceType: 'ROOM',
      nameTh: 'ห้องปฏิบัติการคอมพิวเตอร์ AI Lab',
      nameEn: 'AI & Computing Lab Room 201',
      capacity: 50,
      location: 'ชั้น 2 อาคารเรียนรวมและอำนวยการ',
      details: 'คอมพิวเตอร์ High-Spec GPU 50 เครื่อง, Smart Board 85 นิ้ว',
      imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800&auto=format&fit=crop',
      isActive: true,
    },
  });

  await await prisma.resource.upsert({
    where: { id: 'a0000000-0000-0000-0000-000000000301' },
    update: {},
    create: {
      id: 'a0000000-0000-0000-0000-000000000301',
      tenantId: core.tenantId,
      resourceType: 'VEHICLE',
      nameTh: 'รถตู้คณะ Toyota Commuter (ทะเบียน นข-4592 อยุธยา)',
      nameEn: 'Faculty Van Toyota Commuter (Plate: NK-4592)',
      capacity: 12,
      location: 'ลานจอดรถส่วนกลาง คณะวิทยาการจัดการ',
      details: 'รถตู้ปรับอากาศ VIP 12 ที่นั่ง พร้อมพนักงานขับรถ',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
      isActive: true,
    },
  });

  await prisma.reservation.upsert({
    where: { id: 'b0000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: 'b0000000-0000-0000-0000-000000000001',
      tenantId: core.tenantId,
      resourceId: rRoom1.id,
      userId: (await prisma.user.findFirstOrThrow({ where: { email: 'admin@app.local' } })).id,
      title: 'ประชุมคณะกรรมการประจำคณะ นัดพิเศษครั้งที่ 1/2569',
      description: 'พิจารณาหลักสูตรปรับปรุงใหม่ และความร่วมมือทางวิชาการ',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 27 * 60 * 60 * 1000),
      passengerCount: 20,
      status: 'APPROVED',
      approvedById: (await prisma.user.findFirstOrThrow({ where: { email: 'admin@app.local' } })).id,
    },
  });

  
  // Seed Sample Documents & Approvals
  const adminUser = await prisma.user.findFirstOrThrow({ where: { email: 'admin@app.local' } });
  const staffUser = await prisma.user.findFirstOrThrow({ where: { email: 'staff@app.local' } });

  await await prisma.document.upsert({
    where: { tenantId_documentNo: { tenantId: core.tenantId, documentNo: 'ว 01/2569' } },
    update: {},
    create: {
      tenantId: core.tenantId,
      userId: adminUser.id,
      documentNo: 'ว 01/2569',
      title: 'หนังสือเวียนเรื่อง กำหนดการเปิดภาคการศึกษาที่ 1/2569 และการเตรียมความพร้อมห้องเรียน',
      category: 'CIRCULAR',
      urgency: 'NORMAL',
      content: 'ขอให้คณาจารย์และเจ้าหน้าที่ทุกท่านเตรียมความพร้อมด้านสื่อการสอนและระบบห้องปฏิบัติการ เพื่อต้อนรับนิสิตในวันเปิดภาคเรียนที่ 15 มิ.ย. 2569',
      fileUrl: '/docs/circular-01-2569.pdf',
      status: 'APPROVED',
    },
  });

  await await prisma.document.upsert({
    where: { tenantId_documentNo: { tenantId: core.tenantId, documentNo: 'คำสั่ง 12/2569' } },
    update: {},
    create: {
      tenantId: core.tenantId,
      userId: adminUser.id,
      documentNo: 'คำสั่ง 12/2569',
      title: 'คำสั่งแต่งตั้งคณะกรรมการตรวจรับพัสดุและครุภัณฑ์คอมพิวเตอร์ ประจำปีงบประมาณ 2569',
      category: 'ORDER',
      urgency: 'NORMAL',
      content: 'แต่งตั้งคณะกรรมการเพื่อดำเนินการตรวจสอบและตรวจรับเครื่องคอมพิวเตอร์และอุปกรณ์เครือข่ายสำหรับห้องปฏิบัติการ AI Lab',
      fileUrl: '/docs/order-12-2569.pdf',
      status: 'APPROVED',
    },
  });

  const doc3 = await prisma.document.upsert({
    where: { tenantId_documentNo: { tenantId: core.tenantId, documentNo: 'บันทึก 05/2569' } },
    update: {},
    create: {
      tenantId: core.tenantId,
      userId: staffUser.id,
      documentNo: 'บันทึก 05/2569',
      title: 'ขออนุมัติจัดซื้อหมึกพิมพ์และอุปกรณ์สำนักงานสำหรับภาควิชาเทคโนโลยีสารสนเทศ',
      category: 'EXPENSE',
      urgency: 'URGENT',
      content: 'มีความประสงค์ขออนุมัติจัดซื้อหมึกพิมพ์และกระดาษสำหรับงานวิชาการและการจัดการเรียนการสอน รวมเป็นเงินทั้งสิ้น 12,500 บาท',
      status: 'IN_REVIEW',
    },
  });

  await prisma.documentApproval.upsert({
    where: { documentId_stepOrder: { documentId: doc3.id, stepOrder: 1 } },
    update: {},
    create: {
      tenantId: core.tenantId,
      documentId: doc3.id,
      approverId: adminUser.id,
      stepOrder: 1,
      status: 'PENDING',
    },
  });

  console.log(`[seed] เสร็จ — login: admin@app.local / ${DEV_PASSWORD}`);
}

main().finally(() => prisma.$disconnect());
