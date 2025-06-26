// 11. app/api/auth/signup/route.js (NEW FILE)
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const { email, password } = await req.json();

  if (!email || !password || password.length < 6) {
    return NextResponse.json({ message: 'Invalid input.' }, { status: 422 });
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db("mindsignal");
  const usersCollection = db.collection("users");
  const existingUser = await usersCollection.findOne({ email: email });

  if (existingUser) {
    client.close();
    return NextResponse.json({ message: 'User already exists.' }, { status: 422 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await usersCollection.insertOne({ email, password: hashedPassword });

  client.close();
  return NextResponse.json({ message: 'User created!' }, { status: 201 });
}

