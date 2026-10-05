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
    console.log('🌱 Starting CRM database seeding process...');
    await mongoose.connect(config.MONGODB_URI);
    console.log(`Connected to database: ${mongoose.connection.name}`);

    // Clear existing collections
    console.log('Clearing old collections...');
    await Promise.all([
      User.deleteMany({}),
      Customer.deleteMany({}),
      Interaction.deleteMany({}),
      Purchase.deleteMany({}),
    ]);

    // 1. Create Users (1 Owner, 2 Staff)
    console.log('Creating Owner and Staff accounts...');
    const owner = await User.create({
      name: 'Eleanor Vance (Business Owner)',
      email: 'owner@crm.com',
      password: 'Owner@123',
      role: ROLES.OWNER,
      phone: '+1 555-0199',
    });

    const staff1 = await User.create({
      name: 'Sarah Jenkins (Sales Representative)',
      email: 'sarah.staff@crm.com',
      password: 'Staff@123',
      role: ROLES.STAFF,
      phone: '+1 555-0142',
    });

    const staff2 = await User.create({
      name: 'Michael Chang (Account Manager)',
      email: 'michael.staff@crm.com',
      password: 'Staff@123',
      role: ROLES.STAFF,
      phone: '+1 555-0188',
    });

    console.log(`Created 3 users: 1 Owner (${owner.email}), 2 Staff (${staff1.email}, ${staff2.email})`);

    // 2. Create Realistic Customers
    console.log('Creating sample customers...');
    const rawCustomers = [
      {
        name: 'Apex Global Logistics',
        email: 'procurement@apexlogistics.com',
        phone: '+1 800-555-0101',
        company: 'Apex Logistics LLC',
        tags: ['VIP', 'Enterprise', 'Logistics'],
        status: 'active',
        notes: 'Long-term enterprise customer, monthly billing schedule.',
        createdBy: owner._id,
      },
      {
        name: 'Brightline Creative Studio',
        email: 'hello@brightlinestudio.design',
        phone: '+1 415-555-0122',
        company: 'Brightline Studios Inc.',
        tags: ['Creative', 'Retail', 'Design'],
        status: 'active',
        notes: 'Design agency needing ongoing consultation and creative assets.',
        createdBy: staff1._id,
      },
      {
        name: 'Cascade Mountain Gear',
        email: 'buyer@cascadedgear.com',
        phone: '+1 206-555-0177',
        company: 'Cascade Retail Group',
        tags: ['Wholesale', 'Outdoor', 'Retail'],
        status: 'active',
        notes: 'Outdoor sports equipment retailer placing seasonal bulk orders.',
        createdBy: staff2._id,
      },
      {
        name: 'Delta Data Systems',
        email: 'accounts@deltadatasys.io',
        phone: '+1 512-555-0189',
        company: 'Delta Systems Corp',
        tags: ['VIP', 'Technology', 'SaaS'],
        status: 'active',
        notes: 'High-value tech client with automated yearly renewals.',
        createdBy: owner._id,
      },
      {
        name: 'Echo Horizon Coffee Roasters',
        email: 'info@echohorizon.coffee',
        phone: '+1 503-555-0190',
        company: 'Echo Horizon Roasters',
        tags: ['Retail', 'F&B', 'Local'],
        status: 'active',
        notes: 'Artisanal roastery purchasing packaging supplies weekly.',
        createdBy: staff1._id,
      },
      {
        name: 'Falcon Robotics & AI',
        email: 'contact@falconrobotics.ai',
        phone: '+1 617-555-0134',
        company: 'Falcon Robotics Labs',
        tags: ['Lead', 'Technology', 'AI'],
        status: 'lead',
        notes: 'Inquired through web form, looking for prototype component supplier.',
        createdBy: staff2._id,
      },
      {
        name: 'Greenfield Organic Farms',
        email: 'farm@greenfieldorganic.org',
        phone: '+1 831-555-0165',
        company: 'Greenfield Co-op',
        tags: ['Wholesale', 'Agriculture', 'Eco-friendly'],
        status: 'prospect',
        notes: 'Negotiating volume discount on solar irrigation systems.',
        createdBy: staff1._id,
      },
      {
        name: 'Harbor City Dental Clinic',
        email: 'reception@harbordentalcare.com',
        phone: '+1 206-555-0199',
        company: 'Harbor Dental Care PC',
        tags: ['Healthcare', 'Retail'],
        status: 'active',
        notes: 'Quarterly clinic replenishment orders.',
        createdBy: staff2._id,
      },
      {
        name: 'Ironclad Fitness Gear',
        email: 'orders@ironcladfit.com',
        phone: '+1 305-555-0144',
        company: 'Ironclad Sports Inc',
        tags: ['Wholesale', 'Fitness', 'E-commerce'],
        status: 'active',
        notes: 'Rapidly growing regional gym supplier.',
        createdBy: owner._id,
      },
      {
        name: 'Jupiter Digital Marketing',
        email: 'ops@jupiterdigital.agency',
        phone: '+1 312-555-0178',
        company: 'Jupiter Media Works',
        tags: ['Lead', 'Consulting'],
        status: 'inactive',
        notes: 'Paused contract pending Q3 budget review.',
        createdBy: staff1._id,
      },
    ];

    const customers = await Customer.create(rawCustomers);
    console.log(`Created ${customers.length} customers.`);

    // 3. Create Interactions
    console.log('Logging customer interactions...');
    const interactionsData = [
      {
        customer: customers[0]._id, // Apex Global
        staff: staff1._id,
        type: 'meeting',
        summary: 'Annual contract review & expansion discussion',
        details: 'Met with logistics VP. Agreed on 15% volume increase for Q3.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        outcome: 'successful',
      },
      {
        customer: customers[0]._id,
        staff: staff2._id,
        type: 'call',
        summary: 'Monthly shipment scheduling checkpoint',
        details: 'Confirmed transit timetable for next week delivery.',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        outcome: 'completed',
      },
      {
        customer: customers[1]._id, // Brightline
        staff: staff1._id,
        type: 'email',
        summary: 'Sent new creative assets catalog and pricing matrix',
        details: 'Included summer collection discounts and bundle terms.',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        outcome: 'successful',
      },
      {
        customer: customers[2]._id, // Cascade Mountain Gear
        staff: staff2._id,
        type: 'meeting',
        summary: 'Wholesale winter pre-order showroom visit',
        details: 'Showcased upcoming waterproof apparel line.',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        outcome: 'successful',
      },
      {
        customer: customers[3]._id, // Delta Data Systems
        staff: staff1._id,
        type: 'call',
        summary: 'License renewal confirmation call',
        details: 'Customer requested multi-year agreement discount quotation.',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        outcome: 'successful',
      },
      {
        customer: customers[4]._id, // Echo Horizon Coffee
        staff: staff2._id,
        type: 'note',
        summary: 'Customer opened their second storefront location',
        details: 'Increased packaging demand expected by end of month.',
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        outcome: 'completed',
      },
      {
        customer: customers[5]._id, // Falcon Robotics
        staff: staff1._id,
        type: 'call',
        summary: 'Initial discovery call regarding robotic sensors',
        details: 'Spoke with lead engineer. Scheduled technical walkthrough for next Tuesday.',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        outcome: 'follow_up_needed',
      },
      {
        customer: customers[6]._id, // Greenfield Organic
        staff: staff2._id,
        type: 'meeting',
        summary: 'On-site consultation on solar drip irrigation system',
        details: 'Evaluated acre coverage. Draft proposal under review.',
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        outcome: 'follow_up_needed',
      },
      {
        customer: customers[7]._id, // Harbor City Dental
        staff: staff1._id,
        type: 'email',
        summary: 'Follow-up regarding quarterly sterilizer order status',
        details: 'Shared tracking information and maintenance guide.',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        outcome: 'completed',
      },
      {
        customer: customers[8]._id, // Ironclad Fitness
        staff: staff2._id,
        type: 'call',
        summary: 'Bulk order discount inquiry for 50 Olympic bar sets',
        details: 'Quoted tiered pricing at 18% margin.',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        outcome: 'successful',
      },
      {
        customer: customers[9]._id, // Jupiter Digital
        staff: staff1._id,
        type: 'call',
        summary: 'Quarterly check-in on paused subscription',
        details: 'Left voicemail with accounts payable manager.',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        outcome: 'no_answer',
      },
    ];

    for (const item of interactionsData) {
      const interaction = await Interaction.create(item);
      // Update customer lastContactDate to match latest interaction date
      await Customer.findByIdAndUpdate(item.customer, {
        lastContactDate: item.date,
      });
    }
    console.log(`Created ${interactionsData.length} customer interactions.`);

    // 4. Create Purchases (Transactions)
    console.log('Recording customer purchase transactions...');
    const purchasesData = [
      // Apex Global Logistics
      {
        customer: customers[0]._id,
        amount: 8500,
        items: [
          { name: 'Fleet Tracking Gateway Hardware', quantity: 10, unitPrice: 500 },
          { name: 'Enterprise Fleet Telematics SaaS (1 Year)', quantity: 1, unitPrice: 3500 },
        ],
        invoiceNumber: 'INV-2026-001',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',
        date: new Date('2026-01-15'),
        recordedBy: owner._id,
        notes: 'Annual enterprise deployment',
      },
      {
        customer: customers[0]._id,
        amount: 3200,
        items: [{ name: 'Replacement Sensor Nodes', quantity: 32, unitPrice: 100 }],
        invoiceNumber: 'INV-2026-002',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',
        date: new Date('2026-02-18'),
        recordedBy: staff1._id,
      },
      // Brightline Creative Studio
      {
        customer: customers[1]._id,
        amount: 1450,
        items: [
          { name: 'Brand Identity Strategy Suite', quantity: 1, unitPrice: 1000 },
          { name: 'Typography & Iconography Licenses', quantity: 3, unitPrice: 150 },
        ],
        invoiceNumber: 'INV-2026-003',
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        date: new Date('2026-01-28'),
        recordedBy: staff1._id,
      },
      {
        customer: customers[1]._id,
        amount: 800,
        items: [{ name: 'Motion Graphic Templates Pack', quantity: 2, unitPrice: 400 }],
        invoiceNumber: 'INV-2026-004',
        paymentMethod: 'stripe',
        paymentStatus: 'paid',
        date: new Date('2026-03-02'),
        recordedBy: staff1._id,
      },
      // Cascade Mountain Gear
      {
        customer: customers[2]._id,
        amount: 6200,
        items: [
          { name: 'Waterproof Alpine Shells (Bulk Pack 50)', quantity: 2, unitPrice: 2500 },
          { name: 'Thermal Base Layers (Bulk Pack 100)', quantity: 1, unitPrice: 1200 },
        ],
        invoiceNumber: 'INV-2026-005',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',
        date: new Date('2026-01-20'),
        recordedBy: staff2._id,
      },
      {
        customer: customers[2]._id,
        amount: 4100,
        items: [{ name: 'Backpacking Tent Bundles', quantity: 10, unitPrice: 410 }],
        invoiceNumber: 'INV-2026-006',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',
        date: new Date('2026-02-25'),
        recordedBy: staff2._id,
      },
      // Delta Data Systems
      {
        customer: customers[3]._id,
        amount: 9800,
        items: [
          { name: 'Dedicated Cloud Database Cluster (12 Months)', quantity: 1, unitPrice: 7200 },
          { name: '24/7 Priority SLA & Support Contract', quantity: 1, unitPrice: 2600 },
        ],
        invoiceNumber: 'INV-2026-007',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',
        date: new Date('2026-02-05'),
        recordedBy: owner._id,
      },
      // Echo Horizon Coffee Roasters
      {
        customer: customers[4]._id,
        amount: 950,
        items: [
          { name: 'Custom Eco-Friendly Coffee Bags (5,000 count)', quantity: 1, unitPrice: 750 },
          { name: 'One-Way Degassing Valves (Roll)', quantity: 2, unitPrice: 100 },
        ],
        invoiceNumber: 'INV-2026-008',
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        date: new Date('2026-02-12'),
        recordedBy: staff1._id,
      },
      {
        customer: customers[4]._id,
        amount: 650,
        items: [{ name: 'Kraft Takeaway Sleeves (Case of 2,000)', quantity: 2, unitPrice: 325 }],
        invoiceNumber: 'INV-2026-009',
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        date: new Date('2026-03-08'),
        recordedBy: staff2._id,
      },
      // Harbor City Dental Clinic
      {
        customer: customers[7]._id,
        amount: 2200,
        items: [{ name: 'Autoclave Sterilization Pouches & Filters', quantity: 4, unitPrice: 550 }],
        invoiceNumber: 'INV-2026-010',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',
        date: new Date('2026-01-11'),
        recordedBy: staff1._id,
      },
      // Ironclad Fitness Gear
      {
        customer: customers[8]._id,
        amount: 5400,
        items: [
          { name: 'Commercial Bumper Plate Sets (1,000 kg)', quantity: 2, unitPrice: 2200 },
          { name: 'Olympic Competition Barbells (Pack of 5)', quantity: 2, unitPrice: 500 },
        ],
        invoiceNumber: 'INV-2026-011',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',
        date: new Date('2026-02-02'),
        recordedBy: owner._id,
      },
    ];

    for (const purchase of purchasesData) {
      await Purchase.create(purchase);
    }
    console.log(`Recorded ${purchasesData.length} purchase records.`);

    // 5. Update cached totals on Customer models
    console.log('Updating customer aggregate spend totals...');
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

    // 6. Test Sales Aggregation Query immediately
    console.log('\n====================================================');
    console.log('📊 VERIFYING SALES SUMMARY AGGREGATION PIPELINE:');
    console.log('====================================================');

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
          tags: '$customerDetails.tags',
          totalSpent: { $round: ['$totalSpent', 2] },
          purchaseCount: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 2] },
        },
      },
      { $sort: { totalSpent: -1 } },
    ]);

    console.table(aggregationResult);

    const totalRevenue = aggregationResult.reduce((sum, item) => sum + item.totalSpent, 0);
    console.log(`\n💰 Total Company Sales Revenue: $${totalRevenue.toLocaleString()}`);
    console.log(`👥 Paying Customers Count: ${aggregationResult.length}`);
    console.log('\n====================================================');
    console.log('🔐 CREDENTIALS FOR TESTING:');
    console.log('====================================================');
    console.log('👑 OWNER ACCOUNT (Full Access including /api/sales-summary):');
    console.log('   Email:    owner@crm.com');
    console.log('   Password: Owner@123\n');
    console.log('👤 STAFF ACCOUNT 1 (Restricted from sales summary):');
    console.log('   Email:    sarah.staff@crm.com');
    console.log('   Password: Staff@123\n');
    console.log('👤 STAFF ACCOUNT 2:');
    console.log('   Email:    michael.staff@crm.com');
    console.log('   Password: Staff@123');
    console.log('====================================================\n');

    console.log('✅ Seeding completed successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

seedData();
