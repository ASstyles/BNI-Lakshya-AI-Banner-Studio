require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require("openai");
const axios = require("axios");
const admin = require("firebase-admin");

const app = express();

const db = require("./firebase");

dotenv.config();

const PORT = process.env.PORT || 3000;
const ACCESS_CODE = process.env.ACCESS_CODE || "LAKSHYA2026";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

async function getSettings() {
  const doc = await db
    .collection("settings")
    .doc("global")
    .get();

  if (doc.exists) {
    return doc.data();
  }

  return {
    chapterName: "BNI Lakshya",
    primaryColor: "#CF142B",
    secondaryColor: "#D4AF37",
    footerText: "",
    defaultVenue: "",
    defaultTime: "Thursday, 7:15 AM",
    defaultCta: "",
    geminiApiKey: "",
    grokApiKey: "",
    openaiApiKey: "",
    errorCount: 0
};
}

async function saveSettings(settings) {
  await db
    .collection("settings")
    .doc("global")
    .set(settings);

  return true;
}

// In-memory rate limiting map (IP -> { count, startTime })
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 50;

function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return next();
  }
  
  const limitData = rateLimitMap.get(ip);
  
  if (now - limitData.startTime > RATE_LIMIT_WINDOW) {
    // Reset window
    limitData.count = 1;
    limitData.startTime = now;
    return next();
  }
  
  if (limitData.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Too many requests. Please try again after an hour.'
    });
  }
  
  limitData.count++;
  next();
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Access Code Auth
app.post('/api/auth/login', (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: 'Access code required' });
  }
  if (code.trim().toUpperCase() === ACCESS_CODE.trim().toUpperCase()) {
    return res.json({ success: true, token: 'lakshya-auth-token-poc' });
  }
  return res.status(401).json({ success: false, error: 'Invalid access code' });
});

  // Settings Management
  app.get('/api/settings', async (req, res) => {
    const settings = await getSettings();
    res.json(settings);
  });


  app.post('/api/settings', async (req, res) => {
    const newSettings = req.body;
    const currentSettings = await getSettings();
    const updated = { ...currentSettings, ...newSettings };
    
    await saveSettings(updated);

      res.json({
        success: true,
        settings: updated
      });
  });


  // Local Rule-Based Fallback Copy Generator
  async function generateLocalFallbackCopy(data) {
    const { category, visitorCategory, opportunities, date, time, venue, cta, speakerName, companyName, topic, reason } = data;
    const settings = await getSettings();
    
    const finalDate = date || 'Upcoming Thursday';
    const finalTime = time || settings.defaultTime;
    const finalVenue = venue || settings.defaultVenue;
    const finalCta = cta || settings.defaultCta;
    
    if (category === 'visitor_invite') {
      const oppStr = opportunities || 'connect with business leaders and premium clients';
      const oppsList = oppStr.split(',').map(s => s.trim()).filter(Boolean).slice(0, 5);
      if (oppsList.length === 0) oppsList.push('Premium Client Connections', 'Collaborative Alliances');
      
      const cat = visitorCategory || 'Professionals';
      
      return {
        headline: `BNI Lakshya Invites ${cat}`,
        subheadline: `Meet business owners ready to refer opportunities in Pune's leading ecosystem.`,
        bulletPoints: oppsList.map(item => `Collaborate with ${item}`),
        cta: finalCta,
        whatsappCaption: `*BNI Lakshya is Inviting ${cat}!*\n\nLooking to scale your business? Visit our chapter meeting and connect with:\n${oppsList.map(o => `• ${o}`).join('\n')}\n\n🗓️ Date: ${finalDate}\n⏰ Time: ${finalTime}\n📍 Venue: ${finalVenue}\n\n👉 *Join as Visitor:* DM us or RSVP to visit!`,
        linkedinCaption: `Are you a ${cat} in Pune looking for a structured referral network? \n\nBNI Lakshya is inviting top ${cat} professionals to explore strategic business collaborations this week. Expand your network with wedding planners, developers, premium client connectors, and corporate service providers. \n\nMeeting Details:\n📅 Date: ${finalDate}\n⏰ Time: ${finalTime}\n🏢 Venue: ${finalVenue}\n\nComment below or DM to receive an exclusive guest invite.`,
        imageDirection: "Golden accents with dark crimson panel. High-contrast white typography."
      };
    } else if (category === 'weekly_meeting') {
      const focusCat = visitorCategory ? `Focus: ${visitorCategory}` : 'Open Category Opportunities';
      const mainReason = reason || 'Unlock a structured system of mutual referrals and business growth.';
      
      return {
        headline: `Scale Your Business with BNI Lakshya`,
        subheadline: `Join Pune's premier networking chapter for our next high-energy meeting.`,
        bulletPoints: [
          'Present your business to 50+ business owners',
          focusCat,
          'Access qualified referral pipelines'
        ],
        cta: finalCta,
        whatsappCaption: `*Looking for Qualified Business Referrals?*\n\nJoin the next weekly meeting of BNI Lakshya and pitch your business to Pune's top industry leaders.\n\n🗓️ Date: ${finalDate}\n⏰ Time: ${finalTime}\n📍 Venue: ${finalVenue}\n\n👉 *RSVP now to reserve your slot:* DM us today!`,
        linkedinCaption: `Cold calling is slow. Direct word-of-mouth referrals are fast. \n\nBNI Lakshya invites Pune-based founders, entrepreneurs, and service professionals to pitch their businesses at our weekly networking chapter meeting. \n\n📅 Date: ${finalDate}\n⏰ Time: ${finalTime}\n🏢 Venue: ${finalVenue}\n\nBuild relationships that turn into repeat business. DM us for guest registration details.`,
        imageDirection: "High contrast spotlight layout with glowing business nodes."
      };
    } else if (category === 'feature_presentation') {
      const spName = speakerName || 'Key Speaker';
      const compName = companyName ? ` (${companyName})` : '';
      const spCat = visitorCategory || 'Expert';
      const spTopic = topic || 'Business Excellence';
      
      return {
        headline: `Feature Speaker: ${spName}`,
        subheadline: `${spCat}${compName} presents on "${spTopic}".`,
        bulletPoints: [
          'Gain deep industry insights',
          'Identify target referral partners',
          'Learn strategic networking secrets'
        ],
        cta: finalCta,
        whatsappCaption: `*BNI Lakshya Feature Presentation!*\n\nThis week, hear from our category expert ${spName} presenting on: *"${spTopic}"*.\n\n🗓️ Date: ${finalDate}\n⏰ Time: ${finalTime}\n📍 Venue: ${finalVenue}\n\n👉 *Secure your visitor pass:* DM us to attend.`,
        linkedinCaption: `Unlock strategic business insights this week at BNI Lakshya. \n\nWe are proud to host ${spName}, representing the ${spCat} category, for a 10-minute deep dive on: "${spTopic}". Discover how their solutions are impacting the market and explore direct collaboration paths. \n\n📅 Date: ${finalDate}\n⏰ Time: ${finalTime}\n🏢 Venue: ${finalVenue}\n\nDM us to block a seat as a visiting entrepreneur.`,
        imageDirection: "Premium corporate design with gold accents and spotlight focus."
      };
    }
    
    return {
      headline: 'BNI Lakshya Weekly Meeting',
      subheadline: 'Expand your business network through structured referrals.',
      bulletPoints: ['Givers Gain', 'Structured Networking', 'Business Opportunities'],
      cta: finalCta,
      whatsappCaption: 'Visit BNI Lakshya meeting this Thursday!',
      linkedinCaption: 'Join us at BNI Lakshya to grow your business network in Pune.',
      imageDirection: 'Premium corporate background'
    };
  }

  app.get("/api/user/:uid", async (req,res)=>{
      try{
          const uid = req.params.uid;

          const doc =await db.collection("users").doc(uid).get();

          if(!doc.exists){
              return res.status(404).json({
                  error:"User not found"
              });
          }
          res.json(doc.data());

      }catch(err){

          res.status(500).json({
              error: err.message
          });
      }
  });


  app.get("/api/banners/user/:uid", async (req, res) => {

      try {
          console.log("UID:", req.params.uid);
          const snapshot = await db .collection("banners") .where("userId", "==", req.params.uid) .get();
          const banners = [];
          
          snapshot.forEach(doc => {
              banners.push({
                  id: doc.id,
                  ...doc.data()
              });
          });

          console.log("Banners Found:", banners.length);

          res.json(banners);

      } catch (error) {

          console.error("Banner Route Error:", error);

          res.status(500).json({
              error: error.message
          });
      }
  });

