import { Liveblocks } from "@liveblocks/node";

// Initialize Liveblocks with the Secret Key
const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY || "sk_dev_dummy_key_for_build",
});

export default async function handler(request, response) {
  // CORS Configuration for local development and Vercel
  const origin = request.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'https://owgudo.vercel.app'
  ];
  
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  if (allowedOrigins.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  }
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Pre-flight request handling
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  // Reject non-POST requests (Basic Abuse Control)
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { room } = request.body;

    if (!room) {
      return response.status(400).json({ error: "Missing room ID" });
    }

    // Identify the user. In OWGudo, users are anonymous but we need a unique ID per session.
    // In a real app with login, you would use their actual DB user ID.
    const userId = `user_${Math.floor(Math.random() * 1000000000)}`;
    
    // Prepare a session for the user
    // `userInfo` can be used to pass metadata to other users (e.g., avatar, name)
    const session = liveblocks.prepareSession(userId, {
      userInfo: {
        id: userId,
      },
    });

    // 🌟 Least Privilege Architecture 🌟
    // Only grant FULL_ACCESS to the SPECIFIC room requested. 
    // This prevents a compromised token from accessing other rooms.
    session.allow(room, session.FULL_ACCESS);

    // Get the status and body (the token)
    const { status, body } = await session.authorize();

    return response.status(status).send(body);
  } catch (error) {
    console.error("Auth error:", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
}
