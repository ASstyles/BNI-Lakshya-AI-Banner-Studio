const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ACCESS_CODE = process.env.ACCESS_CODE || 'LAKSHYA2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const settingsPath = path.join(dataDir, 'settings.json');

// Helper to read settings
function getSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading settings.json:', err);
  }
  // Default fallback settings
  return {
    chapterName: 'BNI Lakshya',
    primaryColor: '#CF142B',
    secondaryColor: '#D4AF37',
    fontPrimary: 'Montserrat',
    fontSecondary: 'Inter',
    footerText: 'BNI Lakshya Pune Chapter • Together Everyone Achieves More',
    defaultVenue: 'Conrad Pune, Mangaldas Rd',
    defaultTime: 'Thursday, 7:15 AM',
    defaultCta: 'DM us to attend as a visitor',
    geminiApiKey: '',
    grokApiKey: '',
    errorCount: 0
  };
}

// Helper to save settings
function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing settings.json:', err);
    return false;
  }
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
app.get('/api/settings', (req, res) => {
  const settings = getSettings();
  // Strip sensitive keys before sending to frontend if needed, but for POC we can return it.
  // Actually, we can return the keys, but it's better to allow editing them in Admin.
  res.json(settings);
});

app.post('/api/settings', (req, res) => {
  const newSettings = req.body;
  const currentSettings = getSettings();
  const updated = { ...currentSettings, ...newSettings };
  
  if (saveSettings(updated)) {
    res.json({ success: true, settings: updated });
  } else {
    res.status(500).json({ success: false, error: 'Failed to save settings' });
  }
});

// Local Rule-Based Fallback Copy Generator
function generateLocalFallbackCopy(data) {
  const { category, visitorCategory, opportunities, date, time, venue, cta, speakerName, companyName, topic, reason } = data;
  const settings = getSettings();
  
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

// AI Copy Generator Route
app.post('/api/generate-copy', rateLimiter, async (req, res) => {
  const data = req.body;
  const settings = getSettings();
  
  const apiKey = process.env.GEMINI_API_KEY || settings.geminiApiKey;
  
  if (!apiKey) {
    console.log('No Gemini API Key found. Routing to local fallback copy generator.');
    const fallbackCopy = generateLocalFallbackCopy(data);
    return res.json({ success: true, copy: fallbackCopy, engine: 'Local Fallback Engine (No API Key)' });
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
    
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
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();
    
    // Parse response JSON, removing any markdown code blocks if the model wrapped it
    const cleanJSONText = responseText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const copyData = JSON.parse(cleanJSONText);
    
    res.json({
      success: true,
      copy: copyData,
      engine: 'Gemini 2.5 Flash'
    });
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Increment error count in settings
    try {
      settings.errorCount = (settings.errorCount || 0) + 1;
      saveSettings(settings);
    } catch (_) {}
    
    // Trigger Fallback Engine
    console.log('Triggering Local Fallback copy generator due to API error.');
    const fallbackCopy = generateLocalFallbackCopy(data);
    res.json({
      success: true,
      copy: fallbackCopy,
      engine: 'Local Fallback Engine (Gemini API Error / Quota Limit)'
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`BNI Lakshya AI Banner Studio Server running on http://localhost:${PORT}`);
});
