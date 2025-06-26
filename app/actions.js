// 13. app/actions.js
'use server';
import { ObjectId } from 'bson';
import clientPromise from '../lib/mongo';
import { refineIdeaWithLLM } from '../utils/llmRouter';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]/route';

async function getUserId() { 
    const session = await getServerSession(authOptions); 
    if (!session?.user?.id) throw new Error("User not authenticated"); 
    return session.user.id; 
}

export async function getIdeas() { 
    try { 
        const userId = await getUserId(); 
        const client = await clientPromise; 
        const db = client.db("mindsignal"); 
        const ideas = await db.collection("ideas").find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray(); 
        return JSON.parse(JSON.stringify(ideas)); 
    } catch (e) { 
        console.error(e); 
        if (e.message === "User not authenticated") return []; 
        return []; 
    } 
}

export async function addIdea(title) { 
    const userId = await getUserId(); 
    const client = await clientPromise; 
    const db = client.db("mindsignal"); 
    const newIdea = { _id: new ObjectId(), userId: new ObjectId(userId), title, phrases: [], createdAt: new Date(), updatedAt: new Date(), }; 
    await db.collection("ideas").insertOne(newIdea); 
    return JSON.parse(JSON.stringify(newIdea)); 
}

export async function addPhraseToIdea(ideaId, phrase) { 
    const userId = await getUserId(); 
    const client = await clientPromise; 
    const db = client.db("mindsignal"); 
    const result = await db.collection("ideas").updateOne({ _id: new ObjectId(ideaId), userId: new ObjectId(userId) }, { $push: { phrases: phrase }, $set: { updatedAt: new Date() } }); 
    return result.modifiedCount > 0; 
}

export async function refineIdeaAction(ideaId, phrases, selectedPromptIds, questionBank, provider) { 
    await getUserId(); 
    const jsonStringResponse = await refineIdeaWithLLM(provider, phrases, selectedPromptIds, questionBank); 
    try { 
        const responseObject = JSON.parse(jsonStringResponse); 
        return responseObject; 
    } catch (error) { 
        console.error("Error parsing LLM JSON response:", error); 
        return { error: "Failed to parse the response from the AI.", rawResponse: jsonStringResponse }; 
    } 
}
