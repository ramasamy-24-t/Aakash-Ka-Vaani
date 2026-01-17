import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing MongoDB Connection...');
console.log('URI:', process.env.MONGO_URI ? 'Defined' : 'Missing');

const testConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connection Successful!');

        // Test Write
        console.log('Testing Write Permission...');
        const TestSchema = new mongoose.Schema({ name: String });
        const TestModel = mongoose.model('TestWrite', TestSchema);
        const doc = await TestModel.create({ name: 'test' });
        console.log('✅ Write Successful! Created doc with ID:', doc._id);

        // Clean up
        await TestModel.deleteMany({ name: 'test' });
        console.log('✅ Clean up Successful');

        process.exit(0);
    } catch (err) {
        console.error('❌ Connection/Write Failed:');
        console.error(err);
        process.exit(1);
    }
};

testConnection();