//Admin Banner shows
  app.get("/api/banners", async (req, res) => {

    try {

      const snapshot = await db .collection("banners") .orderBy("createdAt", "desc") .get();
      const banners = [];

      snapshot.forEach(doc => {
        banners.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.json(banners);

    } catch (error) {

      res.status(500).json({
        message: error.message
      });
    }
  });

  app.put("/api/banners/:id/image", async (req, res) => {

      try {

          await db .collection("banners") .doc(req.params.id) .update({ imageUrl: req.body.imageUrl });
          res.json({
              success: true
          });

      } catch (err) {

          console.error(err);

          res.status(500).json({
              success: false
          });
      }
  });

  app.delete("/api/banners/:id", async (req, res) => {
    try {

      const bannerId = req.params.id;

      await db.collection("banners") .doc(bannerId) .delete();

      res.json({
        success: true,
        message: "Banner deleted successfully"
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  app.put("/api/banners/:id", async (req, res) => {
    try {
      console.log("UPDATE ID:", req.params.id);
      console.log("UPDATE BODY:", req.body);

      await db.collection("banners")
        .doc(req.params.id)
        .update({
          bulletPoints: req.body.bulletPoints || [],
          headline: req.body.headline || "",
          subheadline: req.body.subheadline || "",
          cta: req.body.cta || "",
          imageUrl: req.body.imageUrl || "",
 
          copy: {
              headline: req.body.headline || "",
              subheadline: req.body.subheadline || "",
              bulletPoints: req.body.bulletPoints || [],
              cta: req.body.cta || ""
          },

          formData: req.body.formData || {},
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      res.json({ success: true });

    } catch (err) {
      console.error("UPDATE ERROR:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  console.log("Register route loaded");
  app.post("/api/login-user", async (req, res) => {

    try {

      const { uid } = req.body;

      const doc = await db.collection("users").doc(uid).get();

      if (!doc.exists) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      const user = doc.data();

      res.json({
        success: true,
        user
      });

    } catch (err) {

      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  });

  app.post("/api/register", async (req, res) => {
      try {
        console.log("Register endpoint hit");
      console.log(req.body);
          const { name, email, password, role } = req.body;

          const userRecord = await admin.auth().createUser({
              email,
              password,
              displayName: name
          });

          await admin.firestore()
              .collection("users")
              .doc(userRecord.uid)
              .set({
                  name,
                  email,
                  role,
                  createdAt: new Date().toISOString()
              });

          res.status(201).json({
              success: true,
              uid: userRecord.uid
          });

      } catch (error) {

          console.error(error);

          res.status(500).json({
              success: false,
              message: error.message
          });
      }
  });


  app.post("/api/banners", async (req, res) => {
    console.log("===== BANNER RECEIVED =====");
      console.log(JSON.stringify(req.body,null,2));
      const banner = req.body;

      console.log("Banner Received");
      console.log("Image Length:", banner.imageUrl?.length);
      
      const docRef = await db.collection("banners").add({
          ...banner,

          imageUrl: banner.imageUrl || "",
          createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({
          success: true,
          id: docRef.id
      });
  });

  async function generateWithOpenAI(prompt, apiKey) {

      const client = new OpenAI({
          apiKey
      });

      const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
              {
                  role: "user",
                  content: prompt
              }
          ],
          response_format: {
              type: "json_object"
          }
      });

      return response.choices[0].message.content;
  }

  async function generateWithGrok(prompt, apiKey) {

      const response = await axios.post(
          "https://api.x.ai/v1/chat/completions",
          {
              model: "grok-3-mini",
              messages: [
                  {
                      role: "user",
                      content: prompt
                  }
              ]
          },
          {
              headers: {
                  Authorization: `Bearer ${apiKey}`,
                  "Content-Type": "application/json"
              }
          }
      );

      return response.data.choices[0].message.content;
  }

// AI Copy Generator Route
  app.post('/api/generate-copy', rateLimiter, async (req, res) => {

    console.log("OPENAI:", process.env.OPENAI_API_KEY ? "Loaded" : "Missing");
    console.log("GEMINI:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
    console.log("REQ BODY:");
    console.log(req.body);
    const data = req.body;
    const settings = await getSettings();
    
    const geminiKey = process.env.GEMINI_API_KEY || settings.geminiApiKey;
    const openaiKey = process.env.OPENAI_API_KEY || settings.openaiApiKey;
    const grokKey = process.env.GROK_API_KEY || settings.grokApiKey;


    console.log("Gemini Key Exists:", !!geminiKey);
    console.log("OpenAI Key Exists:", !!openaiKey);
    console.log("Grok Key Exists:", !!grokKey);

    console.log("Gemini Key Source:",
        process.env.GEMINI_API_KEY ? "ENV" :
        settings.geminiApiKey ? "FIRESTORE" :
        "NONE"
    );


    if (!geminiKey && !openaiKey && !grokKey){
      console.log("No Gemini API Key found. Routing to local fallback copy generator.");

      const fallbackCopy = await generateLocalFallbackCopy(data);

      console.log("Generated fallback copy:", fallbackCopy);

      try {
          // await db.collection("banners").add({

          //     userId: data.userId,
          //     userName: data.userName,
          //     userEmail: data.userEmail,
          //     userRole: data.userRole,

          //     category: data.category,
          //     businessCategory: data.visitorCategory || "",
          //     opportunities: data.opportunities || "",

          //     meetingDate: data.date || "",
          //     meetingTime: data.time || "",
          //     venue: data.venue || "",

          //     headline: fallbackCopy.headline,
          //     subheadline: fallbackCopy.subheadline,
          //     bulletPoints: fallbackCopy.bulletPoints,

          //     cta: fallbackCopy.cta,

          //     whatsappCaption: fallbackCopy.whatsappCaption,
          //     linkedinCaption: fallbackCopy.linkedinCaption,
          //     imageDirection: fallbackCopy.imageDirection,

          //     engine: engineUsed,
          //     createdAt: new Date()
          // });
        } catch (err) {
            console.error("Firestore Save Error:", err);
          }
          return res.json({
            success: true,
            copy: fallbackCopy,
            engine: "Local Fallback Engine (No API Key)"
          });
      }

      let prompt = '';
      
      if (data.category === 'visitor_invite') {
        prompt = `
          You are creating banner copy for BNI Lakshya, a premium business networking chapter in Pune.
          Your job is to convert the user's raw input into short, clear, professional, high-impact banner copy.
          
          Input details:
          - Visitor category to invite: ${data.visitorCategory}
          - Who they can connect with / Referral opportunities: ${data.opportunities}
          - Meeting details: Date: ${data.date || 'Thursday'}, Time: ${data.time || settings.defaultTime}, Venue: ${data.venue || settings.defaultVenue}
          - CTA: ${data.cta || settings.defaultCta}
          
          Follow these strict copywriting rules:
          1. Keep the copy suitable for a visual banner. Do NOT write long paragraphs.
          2. Use professional, premium, business networking opportunity language.
          3. Avoid clichés (e.g., if inviting a makeup artist, do NOT write about lipsticks or brushes; talk about business connections, wedding planner partnerships, salon scaling).
          4. Maintain a premium, trustworthy, collaboration-focused networking tone.
          5. Headline must be under 10 words (e.g., "BNI Lakshya Invites Makeup Artists" or "Calling Web Developers to BNI Lakshya").
          6. Subheadline must be under 20 words describing the business value proposition.
          7. Provide 3 to 5 clear opportunity points (e.g., "Connect with Wedding Planners", "Partner with Event Managers"). Each point should represent an industry category or connector, not a generic sentence.
          8. CTA should be action-oriented and short.
          9. Keep text short to prevent design overflow.
          10. Provide a detailed WhatsApp caption (with appropriate bullet points, bold markers, and calendar emojis) and a professional LinkedIn caption.
          
          Respond with a JSON object of this structure:
          {
            "headline": "String under 10 words",
            "subheadline": "String under 20 words",
            "bulletPoints": ["Array of 3 to 5 bullet points (each under 5 words)"],
            "cta": "Short CTA string",
            "whatsappCaption": "Formatted WhatsApp text block with line breaks",
            "linkedinCaption": "Formatted LinkedIn post caption",
            "imageDirection": "Brief visualization guidelines (e.g., Premium dark mesh backdrop, crimson accents, spotlight circles)"
          }
        `;
      } else if (data.category === 'weekly_meeting') {
        prompt = `
          You are creating banner copy to promote the upcoming weekly meeting of BNI Lakshya chapter in Pune.
          
          Input details:
          - Meeting Date: ${data.date || 'Thursday'}
          - Time: ${data.time || settings.defaultTime}
          - Venue: ${data.venue || settings.defaultVenue}
          - Visitor Focus (optional): ${data.visitorCategory || 'Open Categories'}
          - Key Reason to Attend: ${data.reason || 'Grow business via word-of-mouth referrals'}
          - CTA: ${data.cta || settings.defaultCta}
          
          Follow these rules:
          1. Keep it professional, energetic, and premium.
          2. Headline must be under 10 words (e.g., "Grow Your Business at BNI Lakshya" or "Pune's Premium Networking Hub Meets").
          3. Subheadline must be under 20 words focusing on mutual growth and referrals.
          4. Offer 3 clear benefits of visiting as bullet points.
          5. Keep text short to avoid layout breakage.
          
          Respond with a JSON object of this structure:
          {
            "headline": "String under 10 words",
            "subheadline": "String under 20 words",
            "bulletPoints": ["Array of 3 bullet points (each under 5 words)"],
            "cta": "Short CTA string",
            "whatsappCaption": "Formatted WhatsApp text block with line breaks",
            "linkedinCaption": "Formatted LinkedIn post caption",
            "imageDirection": "Brief visualization guidelines"
          }
        `;
      } else if (data.category === 'feature_presentation') {
        prompt = `
          You are creating banner copy to announce a member's 10-minute Feature Presentation at BNI Lakshya chapter, Pune.
          
          Input details:
          - Speaker Name: ${data.speakerName}
          - Company Name: ${data.companyName}
          - Business Category: ${data.visitorCategory}
          - Presentation Topic: ${data.topic}
          - Meeting details: Date: ${data.date || 'Thursday'}, Time: ${data.time || settings.defaultTime}, Venue: ${data.venue || settings.defaultVenue}
          - CTA: ${data.cta || settings.defaultCta}
          
          Follow these rules:
          1. Focus on the value and knowledge the audience will gain from the presentation.
          2. Headline must highlight the speaker and company name (e.g., "Feature Speaker: John Doe" or "Spotlight on Acme Corp").
          3. Subheadline must state the topic and category.
          4. Provide 3 bullet points indicating what visitors will learn or who they can connect the speaker with.
          5. Keep text short to avoid layout breakage.
          
          Respond with a JSON object of this structure:
          {
            "headline": "String under 10 words",
            "subheadline": "String under 20 words",
            "bulletPoints": ["Array of 3 bullet points (each under 5 words)"],
            "cta": "Short CTA string",
            "whatsappCaption": "Formatted WhatsApp text block with line breaks",
            "linkedinCaption": "Formatted LinkedIn post caption",
            "imageDirection": "Brief visualization guidelines"
          }
        `;
      } else {
        return res.status(400).json({ success: false, error: 'Invalid category' });
      }
      
      let copyData;
      let engineUsed = "Fallback";

      try {
            if (geminiKey) {
                const genAI = new GoogleGenerativeAI(geminiKey);
                const model = genAI.getGenerativeModel({
                    model: "gemini-flash-latest",
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                });

                const result = await model.generateContent(prompt);
                const response = await result.response;

                const rawResponse = response.text();

                console.log("===== GEMINI RAW RESPONSE =====");
                console.log(rawResponse);
                console.log("===============================");

                copyData = JSON.parse(rawResponse);
                // copyData = JSON.parse(response.text());
                engineUsed = "Gemini";
            }
        } 
        catch (err) {
            console.error("Gemini Error:", err);
              try {
                console.log("OpenAI Key Exists:", !!openaiKey);
                console.log("OpenAI Key Length:", openaiKey ? openaiKey.length : 0);
                  if (openaiKey) {
                      const text = await generateWithOpenAI(prompt, openaiKey);
                      console.log("OpenAI Success");

                      copyData = JSON.parse(text);
                      engineUsed = "OpenAI";
                  }
              }
              catch (err2) {

                console.error("OPENAI ERROR FULL:");
                console.error(err2.response?.data || err2.message || err2);

                try {

                    if (grokKey) {

                        const text = await generateWithGrok(prompt, grokKey);

                        console.log("Grok Success");

                        copyData = JSON.parse(text);
                        engineUsed = "Grok";
                    }

                } catch (err3) {

                    console.error("Grok Error:", err3);
                }
            }
          }
          
          if (!copyData) {
              copyData = await generateLocalFallbackCopy(data);
              engineUsed = "Fallback";
          }

        let bannerRef;
        // SAVE BANNER TO FIRESTORE
        try {

            bannerRef = await db.collection("banners").add({
                // User Info
                userId: data.userId || "",
                userName: data.userName || "",
                userEmail: data.userEmail || "",
                userRole: data.userRole || "member",

                // Form Data
                category: data.category || "",
                businessCategory: data.visitorCategory || "",
                opportunities: data.opportunities || "",
                visitorCategory: data.visitorCategory || "",

                meetingDate: data.date || "",
                meetingTime: data.time || "",
                venue: data.venue || "",

                speakerName: data.speakerName || "",
                companyName: data.companyName || "",
                topic: data.topic || "",
                reason: data.reason || "",

                // Generated Copy
                headline: copyData.headline || "",
                subheadline: copyData.subheadline || "",
                bulletPoints: copyData.bulletPoints || [],

                cta: copyData.cta || "",

                whatsappCaption: copyData.whatsappCaption || "",
                linkedinCaption: copyData.linkedinCaption || "",
                imageUrl: "",
                imageDirection: copyData.imageDirection || "",

                engine: engineUsed,

                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log("Banner Saved Successfully");
            console.log("Banner ID:", bannerRef.id);
            console.log("User ID:", data.userId);

        } catch (saveError) {

            console.error("FIRESTORE SAVE ERROR:");
            console.error(saveError);
        }

        return res.json({
            success: true,
            copy: copyData,
            engine: engineUsed,
            bannerId: bannerRef ? bannerRef.id : null
        });
        
  });

  app.get("/test-gemini", async (req, res) => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest"
      });

      const result = await model.generateContent("Say hello");

      res.send(result.response.text());

    } catch (e) {
      console.error(e);
      res.status(500).send(e.message);
    }
  });

// TO check availbale model :-> http://localhost:3000/list-models
  app.get("/list-models", async (req, res) => {
      try {
          const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
          );

          const data = await response.json();

          console.log(data);
          res.json(data);

      } catch (err) {
          console.error(err);
          res.status(500).send(err.message);
      }
  });
  
// Start Server
app.listen(PORT, () => {
  console.log(`BNI Lakshya AI Banner Studio Server running on http://localhost:${PORT}`);
});