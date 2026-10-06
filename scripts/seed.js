const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = require('../src/config/env');
const User = require('../src/models/User');
const Customer = require('../src/models/Customer');
const Interaction = require('../src/models/Interaction');
const Purchase = require('../src/models/Purchase');
const { ROLES } = require('../src/constants/roles');

const seedData = async () => {
  try {
    console.log('🌱 Connecting to MongoDB Atlas for database wipe & Indianized seeding...');
    await mongoose.connect(config.MONGODB_URI);
    console.log(`Connected to database: ${mongoose.connection.name}`);

    // STEP 1: Wipe all existing collections completely
    console.log('🗑️  Deleting all existing MongoDB data across all collections...');
    await Promise.all([
      User.deleteMany({}),
      Customer.deleteMany({}),
      Interaction.deleteMany({}),
      Purchase.deleteMany({}),
    ]);
    console.log('✅ All old data successfully wiped!');

    // STEP 2: Create Indianized Users (1 Owner, 2 Staff)
    console.log('Creating Owner and Staff accounts with Indian profiles...');
    const owner = await User.create({
      name: 'Rajesh Sharma (Business Owner)',
      email: 'owner@crm.com',
      password: 'Owner@123',
      role: ROLES.OWNER,
      phone: '+91 98201 12345',
    });

    const staff1 = await User.create({
      name: 'Priya Patel (Senior Sales Executive)',
      email: 'priya.staff@crm.com',
      password: 'Staff@123',
      role: ROLES.STAFF,
      phone: '+91 98112 34567',
    });

    const staff2 = await User.create({
      name: 'Amit Verma (Key Account Manager)',
      email: 'amit.staff@crm.com',
      password: 'Staff@123',
      role: ROLES.STAFF,
      phone: '+91 98334 56789',
    });

    console.log(`Created 3 users: 1 Owner (${owner.email}), 2 Staff (${staff1.email}, ${staff2.email})`);

    // STEP 3: Create 10 Realistic Indian Customer Records
    console.log('Creating sample Indian business customers...');
    const rawCustomers = [
      {
        name: 'Bharat Logistics & Supply Chain Pvt Ltd',
        email: 'procurement@bharatlogistics.in',
        phone: '+91 98200 11223',
        company: 'Bharat Logistics Group (Mumbai)',
        tags: ['VIP', 'Enterprise', 'Logistics'],
        status: 'active',
        notes: 'Pan-India fleet customer with monthly GST billing on 1st of every month.',
        createdBy: owner._id,
      },
      {
        name: 'FabStudio Creative Solutions',
        email: 'hello@fabstudio.design',
        phone: '+91 98450 33445',
        company: 'FabStudio Media LLP (Bengaluru)',
        tags: ['Creative', 'Retail', 'Design'],
        status: 'active',
        notes: 'Design studio ordering ongoing brand identity assets and media suites.',
        createdBy: staff1._id,
      },
      {
        name: 'Himalaya Herbal Products Co.',
        email: 'supply@himalayaherbal.co.in',
        phone: '+91 94120 55667',
        company: 'Himalaya Wellness Corp (Dehradun)',
        tags: ['Wholesale', 'Healthcare', 'Ayurveda'],
        status: 'active',
        notes: 'Ayurvedic formulations distributor ordering packaging & bottles in bulk.',
        createdBy: staff2._id,
      },
      {
        name: 'Tata Tech Infra Solutions',
        email: 'corporate@tatatechinfra.com',
        phone: '+91 98230 77889',
        company: 'Tata Infra Technologies (Pune)',
        tags: ['VIP', 'Technology', 'SaaS'],
        status: 'active',
        notes: 'High-value enterprise IT client with annual AMC renewals via NEFT.',
        createdBy: owner._id,
      },
      {
        name: 'Chai Point Beverage Enterprises',
        email: 'stores@chaipointenterprises.in',
        phone: '+91 98300 99001',
        company: 'Chai Point Retail (Kolkata)',
        tags: ['Retail', 'F&B', 'Local'],
        status: 'active',
        notes: 'Rapidly growing regional tea cafe chain purchasing eco-packaging weekly.',
        createdBy: staff1._id,
      },
      {
        name: 'Garuda Aerospace & Drone Labs',
        email: 'contact@garuda-aero.tech',
        phone: '+91 98480 22334',
        company: 'Garuda Robotics Ltd (Hyderabad)',
        tags: ['Lead', 'Technology', 'Defence'],
        status: 'lead',
        notes: 'Inquired through Make-in-India defense expo for precision sensors.',
        createdBy: staff2._id,
      },
      {
        name: 'Greenfield Organic Farming Co-op',
        email: 'director@greenfieldfarms.org',
        phone: '+91 98140 44556',
        company: 'Greenfield Co-op Society (Punjab)',
        tags: ['Wholesale', 'Agriculture', 'Eco-friendly'],
        status: 'prospect',
        notes: 'Solar irrigation pilot project under evaluation by state agricultural board.',
        createdBy: staff1._id,
      },
      {
        name: 'Carewell Multispeciality Clinic',
        email: 'reception@carewellclinic.in',
        phone: '+91 98100 66778',
        company: 'Carewell Health Services (New Delhi)',
        tags: ['Healthcare', 'Retail'],
        status: 'active',
        notes: 'Regular replenishment of medical consumables every quarter.',
        createdBy: staff2._id,
      },
      {
        name: 'FitIndia Gym Equipment & Fitness',
        email: 'orders@fitindiaequipment.com',
        phone: '+91 98790 88990',
        company: 'FitIndia Sports Group (Ahmedabad)',
        tags: ['Wholesale', 'Fitness', 'E-commerce'],
        status: 'active',
        notes: 'Commercial gym fitness supplier scaling across Tier-2 Indian cities.',
        createdBy: owner._id,
      },
      {
        name: 'Mumbai Digital Media Works',
        email: 'accounts@mumbaimedia.in',
        phone: '+91 98210 11122',
        company: 'Mumbai Media Works (Mumbai)',
        tags: ['Lead', 'Consulting'],
        status: 'inactive',
        notes: 'Contract currently on hold pending FY27 budget sanction.',
        createdBy: staff1._id,
      },
    ];

    const customers = await Customer.create(rawCustomers);
    console.log(`Created ${customers.length} Indian business customers.`);

    // STEP 4: Create Interactions (Phone calls, meetings, emails, site visits)
    console.log('Logging customer interactions with Indian business contexts...');
    const interactionsData = [
      {
        customer: customers[0]._id, // Bharat Logistics
        staff: staff1._id,
        type: 'meeting',
        summary: 'Annual GST Contract Renewal & expansion discussion',
        details: 'Met at Mumbai Nariman Point office. Finalized 20% volume growth for Q3.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        outcome: 'successful',
      },
      {
        customer: customers[0]._id,
        staff: staff2._id,
        type: 'call',
        summary: 'Monthly shipment checkpoint via WhatsApp call',
        details: 'Confirmed dispatch schedule for Bhiwandi warehouse transit.',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        outcome: 'completed',
      },
      {
        customer: customers[1]._id, // FabStudio
        staff: staff1._id,
        type: 'email',
        summary: 'Sent festive Diwali design catalog & INR rate card',
        details: 'Included festive creative bundle discounts and UPI settlement terms.',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        outcome: 'successful',
      },
      {
        customer: customers[2]._id, // Himalaya Herbal
        staff: staff2._id,
        type: 'meeting',
        summary: 'Dehradun manufacturing plant visit',
        details: 'Inspected bottling requirements for autumn herbal product line.',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        outcome: 'successful',
      },
      {
        customer: customers[3]._id, // Tata Tech Infra
        staff: staff1._id,
        type: 'call',
        summary: 'Enterprise SLA & Cloud renewal confirmation',
        details: 'Confirmed multi-year agreement discount. PO to be raised by finance team.',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        outcome: 'successful',
      },
      {
        customer: customers[4]._id, // Chai Point
        staff: staff2._id,
        type: 'note',
        summary: 'New outlet opened in Park Street, Kolkata',
        details: 'Expected 40% increase in packaging cup consumption by month end.',
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        outcome: 'completed',
      },
      {
        customer: customers[5]._id, // Garuda Aerospace
        staff: staff1._id,
        type: 'call',
        summary: 'Initial discovery call for drone sensors',
        details: 'Spoke with chief engineer. Scheduled online demonstration for next Thursday.',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        outcome: 'follow_up_needed',
      },
      {
        customer: customers[6]._id, // Greenfield Organic
        staff: staff2._id,
        type: 'meeting',
        summary: 'Ludhiana site consultation on solar drip irrigation',
        details: 'Evaluated 50 acre coverage. Subsidized quotation sent for co-op review.',
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        outcome: 'follow_up_needed',
      },
      {
        customer: customers[7]._id, // Carewell Clinic
        staff: staff1._id,
        type: 'email',
        summary: 'Quarterly clinic sterilizer delivery update',
        details: 'Shared BlueDart tracking ID and installation manual.',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        outcome: 'completed',
      },
      {
        customer: customers[8]._id, // FitIndia
        staff: staff2._id,
        type: 'call',
        summary: 'Bulk order discount negotiation for 50 Olympic barbell sets',
        details: 'Agreed on 12% wholesale margin with 50% advance via RTGS.',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        outcome: 'successful',
      },
      {
        customer: customers[9]._id, // Mumbai Digital Media
        staff: staff1._id,
        type: 'call',
        summary: 'Follow-up regarding paused retainer contract',
        details: 'Spoke with accounts lead. Awaiting new fiscal year budget release.',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        outcome: 'no_answer',
      },
    ];

    for (const item of interactionsData) {
      await Interaction.create(item);
      await Customer.findByIdAndUpdate(item.customer, {
        lastContactDate: item.date,
      });
    }
    console.log(`Created ${interactionsData.length} customer interaction logs.`);

    // STEP 5: Create Indian Purchases in Indian Rupees (INR / ₹)
    console.log('Recording customer purchase invoices in Indian Rupees (₹)...');
    const purchasesData = [
      // Bharat Logistics
      {
        customer: customers[0]._id,
        amount: 350000, // ₹3,50,000
        items: [
          { name: 'Fleet GPS Gateway Hardware (20 Units)', quantity: 20, unitPrice: 10000 },
          { name: 'Telematics Enterprise Annual Subscription', quantity: 1, unitPrice: 150000 },
        ],
        invoiceNumber: 'INV-2026-MUM-001',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',
        date: new Date('2026-01-15'),
        recordedBy: owner._id,
        notes: 'Paid via RTGS / HDFC Bank',
      },
      {
        customer: customers[0]._id,
        amount: 125000, // ₹1,25,000
        items: [{ name: 'Replacement OBD Sensor Nodes', quantity: 25, unitPrice: 5000 }],
        invoiceNumber: 'INV-2026-MUM-002',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',
        date: new Date('2026-02-18'),
        recordedBy: staff1._id,
      },
      // FabStudio
      {
        customer: customers[1]._id,
        amount: 95000, // ₹95,000
        items: [
          { name: 'Brand Identity Design Suite', quantity: 1, unitPrice: 65000 },
          { name: 'Motion Graphic Templates Pack', quantity: 3, unitPrice: 10000 },
        ],
        invoiceNumber: 'INV-2026-BLR-003',
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        date: new Date('2026-01-28'),
        recordedBy: staff1._id,
      },
      {
        customer: customers[1]._id,
        amount: 45000, // ₹45,000
        items: [{ name: 'Commercial Font & Asset Licenses', quantity: 1, unitPrice: 45000 }],
        invoiceNumber: 'INV-2026-BLR-004',
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        date: new Date('2026-03-02'),
        recordedBy: staff1._id,
      },
      // Himalaya Herbal
      {
        customer: customers[2]._id,
        amount: 280000, // ₹2,80,000
        items: [
          { name: 'Glass Dropper Bottles (10,000 Units)', quantity: 2, unitPrice: 100000 },
          { name: 'Tamper Evident Seal Packs', quantity: 4, unitPrice: 20000 },
        ],
        invoiceNumber: 'INV-2026-DED-005',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',
        date: new Date('2026-01-20'),
        recordedBy: staff2._id,
      },
      {
        customer: customers[2]._id,
        amount: 175000, // ₹1,75,000
        items: [{ name: 'Eco Kraft Outer Packaging Cartons', quantity: 500, unitPrice: 350 }],
        invoiceNumber: 'INV-2026-DED-006',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',
        date: new Date('2026-02-25'),
        recordedBy: staff2._id,
      },
      // Tata Tech Infra
      {
        customer: customers[3]._id,
        amount: 540000, // ₹5,40,000
        items: [
          { name: 'Managed Cloud Cluster Hosting (12 Months)', quantity: 1, unitPrice: 380000 },
          { name: '24/7 Mission Critical Support SLA', quantity: 1, unitPrice: 160000 },
        ],
        invoiceNumber: 'INV-2026-PUN-007',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',
        date: new Date('2026-02-05'),
        recordedBy: owner._id,
      },
      // Chai Point
      {
        customer: customers[4]._id,
        amount: 68000, // ₹68,000
        items: [
          { name: 'Biodegradable Paper Cups (20,000 count)', quantity: 2, unitPrice: 29000 },
          { name: 'Custom Wooden Stirrers Box', quantity: 10, unitPrice: 1000 },
        ],
        invoiceNumber: 'INV-2026-KOL-008',
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        date: new Date('2026-02-12'),
        recordedBy: staff1._id,
      },
      {
        customer: customers[4]._id,
        amount: 42000, // ₹42,000
        items: [{ name: 'Kraft Takeaway Coffee Sleeves (Case of 5,000)', quantity: 2, unitPrice: 21000 }],
        invoiceNumber: 'INV-2026-KOL-009',
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        date: new Date('2026-03-08'),
        recordedBy: staff2._id,
      },
      // Carewell Clinic
      {
        customer: customers[7]._id,
        amount: 115000, // ₹1,15,000
        items: [{ name: 'Hospital Grade Disinfectants & Autoclave Rolls', quantity: 5, unitPrice: 23000 }],
        invoiceNumber: 'INV-2026-DEL-010',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',
        date: new Date('2026-01-11'),
        recordedBy: staff1._id,
      },
      // FitIndia
      {
        customer: customers[8]._id,
        amount: 320000, // ₹3,20,000
        items: [
          { name: 'Competition Bumper Plate Sets (1000 kg)', quantity: 2, unitPrice: 120000 },
          { name: 'Olympic Barbells 20kg (Pack of 8)', quantity: 2, unitPrice: 40000 },
        ],
        invoiceNumber: 'INV-2026-AMD-011',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',
        date: new Date('2026-02-02'),
        recordedBy: owner._id,
      },
    ];

    for (const purchase of purchasesData) {
      await Purchase.create(purchase);
    }
    console.log(`Recorded ${purchasesData.length} purchase invoices.`);

    // STEP 6: Update aggregate totals on Customer models
    console.log('Calculating customer aggregate spend totals in INR...');
    const stats = await Purchase.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$customer',
          totalSpent: { $sum: '$amount' },
          totalPurchases: { $sum: 1 },
        },
      },
    ]);

    for (const stat of stats) {
      await Customer.findByIdAndUpdate(stat._id, {
        totalSpent: stat.totalSpent,
        totalPurchases: stat.totalPurchases,
      });
    }

    // STEP 7: Run & verify the Sales Summary Aggregation query
    console.log('\n========================================================================');
    console.log('📊 VERIFYING SALES SUMMARY AGGREGATION PIPELINE (INR / ₹):');
    console.log('========================================================================');

    const aggregationResult = await Purchase.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$customer',
          totalSpent: { $sum: '$amount' },
          purchaseCount: { $sum: 1 },
          averageOrderValue: { $avg: '$amount' },
        },
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      { $unwind: '$customerDetails' },
      {
        $project: {
          _id: 0,
          customerName: '$customerDetails.name',
          company: '$customerDetails.company',
          totalSpentINR: {
            $concat: ['₹', { $toString: { $round: ['$totalSpent', 2] } }],
          },
          purchaseCount: 1,
          averageOrderValueINR: {
            $concat: ['₹', { $toString: { $round: ['$averageOrderValue', 2] } }],
          },
        },
      },
      { $sort: { purchaseCount: -1 } },
    ]);

    console.table(aggregationResult);

    const totalRevenue = stats.reduce((sum, item) => sum + item.totalSpent, 0);
    console.log(`\n💰 Total Company Sales Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`);
    console.log(`👥 Total Paying Customers: ${stats.length}`);
    console.log('\n========================================================================');
    console.log('🔐 CREDENTIALS FOR TESTING & DEMOS:');
    console.log('========================================================================');
    console.log('👑 BUSINESS OWNER ACCOUNT (Full Access including /api/sales-summary):');
    console.log('   Name:     Rajesh Sharma');
    console.log('   Email:    owner@crm.com');
    console.log('   Password: Owner@123\n');
    console.log('👤 STAFF ACCOUNT 1 (Restricted from sales summary):');
    console.log('   Name:     Priya Patel');
    console.log('   Email:    priya.staff@crm.com');
    console.log('   Password: Staff@123\n');
    console.log('👤 STAFF ACCOUNT 2:');
    console.log('   Name:     Amit Verma');
    console.log('   Email:    amit.staff@crm.com');
    console.log('   Password: Staff@123');
    console.log('========================================================================\n');

    console.log('✅ MongoDB wipe and Indianized seeding completed successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

seedData();
