import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import { User } from '../models/User.model';

dotenv.config({ quiet: true });

type DemoUserSeed = {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	role: 'student' | 'instructor' | 'admin' | 'content_manager';
};

const demoUsers: DemoUserSeed[] = [
	{
		email: 'admin@mit.com',
		password: 'Admin123!',
		firstName: 'Admin',
		lastName: 'User',
		role: 'admin',
	},
	{
		email: 'instructor@mit.com',
		password: 'Instructor123!',
		firstName: 'Instructor',
		lastName: 'User',
		role: 'instructor',
	},
	{
		email: 'content.manager@mit.com',
		password: 'Content123!',
		firstName: 'Content',
		lastName: 'Manager',
		role: 'content_manager',
	},
	{
		email: 'student@mit.com',
		password: 'Student123!',
		firstName: 'Student',
		lastName: 'User',
		role: 'student',
	},
];

const seedDemoUsers = async () => {
	if (process.env.NODE_ENV === 'production') {
		throw new Error('Refusing to seed demo users in production.');
	}

	await connectDB();

	const results: Array<{ email: string; role: string; action: string }> = [];

	for (const demoUser of demoUsers) {
		const hashedPassword = await bcrypt.hash(demoUser.password, 10);

		const existingUser = await User.findOne({ email: demoUser.email });
		if (existingUser) {
			existingUser.firstName = demoUser.firstName;
			existingUser.lastName = demoUser.lastName;
			existingUser.role = demoUser.role;
			existingUser.password = hashedPassword;
			existingUser.emailVerified = true;
			existingUser.isActive = true;
			existingUser.tokenVersion = 0;
			existingUser.verificationToken = undefined;
			existingUser.verificationTokenExpiry = undefined;
			existingUser.passwordResetToken = undefined;
			existingUser.passwordResetTokenExpiry = undefined;
			await existingUser.save();
			results.push({ email: demoUser.email, role: demoUser.role, action: 'updated' });
			continue;
		}

		await User.create({
			email: demoUser.email,
			password: hashedPassword,
			firstName: demoUser.firstName,
			lastName: demoUser.lastName,
			role: demoUser.role,
			emailVerified: true,
			isActive: true,
			tokenVersion: 0,
		});

		results.push({ email: demoUser.email, role: demoUser.role, action: 'created' });
	}

	console.log('Demo users seeded successfully.');
	console.table(results);
	console.log('Demo user passwords are defined only in the seed script for local development.');
};

seedDemoUsers()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('Failed to seed demo users:', error);
		process.exit(1);
	});
